# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains product and architecture documentation for a training machine learning application. `README.md` is minimal; most working material lives under `docs/`.

- `docs/po-requirement.md`, `docs/ba-refine.md`: product and business requirements.
- `docs/ui-ux/`: personas, journeys, information architecture, user flows, and SVG wireframes for user and admin screens.
- `docs/solution-architect/`: high-level design, low-level design, API contracts, frontend architecture, caching, performance, and security guidance.
- `docs/solution-architect/low-level-design/api-contracts/openapi.yaml`: canonical OpenAPI contract.
- `backend/` and `frontend/`: reserved for implementation code; they are currently empty.

Keep diagrams next to the documents that explain them, using `diagrams/` subdirectories where that pattern already exists.

## Build, Test, and Development Commands

Follow the local agent convention and prefix shell commands with `rtk`.

- `rtk rg "<term>" docs`: search documentation quickly.
- `rtk plantuml -tsvg <file.puml>`: render PlantUML diagrams when updating `.puml` files.
- `rtk npm run build`, `rtk npm run test`, `rtk npm run lint`, `rtk npm run typecheck`, `rtk npm run e2e`: expected frontend validation commands once `frontend/` has a package manifest.

There is no repository-wide build script yet. Do not add command references unless the supporting tool configuration exists.

## Coding Style & Naming Conventions

Use Markdown for documentation with concise headings, short paragraphs, and relative links. Name docs and folders in lowercase kebab case, matching existing paths such as `frontend-architecture-document/` and `api-integration-and-client-side-caching-strategy/`. Use `.mermaid` for Mermaid diagrams, `.puml` for PlantUML diagrams, `.yaml` for OpenAPI fragments, and `.svg` for generated UI wireframes.

## Testing Guidelines

For documentation changes, validate links, diagram syntax, and OpenAPI references touched by the change. When implementation begins, align tests with the architecture docs: unit tests for retry, event dedupe, permissions, formatting, and theme utilities; component tests for loading, empty, dialog, and log viewer states; integration and E2E tests for training, recovery, WebSocket fallback, artifact download, and admin access.

## Commit & Pull Request Guidelines

Use Conventional Commits as documented in `docs/github-commit-strategy.md`: `feat(scope): add capability`, `fix(api): handle missing project`, or `docs: update setup notes`. Keep subjects imperative, lowercase after the type, under roughly 72 characters, and without a trailing period.

Pull requests should include a short summary, affected paths, validation performed, linked issue or requirement, and screenshots or regenerated SVGs when UI wireframes change.
