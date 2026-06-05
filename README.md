# The Flock — Twitter Clone Challenge

A functional Twitter/X clone: **NestJS + PostgreSQL** (`backend/`) and **React + Vite** (`frontend/`).

| Document | Contents |
|----------|----------|
| **[backend/README.md](./backend/README.md)** | Full API reference |
| **[frontend/README.md](./frontend/README.md)** | UI, routes, scripts, and frontend tests |

---

## Runbook — quick start (reviewers)

**Requirements:** Docker 24+ and Docker Compose v2. Node.js on the host is not required.

```bash
git clone <REPO_URL>
cd the-flock-twitter-clone-challenge
docker compose up --build -d
```

Wait ~30–90 seconds, then verify:

```bash
docker compose ps
curl -s http://localhost:3000/health
```

Expected response: `"status":"ok"` and `"database":"connected"`.

| Service | URL |
|---------|-----|
| **App (open in browser)** | http://localhost:5173 |
| **API** | http://localhost:3000 |

**Test login** (seed data):

| Field | Value |
|-------|--------|
| Email | `alice@example.com` |
| Password | `Password123!` |

On startup, the backend runs migrations and an automatic **seed** (`RUN_SEED=true`): 12 users, tweets, follows, likes, and notifications.

**Stop / reset:**

```bash
docker compose down              # keep data
docker compose down -v           # wipe DB volume
docker compose up --build -d     # fresh start
```

### Common issues

| Problem | Fix |
|---------|-----|
| Port 5432, 3000, or 5173 in use | `lsof -i :5432 -i :3000 -i :5173` and free the process, or `docker compose stop` on another stack |
| Empty timeline | Check seed: `docker compose logs backend \| grep -i seed`. Reset: `docker compose down -v && docker compose up --build -d` |
| Backend restart loop | `docker compose logs backend` |

---

## Local development (optional)

Hot reload with Node on the host. **Postgres still runs in Docker.** Do not mix with the full stack on the same ports.

```bash
docker compose stop backend frontend
docker compose up -d postgres
cp .env.example backend/.env

cd backend && npm install && npm run migration:run && npm run seed && npm run start:dev
# another terminal:
cd frontend && npm install && npm run dev
```

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| UI | http://localhost:5173 |

If you previously ran the Docker full stack, stop `backend` and `frontend` before `npm run start:dev` / `npm run dev`.

---

## Tests

Postgres must be running (`docker compose up -d postgres` or the full stack).

```bash
# Backend — unit
cd backend && npm test

# Backend — coverage (~92%)
cd backend && npm run test:cov

# Frontend — unit + integration
cd frontend && npm run test:run

# Frontend — E2E (Playwright; requires API + UI running and seed data)
cd backend && npm run seed
cd frontend && npm run test:e2e:install && npm run test:e2e

# Backend — E2E (run last: drops and recreates tables on the shared DB)
cd backend && npm run test:e2e && npm run seed
```

---

## Environment variables

Copy **`.env.example`** to `backend/.env` (local dev) or use a root `.env` for Docker overrides.

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_*` | Postgres connection | see `.env.example` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | JWT signing keys | change in production |
| `JWT_ACCESS_TTL` / `JWT_REFRESH_TTL` | Token lifetime | `15m` / `7d` |
| `CORS_ORIGIN` | Allowed browser origins | `http://localhost:5173` |
| `VITE_API_URL` | API URL (frontend build) | `http://localhost:3000` |
| `RUN_SEED` | Seed on backend Docker start | `true` |

Full list with comments: **`.env.example`**.

---

## Architecture decisions

### Stack choice

| Choice | Why |
|--------|-----|
| **NestJS** over Express | Built-in modules, guards, pipes, and DI fit auth + many REST domains without ad-hoc structure. |
| **PostgreSQL + TypeORM** | Follows, likes, and timeline are relational; migrations keep the schema explicit and reviewable. |
| **React + Vite + TanStack Query** | Vite for fast dev; Query handles cache, pagination, and post-mutation invalidation without a custom data layer. |
| **Custom JWT** | Challenge requires own auth; access + refresh with hashed refresh tokens in DB meets that without a third-party provider. |
| **Docker Compose** | One-command review setup; same Postgres service reused for local Node dev. |

### Timeline and social graph

- **Follows:** `follows` (`followerId` → `followingId`), unique index on the pair.
- **Timeline:** SQL over own tweets + followed authors, `createdAt DESC`, **cursor** pagination (`ISO8601|tweetId`) for stable infinite scroll.
- **Likes:** `likes` table; `likesCount` denormalized on tweets to avoid counting on every read.

### Authentication

- Register/login → `accessToken`, `refreshToken`, `user`. Access JWT on every protected request; refresh in body for `/auth/refresh` and `/auth/logout`.
- Nest `JwtAuthGuard` on controllers; axios interceptor refreshes on 401 and clears session on failure.
- Refresh token rotation; reuse of a revoked refresh token revokes all sessions for that user.

### Trade-offs


|----------|--------|---------------------|--------|
| Timeline paging | Cursor | Offset | Stable pages when new tweets arrive; no duplicate/skipped rows on scroll. |
| Real-time feed | Socket push + refetch banner | Insert tweets live in the list | Simpler cache/scroll behavior; avoids reordering and duplicate keys in React Query. |
| Image storage | Local disk (`uploads/`) |
| Public profiles | JWT required |
| Reply visibility | Thread page only | Replies in main timeline | Keeps the home feed readable; matches common “view thread” UX. |

### AI tools (Cursor)

Used throughout as an accelerator, with manual review before merge:

- **Scaffolding** — Nest modules, entities, migrations, and React feature folders.
- **Features** — notifications, Socket.IO, reply threads, and image uploads implemented incrementally (one PR per feature).
- **Tests** — unit/integration specs and Playwright E2E; AI drafts, human fixes edge cases (e.g. E2E follow target vs seed data).
- **Refactors** — feature hooks extracted from components; dead code removed with test runs after each change.
- **Docs** — README runbook and API docs.

### Known limitations

- Search by **username** and **email** only (no separate display name).
- Timeline real-time is notify + manual refresh, not live list updates.
- One image per tweet, max **5 MB**, files not deleted when the tweet is deleted.
- Backend E2E tests drop and recreate tables on the shared Postgres instance — re-run `npm run seed` before frontend E2E or manual testing.

API and WebSocket details: **[backend/README.md](./backend/README.md)**.

---

## Features

### Required

Auth (register, login, logout, protected routes, profile with bio), tweets (create, delete, 280 chars), timeline with infinite scroll, follow/unfollow, like/unlike, followers/following, user search, mobile-first responsive UI.

### Bonus (all implemented)

| Bonus | Summary |
|-------|---------|
| **Docker Compose** | Full stack with one command |
| **Notifications** | REST inbox, badge, mark-all-read (follow, like, reply) |
| **Real-time** | Socket.IO — timeline banner + notification badge |
| **Reply threads** | Replies + `/tweets/:id` thread page |
| **Image uploads** | Optional tweet attachment (multipart, 5 MB) |

---

## API — overview

Base: `http://localhost:3000`. Public: `GET /health`, `POST /auth/*`. Everything else requires JWT.

| Area | Main routes |
|------|-------------|
| Auth | `POST /auth/register`, `login`, `refresh`, `logout` |
| Users | `GET /users/search`, `:username`, followers, following, tweets; `PATCH :username` |
| Tweets | `POST /tweets`, `DELETE /tweets/:id`, like/unlike, `GET /tweets/:id/thread` |
| Media | `GET /uploads/:filename` |
| Timeline | `GET /timeline?limit=&cursor=` |
| Notifications | `GET /notifications`, `unread-count`, `PATCH /notifications/read` |

Full reference: **[backend/README.md](./backend/README.md)**.

---

## Repository structure

```
├── backend/          # NestJS API
├── frontend/         # React + Vite
├── docker-compose.yml
├── .env.example
└── README.md
```
