# Frontend — React + Vite

Twitter clone UI. Monorepo setup: **[root README](../README.md)**.

## Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev/) + [Vite](https://vite.dev/) | UI and dev server |
| [Tailwind CSS v4](https://tailwindcss.com/docs) | Styling, design tokens, dark mode |
| [TanStack Query](https://tanstack.com/query/latest) | Server state |
| [Zustand](https://zustand.docs.pmnd.rs/) | Client state (auth, theme) |
| [Axios](https://axios-http.com/) | HTTP client |
| [React Router](https://reactrouter.com/) | Routing |
| [Lucide React](https://lucide.dev/) | Icons |

Folder layout: **[src/STRUCTURE.md](./src/STRUCTURE.md)**.

## Routes

| Path | Page |
|------|------|
| `/` | Public landing |
| `/login`, `/register` | Sign in / sign up |
| `/home`, `/notifications`, `/search`, `/profile` | App shell (protected) |

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `http://localhost:3000` |

For local dev, optional `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Docker build uses the root `.env.example` / compose `VITE_API_URL` build arg.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (http://localhost:5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (watch) — unit & integration tests |
| `npm run test:run` | Vitest (single run, CI) |
| `npm run test:e2e` | Playwright E2E (requires API + UI running) |
| `npm run test:e2e:ui` | Playwright UI mode |

### Testing

**Vitest + React Testing Library** (`src/**/*.test.ts(x)`): auth, tweets, timeline, search, profile, follow, notifications, layouts, atoms, API modules, hooks, and utilities (67 tests).

**Playwright E2E** (`e2e/`): real login, compose tweet, follow from search, notifications. Prerequisites:

```bash

docker compose up -d


cd frontend
npm run test:e2e:install   
npm run test:e2e
```

**Browsers:** By default, local E2E uses **Google Chrome** already installed on your Mac (`channel: 'chrome'`). If you do not have Chrome, either install it or run:

```bash
npm run test:e2e:install
PLAYWRIGHT_BUNDLE_CHROMIUM=true npm run test:e2e
```

If you see `Executable doesn't exist`, run `npm run test:e2e:install` (or install [Google Chrome](https://www.google.com/chrome/)).
```

## Breakpoints (mobile-first)

- **Mobile:** default (&lt; 640px)
- **Tablet:** `sm:` (≥ 640px)
- **Desktop:** `lg:` (≥ 1024px)

## Theme

Semantic colors and `.dark` mode are defined in `src/index.css`.
