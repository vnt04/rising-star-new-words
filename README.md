# Flashcard English Vocabulary App

A production-ready MVP for learning English vocabulary using flashcards.

**Stack:** NestJS · Next.js · TypeORM · PostgreSQL · JWT · Docker

## Project structure

```
rising-star/
├── backend/    # NestJS API (port 4000)
├── frontend/   # Next.js app (port 3000)  [Step 7]
└── nginx/      # Reverse proxy            [Step 6]
```

## Status

- [x] Step 1 — NestJS skeleton (Auth, Users, Decks, Cards modules)
- [x] Step 2 — TypeORM + entities
- [x] Step 3 — Auth (register / login / JWT)
- [x] Step 4 — Decks CRUD
- [x] Step 5 — Cards CRUD
- [x] Step 6 — Docker Compose
- [ ] Step 7 — Next.js frontend
- [ ] Step 8 — Flashcard study UI

## Quick start with Docker

```bash
cp .env.example .env          # fill in real secrets
docker compose up -d postgres backend nginx
# backend available at http://localhost/api
```

Run migrations after first boot:

```bash
docker compose exec backend node -e "
const { DataSource } = require('typeorm');
// use npm run migration:run inside the container if needed
"
# or from host (requires local .env):
cd backend && npm run migration:run
```

## Quick start (backend only, no Docker)

```bash
cd backend
cp .env.example .env   # fill in values (needs local Postgres)
npm run start:dev
```
