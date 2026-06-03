# The Flock — Twitter Clone Challenge

A functional Twitter/X clone: monorepo with **NestJS + PostgreSQL** (`backend/`) and **React + Vite** (`frontend/`).

Full API documentation: **[backend/README.md](./backend/README.md)**.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20.x or later (24 LTS recommended) |
| npm | 10.x or later |
| Docker | 24+ |
| Docker Compose | v2 (`docker compose`) |
| Git | 2.x |

---

## Runbook

Two ways to run the project. Pick **one**; do not mix them on the same ports.

| | Local development | Docker full stack |
|---|-------------------|-------------------|
| **Best for** | Day-to-day dev and reviewers stepping through the code | Quick demo without installing Node for API/UI |
| **Postgres** | Docker container | Docker container |
| **Backend** | `npm run start:dev` on your machine | Docker container (migrate + seed on start) |
| **Frontend** | `npm run dev` on your machine | Docker container (nginx, production build) |
| **Config** | `backend/.env` required | Optional root `.env` for JWT secrets (see `.env.example`) |

---

## Local development

Run these steps **in order** from the repository root after cloning.

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd the-flock-twitter-clone-challenge
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

Wait until the container is healthy (`docker compose ps`).

### 3. Configure environment variables

```bash
cp .env.example backend/.env
```

Use the defaults in `.env.example` (`DATABASE_HOST=localhost`, etc.). They match the Postgres service above.

### 4. Backend — install, database, and run

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

API: **http://localhost:3000**

Leave this terminal running.

**Verify the API** (new terminal):

```bash
curl -s http://localhost:3000/health
```

Expected: `"status":"ok"` and `"database":"connected"`.

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'
```

Expected: JSON with `accessToken`, `refreshToken`, and `user`.

### 5. Frontend — install and run

From the **repository root** (new terminal):

```bash
cd frontend
npm install
npm run dev
```

UI: **http://localhost:5173** (talks to the API at http://localhost:3000).

### 6. Run tests (backend)

Postgres must still be running. From `backend/`:

```bash
npm test
npm run test:cov
npm run test:e2e
```

E2E tests use the same database as the API and run serially (`--runInBand`).

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Database connection errors | Run `docker compose up -d postgres`. Check `DATABASE_HOST=localhost` in `backend/.env`. |
| Port 3000 already in use | Stop any other process on port 3000, then run `npm run start:dev` again. |
| Empty timeline / no users | From `backend/`: `npm run seed`. |
| CORS errors in the browser | Ensure the backend is running and `CORS_ORIGIN` in `backend/.env` includes `http://localhost:5173`. |
| E2E failures | Run e2e only from `backend/` with a single Postgres instance; do not run two e2e suites in parallel. |

Stop Postgres: `docker compose down`. Reset database volume: `docker compose down -v`.

---

## Docker full stack

Runs **Postgres + backend + frontend** in containers. Requires **Docker and Docker Compose only** (no local `npm run start:dev` / `npm run dev`).

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd the-flock-twitter-clone-challenge
```

### 2. Start the stack

```bash
docker compose up --build
```

On first start the backend runs migrations and seed (~30–90 seconds). Wait until logs show `Starting API...`.

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Frontend | http://localhost:5173 |
| PostgreSQL | `localhost:5432` |

### 3. Verify

```bash
curl -s http://localhost:3000/health
```

Login with seed user: `alice@example.com` / `Password123!` (browser or curl; see [Seed and test credentials](#seed-and-test-credentials)).

Stop: `docker compose down`. Fresh database: `docker compose down -v`, then `docker compose up --build` again.

Optional: create a `.env` file in the repo root from `.env.example` to override `JWT_*` secrets, `CORS_ORIGIN`, or set `RUN_SEED=false` to skip re-seeding on every backend restart.

| Problem | Fix |
|---------|-----|
| Port 3000 or 5173 in use | Stop local Nest/Vite or another compose stack using those ports. |
| Backend container keeps restarting | `docker compose logs backend` — often migrate/seed error or port conflict. |

Details: `docker-compose.yml`, [backend/README.md — Docker](./backend/README.md#docker).

---

## Environment variables

Reference: **`.env.example`** → copy to **`backend/.env`**.

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API HTTP port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_HOST` | Postgres host (local setup) | `localhost` |
| `DATABASE_PORT` | Postgres port | `5432` |
| `DATABASE_USER` | DB user | `postgres` |
| `DATABASE_PASSWORD` | DB password | `postgres` |
| `DATABASE_NAME` | Database name | `twitter_clone` |
| `DATABASE_LOGGING` | TypeORM SQL logging | `false` |
| `DATABASE_SYNCHRONIZE` | Auto sync (`false` + migrations) | `false` |
| `JWT_ACCESS_SECRET` | Access token secret | `change-me-access-secret` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `change-me-refresh-secret` |
| `JWT_ACCESS_TTL` | Access token lifetime | `15m` |
| `JWT_REFRESH_TTL` | Refresh token lifetime | `7d` |
| `CORS_ORIGIN` | Allowed browser origins | `http://localhost:5173` |

Docker-only variables (`VITE_API_URL`, `RUN_SEED`) are documented in `.env.example` for optional container builds.

---

## Seed and test credentials

After `npm run seed` in `backend/`:

- **12 users**, **24 tweets**, **26 follows**, **27 likes**
- Seed **truncates** users, tweets, follows, likes, and refresh tokens before inserting

| Field | Value |
|-------|--------|
| Email | `alice@example.com` |
| Username | `alice` |
| Password | `Password123!` |

Other users: `bob@example.com`, `carol@example.com`, etc. (same password). Data in `backend/src/database/seed-data.ts`.

### Example API calls

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'

curl -s http://localhost:3000/timeline?limit=20 \
  -H "Authorization: Bearer <accessToken>"
```

---

## API — Overview

Base: `http://localhost:3000`. Public routes: `GET /health`, `POST /auth/*`. Everything else requires `Authorization: Bearer <accessToken>`.

| Area | Main routes |
|------|-------------|
| Auth | `POST /auth/register`, `login`, `refresh`, `logout` |
| Users | `GET /users`, `search`, `:username`, followers, following, tweets; `PATCH :username` |
| Tweets | `POST /tweets`, `DELETE /tweets/:id`, like/unlike |
| Timeline | `GET /timeline?limit=&cursor=` |

Full reference: **[backend/README.md](./backend/README.md)**.

---

## Stack and technical decisions

### Why this stack

- **NestJS + TypeScript**: modules, DI, and `class-validator` for a medium-sized REST API.
- **PostgreSQL + TypeORM**: relational model for users, follows, likes, and timeline; versioned migrations.
- **React + Vite**: SPA with fast local dev; production deploy can target any static host.
- **Custom JWT (access + refresh)**: no third-party auth; rotated and revoked refresh tokens in `refresh_tokens`.
- **Docker Compose**: runs **PostgreSQL** locally; API and UI run on the host with Node.

### Timeline and follow graph

- **Follows**: `follows` table (`followerId` → `followingId`), unique pair index.
- **Timeline**: own tweets + followed users, `createdAt DESC`, **cursor** pagination (`ISO_DATE|tweetId`).
- **Likes**: `likes` table plus `likesCount` and `likedByMe` in responses.

### Authentication

- Register/login return `accessToken`, `refreshToken`, and `user`.
- Access JWT in `Authorization`; refresh in body for `/auth/refresh` and `/auth/logout`.
- Invalid refresh reuse revokes all refresh tokens for that user.

### AI tools

- **Cursor**: scaffolding, Nest modules, tests, e2e, Docker, and documentation.

### Known limitations

See [backend/README.md](./backend/README.md#known-limitations).

- No WebSockets/SSE for timeline (client polling/refetch).
- No tweet images, replies, or notifications.
- User search by **username** and **email** (no separate display name).
- Profiles and `/users` listings require JWT.

---

## Repository structure

```
├── backend/          # NestJS API
├── frontend/         # React + Vite
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Delivery

- Public repository or accessible to reviewers.
- Commits **without squash**, feature-by-feature progression.
- Main branch: `main` or `master`.
