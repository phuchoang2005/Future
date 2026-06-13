# Training Machine Learning Application

Training Machine Learning Application is a full-stack web application for configuring, running, monitoring, and administering training jobs. The repository contains the product and architecture documentation plus an implemented React frontend, Spring Boot backend, PostgreSQL persistence, and Docker-based runtime topology.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Redux Toolkit, React Router, TailwindCSS v4, Radix UI, shadcn-style shared UI wrappers, Framer Motion, Axios.
- Backend: Java 25, Spring Boot 4, Spring Web, Spring WebSocket, Spring JDBC, Flyway, PostgreSQL.
- Testing and quality: ESLint, TypeScript type checking, Vitest, Testing Library, Playwright, Maven tests.
- Runtime: Docker Compose, Nginx frontend proxy, Nginx backend load balancer, PostgreSQL 18.
- API contract: OpenAPI at `docs/solution-architect/low-level-design/api-contracts/openapi.yaml`, with generated frontend types.

## Repository Layout

```text
.
|-- backend/          # Spring Boot API, backend Docker setup, backend load balancer
|-- docs/             # Product, UX, architecture, API, security, and delivery docs
|-- frontend/         # React/Vite app, frontend Docker setup, tests, shared UI
|-- docker-compose.yml
`-- README.md
```

Key documentation:

- `docs/po-requirement.md`: product requirements.
- `docs/ba-refine.md`: business analysis refinements.
- `docs/solution-architect/low-level-design/README.md`: backend/runtime design and Docker topology.
- `docs/solution-architect/frontend-architecture-document/README.md`: frontend architecture and applied tooling.
- `docs/solution-architect/low-level-design/api-contracts/openapi.yaml`: canonical API contract.

## Runtime Notes

This workspace is mounted from `ssh my-ec2`. Follow the local agent convention and run shell commands through `rtk`; runtime commands for this project should execute on the EC2 host:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application && docker compose ps'
```

Frontend local tooling requires Node.js 24 or newer. Backend local tooling requires Java 25 and Maven. Docker builds provide the expected runtime versions.

## Run the Full Stack

From the repository root on the EC2 host:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application && docker compose up -d --build'
```

The root Compose stack starts:

- `postgres`: PostgreSQL database.
- `api`: Spring Boot backend.
- `backend-load-balancer`: Nginx proxy for backend API and WebSocket traffic.
- `frontend`: Nginx-hosted frontend with `/api/` and WebSocket proxying to the backend load balancer.

Default entry points:

- Frontend: `http://localhost/`
- Frontend health: `http://localhost/healthz`
- Backend API health through the frontend proxy: `http://localhost/api/v1/health`

Stop the full stack:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application && docker compose down'
```

## Run Backend Only

The backend owns its standalone database, API container, and backend load balancer setup.

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/backend && docker compose up -d --build'
```

Default backend entry points:

- Backend load balancer: `http://localhost:8080/`
- API health: `http://localhost:8080/api/v1/health`

Stop the backend stack:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/backend && docker compose down'
```

## Run Frontend Only

The frontend has its own Docker setup. By default it proxies API traffic to `http://host.docker.internal:8080`, so run the backend stack first when API calls are needed.

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && docker compose up -d --build'
```

Default frontend-only entry points:

- Frontend: `http://localhost:5173/`
- Health: `http://localhost:5173/healthz`

Stop the frontend stack:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && docker compose down'
```

## Development Commands

Frontend commands require Node.js 24 or newer on the machine running them. If the EC2 host is still on an older Node.js version, run these inside a Node 24 container or use the Docker build path instead.

Frontend commands with a Node 24 host:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run generate:api'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run typecheck'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run lint'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run test'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run build'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && npm run e2e'
```

Frontend validation without installing Node 24 on the EC2 host:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && docker run --rm -v "$PWD":/app -w /app node:24-bookworm-slim sh -lc "npm ci && npm run typecheck && npm run lint && npm run test && npm run build"'
```

Backend commands:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application/backend && mvn test'
```

Docker configuration checks:

```bash
rtk ssh my-ec2 'cd ~/training-machine-learning-application && docker compose config --quiet'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/backend && docker compose config --quiet'
rtk ssh my-ec2 'cd ~/training-machine-learning-application/frontend && docker compose config --quiet'
```

## Smoke Test

After the root stack is running:

```bash
rtk ssh my-ec2 'curl -fsS http://localhost/healthz && curl -fsS http://localhost/api/v1/health'
```

For an authenticated development request, the current backend accepts a bearer token containing the email identity:

```bash
rtk ssh my-ec2 'curl -fsS -H "Authorization: Bearer admin@example.com" http://localhost/api/v1/auth/me'
```

## Documentation Rules

When behavior, architecture, tooling, or runtime setup changes, update the matching documentation under `docs/` in the same change. The architecture docs are the source of truth for intended stack decisions, and the OpenAPI contract is the source of truth for API shape.

## Commit Style

Use Conventional Commits as described in `docs/github-commit-strategy.md`, for example:

```text
feat(frontend): add training job form
fix(api): handle missing project
docs: update docker setup notes
```
