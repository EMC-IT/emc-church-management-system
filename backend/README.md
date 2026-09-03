# EMC CMS Backend

FastAPI backend for the EMC Church Management System. Multi-tenant,
multi-branch, domain-driven modular monolith.

**Status: Phase 1 (platform foundations) complete.** No business domains are
implemented yet. See [`docs/backend-implementation-plan.md`](docs/backend-implementation-plan.md)
for the phase plan and the open questions that gate each phase.

## Stack

Python 3.13 · FastAPI · Pydantic v2 · SQLAlchemy 2.x (async) · PostgreSQL ·
Alembic · Redis · Celery · pytest · Ruff · MyPy

## Quick start

### With Docker

```bash
cp .env.example .env
docker compose up -d postgres redis minio     # infrastructure
docker compose run --rm api alembic upgrade head
docker compose up                              # api, worker, beat
```

| Service | URL |
| :-- | :-- |
| API | http://localhost:8000/api/v1 |
| API docs | http://localhost:8000/api/v1/docs |
| MinIO console | http://localhost:9001 (minioadmin / minioadmin) |

### Without Docker

Needs a local PostgreSQL 14+ and Redis.

```bash
uv sync
cp .env.example .env                           # then edit DATABASE_URL / REDIS_URL
createdb emc_church_db
uv run alembic upgrade head
uv run fastapi dev app/main.py                 # or: uv run uvicorn app.main:app --reload
```

`fastapi dev` and `uvicorn --reload` run the same server; the former prints a
nicer banner. Note that its banner advertises `/docs`, which **404s here** — the
docs live under the version prefix at `/api/v1/docs`, as does everything else.

The Docker image runs `uvicorn` explicitly rather than `fastapi run`, so that
the production entrypoint names its app rather than discovering it.

## Endpoints

| Endpoint | Purpose |
| :-- | :-- |
| `GET /api/v1/health` | Liveness. 200 whenever the process is up; checks no dependencies, so an orchestrator restarts only on a genuinely dead process. |
| `GET /api/v1/ready` | Readiness. Checks PostgreSQL and Redis; 503 when either is down, so a load balancer drains the instance instead of restarting it. |

## Testing

```bash
uv run pytest                    # full suite
uv run pytest -m requires_db     # database-backed tests only
uv run ruff check . && uv run ruff format --check .
uv run mypy
```

The suite needs a reachable PostgreSQL and Redis. It uses its own database and
Redis index and will not touch development data:

| Variable | Default |
| :-- | :-- |
| `TEST_DATABASE_URL` | `postgresql+asyncpg://postgres:postgres@localhost:5432/emc_church_test_db` |
| `TEST_REDIS_URL` | `redis://localhost:6379/15` (flushed between tests) |

`tests/integration/test_migrations.py` creates and drops a throwaway database
per test, so migrations are proven against a genuinely clean schema rather than
whatever an earlier suite left behind.

## Dependencies

`pyproject.toml` is the single source of truth; `uv.lock` is committed and must
stay in sync with it. There is no `requirements.txt` and none should be written
by hand — if a deployment target ever needs one, generate it with
`uv export --no-dev --format requirements-txt`.

```bash
uv add <package>          # runtime dependency
uv add --dev <package>    # tooling: test, lint, type-check, dev server CLI
uv sync                   # install runtime + dev (the default)
uv sync --no-dev          # runtime only, as the Docker image does
uv lock --check           # CI gate: lock file matches pyproject.toml
```

Dev tooling lives in `[dependency-groups]` (PEP 735) rather than an optional
extra, so `uv add --dev` writes to the list that is already there instead of
starting a second one, and `--no-dev` genuinely excludes it from the image.

Before adding anything, check the standard library and the existing dependency
set first. The footprint is deliberately small: every addition is a maintenance
and supply-chain liability, and the platform layer needs very little that
Python 3.13 does not already provide.

## Migrations

```bash
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "add members table"
uv run alembic downgrade -1
uv run alembic upgrade head --sql            # emit SQL without connecting
```

The database URL is read from application settings, **not** from `alembic.ini`,
so migrations and the running application cannot disagree about the target
database and no credential is committed.

Every revision carries the review checklist from `AGENTS.md` §13 and must be
verified against a clean database before it is considered done.

## Layout

```
app/
├── main.py              application factory, middleware stack
├── config.py            pydantic-settings; the only reader of the environment
├── models.py            model registry for Alembic autogenerate
├── api/
│   ├── router.py        master router; domain routers mount here
│   ├── dependencies.py  DbSession, RedisClient, Pagination
│   └── routes/system.py health and readiness probes
├── core/
│   ├── context.py       request-scoped contextvars (request id)
│   ├── database/        engine, session, base model, transaction scope
│   ├── cache/           Redis pool and client
│   ├── exceptions/      error hierarchy + global handlers
│   ├── logging/         structured JSON / console logging
│   └── middleware/      request id, access logging, security headers
├── domains/             20 domain packages (empty until Phase 2+)
├── integrations/        payment, SMS, email, storage, maps interfaces
├── jobs/                Celery application and tasks
└── shared/              pagination, response envelopes, base schemas
```

## Conventions

**camelCase on the wire.** Every schema derives from `CamelModel`
(`app/shared/types/base.py`), which serializes to camelCase and accepts either
spelling on input. The existing Next.js frontend consumes camelCase throughout
(`lib/types/**`); Python code stays snake_case.

**Response envelopes** (`app/shared/types/responses.py`):

```jsonc
{ "success": true, "data": { }, "message": "..." }
{ "success": true, "data": [ ], "total": 120, "page": 1, "limit": 20, "totalPages": 6 }
{ "success": false, "code": "VALIDATION_ERROR", "message": "...",
  "errors": [{ "field": "amount", "message": "..." }], "requestId": "..." }
```

**Errors.** Codes and status pairs come from
`api-documentations/Errors_Responses.md`. Authorization failures return **403,
never 401** — the frontend's Axios interceptor clears the session and redirects
to `/login` on any 401, so a permission failure returning 401 would log the user
out. Unhandled exceptions are logged with a stack trace and reported as a
generic 500 that leaks no internals.

**Request ids.** Every request carries one (`X-Request-ID`, inbound value echoed
if it is well-formed), it appears in every log record, and it is returned in
every error body so a user-reported failure can be traced to a log line.

**Tenancy.** `TenantScopedMixin` gives every tenant-owned table a non-nullable
`tenant_id` and a nullable `branch_id`. The value is always derived from the
authenticated principal, never from a request body.

**Transactions.** `transaction_scope` is the atomicity boundary. Financial
writes and their audit records share one transaction, so a rollback discards
both.

**Configuration safety.** `staging` and `production` refuse to start with an
unset `SECRET_KEY`, `DEBUG=true`, a `*` CORS origin, `DATABASE_ECHO=true`, or
eager Celery. This is a hard failure, not a warning.

## Notes from Phase 1

- **Authentication does not exist yet.** The previous scaffold shipped a
  `get_current_principal` that accepted any non-empty bearer string and returned
  a hard-coded SuperAdmin with `permissions=["*"]`. It has been removed rather
  than left in place: a placeholder that authorizes everything is worse than no
  authentication, because a router mounted against it looks protected while
  being wide open. Real authentication lands in Phase 2.
- **`python-jose` and `passlib[bcrypt]` were dropped** from the dependencies.
  `backend architecture.md` §12 mandates Argon2id; the replacement is chosen in
  Phase 2 rather than carrying a hashing library the plan already rejects.
- **`/api/v1` is now the prefix** (resolves OQ-API-01). The frontend default in
  `services/api-client.ts` and the base URLs in `api-documentations/` and
  `API_DOCUMENTATION.md` were updated to match. Any existing `.env.local` must
  set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`, since a local env file
  overrides the code default.
