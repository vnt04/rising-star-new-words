# Step 1 — NestJS Project Setup + Module Skeleton

## Context

Greenfield MVP: **Flashcard English Vocabulary App**. Working directory `F:\Disk D\2026_projects\rising-star\` is empty. The user wants a production-shaped NestJS + Next.js app delivered in 8 numbered steps, reviewed after each step. This plan covers **Step 1 only**: initialize the NestJS backend, install the dependencies the later steps will need, and lay down a clean modular skeleton (Auth, Users, Decks, Cards, Common, Config) so every subsequent step has an obvious place to add code.

Confirmed choices: two sibling folders (`backend/`, `frontend/`), npm.

---

## Repo layout after Step 1

```
rising-star/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── auth/
│   │   │   └── auth.module.ts
│   │   ├── users/
│   │   │   └── users.module.ts
│   │   ├── decks/
│   │   │   └── decks.module.ts
│   │   ├── cards/
│   │   │   └── cards.module.ts
│   │   ├── common/              # filters, interceptors, decorators (empty for now)
│   │   └── config/
│   │       ├── configuration.ts # typed config loader
│   │       └── env.validation.ts# Joi schema for env vars
│   ├── test/                    # default Nest e2e folder, left intact
│   ├── .env.example
│   ├── .eslintrc.js / eslint.config.mjs (whichever CLI emits)
│   ├── .prettierrc
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json            # strict
│   └── tsconfig.build.json
├── .gitignore                   # repo-root ignores (node_modules, .env, dist, .next, etc.)
└── README.md                    # short stub, will grow with each step
```

The `frontend/`, `nginx/`, and `docker-compose.yml` entries are intentionally **not** created in Step 1 — they belong to Steps 6–8.

---

## Commands to run (in order)

1. `cd` into `F:\Disk D\2026_projects\rising-star`.
2. `npx -y @nestjs/cli@latest new backend --package-manager npm --strict` — scaffolds `backend/` with the default Nest CLI template.
3. Remove the boilerplate `AppController` / `AppService` (we don't need the sample `GET /`).
4. From inside `backend/`, install runtime deps that Steps 2–5 will consume:
   ```
   npm i @nestjs/config @nestjs/typeorm typeorm pg \
         @nestjs/jwt @nestjs/passport passport passport-jwt \
         bcrypt class-validator class-transformer joi
   ```
5. Install dev types:
   ```
   npm i -D @types/passport-jwt @types/bcrypt
   ```
6. Generate empty module skeletons (controllers/services land in later steps):
   ```
   npx nest g module auth --no-spec
   npx nest g module users --no-spec
   npx nest g module decks --no-spec
   npx nest g module cards --no-spec
   ```
7. Create `src/common/` and `src/config/` directories with the two config files listed below.
8. Write root-level `.gitignore` and `README.md` stub.

No DB connection, no entities, no auth logic yet — those are Steps 2 and 3.

---

## Files to author in Step 1

| Path                                   | Purpose                                                                                                                                                                                                                             |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/src/main.ts`                  | Enable `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` globally; enable CORS for `http://localhost:3000`; read port from `ConfigService` (default 4000); strip the default "Hello World" wiring. |
| `backend/src/app.module.ts`            | Import `ConfigModule.forRoot({ isGlobal: true, load: [configuration], validationSchema: envValidation })` + the four feature modules. No `AppController`/`AppService`.                                                              |
| `backend/src/config/configuration.ts`  | Typed loader returning `{ port, database: {...}, jwt: { secret, expiresIn } }` from `process.env`.                                                                                                                                  |
| `backend/src/config/env.validation.ts` | Joi schema: `NODE_ENV`, `PORT`, `DATABASE_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`. Fails fast on missing vars.                                                                                                                           |
| `backend/src/auth/auth.module.ts`      | Empty `@Module({})` — filled in Step 3.                                                                                                                                                                                             |
| `backend/src/users/users.module.ts`    | Empty — filled in Step 3.                                                                                                                                                                                                           |
| `backend/src/decks/decks.module.ts`    | Empty — filled in Step 4.                                                                                                                                                                                                           |
| `backend/src/cards/cards.module.ts`    | Empty — filled in Step 5.                                                                                                                                                                                                           |
| `backend/.env.example`                 | Documents every env var the validation schema requires. **No real secrets.**                                                                                                                                                        |
| `.gitignore` (repo root)               | `node_modules/`, `dist/`, `.next/`, `.env`, `.env.local`, `*.log`, `coverage/`.                                                                                                                                                     |
| `README.md` (repo root)                | One paragraph describing the project + "Step 1 done" note.                                                                                                                                                                          |

---

## Key quality decisions baked in now

- **Strict TypeScript** — `nest new --strict` flips on `strict`, `noImplicitAny`, `strictNullChecks`. Keep these on; do not relax later.
- **Global `ValidationPipe` with `whitelist + forbidNonWhitelisted`** — unknown DTO fields are rejected, so every later endpoint is safe-by-default.
- **Env validated with Joi at bootstrap** — the server refuses to start if `JWT_SECRET` or a DB var is missing. Catches misconfigured deploys early.
- **`ConfigModule` global** — feature modules inject `ConfigService` instead of reading `process.env` directly. No hardcoded secrets anywhere.
- **No DB wiring yet** — `TypeOrmModule.forRootAsync` is deliberately deferred to Step 2 so Step 1 boots green without Postgres running.

---

## Verification (end-of-step acceptance test)

From `backend/`:

1. `cp .env.example .env` and fill in placeholder values (any non-empty strings satisfy the Joi schema at this stage).
2. `npm run build` → exits 0, no TS errors.
3. `npm run start:dev` → Nest logs all four feature modules as mounted, server listens on `:4000`, no Postgres connection is attempted.
4. `curl http://localhost:4000/` → returns 404 (expected — no routes registered yet; proves the app is alive and routing).
5. Temporarily unset `JWT_SECRET` in `.env` and restart → Nest bootstrap fails with a Joi validation error naming the missing variable. Re-set it.
6. `npm run lint` → clean.

If all six pass, Step 1 is complete and we move to Step 2 (TypeORM config + `User`, `Deck`, `Card` entities).

---

## Out of scope for Step 1 (tracked for later steps)

- Step 2 — TypeORM `DataSource`, entities, migrations.
- Step 3 — Auth module (register/login, `JwtStrategy`, `JwtAuthGuard`, `bcrypt` hashing, `@CurrentUser()` decorator in `common/`).
- Step 4 — Decks CRUD with ownership guard.
- Step 5 — Cards CRUD scoped by deck.
- Step 6 — `docker-compose.yml` (postgres + backend + frontend + nginx), Dockerfiles, nginx config.
- Step 7 — Next.js `frontend/` scaffold, pages, Axios client with JWT interceptor.
- Step 8 — Flashcard flip component + `/study/[deckId]` page.

---
---

# Step 2 — TypeORM + PostgreSQL + Entities

## Context

Step 1 left the backend booting with four empty feature modules and a global `ConfigModule`. Step 2 wires TypeORM to PostgreSQL, defines the three domain entities (`User`, `Deck`, `Card`), and sets up a CLI `DataSource` for migrations. At the end of this step the backend will **require a running Postgres** to start, and `npm run migration:run` will create the three tables in that database.

Runtime deps `@nestjs/typeorm`, `typeorm`, `pg`, `@nestjs/config` are already installed (Step 1).

---

## Two decisions baked into this plan

### 1. Env var rename: `DATABASE_*` → `DB_*`

Step 2 spec asks for `DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME`. Step 1 scaffolded `DATABASE_*`. Renaming now is cheap (no real users, no deploys) and matches the latest request. **Action**: update `configuration.ts`, `env.validation.ts`, `.env.example`, and `.env` in lockstep.

### 2. TypeORM CLI runner: `typeorm-ts-node-commonjs` (not raw `ts-node`)

The spec suggests `ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js`. That script breaks under our current `"module": "nodenext"` tsconfig (ts-node demands explicit `.js` extensions on every import). The official fix ships inside TypeORM itself — the `typeorm-ts-node-commonjs` bin spawns ts-node with a CommonJS override. Same behavior, one-line script, zero config. The raw-`ts-node` variant is documented as a fallback below.

---

## Files to create

| Path | Purpose |
|---|---|
| `backend/src/config/typeorm.config.ts` | Shared `buildTypeOrmOptions(db)` helper that returns a `DataSourceOptions`. Used by both `AppModule` (runtime) and `data-source.ts` (CLI) — single source of truth for the connection shape. |
| `backend/src/config/data-source.ts` | Exports a `DataSource` instance for the TypeORM CLI. Loads `.env` via `dotenv/config`, calls the shared helper, points `entities` at `src/**/*.entity.ts` and `migrations` at `src/migrations/*.ts`. |
| `backend/src/users/entities/user.entity.ts` | `@Entity('users')` — `id` (uuid PK), `email` (unique), `password`, `name` (nullable), `createdAt`, `decks: Deck[]` (OneToMany). |
| `backend/src/decks/entities/deck.entity.ts` | `@Entity('decks')` — `id`, `title`, `description` (nullable, text), `createdAt`, `user: User` (ManyToOne, `onDelete: 'CASCADE'`), `userId: string` (FK column), `cards: Card[]` (OneToMany). |
| `backend/src/cards/entities/card.entity.ts` | `@Entity('cards')` — `id`, `front` (text), `back` (text), `example` (nullable, text), `createdAt`, `deck: Deck` (ManyToOne, `onDelete: 'CASCADE'`), `deckId: string`. |
| `backend/src/migrations/.gitkeep` | Placeholder so the empty folder ships in git. |

## Files to modify

| Path | Change |
|---|---|
| `backend/src/config/configuration.ts` | Rename `database.*` keys to read `DB_*`. |
| `backend/src/config/env.validation.ts` | Rename keys in Joi schema: `DATABASE_HOST → DB_HOST`, etc. |
| `backend/.env.example` | Same rename. |
| `backend/.env` | Same rename (local file, do not commit). |
| `backend/src/app.module.ts` | Add `TypeOrmModule.forRootAsync({ useFactory: (config: ConfigService) => ({ ...buildTypeOrmOptions(config.get('database')), autoLoadEntities: true, migrations: ['dist/migrations/*.js'], migrationsRun: false }) })`. |
| `backend/package.json` | Add four scripts (see below). Install `dotenv` as runtime dep (TypeORM CLI reads `.env` directly; we cannot rely on `@nestjs/config` outside Nest bootstrap). |

---

## Entity shapes (strict — do not add business methods)

**User** (`users` table — `user` is reserved in Postgres, so the table is pluralized):
```ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ unique: true }) email!: string;
  @Column() password!: string;
  @Column({ nullable: true, type: 'varchar' }) name!: string | null;
  @CreateDateColumn() createdAt!: Date;
  @OneToMany(() => Deck, (deck) => deck.user) decks!: Deck[];
}
```

**Deck** (`decks`):
```ts
@Entity('decks')
export class Deck {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() title!: string;
  @Column({ nullable: true, type: 'text' }) description!: string | null;
  @CreateDateColumn() createdAt!: Date;

  @ManyToOne(() => User, (user) => user.decks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column() userId!: string;

  @OneToMany(() => Card, (card) => card.deck) cards!: Card[];
}
```

**Card** (`cards`):
```ts
@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column({ type: 'text' }) front!: string;
  @Column({ type: 'text' }) back!: string;
  @Column({ nullable: true, type: 'text' }) example!: string | null;
  @CreateDateColumn() createdAt!: Date;

  @ManyToOne(() => Deck, (deck) => deck.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deckId' })
  deck!: Deck;

  @Column() deckId!: string;
}
```

Rules enforced by the shape above:
- UUID PKs (`@PrimaryGeneratedColumn('uuid')`).
- `@CreateDateColumn()` for timestamps — never a manual `Date` column.
- No eager loading anywhere (`{ eager: true }` is absent by design — callers opt in via `relations` in the query).
- No service methods on entities — they stay plain data classes.
- Explicit FK columns (`userId`, `deckId`) alongside the relation so services can filter/query without touching the join object.

---

## `package.json` scripts to add

```json
"typeorm": "typeorm-ts-node-commonjs",
"migration:generate": "npm run typeorm -- -d src/config/data-source.ts migration:generate",
"migration:run": "npm run typeorm -- -d src/config/data-source.ts migration:run",
"migration:revert": "npm run typeorm -- -d src/config/data-source.ts migration:revert"
```

**Fallback (if you strongly prefer the raw ts-node form requested in the spec):** create `backend/tsconfig.typeorm.json` extending the base with `"module": "commonjs"`, then:
```json
"typeorm": "cross-env TS_NODE_PROJECT=tsconfig.typeorm.json ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js"
```
(requires installing `cross-env`). Not recommended — strictly more moving parts than the `typeorm-ts-node-commonjs` bin, which is shipped by TypeORM itself.

---

## Migration workflow (what the user will actually run)

One-time: start Postgres (via Docker: `docker run --name flashcard-pg -e POSTGRES_USER=flashcard_user -e POSTGRES_PASSWORD=change_me -e POSTGRES_DB=flashcard_db -p 5432:5432 -d postgres:16`). Step 6 will replace this with `docker-compose`.

1. **Generate the initial migration** from the entities:
   ```
   npm run migration:generate --name=InitSchema
   ```
   Writes `src/migrations/<timestamp>-InitSchema.ts` containing the `CREATE TABLE users / decks / cards` statements and FK constraints derived from the decorators.

2. **Apply migrations to the DB**:
   ```
   npm run migration:run
   ```
   Creates the tables and records the run in TypeORM's `migrations` bookkeeping table.

3. **Revert the last migration** (if something went wrong):
   ```
   npm run migration:revert
   ```

The NestJS runtime is set to `migrationsRun: false` — migrations never run automatically on app boot. Operators run them explicitly via the CLI.

---

## Verification (end-of-step acceptance test)

1. `npm run build` → exits 0.
2. Start Postgres locally (see migration workflow above) and fill `.env` with the matching credentials.
3. `npm run migration:generate --name=InitSchema` → a single new file appears in `src/migrations/` containing three `CREATE TABLE` statements and the two FKs (`decks.userId → users.id`, `cards.deckId → decks.id`), both `ON DELETE CASCADE`.
4. `npm run migration:run` → logs 1 migration applied.
5. `psql` into the DB and run `\dt` → see `cards`, `decks`, `migrations`, `users`.
6. `npm run start:dev` → all four modules plus `TypeOrmModule` initialize; server listens on `:4000`; no errors about missing entities.
7. Stop Postgres, rerun `npm run start:dev` → server fails at bootstrap with a clear "connect ECONNREFUSED" error (confirms TypeORM is actually connecting at startup).
8. `npm run lint` → clean.

If all eight pass, Step 2 is done and Step 3 (Auth module) begins.

---

## Out of scope for Step 2

- No repositories, no services, no controllers — those arrive with the feature modules in Steps 3–5.
- No seed data.
- No `bcrypt` hashing yet (Step 3).
- `@nestjs/typeorm`'s `forFeature([Entity])` registrations land in Steps 3–5 as each feature module starts using its repository.

---
---

# Step 3 — Authentication (Register / Login / JWT)

## Context

Steps 1–2 left us with a booting NestJS app, three entities, and applied migrations. Step 3 wires the first real feature: users can register, log in, receive a JWT, and access a protected `/auth/profile` endpoint. After this step, `JwtAuthGuard` is available for Steps 4–5 to lock down the Decks and Cards controllers.

All required packages were installed in Step 1 (`@nestjs/passport`, `passport`, `passport-jwt`, `@nestjs/jwt`, `bcrypt`, `class-validator`, `class-transformer`, `@types/*`). **No new installs** — we move straight to code.

---

## Key design decisions

1. **`UsersService` owns User data access; `AuthService` composes it.** `UsersModule` registers `TypeOrmModule.forFeature([User])`, provides `UsersService`, and exports it. `AuthModule` imports `UsersModule` and injects `UsersService` — Auth never touches the User repository directly. Prevents the "two places hash passwords" bug.

2. **Password hashing lives in `AuthService.register`, not in `UsersService.createUser`.** `UsersService.createUser(email, passwordHash, name)` takes an **already-hashed** value and simply persists. This keeps auth concerns out of the Users module and makes hashing cost / algorithm a single-file change later.

3. **Password stripping via `@Exclude()` + global `ClassSerializerInterceptor`.** Mark `User.password` with `@Exclude()` from `class-transformer`; register `ClassSerializerInterceptor` globally in `main.ts`. Every endpoint that returns a `User` automatically drops `password` — impossible to accidentally leak. Alternative (response DTOs) is more code; this one is declarative and covers future endpoints for free.

4. **`JwtStrategy.validate()` re-fetches the user from the DB** rather than just passing the payload through. Costs one query per authenticated request, but means deleted/disabled accounts can't use old tokens. Acceptable for MVP; add a cache later if it becomes hot.

5. **`@CurrentUser()` param decorator lives in `src/common/decorators/`.** `createParamDecorator` that pulls `request.user`. Keeps controller signatures readable (`profile(@CurrentUser() user: User)`) instead of `@Req() req: Request` + manual extraction.

6. **Duplicate-email handling returns `ConflictException` (409), not a generic 400.** Clients need to distinguish "you typed a bad password" from "this email is taken."

---

## Files to create

| Path | Purpose |
|---|---|
| `backend/src/auth/dto/register.dto.ts` | `email: IsEmail`, `password: IsString + MinLength(6)`, `name?: IsString + IsOptional`. |
| `backend/src/auth/dto/login.dto.ts` | `email: IsEmail`, `password: IsString + IsNotEmpty`. |
| `backend/src/auth/strategies/jwt.strategy.ts` | Extends `PassportStrategy(Strategy, 'jwt')`. Extracts token from `Authorization: Bearer`, validates signature with `JWT_SECRET` via `ConfigService`, then calls `usersService.findById(payload.sub)`; throws `UnauthorizedException` if the user no longer exists. |
| `backend/src/auth/guards/jwt-auth.guard.ts` | Trivial `extends AuthGuard('jwt')`. Named class exists so controllers use the guard by symbol, not by string. |
| `backend/src/auth/auth.service.ts` | `register(dto)` → check duplicate via `usersService.findByEmail`; hash with `bcrypt.hash(password, 10)`; `usersService.createUser(...)`; return created user. `login(dto)` → fetch user by email; `bcrypt.compare`; throw `UnauthorizedException` on either miss; sign JWT `{ sub: user.id, email: user.email }`; return `{ access_token }`. |
| `backend/src/auth/auth.controller.ts` | `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` (guarded). Thin — delegates to service. |
| `backend/src/users/users.service.ts` | `findByEmail(email)`, `findById(id)`, `createUser({ email, passwordHash, name })`. Wraps `Repository<User>`. |
| `backend/src/common/decorators/current-user.decorator.ts` | `export const CurrentUser = createParamDecorator((_, ctx) => ctx.switchToHttp().getRequest().user)`. |

## Files to modify

| Path | Change |
|---|---|
| `backend/src/users/entities/user.entity.ts` | Add `@Exclude()` to the `password` column. |
| `backend/src/users/users.module.ts` | Import `TypeOrmModule.forFeature([User])`; provide `UsersService`; **export `UsersService`**. |
| `backend/src/auth/auth.module.ts` | Import `UsersModule` + `PassportModule` + `JwtModule.registerAsync({ inject: [ConfigService], useFactory: (c) => ({ secret: c.get('jwt.secret'), signOptions: { expiresIn: c.get('jwt.expiresIn') } }) })`. Providers: `AuthService`, `JwtStrategy`. Controllers: `AuthController`. |
| `backend/src/main.ts` | Register `ClassSerializerInterceptor` globally (`app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))`). |

---

## Key code sketches (non-trivial parts only)

**`auth.service.ts` — register flow**
```ts
async register(dto: RegisterDto): Promise<User> {
  const existing = await this.usersService.findByEmail(dto.email);
  if (existing) throw new ConflictException('Email already registered');
  const passwordHash = await bcrypt.hash(dto.password, 10);
  return this.usersService.createUser({
    email: dto.email,
    password: passwordHash,
    name: dto.name ?? null,
  });
}
```

**`auth.service.ts` — login flow**
```ts
async login(dto: LoginDto): Promise<{ access_token: string }> {
  const user = await this.usersService.findByEmail(dto.email);
  if (!user) throw new UnauthorizedException('Invalid credentials');
  const ok = await bcrypt.compare(dto.password, user.password);
  if (!ok) throw new UnauthorizedException('Invalid credentials');
  const access_token = await this.jwtService.signAsync({
    sub: user.id,
    email: user.email,
  });
  return { access_token };
}
```
Both "user not found" and "bad password" throw the **same** message — prevents user enumeration via timing / error copy.

**`jwt.strategy.ts` — validate**
```ts
async validate(payload: { sub: string; email: string }): Promise<User> {
  const user = await this.usersService.findById(payload.sub);
  if (!user) throw new UnauthorizedException();
  return user;  // becomes request.user
}
```

**`auth.controller.ts`**
```ts
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@CurrentUser() user: User) { return user; }
}
```
`@HttpCode(200)` on login because by default `@Post` returns 201, which is wrong for "authenticated an existing account."

---

## Verification (end-of-step acceptance test)

Assume Postgres is up and migrations applied (Step 2 checklist).

1. `npm run build` → 0 errors.
2. `npm run lint` → clean.
3. `npm run start:dev` → logs `AuthModule`, `UsersModule`, `JwtModule`, `PassportModule` all initialized.
4. **Register happy path**
   ```
   curl -X POST localhost:4000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"a@b.com","password":"secret1","name":"A"}'
   ```
   → 201, body contains `id`, `email`, `name`, `createdAt`. **Must NOT contain `password`.**
5. **Register — validation failure**
   ```
   -d '{"email":"not-an-email","password":"123"}'
   ```
   → 400 with Joi/class-validator messages listing both `email` and `password` failures.
6. **Register — duplicate**: repeat step 4 → 409 "Email already registered".
7. **Login happy path**
   ```
   curl -X POST localhost:4000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"a@b.com","password":"secret1"}'
   ```
   → 200 `{ "access_token": "eyJ..." }`.
8. **Login — wrong password**: same but bad password → 401 "Invalid credentials".
9. **Profile — no token**: `curl localhost:4000/auth/profile` → 401.
10. **Profile — bogus token**: `Authorization: Bearer not.a.jwt` → 401.
11. **Profile — valid token**: `Authorization: Bearer <access_token from step 7>` → 200 with the user object (no password).
12. **Stale-user guard**: delete the user row in psql, re-hit `/auth/profile` with the same token → 401 (confirms `JwtStrategy.validate` re-checks the DB).
13. **DB inspection**: `select email, password from users;` — password must be a bcrypt hash (`$2b$10$...`), not plaintext.

If all 13 pass, Step 3 is done and Step 4 (Decks CRUD) begins.

---

## Out of scope for Step 3

- **Refresh tokens.** MVP uses access-token-only; rotation arrives later if needed.
- **Password reset / email verification.** Not in MVP spec.
- **Rate limiting on `/auth/login`.** Production concern; add with `@nestjs/throttler` when deploying.
- **Role-based authorization.** Every authenticated user is equal in this app; no admin tier.
- **Logout endpoint.** Stateless JWT means logout is client-side token discard; no server-side session to invalidate yet.

---
---

# Step 4 — Decks CRUD + Ownership

## Context

Steps 1–3 produced a bootable API with authentication. Step 4 delivers the first real feature users interact with: Decks. A logged-in user can create decks, list only their own, open one with its cards loaded, update title/description, and delete. Every route is guarded by JWT and scoped to the caller — no user can see or mutate another user's data. This step also establishes the ownership-enforcement pattern that Step 5 (Cards) will reuse.

No new packages required.

---

## Key design decisions

1. **Ownership is enforced in the service, not in a separate guard.** Every service method takes `userId` as its first argument and filters by it in the WHERE clause (or re-verifies after fetching). A dedicated `OwnershipGuard` was considered and rejected — it would need to load the deck anyway, duplicating the service's own query.

2. **Two-step check: 404 if row doesn't exist, 403 if it exists but belongs to someone else** — matching the literal spec wording ("deck.user.id === currentUser.id → if not, `ForbiddenException`"). This leaks resource existence (an attacker who iterates UUIDs can learn which IDs are valid), but UUIDs are unguessable, so the leak is academic. Documented as a tradeoff; can flip to 404-always later if desired.

3. **Filter by `userId` column, not by loading the `user` relation.** Deck has both `userId` (scalar FK column) and `user` (ManyToOne). Querying `where: { id, userId }` is one round-trip; loading `user` to compare IDs is two. The scalar column is already indexed by the FK.

4. **`findAll` does NOT load cards; `findOne` does.** Matches the spec ("include related cards" only on detail). Keeps list pages fast even when a user has many big decks.

5. **`ParseUUIDPipe` on every `:id` path param.** Malformed IDs return `400 Bad Request` at the edge, before hitting the DB. Cleaner error + protects against future drivers that treat non-UUID strings inconsistently.

6. **`UpdateDeckDto` is hand-written, not `PartialType(CreateDeckDto)`.** `@nestjs/mapped-types` isn't installed and for two fields it's cheaper to keep the two files symmetric than add a dependency.

7. **`DecksModule` does NOT import `AuthModule`.** Passport keeps a global strategy registry; since `JwtStrategy` is instantiated by `AuthModule` (already imported into `AppModule`), any `JwtAuthGuard` in the app works by referencing the `'jwt'` strategy name. This keeps module graphs shallow.

8. **`@UseGuards(JwtAuthGuard)` at the controller class level** — applies to every route in the controller. No risk of forgetting it on a new endpoint.

---

## Files to create

| Path | Purpose |
|---|---|
| `backend/src/decks/dto/create-deck.dto.ts` | `title: IsString + IsNotEmpty + MaxLength(200)`, `description?: IsString + IsOptional + MaxLength(2000)`. |
| `backend/src/decks/dto/update-deck.dto.ts` | Both fields optional, same validators. Hand-written (two fields). |
| `backend/src/decks/decks.service.ts` | `create`, `findAll`, `findOne`, `update`, `remove` — all take `userId` as the first argument. Private `findOwned(userId, id, opts?)` helper that throws `NotFoundException` / `ForbiddenException`. |
| `backend/src/decks/decks.controller.ts` | `@UseGuards(JwtAuthGuard)` at class level. 5 routes: `POST /decks`, `GET /decks`, `GET /decks/:id`, `PATCH /decks/:id`, `DELETE /decks/:id`. `:id` always runs through `ParseUUIDPipe`. `DELETE` returns `204`. |

## Files to modify

| Path | Change |
|---|---|
| `backend/src/decks/decks.module.ts` | Import `TypeOrmModule.forFeature([Deck])`. Provide `DecksService`. Declare `DecksController`. Export `DecksService` so Step 5's `CardsService` can ask "does this deck belong to me?" (will be used in cards CRUD). |

---

## Key code patterns (non-trivial bits)

**`decks.service.ts` — the ownership helper (single source of truth)**
```ts
private async findOwned(
  userId: string,
  id: string,
  options: { withCards?: boolean } = {},
): Promise<Deck> {
  const deck = await this.repo.findOne({
    where: { id },
    relations: options.withCards ? { cards: true } : undefined,
  });
  if (!deck) throw new NotFoundException('Deck not found');
  if (deck.userId !== userId) throw new ForbiddenException();
  return deck;
}
```
Every public method calls this. Nothing else does the ownership check. When the rule changes (e.g. add shared decks later), one file moves.

**`create`**
```ts
create(userId: string, dto: CreateDeckDto): Promise<Deck> {
  const deck = this.repo.create({
    ...dto,
    description: dto.description ?? null,
    userId,
  });
  return this.repo.save(deck);
}
```

**`findAll`**
```ts
findAll(userId: string): Promise<Deck[]> {
  return this.repo.find({
    where: { userId },
    order: { createdAt: 'DESC' },
  });
}
```

**`update`** and **`remove`** both go through `findOwned`:
```ts
async update(userId: string, id: string, dto: UpdateDeckDto): Promise<Deck> {
  const deck = await this.findOwned(userId, id);
  Object.assign(deck, dto);
  return this.repo.save(deck);
}

async remove(userId: string, id: string): Promise<void> {
  const deck = await this.findOwned(userId, id);
  await this.repo.remove(deck);
}
```

**`decks.controller.ts` — full shape**
```ts
@UseGuards(JwtAuthGuard)
@Controller('decks')
export class DecksController {
  constructor(private readonly decks: DecksService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateDeckDto) {
    return this.decks.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.decks.findAll(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.decks.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeckDto,
  ) {
    return this.decks.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.decks.remove(user.id, id);
  }
}
```

---

## Verification (end-of-step acceptance test)

Prereq: Postgres up, migrations applied, two test users (call them **A** and **B**) registered via `/auth/register`, both with access tokens.

1. `npm run build` → 0 errors.
2. `npm run lint` → clean.
3. `npm run start:dev` → `DecksModule` appears in module init logs with no errors.
4. **Create as A**: `POST /decks` with `{ "title":"Basics" }` + A's token → 201, response includes `id`, `title`, `userId` (= A.id), `createdAt`. Capture `deckId`.
5. **Create without token**: same call, no `Authorization` header → 401.
6. **Create with empty title**: `{ "title":"" }` + A's token → 400, validation error on `title`.
7. **Create with extra field**: `{ "title":"X", "hacker":"y" }` + A's token → 400 (`forbidNonWhitelisted` rejects unknown keys; confirms the Step 1 `ValidationPipe` is still active).
8. **List A's decks**: `GET /decks` + A's token → 200, array containing the `Basics` deck. `createdAt DESC` ordering.
9. **B cannot see A's decks**: `GET /decks` + B's token → 200, array **does not** include A's deck.
10. **Detail — owner**: `GET /decks/<deckId>` + A's token → 200, includes `cards: []` (empty).
11. **Detail — other user**: `GET /decks/<deckId>` + B's token → **403 Forbidden**.
12. **Detail — nonexistent**: `GET /decks/00000000-0000-0000-0000-000000000000` + A's token → 404.
13. **Detail — malformed id**: `GET /decks/not-a-uuid` + A's token → 400 (`ParseUUIDPipe`).
14. **Update — owner**: `PATCH /decks/<deckId>` `{ "description":"v2" }` + A's token → 200, deck reflects the change.
15. **Update — other user**: same call + B's token → 403.
16. **Delete — other user**: `DELETE /decks/<deckId>` + B's token → 403 (and the deck still exists).
17. **Delete — owner**: same + A's token → 204, empty body. Re-`GET /decks/<deckId>` → 404.
18. **Cascade check**: create a deck + a couple of cards under A (via direct SQL or later in Step 5); delete the deck; confirm the cards row count drops (Step 2's `onDelete: 'CASCADE'` still works).

If all 18 pass, Step 4 is done and Step 5 (Cards CRUD, scoped by deck ownership) begins.

---

## Out of scope for Step 4

- **Sharing / collaborators.** One owner per deck in MVP.
- **Pagination on `GET /decks`.** Fine for a first deploy; revisit if any user is expected to hit 100+ decks.
- **Soft delete.** Hard delete per spec. Cards cascade via the FK set in Step 2.
- **Bulk endpoints** (multi-delete, multi-create). YAGNI for MVP.
- **Card counts on list view.** Adding `cardCount` would require a subquery or a separate endpoint — defer until the UI asks for it.

---
---

# Step 5 — Cards CRUD + Chained Deck Ownership

## Context

Step 4 delivered deck ownership. Step 5 nests cards under decks and enforces the `Card → Deck → User` ownership chain: you can only CRUD a card if the deck it belongs to is yours. This closes the backend MVP — after Step 5 the three features Register/Decks/Cards are all safe-by-default and the server is ready for Docker (Step 6) and the Next.js client (Step 7).

No new packages required.

---

## Key design decisions

1. **Reuse `DecksService`, do not reinvent the ownership check.** Step 4's `findOwned(userId, deckId, opts?)` on `DecksService` already does exactly what Card-create and Card-list-by-deck need. Card operations that take a `deckId` delegate to `DecksService`; operations that take a `cardId` join through `card.deck` and compare `deck.userId` with the caller. Single rule, two entry points.

2. **Promote `DecksService.findOwned` from `private` to `public`.** This is the Step-5-into-Step-4 touch-up. The method is genuinely a cross-module API now ("return this deck if this user owns it, else throw"). Same signature, same body, one keyword removed. No behavior change for existing deck routes.

3. **For card lookup by `cardId`, load `card.deck` and check `deck.userId` — do NOT load `deck.user`.** The spec suggested `relations: ['deck', 'deck.user']`, but the `userId` scalar on the Deck row is already sufficient (same trick used in Step 4). Skipping the `user` relation saves one JOIN per request.

4. **404 for missing card, 403 for card owned by someone else** — matches Step 4's pattern so the API feels consistent.

5. **`PATCH /cards/:id` cannot re-parent a card to a different deck.** `UpdateCardDto` intentionally omits `deckId`. Re-parenting would require ownership checks on **two** decks (old and new) and is not in MVP scope; a user who wants to move a card can delete + recreate.

6. **`GET /cards?deckId=...` uses `@Query('deckId', ParseUUIDPipe)`** — one query param, inline pipe, no dedicated Query DTO. Switch to a DTO only when a second filter appears.

7. **Order cards by `createdAt ASC`** on the list endpoint — flashcards are usually studied in authoring order. Step 4 used DESC for decks (newest first); different default, different semantics, both correct.

---

## Files to create

| Path | Purpose |
|---|---|
| `backend/src/cards/dto/create-card.dto.ts` | `front`, `back`: `IsString + IsNotEmpty + MaxLength(1000)`. `example?`: `IsString + IsOptional + MaxLength(2000)`. `deckId`: `IsUUID`. |
| `backend/src/cards/dto/update-card.dto.ts` | `front?`, `back?`, `example?` — same validators, all optional. **No `deckId`** (see decision 5). |
| `backend/src/cards/cards.service.ts` | `create`, `findByDeck`, `update`, `remove` — all take `userId` first. `create` and `findByDeck` delegate to `decksService.findOwned(userId, deckId)`. `update` and `remove` go through a private `findOwnedCard(userId, cardId)` helper that loads `card.deck` and compares `deck.userId`. |
| `backend/src/cards/cards.controller.ts` | `@UseGuards(JwtAuthGuard)` at class level. `POST /cards`, `GET /cards?deckId=`, `PATCH /cards/:id`, `DELETE /cards/:id`. `DELETE` returns 204. `:id` / `deckId` query param both go through `ParseUUIDPipe`. |

## Files to modify

| Path | Change |
|---|---|
| `backend/src/decks/decks.service.ts` | Remove `private` modifier on `findOwned`. No other change. |
| `backend/src/cards/cards.module.ts` | Import `TypeOrmModule.forFeature([Card])` **and** `DecksModule` (so `DecksService` is injectable). Declare `CardsController`. Provide `CardsService`. |

---

## Key code patterns

**`cards.service.ts` — create flow (deck-ownership delegated)**
```ts
async create(userId: string, dto: CreateCardDto): Promise<Card> {
  await this.decksService.findOwned(userId, dto.deckId);  // throws 404/403
  const card = this.repo.create({
    front: dto.front,
    back: dto.back,
    example: dto.example ?? null,
    deckId: dto.deckId,
  });
  return this.repo.save(card);
}
```

**`cards.service.ts` — list-by-deck**
```ts
async findByDeck(userId: string, deckId: string): Promise<Card[]> {
  await this.decksService.findOwned(userId, deckId);  // throws if not owned
  return this.repo.find({
    where: { deckId },
    order: { createdAt: 'ASC' },
  });
}
```

**`cards.service.ts` — ownership via `card.deck.userId`**
```ts
private async findOwnedCard(userId: string, id: string): Promise<Card> {
  const card = await this.repo.findOne({
    where: { id },
    relations: { deck: true },
  });
  if (!card) throw new NotFoundException('Card not found');
  if (card.deck.userId !== userId) throw new ForbiddenException();
  return card;
}

async update(userId: string, id: string, dto: UpdateCardDto): Promise<Card> {
  const card = await this.findOwnedCard(userId, id);
  Object.assign(card, dto);
  return this.repo.save(card);
}

async remove(userId: string, id: string): Promise<void> {
  const card = await this.findOwnedCard(userId, id);
  await this.repo.remove(card);
}
```

**`cards.controller.ts` — query param with ParseUUIDPipe**
```ts
@Get()
findByDeck(
  @CurrentUser() user: User,
  @Query('deckId', ParseUUIDPipe) deckId: string,
) {
  return this.cardsService.findByDeck(user.id, deckId);
}
```

---

## Verification (end-of-step acceptance test)

Prereq: Postgres up + migrations applied. Two registered users **A** and **B** with tokens. A has one deck `deckA`; B has one deck `deckB`.

1. `npm run build` → 0 errors.
2. `npm run lint` → clean.
3. `npm run start:dev` → `CardsModule` + `DecksModule` both init cleanly.
4. **Create happy path (A)**: `POST /cards` with `{ front:"hello", back:"xin chào", deckId:"<deckA>" }` + A's token → 201, response includes `id`, `deckId`, `createdAt`. Capture `cardId`.
5. **Create — missing required field**: omit `back` → 400.
6. **Create — bad `deckId` format**: `"deckId":"not-a-uuid"` → 400.
7. **Create — nonexistent deck**: `"deckId":"00000000-0000-0000-0000-000000000000"` → 404.
8. **Create — someone else's deck**: A's token, `"deckId":"<deckB>"` → **403**. (This is the critical ownership test.)
9. **Create — no token**: 401.
10. **List — owner**: `GET /cards?deckId=<deckA>` + A's token → 200, array of A's cards (createdAt ASC).
11. **List — other user's deck**: `GET /cards?deckId=<deckA>` + B's token → 403.
12. **List — missing `deckId` param**: `GET /cards` → 400 (`ParseUUIDPipe` fails on undefined).
13. **List — malformed deckId**: `GET /cards?deckId=nope` → 400.
14. **Update — owner**: `PATCH /cards/<cardId>` `{ "example":"Hello, how are you?" }` + A's token → 200, response reflects update.
15. **Update tries to change `deckId`**: `{ "deckId":"<deckB>" }` + A's token → 400 (`forbidNonWhitelisted`; unknown field rejected).
16. **Update — other user**: B's token → 403.
17. **Update — nonexistent card**: zero UUID → 404.
18. **Delete — other user**: B's token → 403 (card still exists afterward).
19. **Delete — owner**: A's token → 204. Re-`PATCH` same id → 404.
20. **Cascade regression**: recreate a card under `deckA`, then `DELETE /decks/<deckA>` (Step 4) → card row disappears from the `cards` table (FK `CASCADE` from Step 2 still holds).

If all 20 pass, Step 5 is done and the backend MVP is feature-complete. Next up: Docker (Step 6).

---

## Out of scope for Step 5

- **Moving a card to another deck.** `UpdateCardDto` has no `deckId` field. Delete + recreate is the MVP workflow.
- **DB index on `cards.deckId`.** Postgres does not auto-index FK columns; for large decks the list query will eventually need `@Index()` + a migration. Add before the first real rollout; skip for MVP.
- **Pagination on `GET /cards?deckId=`.** OK for decks with hundreds of cards; revisit if a user ever hits thousands.
- **Bulk card creation.** The UI can loop. Add a `POST /cards/bulk` later if spreadsheet import becomes a feature.
- **Spaced-repetition fields** (`interval`, `easeFactor`, `nextReviewAt`). The MVP explicitly defers SRS — study mode in Step 8 is next/prev only.

---
---

# Step 6 — Docker + Docker Compose + Nginx

## Context

Steps 1–5 produced a feature-complete backend that runs on a developer laptop. Step 6 packages the app for real deployment: one `docker compose up -d` brings up Postgres, the NestJS API, the Next.js frontend, and an Nginx reverse proxy behind one hostname. After this step, the API is reachable at `http://localhost/api/*` and the frontend (once Step 7 lands) at `http://localhost/`.

**Key scope boundary:** the `frontend` service gets defined in `docker-compose.yml` now, but its Dockerfile and source live in Step 7. Until then, the stack runs with `postgres + backend + nginx`; the `/` route returns 502 until Step 7 scaffolds the Next app.

---

## Key design decisions

1. **Global API prefix: `app.setGlobalPrefix('api')` in `main.ts`.** Routes become `/api/auth/login`, `/api/decks`, etc. Nginx then does a simple pass-through (`location /api { proxy_pass http://backend:4000; }`) — no prefix stripping, no trailing-slash gymnastics. Same URL shape whether you hit the container directly or go through the reverse proxy. Trade-off: earlier manual curl examples (`localhost:4000/auth/login`) become `localhost:4000/api/auth/login`; one-time path update.

2. **Wait for Postgres via a `healthcheck`, not just `depends_on`.** `depends_on` alone only waits for container *start*, not for the DB to accept connections. Add `pg_isready` healthcheck to postgres and `depends_on: { postgres: { condition: service_healthy } }` on backend. No wait-for-it scripts needed.

3. **Migrations are explicit, not auto-run at boot.** Per spec: `docker compose exec backend npm run migration:run`. Operators decide when schema changes apply. Safer than auto-running on every container restart (which can race during rolling deploys).

4. **Single-stage Dockerfile for the backend, not multi-stage.** MVP priority: migrations must work inside the container, and `typeorm-ts-node-commonjs` needs `src/` + `ts-node`. Stripping source in a "runtime" stage breaks `npm run migration:run`. The size cost (~150MB vs ~80MB) is acceptable for MVP; we can split stages and compile a JS data-source later if image size becomes a concern.

5. **Two `.env` files, kept in sync.** Root `./.env` is consumed by Docker Compose; `backend/.env` stays for local dev (`npm run start:dev` without Docker). Both ship as `.env.example`. Warned in the README — drift is the most common footgun here.

6. **Postgres exposes 5432 to the host; backend does NOT expose 4000.** DB port is useful for local tools (psql, pgAdmin, TablePlus). The API is only reachable through Nginx — no bypass path that could accidentally skip the reverse proxy in production mental models.

7. **Run as the built-in `node` user in the backend container** (UID 1000, ships with `node:*-alpine`). Baseline hardening — process cannot write to system paths.

8. **Only expose Nginx port 80 in Step 6; defer 443 + TLS to production hardening.** Listing `443:443` without a cert just wastes a port and adds confusion. LetsEncrypt / Caddy / Traefik swap is a later-stage concern.

9. **Named volume `postgres_data` (not a bind mount).** Portable across Windows/Mac/Linux; docker-managed; explicit teardown via `docker compose down -v`.

10. **`restart: unless-stopped` on every long-running service.** Survives host reboots, doesn't fight manual `docker stop` during debugging.

---

## Files to create

| Path | Purpose |
|---|---|
| `docker-compose.yml` (repo root) | Four services: `postgres`, `backend`, `frontend`, `nginx`. Postgres healthcheck. Named volume. All vars sourced from root `./.env`. |
| `backend/Dockerfile` | `node:20-alpine` → `npm ci` → `npm run build` → `USER node` → `CMD ["node", "dist/main.js"]`. Single-stage, keeps `src/` for migrations. |
| `backend/.dockerignore` | `node_modules`, `dist`, `.env`, `*.log`, `coverage`, `.git`. |
| `nginx/nginx.conf` | `/api` → backend:4000, `/` → frontend:3000, standard proxy headers, websocket upgrade for Next.js HMR. |
| `.env` (repo root) | Local file (gitignored). Contains real values — `DB_*`, `JWT_SECRET`. |
| `.env.example` (repo root) | Committed template with placeholder values. |

## Files to modify

| Path | Change |
|---|---|
| `backend/src/main.ts` | Add `app.setGlobalPrefix('api')` before `app.listen(...)`. |
| `backend/.env` | Leave as is (still has `DB_HOST=localhost` for local non-Docker dev). |
| `README.md` | Add a "Run with Docker" section: copy `.env.example`, `docker compose up -d`, `docker compose exec backend npm run migration:run`, hit `http://localhost/api/*`. |

## Files NOT created (intentional)

| Path | Why deferred |
|---|---|
| `frontend/Dockerfile` | Written in Step 7 after `frontend/` is scaffolded. Compose file references it so wiring is ready. |
| `frontend/.dockerignore` | Same — Step 7. |

---

## Key config snippets

**`docker-compose.yml`** (shape, not literal):
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 4000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 7d
    depends_on:
      postgres: { condition: service_healthy }
    # no ports: — only reachable via nginx

  frontend:
    build: ./frontend    # Dockerfile arrives in Step 7
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: http://localhost/api
    depends_on: [backend]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["80:80"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on: [backend, frontend]

volumes:
  postgres_data:
```

**`backend/Dockerfile`**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
USER node
EXPOSE 4000
CMD ["node", "dist/main.js"]
```

**`nginx/nginx.conf`**:
```nginx
events {}

http {
  upstream backend  { server backend:4000; }
  upstream frontend { server frontend:3000; }

  server {
    listen 80;
    server_name _;

    location /api {
      proxy_pass http://backend;
      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
      proxy_pass http://frontend;
      proxy_http_version 1.1;
      proxy_set_header Host              $host;
      proxy_set_header X-Real-IP         $remote_addr;
      proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Upgrade           $http_upgrade;    # Next.js HMR
      proxy_set_header Connection        "upgrade";
    }
  }
}
```

**Root `.env.example`**:
```
DB_USER=flashcard_user
DB_PASSWORD=change_me_in_production
DB_NAME=flashcard_db
JWT_SECRET=replace_with_a_long_random_secret
```

---

## Verification (end-of-step acceptance test)

Without the frontend service (deferred to Step 7):

1. `cp .env.example .env` at repo root and fill in values.
2. `docker compose config` → valid YAML, no env-var interpolation warnings.
3. `docker compose build backend` → succeeds.
4. `docker compose up -d postgres backend nginx` → 3 containers running.
5. `docker compose ps` → postgres shows `healthy`, backend + nginx show `running`.
6. `docker compose logs backend` → Nest bootstraps, `AppModule`/`TypeOrmModule`/`AuthModule`/`UsersModule`/`DecksModule`/`CardsModule` all init, no errors.
7. `docker compose exec backend npm run migration:run` → migration applies (users/decks/cards tables created).
8. `psql -h localhost -U $DB_USER -d $DB_NAME -c "\dt"` → 4 tables (users, decks, cards, migrations).
9. **API smoke test through Nginx**:
   ```
   curl -X POST http://localhost/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"a@b.com","password":"secret1"}'
   ```
   → 201 with user body (no password).
10. `curl http://localhost/api/auth/login -X POST -H ... -d '{...}'` → 200 with `access_token`.
11. `curl http://localhost/api/decks -H "Authorization: Bearer <token>"` → 200, empty array.
12. `curl http://localhost/` → 502 Bad Gateway (expected — frontend service not built yet; confirms nginx IS trying to reach `frontend:3000`).
13. **Restart resilience**: `docker compose restart backend` → comes back up, reconnects to Postgres, no manual intervention.
14. **Data persistence**: `docker compose down` (without `-v`) → `docker compose up -d postgres backend nginx` → users table still has the registered user.
15. **Env misconfiguration**: unset `JWT_SECRET` in `.env`, `docker compose up backend` → container exits with the Joi validation error from Step 1 naming the missing var.

If all 15 pass, Step 6 is done. Step 7 will add `frontend/` + its Dockerfile, at which point `docker compose up -d` (no service filter) brings the full stack up and `http://localhost/` returns the Next.js app.

---

## Out of scope for Step 6

- **TLS / HTTPS (port 443).** Deploy-time concern. Use LetsEncrypt + certbot, or front the stack with Caddy / Traefik that do automatic TLS.
- **Production image size optimization.** Current single-stage image is ~150MB. A multi-stage split with a compiled JS data-source could cut this in half; defer until it matters.
- **Log aggregation.** `docker compose logs -f` is sufficient for MVP. Fluentd/Loki/ELK belong in production.
- **Backup strategy for `postgres_data`.** Document separately when a first real deployment happens.
- **Resource limits** (`deploy.resources.limits`). Add when running on a host shared with other workloads.
- **Health endpoint on backend.** `@nestjs/terminus` + `/api/health` would let nginx and a load balancer do smart routing. Easy add when needed.
- **CI build of images.** `docker compose build` runs locally today; a GitHub Actions job that pushes to a registry is a deployment concern.

---

# Step 7 — Next.js Frontend (App Router) + API Integration

## Context

Steps 1–6 delivered a fully functional backend with `/api/auth/*`, `/api/decks`, `/api/decks/:id`, `/api/cards` endpoints, all reachable through nginx at `http://localhost/api/*`. Step 7 builds the **user-facing frontend**: a Next.js 15 (App Router) app in `frontend/` that lets a user register, log in, manage decks, manage cards, and step through a deck in a bare-bones study mode. No flip animation yet — that's Step 8.

Confirmed choices from the spec: Next.js App Router, TypeScript, TailwindCSS, fetch (not axios — one less dep, native on the platform), JWT in `localStorage`, local React state only (no Redux / Zustand / React Query).

Step 7 also **unblocks the frontend Docker service** that Step 6 left as a placeholder, so `docker compose up -d` (no service filter) brings the full stack up and `http://localhost/` serves the Next.js app through nginx.

---

## Repo layout added in Step 7

```
rising-star/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # root layout, imports globals.css
│   │   │   ├── page.tsx                # `/` → redirect to /decks or /login
│   │   │   ├── globals.css             # Tailwind directives
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── decks/
│   │   │   │   ├── page.tsx            # list + create
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # deck detail + cards CRUD
│   │   │   └── study/
│   │   │       └── [deckId]/
│   │   │           └── page.tsx        # step through cards
│   │   ├── components/
│   │   │   ├── DeckList.tsx
│   │   │   ├── CardList.tsx
│   │   │   └── AuthGuard.tsx           # client-side route protection wrapper
│   │   └── lib/
│   │       ├── api.ts                  # fetch wrapper with Bearer auth + 401 handling
│   │       ├── auth.ts                 # getToken/setToken/removeToken + SSR-safe guards
│   │       └── types.ts                # shared DTO/response types (User, Deck, Card)
│   ├── public/                         # default Next assets
│   ├── .env.example                    # NEXT_PUBLIC_API_URL
│   ├── .env.local                      # gitignored, dev-only
│   ├── .dockerignore
│   ├── Dockerfile                      # multi-stage: deps → build → runner
│   ├── next.config.ts
│   ├── tsconfig.json                   # strict
│   ├── tailwind.config.ts
│   ├── postcss.config.mjs
│   ├── package.json
│   └── eslint.config.mjs
└── docker-compose.yml                  # frontend service switches from placeholder to real build
```

---

## Commands to run (in order)

1. From repo root:
   ```
   npx create-next-app@latest frontend \
     --typescript --tailwind --app --eslint \
     --src-dir --import-alias "@/*" --use-npm --no-turbopack
   ```
   Flags picked so the scaffold matches our layout (`src/app`), TS+strict, Tailwind preinstalled, eslint on, alias `@/` for clean imports.

2. Inside `frontend/`, no extra runtime deps required for Step 7 — fetch is on the platform, React hooks are built in. Only dev-time extras if eslint doesn't already ship with a flat config: skip unless needed.

3. Write `frontend/.env.example` + `frontend/.env.local` with `NEXT_PUBLIC_API_URL=/api` (dev default).

4. Delete the CRA-style default `src/app/page.tsx` content and replace with our `/` redirect shim.

5. Author the files listed in the **Files to author** table below.

6. Update `docker-compose.yml` — replace the frontend placeholder service with a real `build: ./frontend` definition.

7. Write `frontend/Dockerfile` and `frontend/.dockerignore` (deferred from Step 6).

---

## Files to author in Step 7

### Libraries / helpers

| Path | Purpose |
|---|---|
| `frontend/src/lib/auth.ts` | `getToken()`, `setToken(token)`, `removeToken()`. All guarded with `typeof window !== 'undefined'` so they're SSR-safe and don't throw when imported from a Server Component that ends up in a static build. |
| `frontend/src/lib/api.ts` | `apiFetch<T>(path, init?)` wrapper. Reads `NEXT_PUBLIC_API_URL` (defaults to `/api`). Attaches `Authorization: Bearer <token>` if a token is present. Parses JSON. On `401`, calls `removeToken()` and `window.location.href = '/login'` so expired tokens auto-kick the user. Throws a typed `ApiError { status, message }` on non-2xx for the UI to render. |
| `frontend/src/lib/types.ts` | Types mirroring backend responses: `User { id, email, name?, createdAt }`, `Deck { id, name, description?, userId, createdAt, updatedAt }`, `Card { id, front, back, example?, deckId, createdAt, updatedAt }`, `LoginResponse { access_token }`. |

### Pages (App Router — all use `'use client'` because they touch `localStorage`)

| Path | Responsibility |
|---|---|
| `frontend/src/app/layout.tsx` | Root layout with `<html lang="en">`, `<body className="min-h-screen bg-slate-50 text-slate-900">`, imports `./globals.css`. |
| `frontend/src/app/page.tsx` | Client component. On mount: if token → `router.replace('/decks')`, else `router.replace('/login')`. Renders nothing (or a spinner) while deciding. |
| `frontend/src/app/login/page.tsx` | Form: `email`, `password`. Submits to `POST /auth/login` via `apiFetch`. Stores `access_token` in localStorage, navigates to `/decks`. Shows loading + error states. Link to `/register`. |
| `frontend/src/app/register/page.tsx` | Form: `email`, `password`, optional `name` (backend `RegisterDto` accepts optional name). Submits to `POST /auth/register`. On success, redirect to `/login` (does NOT auto-login — simpler and matches spec). |
| `frontend/src/app/decks/page.tsx` | `AuthGuard`-wrapped. `useEffect` → `GET /decks`. Renders `<DeckList decks={...} onDelete={...} />`. Inline "Create deck" form (name + description). `POST /decks` → prepend to list. |
| `frontend/src/app/decks/[id]/page.tsx` | `AuthGuard`-wrapped. `useParams()` → `id`. Fetches `GET /decks/:id` (includes cards via backend's `withCards` relation? — **verify** what `findOne` returns; if it does NOT include cards, also fetch `GET /cards?deckId=...`). Renders deck header + `<CardList cards={...} onUpdate onDelete />` + "Add card" form (front, back, example). `POST /cards` with `{ deckId, front, back, example? }`. Link to `/study/[deckId]`. |
| `frontend/src/app/study/[deckId]/page.tsx` | `AuthGuard`-wrapped. Fetches `GET /cards?deckId=...` once on mount. Local state: `index`, `flipped`. Shows `cards[index].front` or `cards[index].back` based on `flipped`. Buttons: **Flip** (toggles), **Previous** (disabled at 0), **Next** (disabled at last). Progress indicator `"Card 3 / 12"`. Empty state: "No cards in this deck — add some first." |

### Components

| Path | Purpose |
|---|---|
| `frontend/src/components/AuthGuard.tsx` | Client component. On mount: if no token → `router.replace('/login')`. While checking, renders `null` (prevents flash of protected content). Wraps the body of every protected page. |
| `frontend/src/components/DeckList.tsx` | Presentational. Props: `decks: Deck[]`, `onDelete: (id) => void`. Each row links to `/decks/[id]`, shows name + description, has a delete button. |
| `frontend/src/components/CardList.tsx` | Presentational. Props: `cards: Card[]`, `onUpdate: (id, patch) => void`, `onDelete: (id) => void`. Inline-edit per card (front/back/example) — simple controlled inputs + Save/Cancel. |

### Config / infra

| Path | Purpose |
|---|---|
| `frontend/.env.example` | `NEXT_PUBLIC_API_URL=/api` (works in Docker via nginx; for standalone `next dev` against a host backend, user overrides to `http://localhost:4000/api`). |
| `frontend/.env.local` | Gitignored. Same content as `.env.example` for local dev. |
| `frontend/Dockerfile` | Multi-stage: (1) `node:20-alpine` install deps, (2) `next build`, (3) `node:20-alpine` runner running `next start -p 3000`. Exposes 3000. `USER node`. Uses `.next/standalone` output if `next.config.ts` sets `output: 'standalone'` (recommended — smaller image, no `node_modules` in final layer). |
| `frontend/.dockerignore` | `node_modules`, `.next`, `.env*`, `*.log`, `coverage`. |
| `docker-compose.yml` (modify) | Replace the frontend placeholder block with:<br>`build:`<br>&nbsp;&nbsp;`context: ./frontend`<br>&nbsp;&nbsp;`dockerfile: Dockerfile`<br>+ `environment: NEXT_PUBLIC_API_URL: /api`. Keep nginx `depends_on: [frontend]` as-is — nginx will now actually proxy `/` successfully. |

---

## API contract the frontend will consume

All requests go through nginx → `/api/*` → backend. `apiFetch` prepends `NEXT_PUBLIC_API_URL` (default `/api`).

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/auth/register` | no | `{ email, password, name? }` | `User` (no password) |
| POST | `/auth/login` | no | `{ email, password }` | `{ access_token }` |
| GET | `/auth/profile` | yes | — | `User` |
| GET | `/decks` | yes | — | `Deck[]` |
| POST | `/decks` | yes | `{ name, description? }` | `Deck` |
| GET | `/decks/:id` | yes | — | `Deck` (check if cards are included — the Step 4 service's `findOne` wraps `findOwned(userId, id)`; if it was called without `withCards: true`, the detail page must fetch cards separately) |
| PATCH | `/decks/:id` | yes | `{ name?, description? }` | `Deck` |
| DELETE | `/decks/:id` | yes | — | 204 |
| GET | `/cards?deckId=<uuid>` | yes | — | `Card[]` |
| POST | `/cards` | yes | `{ deckId, front, back, example? }` | `Card` |
| PATCH | `/cards/:id` | yes | `{ front?, back?, example? }` | `Card` |
| DELETE | `/cards/:id` | yes | — | 204 |

---

## Key quality decisions baked in now

- **All pages that touch auth state are `'use client'`.** JWT is in `localStorage`, which doesn't exist server-side. Trying to SSR a protected page against the user's token is impossible; forcing client rendering is the correct trade-off for a SPA-like app. The root `/` page is also a client shim.
- **`AuthGuard` component, not middleware.** Next.js `middleware.ts` runs on the edge and can't read `localStorage`. It could read cookies, but we're explicitly using localStorage per spec. A client-side `AuthGuard` on each protected page is the simplest path that matches the requirement.
- **`apiFetch` centralizes 401 handling.** Expired tokens trigger one place: clear storage + redirect to `/login`. No page needs to think about token expiry.
- **`NEXT_PUBLIC_API_URL` with a relative default (`/api`).** In Docker, nginx serves both frontend and backend on port 80, so relative `/api/...` works with zero config. For `npm run dev` alone against a host-mode backend, user sets `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `.env.local`.
- **No data-fetching library.** Spec is explicit: React hooks only. Page state shape stays trivially small (`{ data, loading, error }` per page).
- **Strict TS.** Next's scaffold turns it on; keep it on.
- **Loading + error states are mandatory per page.** The spec calls these out as common mistakes to avoid — the verification list below checks both explicitly.
- **`next.config.ts` with `output: 'standalone'`.** Shrinks the Docker image dramatically and is the officially recommended prod mode.

---

## Route protection flow

```
user hits /decks
  → AuthGuard useEffect runs
    → getToken() returns null
      → router.replace('/login')      [fast redirect, no flash]
    → getToken() returns string
      → setState({ ready: true })     [children render]
```

Every protected route (`/decks`, `/decks/[id]`, `/study/[deckId]`) wraps its body in `<AuthGuard>`. Auth pages (`/login`, `/register`) do **not** wrap — they're reachable unauthenticated.

---

## Verification (end-of-step acceptance test)

Run `cp .env.example .env` at repo root, fill values, then:

**Local dev (outside Docker)**:
1. `cd frontend && npm run dev` → Next starts on `:3000`, no compile errors.
2. Visit `http://localhost:3000/` → redirects to `/login` (no token yet).
3. `/register` form → fill email + password → 201 response → redirect to `/login`.
4. `/login` → submit same credentials → token stored in localStorage (verify via DevTools → Application → Local Storage) → redirect to `/decks`.
5. `/decks` → empty state rendered, "Create deck" form works → new deck appears in list.
6. Click a deck → `/decks/:id` loads with deck header + empty "No cards" state → add a card → it appears.
7. Click "Study" → `/study/:deckId` → card front shown, **Flip** toggles front↔back, **Next/Previous** navigate, buttons disable at edges.
8. Delete the JWT from localStorage, hit `/decks` → instantly redirects to `/login` (AuthGuard).
9. Set a **bogus** JWT in localStorage, hit `/decks` → `apiFetch` receives 401, clears token, redirects to `/login`.
10. Kill the backend, submit the login form → UI renders an error message (not a silent hang).
11. `cd frontend && npm run build` → exits 0, no TS or lint errors.
12. `cd frontend && npm run lint` → clean.

**Full-stack Docker**:
13. From repo root: `docker compose up -d --build` (no service filter now — frontend builds for real).
14. `docker compose ps` → postgres healthy, backend + frontend + nginx all running.
15. `http://localhost/` → Next.js app served through nginx, identical UX to step 2–10 above.
16. `http://localhost/api/auth/profile` with a valid bearer token (curl) → still works — confirms the Step 6 backend path isn't regressed.
17. Reload `http://localhost/decks` while logged in → still works after an `nginx` container restart (`docker compose restart nginx`).

If all 17 pass, Step 7 is complete and the app is end-to-end functional. Step 8 adds the flashcard **flip animation** and any UX polish on the study page.

---

## Out of scope for Step 7 (tracked for Step 8 or later)

- **Flip animation.** Study page uses plain state toggle; CSS 3D transform lives in Step 8.
- **Optimistic updates.** Every mutation awaits the server response before updating UI. Fine for MVP; optimistic + rollback is a later refinement.
- **Toast / snackbar system.** Errors render inline per page. A global toast is nice-to-have, not required.
- **Pagination / infinite scroll.** Deck and card lists render all rows; MVP scale assumption.
- **Shared nav / layout chrome.** Minimal header-less pages to start. A top nav with logout belongs after Step 8 UX polish.
- **Form validation library.** Native HTML `required` + backend validation errors. No react-hook-form / zod in MVP.
- **Refresh tokens.** Backend issues a single access_token with 7d expiry. When it expires, user re-logs-in. Refresh token flow is future work.
- **HttpOnly cookie auth.** Spec pinned us to localStorage. Migration to cookie-based auth (safer against XSS) is a dedicated follow-up that touches backend too.
- **E2E tests (Playwright).** Manual verification list above is sufficient for the MVP gate.
- **Dark mode / theming.** Tailwind is in, but Step 7 ships a single light theme.
