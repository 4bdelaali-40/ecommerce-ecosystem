# EcoSphere — Distributed E-Commerce Ecosystem

> A production-ready, cloud-native e-commerce platform built with Java Spring Boot microservices, React, and AI-powered features — designed with security, scalability, and observability in mind.

[![CI/CD](https://github.com/4bdelaali-40/ecommerce-ecosystem/actions/workflows/ci.yml/badge.svg)](https://github.com/4bdelaali-40/ecommerce-ecosystem/actions)
[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com)
[![Kafka](https://img.shields.io/badge/Apache-Kafka-231F20?logo=apachekafka)](https://kafka.apache.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Services](#services)
- [Features](#features)
- [Security](#security)
- [Performance & Optimization](#performance--optimization)
- [Observability & Monitoring](#observability--monitoring)
- [Design Patterns](#design-patterns)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)

---

## Overview

EcoSphere is a fully distributed e-commerce ecosystem designed following **Domain-Driven Design (DDD)** and **Hexagonal Architecture** principles. The platform is composed of 7 independent microservices communicating via REST APIs and asynchronous Kafka events, orchestrated by Spring Cloud Netflix Eureka and routed through an API Gateway.

**Key highlights:**
- Role-based access control (USER / ADMIN) with stateless JWT authentication
- AI-powered features: product search, chatbot, inventory prediction, and personalized recommendations via **Groq × Llama 3.1**
- Real-time event streaming with Apache Kafka using the **Transactional Outbox Pattern**
- Distributed tracing with Zipkin and Micrometer across all services
- Redis caching, rate limiting, and token blacklisting
- Full CI/CD pipeline with GitHub Actions (build, test, Docker, code quality)
- Adaptive UI with automatic light/dark mode based on OS preference

---

## Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │              React Frontend :5173            │
                     │     Vite · TypeScript · TailwindCSS · Axios  │
                     │     Role-based routing · System dark mode    │
                     └─────────────────────┬────────────────────────┘
                                       │ HTTPS / REST
                     ┌─────────────────────▼──────────────────────────┐
                     │            API Gateway  :8080                  │
                     │  ┌──────────────────────────────────────────┐  │
                     │  │  JWT Auth Filter (GlobalFilter, Order -1)│  │
                     │  │  Rate Limiting · Redis Token Bucket      │  │
                     │  │  CORS · DedupeResponseHeader             │  │
                     │  │  Role Enforcement (ADMIN routes)         │  │
                     │  └──────────────────────────────────────────┘  │
                     │  Spring Cloud Gateway · Load Balancing (lb://) │
                     └───────┬──────┬─────┬─────────┬───────┬───────┬─┘
                             │      │     │         │       │       │
                ┌────────────▼─┐ ┌──▼──┐ ┌▼────┐ ┌──▼──┐ ┌──▼──┐ ┌──▼──────┐
                │Identity :8085│ │Prod │ │Order│ │Inv  │ │Notif│ │AI :8086 │
                │Spring Sec 6  │ │:8081│ │:8082│ │:8083│ │:8084│ │Groq API │
                │JWT + Refresh │ │Mongo│ │Kafka│ │Kafka│ │Kafka│ │Llama3.1 │
                │Redis Blacklst│ │Redis│ │Outbx│ │     │ │     │ │         │
                └──────────────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────────┘
                               │      │      │      │      │
                            ┌──▼──────▼──────▼──────▼──────▼───┐
                            │  PostgreSQL · MongoDB · Redis    │
                            │  Kafka · Zookeeper · Zipkin      │
                            └──────────────────────────────────┘
                                            │
                            ┌───────────────▼──────────────────┐
                            │  Eureka Server :8761             │
                            │  Config Server :8888             │
                            └──────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Layer | Technology | Purpose |
|---|---|---|
| Language | Java 21 (LTS) | Virtual threads, records, pattern matching |
| Framework | Spring Boot 3.3 | Auto-configuration, production-ready features |
| Cloud | Spring Cloud 2023 | Gateway, Config, Eureka, LoadBalancer |
| Security | Spring Security 6 + JJWT | Stateless auth, role enforcement |
| Messaging | Apache Kafka + Zookeeper | Async event streaming, Outbox pattern |
| Databases | PostgreSQL, MongoDB | Relational + document storage |
| Caching | Redis | Rate limiting, token blacklist, product cache |
| AI / LLM | Groq API (llama-3.1-8b-instant) | Real-time AI inference |
| Tracing | Zipkin + Micrometer | Distributed request tracing |
| Mapping | MapStruct | Compile-time DTO mapping, zero reflection |
| API Docs | SpringDoc OpenAPI 3 | Swagger UI per service |
| Build | Maven (multi-module, 9 modules) | Unified dependency management |

### Frontend
| Layer | Technology | Purpose |
|---|---|---|
| Language | TypeScript 5 | Type safety across the entire codebase |
| Framework | React 18 | Concurrent rendering, hooks |
| Build Tool | Vite + SWC | Sub-second HMR, 10-20x faster than Babel |
| Styling | TailwindCSS v4 | Utility-first, zero-runtime CSS |
| Animation | Framer Motion | Declarative animations |
| HTTP Client | Axios | Interceptors, global auth header injection |
| Routing | React Router DOM v6 | Protected routes, role-based navigation |
| Theme | CSS custom properties | OS-adaptive light/dark mode (prefers-color-scheme) |

### DevOps & Infrastructure
| Layer | Technology | Purpose |
|---|---|---|
| Containers | Docker + Docker Compose | Local infrastructure orchestration |
| CI/CD | GitHub Actions | Automated build, test, quality checks |
| Code Quality | Maven Checkstyle | Enforce coding standards on every push |

---

## Services

| Service | Port | Responsibility | Database | Key Dependencies |
|---|---|---|---|---|
| **eureka-server** | 8761 | Service registry & discovery | — | Spring Cloud Netflix |
| **config-server** | 8888 | Centralized config from Git | Git | Spring Cloud Config |
| **api-gateway** | 8080 | Routing, auth, rate limiting | Redis | Spring Cloud Gateway |
| **identity-service** | 8085 | Auth, JWT, refresh tokens | PostgreSQL | Spring Security 6 |
| **product-service** | 8081 | Product catalog, caching | MongoDB + Redis | MapStruct, Swagger |
| **order-service** | 8082 | Order placement, events | PostgreSQL | Kafka Outbox |
| **inventory-service** | 8083 | Stock management | PostgreSQL | Kafka Consumer |
| **notification-service** | 8084 | Email/push notifications | — | Kafka Consumer |
| **ai-service** | 8086 | AI features via Groq API | — | WebClient, Groq |

---

## Features

### User Features
- **Authentication** — Register, login, logout with JWT + automatic refresh token rotation
- **Product Explorer** — Browse catalog, filter by category, AI-powered natural language search
- **Order Management** — Place orders with real-time status tracking and visual progress timeline
- **AI Chatbot** — Real-time conversational assistant powered by Llama 3.1
- **AI Recommendations** — Personalized product recommendations based on purchase history
- **Responsive UI** — Fully adaptive interface with system light/dark mode detection

### Admin Features
- **Mission Control Dashboard** — Real-time health monitoring for all 7 services, live Kafka event stream, revenue and order metrics from real data
- **Product CRUD** — Create, update, delete products with inventory stock indicators (low stock / out of stock warnings)
- **AI Inventory Prediction** — ML-driven stock forecasting with reorder recommendations
- **Role-Based Access** — Admin-only routes protected at both API Gateway and frontend routing level
- **System Stats** — Live total orders, revenue, product count pulled from actual databases

---

## Security

Security is implemented in **multiple layers** across the entire stack — defense in depth.

### 1. Stateless JWT Authentication
- Access tokens signed with **HMAC-SHA256** and short TTL
- Token claims carry `userId` and `role` — no database lookup per request
- Tokens are verified at the **API Gateway** before reaching any downstream service

### 2. Refresh Token Rotation
- Every refresh invalidates the previous refresh token and issues a new pair
- Refresh tokens are stored in **Redis** with TTL-based expiration
- Prevents reuse of stolen refresh tokens

### 3. Redis Token Blacklisting
- On logout, the access token is stored in Redis with a TTL matching its remaining validity
- All subsequent requests using blacklisted tokens are rejected at the gateway
- Prevents session hijacking after explicit logout

### 4. API Gateway Global Security Filter
- A custom `GlobalFilter` at Order `-1` intercepts **every incoming request** before routing
- Public paths (auth, health checks) are whitelisted — all others require a valid Bearer token
- Role enforcement at gateway level: `ADMIN`-only paths return `403 FORBIDDEN` for regular users
- Individual microservices do not need to re-implement authentication logic

### 5. Role-Based Access Control (RBAC)
```
USER  → Products (browse, buy) · Orders (own) · AI Center
ADMIN → All above + Mission Control · Admin Panel · All orders
```
- Roles embedded in JWT, enforced at the gateway and at the frontend router level
- Admin navigation items are conditionally rendered — never present in the DOM for regular users
- Admin routes redirect non-admin users to `/products`

### 6. CORS — Single Point of Control
- Strict CORS policy configured **only at the gateway** — `http://localhost:5173` allowed
- `DedupeResponseHeader` filter removes duplicate CORS headers from downstream services
- No CORS config in individual microservices — zero risk of misconfiguration

### 7. Rate Limiting
- **Redis token bucket** algorithm via Spring Cloud Gateway `RequestRateLimiter`
- 10 requests/second replenish rate, burst capacity of 20, keyed per client IP
- Applied on product and order routes to prevent brute force and abuse

### 8. Password Security & Input Validation
- Passwords hashed with **BCrypt** (adaptive work factor) — never stored or logged in plain text
- `@Valid` + Jakarta Bean Validation on all request DTOs
- Global `@ControllerAdvice` exception handler — no stack traces exposed in API responses

---

## Performance & Optimization

### Backend

**Redis Cache-Aside (product-service)**
- Product catalog responses cached in Redis with configurable TTL
- Cache miss falls back to MongoDB and populates the cache
- Dramatically reduces MongoDB read load under concurrent traffic

**Transactional Outbox Pattern (order-service)**
- Order placement is **non-blocking**: HTTP response returned immediately after PostgreSQL commit
- The Outbox guarantees Kafka event delivery exactly once, even on service crash or restart
- Inventory reservation and notification sending are fully asynchronous — zero added latency to the user

**Database Strategy**
- **PostgreSQL** for transactional data (orders, users) — ACID guarantees, relational integrity
- **MongoDB** for the product catalog — flexible schema, document model, horizontal scaling ready
- **HikariCP** connection pooling (Spring Boot default) for high-throughput PostgreSQL access

**MapStruct — Zero-Cost DTO Mapping**
- Compile-time generated mappers replace manual boilerplate
- No reflection at runtime — mapping is as fast as hand-written code

### Frontend

**Vite + SWC Build Pipeline**
- SWC (Rust-based) replaces Babel: **10–20× faster** TypeScript/JSX transpilation
- Native ESM dev server: near-instant Hot Module Replacement
- Tree-shaking eliminates all unused imports in production bundles

**Global Axios Interceptors**
- Single request interceptor injects `Authorization: Bearer <token>` on every call
- Single response interceptor handles `401 Unauthorized` → automatic redirect to `/login`
- No per-component authentication logic — DRY principle enforced at the HTTP client level

**Vite Dev Proxy**
- Health check requests proxied through Vite's dev server — no direct browser-to-service calls
- Eliminates CORS preflight issues during development without touching service configs

**Optimistic UI & UX**
- Toast notifications give immediate feedback before server confirmation
- Buttons replaced by spinners during async operations — prevents double-submission
- Admin components **never rendered** (not just hidden) for regular users — no leaked data

**Conditional Rendering & Route Guards**
- `PrivateRoute` component wraps all authenticated pages
- `AdminRoute` component redirects non-admins at the router level
- Role stored in `localStorage` from login response — checked on every route change

---

## Observability & Monitoring

### Distributed Tracing with Zipkin
- **Micrometer Tracing** auto-instruments all HTTP requests and Kafka messages
- **Zipkin** collects spans and visualizes complete request flows at `http://localhost:9411`
- Every cross-service call carries a `traceId` and `spanId` for end-to-end correlation
- 100% sampling rate configured (`probability: 1.0`) — every request is traced

### Real-Time Service Health Dashboard
- Mission Control (admin only) polls all 7 services every **30 seconds** via Vite proxy
- Visual green/red status cards with UP/DOWN labels per service
- Global system badge: "All Systems Operational" or "N Service(s) Down"
- Automatic refresh with manual refresh button

### Structured Logging
- All services use **SLF4J + Logback**
- Log entries include `traceId` and `spanId` — correlatable with Zipkin traces
- Service name injected in every log line via Spring Cloud context

### Eureka Service Registry Dashboard
- All registered instances visible at `http://localhost:8761`
- Instance heartbeat, status, and metadata monitored in real time
- Load balancer uses registry to route requests via `lb://service-name`

### Spring Boot Actuator
- `/actuator/health` exposed on every service
- `/actuator/info`, `/actuator/metrics`, `/actuator/prometheus` available
- Gateway exposes `/actuator/gateway` for route inspection

---

## Design Patterns

| Pattern | Where Applied | Purpose |
|---|---|---|
| **Hexagonal Architecture** | All microservices | Decouple domain logic from infrastructure |
| **Transactional Outbox** | order-service | Guaranteed Kafka delivery without distributed transactions |
| **API Gateway** | api-gateway | Single entry point for cross-cutting concerns |
| **Service Registry** | eureka-server | Dynamic discovery, client-side load balancing |
| **Cache-Aside** | product-service | Reduce database read load with Redis |
| **Token Blacklist** | identity-service | Secure stateless logout |
| **Refresh Token Rotation** | identity-service | Secure long-lived sessions without DB per request |
| **CQRS (partial)** | order-service | Separate read/write use case interfaces via ports |
| **Repository Pattern** | All services | Abstract persistence behind port interfaces |
| **DTO Pattern** | All services | Decouple API contracts from domain models |
| **Global Exception Handler** | All services | Centralized error handling, consistent HTTP responses |
| **Role-Based Route Guard** | Frontend + Gateway | Defense-in-depth access control |

---

## Prerequisites

- **Java 21** — [Download](https://adoptium.net)
- **Maven 3.9+** — [Download](https://maven.apache.org)
- **Node.js 20+** — [Download](https://nodejs.org)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop)
- **Groq API Key** (free tier available) — [Get key](https://console.groq.com)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/4bdelaali-40/ecommerce-ecosystem.git
cd ecommerce-ecosystem
```

### 2. Start infrastructure

```bash
docker-compose up -d postgres mongodb redis zookeeper kafka zipkin
```

Wait ~30 seconds for all containers to be healthy.

### 3. Start backend services (in order)

```bash
# Terminal 1 — Service Registry (must start first)
mvn spring-boot:run -pl eureka-server

# Terminal 2 — Identity Service
mvn spring-boot:run -pl identity-service

# Terminal 3 — API Gateway
mvn spring-boot:run -pl api-gateway

# Terminal 4 — Product Service
mvn spring-boot:run -pl product-service

# Terminal 5 — Order Service
mvn spring-boot:run -pl order-service

# Terminal 6 — Inventory Service
mvn spring-boot:run -pl inventory-service

# Terminal 7 — Notification Service
mvn spring-boot:run -pl notification-service

# Terminal 8 — AI Service
$env:GROQ_API_KEY="your_groq_api_key_here"   # Windows PowerShell
export GROQ_API_KEY="your_groq_api_key_here" # Linux / macOS
mvn spring-boot:run -pl ai-service
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Application available at **http://localhost:5173**

### 5. Create an admin account

```powershell
# Windows PowerShell
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register/admin" `
  -Method POST -ContentType "application/json" `
  -Body '{"email":"admin@ecosphere.com","password":"admin123","firstName":"Admin","lastName":"EcoSphere"}'
```

```bash
# Linux / macOS
curl -X POST http://localhost:8080/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecosphere.com","password":"admin123","firstName":"Admin","lastName":"EcoSphere"}'
```

### 6. Verify everything is running

| URL | Description |
|---|---|
| http://localhost:5173 | Frontend application |
| http://localhost:8761 | Eureka service registry dashboard |
| http://localhost:9411 | Zipkin distributed tracing UI |
| http://localhost:8080/api/health/services | All services health status (JSON) |
| http://localhost:8085/swagger-ui.html | Identity Service API docs |
| http://localhost:8081/swagger-ui.html | Product Service API docs |
| http://localhost:8082/swagger-ui.html | Order Service API docs |
| http://localhost:8086/swagger-ui.html | AI Service API docs |

---

## API Documentation

### Authentication
```http
POST /api/auth/register           Register new user (role: USER)
POST /api/auth/register/admin     Register admin user (role: ADMIN)
POST /api/auth/login              Login → { token, refreshToken, userId, role }
POST /api/auth/refresh            Rotate refresh token → new access token
POST /api/auth/logout             Blacklist tokens in Redis
```

### Products
```http
GET    /api/products                  List all products
GET    /api/products/{id}             Get product by ID
GET    /api/products/category/{cat}   Filter by category
POST   /api/products                  Create product          [ADMIN]
PUT    /api/products/{id}             Update product          [ADMIN]
DELETE /api/products/{id}             Delete product          [ADMIN]
```

### Orders
```http
POST /api/orders                  Place a new order (triggers Kafka event)
GET  /api/orders/{id}             Get order by ID
GET  /api/orders/user/{userId}    Get all orders for a specific user
GET  /api/orders                  Get all orders              [ADMIN]
```

### AI Services
```http
POST /api/ai/chat                 Conversational chatbot (Llama 3.1)
POST /api/ai/search               Natural language product search
POST /api/ai/recommendations      Personalized product recommendations
POST /api/ai/inventory/predict    Demand forecasting & reorder advice [ADMIN]
```

### Health & Monitoring
```http
GET /api/health/services          Health status of all 7 services
GET /actuator/health              Individual service health check
GET /actuator/metrics             Service metrics
```

---

## CI/CD Pipeline

```
Push / Pull Request to main
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  Job 1              │     │  Job 2              │     │  Job 3              │
│  Build & Test       │──▶ │  Docker Build       │────▶│  Code Quality       │
│                     │     │                     │     │                     │
│  Java 21 setup      │     │  docker compose     │     │  Maven Checkstyle   │
│  mvn clean verify   │     │  build --no-cache   │     │  Style enforcement  │
│  All 9 modules      │     │  All 9 services     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

Every commit is guaranteed to:
- Compile all 9 Maven modules without errors
- Pass all unit and integration tests
- Build Docker images successfully for all services
- Comply with project coding standards

---

## Project Structure

```
ecommerce-ecosystem/
├── .github/
│   └── workflows/
│       └── ci.yml                    # 3-job CI pipeline
├── api-gateway/                      # Spring Cloud Gateway + JWT filter
├── config-server/                    # Centralized config from Git
├── eureka-server/                    # Netflix Eureka registry
├── identity-service/                 # Auth + JWT + Refresh tokens
├── product-service/                  # Catalog + Redis cache
├── order-service/                    # Orders + Kafka Outbox
├── inventory-service/                # Stock + Kafka consumer
├── notification-service/             # Notifications + Kafka consumer
├── ai-service/                       # Groq AI integration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.tsx            # Role-aware navigation
│   │   ├── pages/
│   │   │   ├── Login.tsx             # JWT auth + role storage
│   │   │   ├── MissionControl.tsx    # Admin: live health + metrics
│   │   │   ├── ProductExplorer.tsx   # AI search + Buy Now
│   │   │   ├── OrderTracker.tsx      # Real-time order status
│   │   │   ├── AiCommandCenter.tsx   # Chatbot + recommendations
│   │   │   └── AdminPanel.tsx        # CRUD + AI inventory
│   │   ├── services/
│   │   │   └── api.ts                # Axios client + interceptors
│   │   └── index.css                 # CSS variables light/dark theme
│   ├── vite.config.ts                # Proxy config for dev
│   └── package.json
├── docker-compose.yml                # Full infrastructure stack
└── pom.xml                           # Maven multi-module parent (9 modules)
```

**Hexagonal Architecture per service:**

```
service/
├── adapters/
│   ├── in/web/           # REST controllers    (driving adapters)
│   └── out/
│       ├── persistence/  # JPA / MongoDB       (driven adapters)
│       └── messaging/    # Kafka producers     (driven adapters)
├── application/          # Use cases, business logic
├── domain/               # Entities, value objects, domain events
└── ports/
    ├── in/               # Use case interfaces (PlaceOrderUseCase...)
    └── out/              # Repository & messaging interfaces
```

---

## Environment Variables

| Variable | Service | Description | Default |
|---|---|---|---|
| `GROQ_API_KEY` | ai-service | Groq API key for Llama 3.1 | — |
| `JWT_SECRET` | gateway, identity | HMAC-SHA256 signing key | `ecommerce-secret-...` |
| `SPRING_DATASOURCE_URL` | identity, order, inventory | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/...` |
| `SPRING_DATA_MONGODB_URI` | product | MongoDB connection URI | `mongodb://localhost:27017/...` |
| `SPRING_REDIS_HOST` | gateway, identity | Redis hostname | `localhost` |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | all services | Eureka registry URL | `http://localhost:8761/eureka/` |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

Commit types: `feat` · `fix` · `docs` · `refactor` · `test` · `chore`

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**EcoSphere** — Java 21 · Spring Boot 3.3 · React 18 · Apache Kafka · Groq AI

*Production-grade microservices: security in depth · event-driven architecture · AI integration · full observability*

</div>