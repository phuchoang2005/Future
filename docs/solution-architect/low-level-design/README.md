# Low-Level Design - AI Training Management Platform

## Purpose

This Low-Level Design (LLD) translates the approved requirements, HLD, and ADR decisions into implementation-level guidance for the MVP. It assumes Spring Boot, ReactJS with TypeScript, Vite, Redux, Axios, TailwindCSS, Radix UI, shadcn/ui, PostgreSQL, Docker, Google Workspace authentication/email, local filesystem storage, and WebSocket-based real-time updates.

## Document Set

| Document | Purpose |
| --- | --- |
| [01-backend-design.md](./01-backend-design.md) | Spring Boot modules, packages, services, workers, and job execution design |
| [02-api-and-websocket-contracts.md](./02-api-and-websocket-contracts.md) | REST API endpoints, WebSocket channel contract, request/response examples |
| [03-database-design.md](./03-database-design.md) | PostgreSQL tables, enums, indexes, constraints, and transaction rules |
| [04-frontend-design.md](./04-frontend-design.md) | React screens, state management, API client, WebSocket client, and UI behavior |
| [05-security-and-operations.md](./05-security-and-operations.md) | Authorization, audit logging, storage rules, failure handling, and operational jobs |

## Technology Baseline

| Layer | Decision |
| --- | --- |
| Backend | Spring Boot 4.0.x, Java 25 LTS |
| Frontend | React 19.2, TypeScript, Vite, Redux, Axios, TailwindCSS, Radix UI, shadcn/ui, Node.js 24 LTS |
| Database | PostgreSQL 18 |
| Execution | Docker Engine, one centralized training server |
| Realtime | WebSocket primary, REST polling fallback |
| Authentication | Google Workspace OpenID Connect / OAuth 2.0 |
| Notifications | Google Workspace SMTP relay or Gmail API |
| Storage | Local POSIX filesystem under `/data` |

## MVP Constraints

* Maximum 7 active users.
* Maximum 2 concurrent `RUNNING` jobs.
* FIFO queue persisted in PostgreSQL.
* Queued and interrupted jobs must survive restart.
* Running jobs interrupted by restart are requeued and rerun from the beginning.
* Dataset management remains inside project Python code.
* Administrators cannot access project source code, detailed logs, or artifacts unless ownership rules allow it.

## MVP Authentication Bootstrap

The production authentication target remains Google Workspace OpenID Connect / OAuth 2.0. Until that integration is configured, the backend may run with a replaceable development bearer-token resolver for Docker-based implementation and testing.

* `Authorization: Bearer <email-or-user-id>` resolves to an `ACTIVE` user in the PostgreSQL `users` table.
* Flyway may seed one non-production `USER` and one non-production `ADMIN` account for local Docker validation.
* Controllers, authorization checks, audit logging, and ownership rules must depend on the current-user abstraction, not on the bearer-token parser directly.
* The development resolver must be isolated so Google Workspace/OIDC can replace it without changing resource controllers or RBAC services.

Seeded non-production accounts:

| Role | Email | Password | Development bearer token |
| --- | --- | --- | --- |
| User | `user@example.com` | `password` | `user@example.com` |
| Admin | `admin@example.com` | `password` | `admin@example.com` |

The password is used only by the frontend development login/register phase. The current backend resolver validates the bearer token against an active database user and does not store or verify passwords.

## Docker Setup and Load Balancing Topology

The Docker implementation separates frontend and backend ownership while keeping a root stack for integrated validation.

```text
Browser
  -> frontend nginx :80
     -> static Future frontend assets
     -> /api/* reverse proxy
        -> backend nginx load balancer
           -> api replicas :8080
              -> postgres :5432
```

Implementation rules:

* The root `docker-compose.yml` owns the integrated local stack and runs `frontend`, `backend-load-balancer`, `api`, and `postgres`.
* `frontend/docker-compose.yml` owns the standalone frontend static Nginx setup and proxies `/api/` to a configurable `API_UPSTREAM`.
* `backend/docker-compose.yml` owns the standalone backend stack, including `postgres`, `api`, and the backend Nginx load balancer.
* In the integrated root stack, `frontend` is the only public HTTP entry point and binds host port `80`.
* Frontend static assets are built into the frontend image and served by frontend Nginx.
* `/api/` requests are proxied from frontend Nginx to the backend load balancer, then to the Docker Compose `api` service on port `8080`.
* API containers do not publish host ports; they are reachable only on the Compose network.
* API replicas should be scaled with Docker Compose, for example `docker compose up --scale api=2`.
* Backend replicas share PostgreSQL and the mounted storage root.
* The backend exposes `GET /api/v1/health` as an unauthenticated health endpoint for Nginx and Docker validation.
* Sticky sessions are not required for the current development bearer-token resolver because session state is not stored in API process memory.
* WebSocket routes are proxied with HTTP upgrade headers through both frontend and backend Nginx layers and should be reviewed for affinity requirements before multi-replica streaming is enabled.

## Backend Code Organization

The implemented backend keeps controllers thin and pushes repeated persistence mapping into focused components.

* DTO records are grouped by concern under `com.example.aitraining.dto`: `CommonDtos`, `UserDtos`, `ProjectDtos`, `JobDtos`, and `SupportDtos`.
* Repository row mapping uses mapper classes under `com.example.aitraining.repo.mapper` so repositories do not duplicate `ResultSet` mapping logic.
* Queue persistence is isolated in `JobQueueRepository`; `JobRepository` owns training job CRUD/status changes.
* Services orchestrate authorization, persistence, audit logging, and response DTO assembly while controllers keep request routing and parameter binding.

## Key References

* HLD diagrams: `docs/sa/HLD/diagram/`
* ADR: `docs/sa/md/architectural-decision-records.md`
* Architecture refinement: `docs/sa/md/sa-refinement.md`
* Product and BA requirements: `docs/po-requirement.md`, `docs/ba-refine.md`
