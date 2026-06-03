# The Flock — Twitter Clone Challenge

Monorepo con scaffolding inicial: **NestJS** (`backend/`) y **React + Vite** (`frontend/`).

## Estructura

```
├── backend/    # NestJS API
├── frontend/   # React + Vite
└── README.md
```

## Prerrequisitos

- Node.js 20+ (recomendado 24 LTS)
- npm 10+
- Git

## Desarrollo local

```bash
# Postgres (Docker)
docker compose up -d

# Backend (http://localhost:3000)
cd backend
cp ../.env.example .env   # o creá .env con las variables de DB/JWT
npm install
npm run migration:run
npm run seed
npm run start:dev

# Frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

## Seed y credenciales de prueba

Tras `npm run seed` en `backend/` la base queda con **12 usuarios**, tweets, follows y likes cruzados.

| Campo | Valor |
|-------|--------|
| Email | `alice@example.com` |
| Username | `alice` |
| Password | `Password123!` |

Otros usuarios: `bob@example.com`, `carol@example.com`, etc. (misma contraseña). Ver `backend/src/database/seed-data.ts`.

**Nota:** el seed borra users, tweets, follows, likes y refresh tokens antes de insertar.

## Tests (backend)

```bash
cd backend
npm test              
npm run test:cov     
npm run test:e2e      
```

Los e2e cubren: auth (register/login/refresh), follow, tweet, timeline, like y búsqueda de usuarios.

