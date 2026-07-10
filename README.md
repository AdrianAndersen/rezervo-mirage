<img width="564" height="168" alt="rezervo-mirage" src="https://github.com/user-attachments/assets/16777f58-06b1-484c-8a8e-cfe73a5e940e" />

###### A mirage of a gym — fake classes, fake users, real API — for testing rezervo. 🏜️

## Develop

```sh
docker compose -f docker-compose.dev.yml up --build -d
```

This starts the dev server (`mirage`) and an isolated PostgreSQL (`mirage-db`)
in the background; they stay alive and restart automatically. The app is served
at [http://localhost:4000](http://localhost:4000).

```sh
docker compose -f docker-compose.dev.yml logs -f mirage   # follow logs
docker compose -f docker-compose.dev.yml down             # stop
```

Linting, formatting, typechecking and tests run directly with [Bun](https://bun.sh):

```sh
bun run fix
bun run test
```

### Without Docker

Requires [Bun](https://bun.sh) (see `packageManager` in `package.json`) and a
reachable PostgreSQL database.

```sh
bun install
cp .env.example .env      # then edit DATABASE_URL (and admin auth, see below)
bunx prisma migrate dev   # apply migrations + generate the client
bun run dev               # start the dev server (Vite) on http://localhost:4000
```

## Build & run

```sh
bun run build      # production build
bun run start      # serve the build (.output/server/index.mjs)
```

## Database

Prisma schema lives in `prisma/schema.prisma`.

```sh
bunx prisma migrate dev --name <name>   # create + apply a migration in dev
bunx prisma migrate deploy              # apply migrations in production
bunx prisma generate                    # regenerate the client
```

## Admin auth

The admin data-studio (UI + its server functions) is behind a single shared
password; the provider API has its own per-user auth and is not affected.

- **Local/CI:** set `ADMIN_AUTH_DISABLED=1` to skip the login screen entirely
  (the default in `.env.example`).
- **Production:** unset `ADMIN_AUTH_DISABLED` and set `ADMIN_PASSWORD` plus
  `ADMIN_SESSION_SECRET` (≥ 32 chars — `openssl rand -base64 48`). Login is
  rate-limited per IP against brute force.

## Provider API

The rezervo-facing API is served under `/api/chains/{chainIdentifier}/...`.

- OpenAPI: `bun run openapi:gen` writes `openapi.json`; browsable at `/api/docs`.
