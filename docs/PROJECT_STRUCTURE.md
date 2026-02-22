# Project Structure

This project is organized for clear ownership and easier maintenance.

## Root

- `server.js`: API/server entrypoint.
- `package.json`: scripts and dependencies.
- `Dockerfile`, `docker-compose.yml`: deployment/runtime containers.
- `capacitor.config.json`: mobile wrapper configuration.
- `.env.example`: environment variable template.
- `README.md`: setup and operational guidance.

## Application Code

- `public/`: web UI assets and dashboard scripts.
- `src/infrastructure/`: runtime plumbing (Redis, jobs, rate limiting).
- `src/services/`: domain services (notifications, etc).
- `desktop/`: Electron desktop shell.

## Data and Database

- `prisma/`: schema, migrations, and seed logic.
- `data/`: local JSON data files used by runtime features.

## Quality and Docs

- `tests/`: automated test suites.
- `docs/`: release notes, roadmaps, and project documentation.
- `.github/workflows/`: CI workflow(s).

## Operational Files

- `logs/`: local runtime logs (moved from root for cleanliness).

Notes:
- Keep logs out of root to reduce noise.
- Add new docs in `docs/`.
- Keep runnable entrypoints/scripts declared in `package.json`.
