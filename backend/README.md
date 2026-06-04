# Backend — NestJS API

REST API for the Twitter clone. Monorepo setup: **[root README](../README.md)**.

- Base URL: `http://localhost:3000`
- Format: JSON
- Global validation: `ValidationPipe` (whitelist, `class-validator`)

Setup: **[local development](../README.md#local-development)** (recommended) or **[Docker full stack](../README.md#docker-full-stack)**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Development with watch |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run production build |
| `npm run migration:run` | Apply migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run seed` | Populate DB (destructive on domain tables) |
| `npm test` | Unit tests |
| `npm run test:cov` | Coverage (services + `jwt.strategy`) |
| `npm run test:e2e` | E2E tests (Postgres required) |

---

## Environment variables

Copy `../.env.example` to `backend/.env`. Full table in the [root README](../README.md#environment-variables).

---

## Authentication

### Model

- **Access token** (short JWT): send on every protected request.
- **Refresh token** (long JWT + DB hash): rotated on `/auth/refresh`; logout revokes the token used.

### Public routes (no JWT)

| Method | Route | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | User registration |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/refresh` | Renew token pair |
| `POST` | `/auth/logout` | Revoke refresh token |

### Protected routes

All `/users`, `/tweets`, and `/timeline` routes require:

```http
Authorization: Bearer <accessToken>
```

---

## Endpoints — full reference

### Health

#### `GET /health`

**Auth:** none.

**Response:** `200` — `{ "status": "ok", "database": "connected" }`.

---

### Auth

#### `POST /auth/register`

**Auth:** none.

**Body:**

```json
{
  "email": "user@example.com",
  "username": "alice",
  "password": "Password123!"
}
```

- `password`: 8–72 characters, uppercase letter and special character (`@IsPassword()`).

**Response:** `201`

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "alice",
    "bio": "",
    "avatarUrl": "",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:** `409` email/username in use; `400` validation.

---

#### `POST /auth/login`

**Auth:** none.

**Body:**

```json
{
  "email": "alice@example.com",
  "password": "Password123!"
}
```

**Response:** `200` — same shape as register.

**Errors:** `401` invalid credentials.

---

#### `POST /auth/refresh`

**Auth:** none.

**Body:**

```json
{
  "refreshToken": "<refresh_jwt>"
}
```

**Response:** `200`

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

The previous refresh token is revoked and linked to the new DB record.

**Errors:** `401` invalid token or reuse detected (revokes all refresh tokens for the user).

---

#### `POST /auth/logout`

**Auth:** none.

**Body:**

```json
{
  "refreshToken": "<refresh_jwt>"
}
```

**Response:** `204` with no body. Invalid/expired token still returns `204` (idempotent).

---

### Users

Controller uses `@UseGuards(JwtAuthGuard)` on all routes.

#### `GET /users`

**Query:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | `1` | Page |
| `limit` | int | `10` | Items per page (max per DTO) |

**Response:** `200`

```json
{
  "items": [ { "id", "email", "username", "bio", "avatarUrl", "createdAt", "updatedAt" } ],
  "total": 12,
  "page": 1,
  "limit": 10
}
```

---

#### `GET /users/search`

**Query:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `q` | string | yes | Search `username` and `email` (ILIKE); min 3 characters |
| `limit` | int | no | Max results (service default: 10, max 50) |

**Response:** `200` — array of public profiles.

---

#### `GET /users/:username`

**Response:** `200` — public profile.

**Errors:** `404` user not found.

---

#### `PATCH /users/:username`

Own profile only (JWT `username` must match).

**Body (all optional):**

```json
{
  "username": "new_name",
  "email": "new@example.com",
  "bio": "Hello",
  "avatarUrl": "https://example.com/avatar.png",
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

- Changing `email` or `newPassword` requires `currentPassword`.

**Response:** `200` — updated profile.

**Errors:** `403` another user; `409` username/email taken; `401` wrong current password.

---

#### `POST /users/:username/follow`

**Response:** `201` — `{ "following": true }`.

**Errors:** `404` user; `409` already following; `400` cannot follow yourself.

---

#### `DELETE /users/:username/follow`

**Response:** `204`.

**Errors:** `404` follow does not exist.

---

#### `GET /users/:username/followers`

**Query:** `page`, `limit` (offset pagination).

**Response:** `200`

```json
{
  "items": [ { "id", "username", "avatarUrl" } ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

---

#### `GET /users/:username/following`

Same as followers.

---

#### `GET /users/:username/tweets`

**Query:** `page`, `limit`.

**Response:** `200`

```json
{
  "items": [
    {
      "id": "uuid",
      "content": "...",
      "authorId": "uuid",
      "author": { "id", "username", "avatarUrl" },
      "likesCount": 3,
      "likedByMe": false,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

---

### Tweets

All routes require JWT.

#### `POST /tweets`

**Body:**

```json
{
  "content": "Hello world"
}
```

- `content`: 1–280 characters.

**Response:** `201` — tweet with `likesCount: 0`, `likedByMe: false`, embedded `author`.

---

#### `DELETE /tweets/:id`

Author only.

**Response:** `204`.

**Errors:** `404`; `403` not your tweet.

---

#### `POST /tweets/:id/like`

**Response:** `201` — updated tweet with `likesCount` and `likedByMe: true`.

**Errors:** `409` already liked.

---

#### `DELETE /tweets/:id/like`

**Response:** `204`.

**Errors:** `404` like does not exist.

---

### Timeline

#### `GET /timeline`

Authenticated user feed: own tweets + followed users, **newest first**.

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `limit` | int | Items per page (default 20, max 50) |
| `cursor` | string | Pagination: `ISO8601_createdAt\|tweetId` from the last item of the previous page |

**Response:** `200`

```json
{
  "items": [ /* TweetResponse[] */ ],
  "hasMore": true,
  "nextCursor": "2025-06-03T12:00:00.000Z|tweet-uuid"
}
```

If `hasMore` is `false`, `nextCursor` is `null`.

---

## Data model (summary)

| Entity | Notes |
|--------|--------|
| `users` | unique email and username; `passwordHash` not exposed on reads |
| `tweets` | `content` max 280; FK `authorId` |
| `follows` | unique follower/following pair |
| `likes` | unique user/tweet pair |
| `refresh_tokens` | refresh JWT hash, `revokedAt`, `replacedByTokenId` |

Migrations in `src/migrations/`.

---

## Testing

- **Unit:** `*.service.spec.ts`, `jwt.strategy.spec.ts`. Jest coverage on `**/*.service.ts` and `strategies/**` (global threshold ≥80%).
- **E2E:** `test/app.e2e-spec.ts` (register → login → profile → refresh → logout), `test/social.e2e-spec.ts` (follow → tweet → timeline → like → search → unfollow).

```bash
npm run test:cov
npm run test:e2e
```

---

## Modules

```
src/
├── auth/           # register, login, refresh, logout, JWT strategy
├── users/          # profiles, search, listing
├── follows/        # follow graph
├── tweets/         # tweets and likes
├── timeline/       # aggregated feed
├── health/
├── database/       # data-source, seed
└── common/         # shared DTOs, password validation
```

---

## Docker

The `backend` service in `docker-compose.yml` on startup:

1. Waits for Postgres (`pg_isready`)
2. `npm run migration:run`
3. `npm run seed` (if `RUN_SEED=true`)
4. `node dist/main.js`

CORS is configured via `CORS_ORIGIN` (default `http://localhost:5173`).

---

## Known limitations

- **Real-time:** no WebSockets/SSE; client uses timeline refetch/polling.
- **Search:** by `username` and `email`; no separate display name from username.
- **Anonymous public profile:** `GET /users/:username` requires JWT.
- **Tweet images, replies, notifications:** not implemented.
