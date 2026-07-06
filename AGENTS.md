# Grablink AI Agent Guidance

## What this repository is
- A link-sharing app with a NestJS backend in `app/backend/grablink` and a React frontend in `app/frontend/grablink-front`.
- The backend stores shares in PostgreSQL, generates 6-digit codes, expires shares after 5 minutes, and uses a scheduled cleanup task.
- The frontend is a Vite-powered React app that talks to the backend API.

## Important files
- `README.md` - primary project overview, quick start, and API contract.
- `app/backend/grablink/package.json` - backend scripts, dependencies, and test commands.
- `app/frontend/grablink-front/package.json` - frontend scripts and Vite config.
- `app/backend/grablink/src/main.ts` - backend bootstrap, validation, and CORS settings.
- `app/backend/grablink/src/share` - core share creation/access logic.
- `app/frontend/grablink-front/src/services/api.ts` - frontend API client.
- `docker-compose.yml` - local postgres + pgAdmin dev environment.
- `docker-compose.prod.yml` - production-style stack with nginx, backend, db, rabbitmq, and worker services.

## Build and run commands
### Backend
```bash
cd app/backend/grablink
npm install --legacy-peer-deps
npm run start:dev
```

### Frontend
```bash
cd app/frontend/grablink-front
npm install
npm run dev
```

### Local database stack
```bash
docker compose up -d
```

### Tests
```bash
cd app/backend/grablink
npm run test
npm run test:e2e
npm run test:cov
```

## Key architecture and conventions
- Backend: NestJS 11, TypeORM 0.3.x, PostgreSQL, class-validator/class-transformer.
- Database config is read from env vars in `app/backend/grablink/src/database/database.config.ts`.
- Frontend API base URL defaults to `http://localhost:3000` and can be overridden with `VITE_API_URL`.
- Prod compose references RabbitMQ and a worker service, but current backend code does not expose a worker script in `package.json`.
- `nginx.conf` routes `/api/` traffic to `http://api:3000/` and serves React build output from `app/frontend/grablink-front/dist`.

## Agent behavior
- Prefer existing docs and code comments over adding new assumptions.
- Keep changes aligned with current working commands and the repository structure.
- Do not add new major framework layers without explicit user direction.
- If a requested change touches deployment or infra, verify against `docker-compose.yml`, `docker-compose.prod.yml`, and `nginx.conf` before editing.

## Useful documentation
- [Project README](README.md)
- [Database quick start](docs/DATABASE_QUICK_START.md)
- [Database setup](docs/DATABASE_SETUP.md)
- [E2E testing](docs/E2E_TESTING.md)
- [QR code guide](docs/QR_CODE_GUIDE.md)
