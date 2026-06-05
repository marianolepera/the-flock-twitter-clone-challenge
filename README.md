# The Flock — Twitter Clone Challenge

A functional Twitter/X clone: monorepo with **NestJS + PostgreSQL** (`backend/`) and **React + Vite** (`frontend/`).

Full API documentation: **[backend/README.md](./backend/README.md)**.

---

## Prerequisites

| Tool | Required for | Version |
|------|----------------|---------|
| Docker | **Quick start (recommended)** | 24+ |
| Docker Compose | **Quick start (recommended)** | v2 (`docker compose`) |
| Git | Both paths | 2.x |
| Node.js | Local development only | 20.x or later (24 LTS recommended) |
| npm | Local development only | 10.x or later |

---

## How to run the project

There are **two independent setups**. Use **one** only — they share ports **3000**, **5173**, and **5432**.

| | **Docker full stack** (start here) | Local development |
|---|-----------------------------------|-------------------|
| **Best for** | First run, demos, reviewers | Day-to-day coding with hot reload |
| **You need** | Docker only | Docker + Node.js |
| **Postgres** | Container | Container (`postgres` service only) |
| **Backend** | Container (migrate + seed on start) | `npm run start:dev` on your machine |
| **Frontend** | Container (production build + nginx) | `npm run dev` on your machine |
| **Database seed** | Automatic when the backend container starts | `npm run seed` in `backend/` |
| **Config** | Optional root `.env` from `.env.example` | `backend/.env` from `.env.example` |

> **Do not mix paths.** If you already ran `docker compose up` for the full stack, **do not** run `npm run start:dev` or `npm run dev` until you stop the backend and frontend containers (see [Switching to local development](#switching-to-local-development)).

---

## Quick start — Docker full stack (recommended)

Runs **PostgreSQL + API + UI** in containers. No `npm install` on the host required.

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd the-flock-twitter-clone-challenge
```

### 2. Free ports (if something else is using them)

The stack needs **5432**, **3000**, and **5173** on your machine.

```bash
docker compose ps
lsof -i :5432 -i :3000 -i :5173
```

- **Port 5432 in use** — often another Postgres container (e.g. an old project). Stop it: `docker stop <container-name>`, or change the host port in `docker-compose.yml` (e.g. `5433:5432`).
- **Port 3000 or 5173 in use** — stop local Nest/Vite or other containers: `docker compose stop backend frontend` from another clone, or kill the process shown by `lsof`.

### 3. Start the stack

Detached (recommended):

```bash
docker compose up --build -d
```

Or attached (logs in the terminal):

```bash
docker compose up --build
```

**What happens on first start**

1. Postgres starts and becomes healthy.
2. The backend container waits for Postgres, runs **migrations**, then **seed** (12 users, 24 tweets, etc.) when `RUN_SEED=true` (default).
3. The frontend container starts after the API is healthy.

First boot usually takes **30–90 seconds**. Watch the backend:

```bash
docker compose logs -f backend
```

Wait until you see `Starting API...` (or check health below).

| Service | URL |
|---------|-----|
| **Frontend (open in browser)** | http://localhost:5173 |
| **API** | http://localhost:3000 |
| **PostgreSQL** | `localhost:5432` (user/password/db: `postgres` / `postgres` / `twitter_clone`) |

### 4. Verify

```bash
docker compose ps
```

All three services should be **Up**; `backend` should be **healthy**.

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

Open **http://localhost:5173** and sign in with [seed credentials](#seed-and-test-credentials) (`alice@example.com` / `Password123!`).

### 5. Stop or reset

```bash
# Stop containers (keep data)
docker compose down

# Stop and delete database volume (fresh DB on next up)
docker compose down -v
docker compose up --build -d
```

**Optional:** copy `.env.example` to a **root** `.env` to override `JWT_*`, `CORS_ORIGIN`, or set `RUN_SEED=false` so the backend does not re-seed on every restart.

### Troubleshooting (Docker)

| Problem | Fix |
|---------|-----|
| `Bind for 0.0.0.0:5432 failed` | Another process/container uses 5432 — see step 2. |
| `EADDRINUSE` on 3000 / 5173 | Stop local `npm run start:dev` / `npm run dev` or other stacks on those ports. |
| Backend keeps restarting | `docker compose logs backend` — often migrate/seed or DB connection errors. |
| Empty timeline / no users | Ensure seed ran: `docker compose logs backend \| grep -i seed`. Re-run with `RUN_SEED=true` or `docker compose down -v` and start again. |
| Healthy API but UI errors | Confirm frontend is Up: `docker compose ps`. Rebuild if needed: `docker compose up --build -d frontend`. |

Details: `docker-compose.yml`, [backend/README.md — Docker](./backend/README.md#docker).

---

## Local development

For working on **backend** or **frontend** code with hot reload. Postgres still runs in Docker; API and UI run on your machine with Node.

### Before you start

If you previously ran the **Docker full stack**, stop API and UI containers so ports 3000 and 5173 are free:

```bash
docker compose stop backend frontend
# Postgres can stay up:
docker compose up -d postgres
```

If you only need Postgres from a clean state:

```bash
docker compose up -d postgres
```

Wait until healthy: `docker compose ps`.

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd the-flock-twitter-clone-challenge
```

(Skip if you already cloned.)

### 2. Environment variables

From the repository root:

```bash
cp .env.example backend/.env
```

Defaults (`DATABASE_HOST=localhost`, port `5432`, etc.) match the `postgres` service in `docker-compose.yml`.

### 3. Backend — install, database, and run

```bash
cd backend
npm install
npm run migration:run
npm run seed
npm run start:dev
```

API: **http://localhost:3000** — leave this terminal running.

**Verify** (new terminal):

```bash
curl -s http://localhost:3000/health
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"Password123!"}'
```

### 4. Frontend — install and run

New terminal, from the repository root:

```bash
cd frontend
npm install
npm run dev
```

UI: **http://localhost:5173** (talks to the API at http://localhost:3000).

### 5. Run tests (backend)

Postgres must be running. From `backend/`:

```bash
npm test
npm run test:cov
npm run test:e2e
```

E2E tests use the same database as the API and run serially (`--runInBand`).

### Troubleshooting (local)

| Problem | Fix |
|---------|-----|
| `EADDRINUSE` on port 3000 | Full-stack backend container still running — `docker compose stop backend`. |
| `EADDRINUSE` on port 5173 | Full-stack frontend container still running — `docker compose stop frontend`. |
| Database connection errors | `docker compose up -d postgres`. Check `DATABASE_HOST=localhost` in `backend/.env`. |
| Empty timeline / no users | From `backend/`: `npm run seed`. |
| CORS errors in the browser | Backend running and `CORS_ORIGIN` in `backend/.env` includes `http://localhost:5173`. |
| E2E failures | Run e2e only from `backend/` with one Postgres instance; do not run two e2e suites in parallel. |

Stop Postgres: `docker compose down`. Reset database volume: `docker compose down -v`.

### Switching to local development

Already used **Docker full stack** and want to code locally?

```bash
docker compose stop backend frontend
docker compose up -d postgres
# then follow "Local development" above (backend/.env, npm install, etc.)
```

You do **not** need to run `npm run seed` again if the same Docker volume already has seed data — unless you ran `docker compose down -v` or want a clean DB.

### Switching back to Docker full stack

Stop local Node processes (Ctrl+C in backend/frontend terminals), then:

```bash
docker compose up --build -d
```

Do not run `npm run start:dev` while the backend container is using port 3000.

---

## Environment variables

Reference: **`.env.example`**.

- **Local development:** copy to **`backend/.env`**.
- **Docker full stack:** optional **root** `.env` for compose overrides (`JWT_*`, `RUN_SEED`, `VITE_API_URL`, etc.).

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

Docker-only variables (`VITE_API_URL`, `RUN_SEED`) are in `.env.example`.

---

## Seed and test credentials

**Docker:** seed runs automatically on backend container start when `RUN_SEED=true` (default in `docker-compose.yml`).

**Local:** run `npm run seed` in `backend/` after migrations.

- **12 users**, **24 tweets**, **26 follows**, **27 likes**, plus **notifications** derived from those follows/likes
- Seed **truncates** users, tweets, follows, likes, notifications, and refresh tokens before inserting

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
| Users | `GET /users/search`, `:username`, followers, following, tweets; `PATCH :username` |
| Tweets | `POST /tweets`, `DELETE /tweets/:id`, like/unlike |
| Timeline | `GET /timeline?limit=&cursor=` |
| Notifications | `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read` |

Full reference: **[backend/README.md](./backend/README.md)**.

---

## Bonus features (challenge)

The challenge asks for **at least two** optional bonuses. This repo implements **three**:

| Bonus | Status | Summary |
|-------|--------|---------|
| **Docker Compose** | Done | Full stack: Postgres + API + UI — [Quick start](#quick-start--docker-full-stack-recommended) |
| **Notifications** | Done | REST inbox + unread badge + mark-all-read button |
| **Real-time (WebSockets)** | Done | [Socket.IO](https://socket.io/) timeline + notification push |

Not implemented (out of scope for now): tweet **images**, **reply threads**.

### Notifications

- **Backend:** `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/read`. Rows are created on **follow** and **like** (not on self-actions).
- **Frontend:** `/notifications` page, bell badge in the app shell, list with links to actor profile (and tweet context on likes).
- **Seed:** notifications are generated from existing follows and likes when the DB is seeded.

### Real-time (Socket.IO)

Uses [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways) on the API and [socket.io-client](https://socket.io/docs/v4/client-api/) in the UI. Same origin rules as REST: configure `CORS_ORIGIN` for the browser URL(s).

| Item | Value |
|------|--------|
| Namespace | `/events` (full URL: `{API_URL}/events`, e.g. `http://localhost:3000/events`) |
| Auth | JWT access token in handshake `auth.token` or `Authorization: Bearer …` |
| `timeline:new-tweet` | Sent to **followers** when someone they follow posts |
| `notification:new` | Sent to the **recipient** when a follow/like notification is created |

**Frontend behavior**

- **Timeline:** banner “New tweets — Show them” on Home; click refetches the feed (no auto-scroll).
- **Notifications:** unread count and list invalidate over the socket (no 30s polling).

**Quick manual check (two browsers)**

1. Start the stack: `docker compose up --build -d`.
2. Browser A: log in as **alice** (`alice@example.com` / `Password123!`).
3. Browser B (incognito): log in as **bob**, open **Home**, ensure Bob follows Alice (Search → follow if needed).
4. In browser A, post a tweet → browser B should show the timeline banner without refreshing.
5. In browser A, follow or like Bob’s content → Bob’s notification badge should update without refresh.

Protocol details and payloads: **[backend/README.md — WebSockets](./backend/README.md#websockets-socketio)**. Client wiring: **[frontend/README.md — Real-time](./frontend/README.md#real-time-socketio)**.

---

## Stack and technical decisions

### Why this stack

- **NestJS + TypeScript**: modules, DI, and `class-validator` for a medium-sized REST API.
- **PostgreSQL + TypeORM**: relational model for users, follows, likes, and timeline; versioned migrations.
- **React + Vite**: SPA with fast local dev; production deploy can target any static host.
- **Custom JWT (access + refresh)**: no third-party auth; rotated and revoked refresh tokens in `refresh_tokens`.
- **Docker Compose**: full stack (Postgres + API + UI) for quick start, or Postgres-only for local Node development.

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

- No tweet **images** or **reply threads**.
- User search by **username** and **email** (no separate display name).
- Profiles and user search require JWT.
- Real-time is **push + manual refresh** on the timeline (not live insertion of tweets in the list).

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
