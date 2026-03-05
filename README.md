# AgentPheonix 🚀

A full-stack, AI-powered cloud deployment platform built as a microservices architecture. AgentPheonix lets users connect their GitHub repositories, trigger builds using an AI-powered build agent (backed by a local LLM), and deploy through a modern React dashboard.

---


## Services

### 1. DiscoveryService (`:8761`)
- **Tech:** Spring Boot 4.0.2, Spring Cloud Netflix Eureka Server
- Netflix Eureka service registry; all other services register here on startup
- **No business logic** — purely for service discovery

---

### 2. GatewayService (`:8777`)
- **Tech:** Spring Boot 4.0.2, Spring Cloud Gateway (WebFlux), Spring Security OAuth2, Spring Kafka, Spring Mail
- Single entry point for all frontend API calls
- Handles user registration and login behind an **email OTP** verification flow
- Issues and signs **RS256 JWT tokens**; downstream services validate with the shared public key
- Sends OTP emails asynchronously via **Gmail SMTP**
- Automatically discovers and routes requests to `ProjectService` and `DeploymentService` via Eureka


---

### 3. ProjectService (`:8081`)
- **Tech:** Spring Boot 4.0.2, Spring Security OAuth2 Resource Server, Spring Kafka, JGit
- Manages Git repositories, build triggers, and project metadata
- Stores and manages **GitHub credentials** (username + PAT) per user
- Clones repositories locally using **JGit** and tracks branches
- Supports both **manual build triggers** and **GitHub push webhooks** for automated CI
- Publishes build requests to the **`build-notification`** Kafka topic

---

### 4. DeploymentService (`:8082`)
- **Tech:** Spring Boot 4.0.2, Spring Security OAuth2 Resource Server, Spring Kafka
- Stores **Cloud credentials** (PAT, region, cloud infrastructure type) per project
- Listens on the **`deployment`** Kafka topic for build completion events from BuildService
- A **scheduled job runs every 10 seconds**, picking up `PENDING` deployments and invoking the **Cloud CLI**
- Tracks deployment lifecycle: `NOT_STARTED → PENDING → MAY_FAIL_STAGE → DEPLOYED / FAILED`
- Exposes deployment status and the live URL back to the frontend

---

### 5. BuildService (`Python`)
- **Tech:** FastAPI, confluent-kafka, py-eureka-client, Ollama (LLM)
- AI-powered build agent; registers with Eureka on startup
- **Workflow:**
  1. Consumes messages from **`build-notification`** Kafka topic
  2. Copies the cloned repo into an isolated `/tmp/builds/<uuid>` workspace
  3. Sends the **file tree + previous error logs** to a local **Ollama** (llama3.1) LLM, which generates the appropriate bash build script
  4. Executes the build script (up to **3 retries** with error feedback to the LLM)
  5. Publishes a success/failure result to the **`deployment`** Kafka topic
- Supports any build system detected from files: `Makefile`, `Dockerfile`, `pom.xml`, `package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, etc.
---

### 6. Frontend (`/frontend`)
- **Tech:** React 19, Vite 7, React Router v7, Tailwind CSS v4, Framer Motion, Axios, Lucide React
- Auth-guarded SPA: unauthenticated users see login/register/forgot-password screens; authenticated users land on the **Project Dashboard**
- Dashboard lets users add GitHub projects, trigger builds, deploy, and view live deployment URLs and status
- Dedicated modals for managing **GitHub credentials**, **Vercel credentials** (PAT, region, infra), and adding new projects
- JWT stored in `localStorage`; all requests routed through the GatewayService

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| Language (Backend) | Java 17, Python 3 |
| Framework (Java) | Spring Boot 4.0.2, Spring Cloud 2025.1.0 |
| Framework (Python) | FastAPI |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway (WebFlux) |
| Message Broker | Apache Kafka |
| Security | JWT (RS256), Spring Security OAuth2, OTP via Email |
| ORM | Spring Data JPA (H2 in-memory) |
| Git Integration | JGit (Eclipse) |
| AI Build Agent | Ollama (llama3.1) |
| Cloud Deployment | Vercel CLI |
| Frontend | React 19, Vite 7, Tailwind CSS v4, Framer Motion |
| HTTP Client | Axios |

---

## Service Ports

| Service | Port |
|---|---|
| DiscoveryService (Eureka) | `8761` |
| GatewayService | `8777` |
| ProjectService | `8081` |
| DeploymentService | `8082` |
| BuildService (FastAPI) | `8000` *(Note: see `main.py`)* |
| Frontend (dev) | `5173` |

---

## Running Locally

### Prerequisites

- Java 17+
- Python 3.10+
- Apache Kafka running on `localhost:9092`
- [Ollama](https://ollama.com/) running locally with `llama3.1` model pulled
- [Vercel CLI](https://vercel.com/docs/cli) installed at `/opt/homebrew/bin/vercel`
- Node.js 18+ (for frontend)

### 1. Start DiscoveryService

```bash
cd DiscoveryService
./mvnw spring-boot:run
```

### 2. Start GatewayService

```bash
cd GatewayService
./mvnw spring-boot:run
```

### 3. Start ProjectService

```bash
cd ProjectService
./mvnw spring-boot:run
```

### 4. Start DeploymentService

```bash
cd DeploymentService
./mvnw spring-boot:run
```

### 5. Start Ollama (AI Build Agent)

```bash
# Pull the model (first time only)
ollama pull llama3.1

# Start the Ollama server (if not already running)
ollama serve
```

### 6. Start BuildService (Python)

```bash
cd BuildService
pip install fastapi confluent-kafka py-eureka-client requests uvicorn
uvicorn main:app --reload
```

### 7. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
AgentPheonix/
├── pom.xml                      # Root Maven multi-module POM
├── DiscoveryService/            # Eureka Server
│   └── src/main/java/…/DiscoveryServiceApplication.java
├── GatewayService/              # API Gateway + Auth (JWT, OTP, Email)
│   └── src/main/java/…/
│       ├── user/                # OtpService, UserLoginController, UserLoginService
│       ├── asset/               # DTOs: Login, LoginRequest, JWTResponse, Role
│       ├── config/              # JWTConfig, DataInitializer, UserDetailsServiceImpl
│       ├── message/             # KafkaMessagePublisher
│       └── repository/          # UserEntity, OtpEntity + Repositories
├── ProjectService/              # Git + Build management
│   └── src/main/java/…/
│       ├── service/             # BuildController, BuildService, GitPullController, GitPullService, GitCredentialController, GitCredentialsService
│       ├── assets/              # GitCredentials, GitDetails, GitFolderDTO
│       ├── configuration/       # JWTConfig
│       ├── message/             # KafkaMessage
│       └── repository/          # GitEntity, GitFolderEntity, BuildEntity + Repos
├── DeploymentService/           # Vercel deployment + cloud credentials
│   └── src/main/java/…/
│       ├── service/             # DeploymentController, DeploymentService, CloudCredentialController, CloudCredentialService
│       ├── assets/              # CloudCredentials, CloudInfrastructure, DeployStage
│       ├── configuration/       # JWTConfig
│       ├── message/             # KafkaMessage
│       └── repository/          # DeploymentEntity, DeploymentRepository
├── BuildService/                # Python AI build agent
│   ├── main.py                  # FastAPI app + Eureka registration
│   └── kafka_consumer.py        # Kafka consumer + Ollama build script generation
└── frontend/                    # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx              # Root router (auth guard)
        ├── api.js               # Axios API calls
        ├── main.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── SignupPage.jsx
            ├── ForgotPasswordPage.jsx
            ├── ProjectDashboard.jsx  # Main dashboard
            ├── AddProjectModal.jsx
            ├── CloudCredentialsModal.jsx
            ├── CredentialsPage.jsx
            ├── Dashboard.jsx
            └── ProjectSidebar.jsx
```

---

## Key Kafka Topics

| Topic | Producer | Consumer | Purpose |
|---|---|---|---|
| `build-notification` | ProjectService | BuildService | Triggers a new build |
| `deployment` | BuildService | DeploymentService | Reports build success/failure, triggers deploy |

---

## Security

- **JWT (RS256):** GatewayService signs tokens with a private RSA key (`jwt-private.pem`). All downstream services (ProjectService, DeploymentService) validate tokens with the corresponding public key (`jwt-public.pem`).
- **OTP:** 6-digit OTP sent via Gmail SMTP, valid for 5 minutes. Required for account creation and password reset.
- **All protected routes** require a valid `Bearer` JWT token.

---

## Environment / Configuration

The following environment variables / properties need to be configured for production:

| Service | Config | Description |
|---|---|---|
| GatewayService | `spring.mail.username.env` | Gmail SMTP username |
| GatewayService | `spring.mail.password.env` | Gmail App Password |
| All Java services | `eureka.client.service-url.defaultZone` | Eureka server URL |
| All Java services | `spring.kafka.bootstrap-servers` | Kafka broker address |
| BuildService | `EUREKA_SERVER` env var | Eureka server URL |
| DeploymentService | Vercel PAT (stored per-project) | Vercel Personal Access Token |

---

## Future Implementations

### ☁️ Multi-Cloud Deployment Support

Currently deployments are handled through the Vercel CLI. Planned integrations include:

- **AWS** — Deploy static sites to S3 + CloudFront, containerised apps to ECS/Fargate, and serverless functions to Lambda. Use IAM roles and access keys stored securely per project.
- **Google Cloud Platform (GCP)** — Deploy to Cloud Run for containerised workloads or Firebase Hosting for static frontends. Integrate with GCP service accounts for authentication.
- **Azure** — Support for Azure Static Web Apps and Azure App Service deployments.
- **Render / Railway / Fly.io** — Lightweight PaaS targets for quick backend deployments via their respective CLIs or APIs.
- A pluggable **CloudProvider** abstraction in `DeploymentService` so new providers can be added without changing core deployment logic.

---

### 🤖 AI Build Agent Improvements

The current `BuildService` uses a local Ollama LLM to generate bash build scripts. Planned improvements:

- **Smarter context injection** — Pass `package.json` scripts, `Makefile` targets, and framework-specific config files directly into the LLM prompt for far more accurate script generation, rather than relying solely on the file tree.
- **Fine-tuned models** — Evaluate smaller, build-specific fine-tuned models to reduce latency and improve reliability over a general-purpose LLM.
- **Build caching** — Cache dependency layers between builds (e.g. reuse `node_modules`, `.m2`, `.gradle`) so repeat builds are significantly faster.
- **Streaming logs** — Stream build output back to the frontend in real time via WebSockets or Server-Sent Events instead of polling for status.
- **Build history & logs** — Store full build logs per run so users can inspect past outputs and debug failures without re-triggering a build.
