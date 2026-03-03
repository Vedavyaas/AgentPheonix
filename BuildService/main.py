import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
import py_eureka_client.eureka_client as eureka_client

from kafka_consumer import kafka_consumer_service


EUREKA_SERVER = os.getenv("EUREKA_SERVER", "http://localhost:8761/eureka/")
APP_NAME = "BuildService"
INSTANCE_PORT = 8761  # ⚠️ Change if your FastAPI runs on another port


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 🔹 Register with Eureka
    print(f"Registering with Eureka at {EUREKA_SERVER}...")
    await eureka_client.init_async(
        eureka_server=EUREKA_SERVER,
        app_name=APP_NAME,
        instance_port=INSTANCE_PORT,
    )

    # 🔹 Start Kafka consumer in background
    print("Starting Kafka Consumer...")
    kafka_task = asyncio.create_task(kafka_consumer_service.consume_loop())

    try:
        yield
    finally:
        # 🔻 Graceful shutdown
        print("Stopping Kafka Consumer...")
        kafka_consumer_service.stop()

        # Wait for loop to exit safely
        if not kafka_task.done():
            kafka_task.cancel()
            try:
                await kafka_task
            except asyncio.CancelledError:
                pass

        # 🔻 Unregister from Eureka
        print("Unregistering from Eureka...")
        await eureka_client.stop_async()


app = FastAPI(
    lifespan=lifespan,
    title="AgentPhoenix BuildService"
)


@app.get("/")
async def read_root():
    return {"message": "BuildService is running and connected to Eureka!"}
