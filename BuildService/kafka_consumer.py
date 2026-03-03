import asyncio
import uuid
import logging
import os
import shutil
import subprocess
import requests

from confluent_kafka import Consumer, Producer, KafkaError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

KAFKA_BROKER = 'localhost:9092'
BUILD_TOPIC = 'build-notification'
DEPLOYMENT_TOPIC = 'deployment'
GROUP_ID = 'buildServiceGroup'

MAX_AI_RETRIES = 3
BUILD_ROOT = "/tmp/builds"

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.1"

producer = Producer({
    'bootstrap.servers': KAFKA_BROKER
})


# 📤 Send deployment result
def send_deployment_message(username: str, stored_url: str, success: bool):
    status = "true" if success else "false"
    message = f"{username},{stored_url},{status}"

    try:
        producer.produce(DEPLOYMENT_TOPIC, message.encode("utf-8"))
        producer.flush()
        logger.info(f"Deployment message sent: {message}")
    except Exception as e:
        logger.error(f"Failed to send deployment message: {e}")


# 📂 Get repo tree for AI context
def get_repo_tree(path: str) -> str:
    tree = []
    for root, dirs, files in os.walk(path):
        level = root.replace(path, "").count(os.sep)
        indent = " " * (level * 2)
        tree.append(f"{indent}{os.path.basename(root)}/")
        subindent = " " * ((level + 1) * 2)
        for f in files:
            tree.append(f"{subindent}{f}")
    return "\n".join(tree)


# 🤖 Call local Ollama to generate build script
def generate_build_commands(repo_path: str, error_logs: str) -> str:
    repo_tree = get_repo_tree(repo_path)

    prompt = f"""
You are a build agent.

Repo structure:
{repo_tree}

Previous errors:
{error_logs}

Return ONLY bash commands to:
1. Install dependencies
2. Build the project
3. Exit with non-zero if build fails
4. if directory structure just contains html, css, js, md, cur files only then just give echo done

Do not explain.
"""
    prompt= 'just say "echo done"'
    prompt = f'''You are a deterministic build script generator.

OUTPUT CONTRACT (MANDATORY):
- Output ONLY a valid executable bash script.
- Output NOTHING before the script.
- Output NOTHING after the script.
- Do NOT explain anything.
- Do NOT describe what you detected.
- Do NOT use markdown.
- Do NOT use code fences.
- Do NOT include commentary outside the script.
- If you output anything other than a script, the result is invalid.

INPUTS:
1) Directory tree of a repository.
2) Previous build error (may be empty).

BEHAVIOR RULES:
- Inspect the directory tree internally.
- Detect build system strictly from files present.
- Priority order:
  1. Makefile
  2. Dockerfile
  3. Language-native config (pom.xml, build.gradle, package.json, requirements.txt, pyproject.toml, go.mod, Cargo.toml, etc.)
- If previous error is NOT empty, modify the script to resolve it.
- Script must be safe to run multiple times.
- Use set -e at the top.

STATIC PROJECT RULE:
If the project contains ONLY static files (HTML, CSS, JS, images, etc.)
AND no package.json
AND no framework config
THEN output exactly:

#!/bin/bash
set -e
echo done

No extra whitespace. No extra lines.

DIRECTORY TREE:
{repo_tree}

PREVIOUS BUILD ERROR:
{error_logs}'''

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        logger.error(f"Ollama request failed: {e}")
        return ""


# 🛠️ Execute shell commands in workspace
def execute_commands(workspace: str, commands: str):
    print(commands)
    try:
        process = subprocess.Popen(
            commands,
            cwd=workspace,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            executable="/bin/bash"
        )
        stdout, stderr = process.communicate(timeout=1800)
        return process.returncode, stdout, stderr
    except subprocess.TimeoutExpired:
        process.kill()
        return 1, "", "Build timed out"
    except Exception as e:
        return 1, "", str(e)


class BuildKafkaConsumer:
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': KAFKA_BROKER,
            'group.id': GROUP_ID,
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': False,
            'max.poll.interval.ms': 3600000
        })
        self.running = False

    def start(self):
        os.makedirs(BUILD_ROOT, exist_ok=True)
        self.consumer.subscribe([BUILD_TOPIC])
        self.running = True
        logger.info(f"Subscribed to topic: {BUILD_TOPIC}")

    def stop(self):
        self.running = False
        self.consumer.close()

    async def consume_loop(self):
        self.start()
        try:
            while self.running:
                msg = await asyncio.to_thread(self.consumer.poll, 1.0)

                if msg is None:
                    continue

                if msg.error():
                    if msg.error().code() != KafkaError._PARTITION_EOF:
                        logger.error(f"Kafka error: {msg.error().str()}")
                    continue

                await asyncio.to_thread(self._process_message, msg)

        finally:
            self.stop()

    def _prepare_workspace(self, source_path: str, build_id: str) -> str:
        workspace_path = os.path.join(BUILD_ROOT, build_id)

        if os.path.exists(workspace_path):
            shutil.rmtree(workspace_path, ignore_errors=True)

        shutil.copytree(source_path, workspace_path)
        return workspace_path

    def _process_message(self, msg):
        workspace_path = None
        build_id = str(uuid.uuid4())
        success = False
        username = ""
        local_repo_path = ""

        try:
            raw = msg.value().decode('utf-8')
            logger.info(f"Received build request: {raw}")

            if '₹' not in raw:
                logger.error("Invalid message format")
                self.consumer.commit(msg)
                return

            local_repo_path, username = raw.split('₹', 1)

            logger.info(f"Build {build_id} | Path: {local_repo_path} | User: {username}")

            attempt = 1
            error_logs = ""

            while attempt <= MAX_AI_RETRIES:
                logger.info(f"--- Build Attempt {attempt} ---")

                # 🔁 Fresh workspace every retry
                workspace_path = self._prepare_workspace(local_repo_path, build_id)

                # 🤖 Ask Ollama for build commands
                commands = generate_build_commands(workspace_path, error_logs)

                if not commands.strip():
                    error_logs = "Ollama returned empty build script"
                    attempt += 1
                    continue

                logger.info("Executing build commands from Ollama")

                exit_code, stdout, stderr = execute_commands(workspace_path, commands)

                if exit_code == 0:
                    success = True
                    logger.info(f"Build {build_id} succeeded")
                    break

                logger.error(f"Build failed (attempt {attempt})")
                logger.error(stderr)

                error_logs = stderr
                attempt += 1

                # Clean workspace before next retry
                if workspace_path and os.path.exists(workspace_path):
                    shutil.rmtree(workspace_path, ignore_errors=True)

            send_deployment_message(username, local_repo_path, success)
            self.consumer.commit(msg)

        except Exception as e:
            logger.exception(f"Failed to process build: {e}")
            send_deployment_message(username, local_repo_path, False)
            self.consumer.commit(msg)

        finally:
            if workspace_path and os.path.exists(workspace_path):
                shutil.rmtree(workspace_path, ignore_errors=True)


kafka_consumer_service = BuildKafkaConsumer()


if __name__ == "__main__":
    asyncio.run(kafka_consumer_service.consume_loop())