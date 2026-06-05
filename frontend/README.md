# Frontend — React + Vite

Twitter clone UI. **Runbook and architecture:** **[root README](../README.md)**.

## Stack

React 19 · Vite · Tailwind CSS v4 · TanStack Query · Zustand · Axios · Socket.IO client · React Router · Lucide

Folder layout: **[src/STRUCTURE.md](./src/STRUCTURE.md)**.

## Routes

| Path | Page |
|------|------|
| `/` | Public landing |
| `/login`, `/register` | Auth |
| `/home` | Timeline + composer |
| `/search` | User search |
| `/notifications` | Inbox |
| `/tweets/:id` | Reply thread |
| `/:username` | Profile |

## Environment

| Variable | Default |
|----------|---------|
| `VITE_API_URL` | `http://localhost:3000` |

Optional in `frontend/.env`. WebSocket: `{VITE_API_URL}/events`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server → http://localhost:5173 |
| `npm run build` | Production build |
| `npm test` / `npm run test:run` | Vitest |
| `npm run test:e2e` | Playwright (API + UI + seed must be running) |
| `npm run test:e2e:install` | Install Playwright browsers |

### E2E

```bash
docker compose up -d
cd backend && npm run seed
cd frontend && npm run test:e2e:install && npm run test:e2e
```

By default uses system Chrome. Without Chrome: `PLAYWRIGHT_BUNDLE_CHROMIUM=true npm run test:e2e` after `test:e2e:install`.

## Tests (Vitest)

Coverage in `src/**/*.test.ts(x)`: auth, tweets, timeline, search, profile, follow, notifications, images, layouts, and utilities.

## UI

- **Theme:** light/dark in `src/index.css`; toggle persists in `localStorage`.
- **Breakpoints:** mobile (&lt;640px), `sm:` ≥640px, `lg:` ≥1024px.
- **Real-time / images:** see **[backend/README.md](../backend/README.md)** (WebSockets, uploads).
