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
| [React Router](https://reactrouter.com/) | Routing (wired in upcoming commits) |



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

## Breakpoints (mobile-first)

- **Mobile:** default (&lt; 640px)
- **Tablet:** `sm:` (≥ 640px)
- **Desktop:** `lg:` (≥ 1024px)

## Theme

Semantic colors and `.dark` mode are defined in `src/index.css`.
