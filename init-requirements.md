# Flashcard English Vocabulary App — Requirements (Condensed)

## Product
MVP flashcard app for English vocabulary. Users register, create decks, add cards (front/back/example), and step through cards in a study mode. Single-owner data; no sharing, no SRS, no refresh tokens.

## Stack
- **Backend**: NestJS + TypeORM + PostgreSQL 16, JWT auth (access-only, 7d), bcrypt, class-validator, Joi env validation.
- **Frontend**: Next.js 15 (App Router, `src/`), TypeScript strict, TailwindCSS, native `fetch`, JWT in `localStorage`, local React state only.
- **Infra**: Docker Compose (postgres + backend + frontend + nginx), nginx reverse proxy on `:80`, API prefix `/api`.

## Repo Layout
```
rising-star/
├── backend/        # NestJS (src/{auth,users,decks,cards,common,config,migrations})
├── frontend/       # Next.js (src/{app,components,lib})
├── nginx/nginx.conf
├── docker-compose.yml
└── .env / .env.example
```

## Domain Model (UUID PKs, `@CreateDateColumn`, no eager loading)
- **User**: `id, email (unique), password, name?, createdAt, decks[]`
- **Deck**: `id, title, description?, createdAt, userId, user, cards[]` — FK `CASCADE`
- **Card**: `id, front, back, example?, createdAt, deckId, deck` — FK `CASCADE`

## API (all `/api/*` through nginx, JWT required except register/login)
| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/auth/register` | `{email,password,name?}` | User (no password) |
| POST | `/auth/login` | `{email,password}` | `{access_token}` |
| GET | `/auth/profile` | — | User |
| GET/POST | `/decks` | `{title,description?}` | Deck[] / Deck |
| GET/PATCH/DELETE | `/decks/:id` | `{title?,description?}` | Deck / 204 |
| GET | `/cards?deckId=<uuid>` | — | Card[] |
| POST | `/cards` | `{deckId,front,back,example?}` | Card |
| PATCH/DELETE | `/cards/:id` | `{front?,back?,example?}` (no `deckId`) | Card / 204 |

## Non-Negotiable Rules
1. **Global `ValidationPipe`** with `whitelist + forbidNonWhitelisted + transform`.
2. **Global `ClassSerializerInterceptor`** + `@Exclude()` on `User.password`.
3. **Env validated by Joi** at bootstrap; fail-fast on missing `JWT_SECRET`/`DB_*`.
4. **Ownership** enforced in service layer: `findOwned(userId, id)` → 404 if missing, 403 if not owner. Cards delegate deck-ownership via `DecksService.findOwned`.
5. **`ParseUUIDPipe`** on every `:id` path param and `deckId` query param.
6. **JWT strategy re-fetches user** from DB on every request (stale-user protection).
7. **Auth errors use identical message** (`Invalid credentials`) to prevent user enumeration; duplicate-email is `409`.
8. **Migrations are explicit** (`npm run migration:run`); never auto-run on boot.
9. **Strict TS** everywhere.

## Delivery in 8 Steps
1. **Backend scaffold**: NestJS CLI, empty modules (auth/users/decks/cards/common/config), global `ConfigModule`, strict TS, global `ValidationPipe`.
2. **TypeORM + entities**: `User/Deck/Card`, CLI `data-source.ts` via `typeorm-ts-node-commonjs`, initial `InitSchema` migration. Env keys `DB_*`.
3. **Auth**: `UsersService` (data access, exported), `AuthService` (hash in register, sign JWT in login), `JwtStrategy`, `JwtAuthGuard`, `@CurrentUser()` decorator in `common/`.
4. **Decks CRUD**: `@UseGuards(JwtAuthGuard)` at class level, private `findOwned` helper, `findAll` excludes cards, `findOne` includes them.
5. **Cards CRUD**: promote `DecksService.findOwned` to public; chained ownership via `card.deck.userId`; `UpdateCardDto` cannot re-parent.
6. **Docker**: `setGlobalPrefix('api')`, single-stage backend Dockerfile (keeps `src/` for migrations), postgres healthcheck + `condition: service_healthy`, nginx routes `/api`→backend:4000 and `/`→frontend:3000, named volume `postgres_data`, only nginx exposes :80.
7. **Next.js frontend**: App Router with `'use client'` pages (localStorage needs browser), `apiFetch` wrapper (Bearer auth, 401 auto-logout), `AuthGuard` client component (no middleware), pages: `/login /register /decks /decks/[id] /study/[deckId]`, multi-stage Dockerfile with `output: 'standalone'`.
8. **Flip animation + polish** on study page (CSS 3D transform).

## Acceptance Gates (per step)
Every step ends with: `npm run build` clean, `npm run lint` clean, server boots, plus a numbered `curl`/UI smoke-test checklist — including negative paths (missing token, wrong owner, malformed UUID, duplicate email, expired/bogus JWT, cascade delete, `.env` misconfig).

## Explicitly Out of Scope (MVP)
Refresh tokens, password reset, rate limiting, roles, soft delete, pagination, bulk endpoints, SRS fields, deck sharing, HttpOnly-cookie auth, TLS/443, E2E tests, toast system, data-fetching library, form library, optimistic updates.
