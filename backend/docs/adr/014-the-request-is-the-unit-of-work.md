# ADR-014: The Request Is the Unit of Work

**Status:** Accepted
**Supersedes:** the "committing is the application service's job" rule stated in
`get_db`'s original docstring (Phase 2B-1).
**Date:** 2026-09-03

## Context

`get_db` yielded a request-scoped session and, on the way out, rolled back and
closed it. Nothing committed. The docstring made this deliberate: *"Committing
is the application service's job, not the dependency's, so a request that
raises after a partial write leaves nothing behind."*

That rule is coherent, and it worked for as long as no route wrote anything.
Phase 2B-6 added the first ones — `PUT /auth/change-password` — and live HTTP
verification found the endpoint answering `200 {"message": "Password changed
successfully"}` while the old password went on working. The same defect was
already live in Phase 2B-5's `authenticate()`: `last_login_at` was never
stamped, and the transparent Argon2 rehash was recomputed on every single
login and persisted for nobody.

**The whole test suite passed throughout.** Every API test overrides `get_db`
with a session the fixture rolls back, so a write only ever had to be
*flushed* to satisfy its assertions. Durability was the one property the tests
structurally could not observe.

The obvious repair — have each service open `transaction_scope` — does not
work, and the reason is worth recording. SQLAlchemy opens a transaction on the
first query. Authentication reads on every protected route, so by the time a
service runs, a transaction is already open; `transaction_scope` then takes
its `begin_nested()` path, which releases a SAVEPOINT and **never commits**.
The helper only commits when it is genuinely outermost, which a service in a
request no longer is. `provision_church` works precisely because nothing has
touched its session first.

## Decision

**`get_db` commits when the request handler returns normally**, and rolls back
if anything escapes it.

```python
async with session_factory() as session:
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()
```

Services `flush()` and let the request own the commit. `transaction_scope`
remains the boundary for an operation that must be atomic *in its own right* —
provisioning, and later the financial mutations `backend/CLAUDE.md` §10 requires
to be transactional — and nests inside the request transaction as designed.

## Rationale

- **It preserves the property the original rule was protecting.** A request
  that raises still rolls back; a partial write still leaves nothing behind.
  What changes is only the successful path, which previously discarded
  everything.
- **It is the one place that can know.** The request is the only scope that
  knows the work finished successfully. A service cannot: it does not know
  whether it is the whole operation or one step of a larger one.
- **The alternative pushes an unanswerable question into every service.**
  With no request-level commit, each service must decide whether to commit —
  and gets it wrong whenever a dependency has already opened a transaction,
  silently, with no failure anywhere.

## Consequences

- Any future route that writes now persists by default. Services should keep
  using `flush()` when they need generated ids, and `transaction_scope` when a
  block must be atomic independently of the request.
- Long-running work must not be started before a write and expected to hold
  the transaction open; the transaction now spans the handler.
- **Rollback-based tests cannot observe durability.** `tests/integration/test_auth_persistence.py`
  exists specifically for this: it drives the real `get_db` with no override,
  reads rows back through a separate session, and cleans up after itself.
  Removing the commit makes five of its tests fail. Any future write endpoint
  needs at least one test of this shape — the rest of the suite cannot see the
  difference between a write that persisted and one that did not.

## Alternatives Considered

- **`transaction_scope` inside each service.** Rejected: defeated by
  SQLAlchemy autobegin whenever any dependency has already read, which is
  every authenticated route. It would have looked correct and fixed nothing.
- **Explicit `await session.commit()` inside each service.** Rejected: it
  works, but it commits whatever else the request had pending, it must be
  remembered at every future write site, and it breaks the test pattern where
  the suite owns an enclosing transaction.
- **Committing in each route handler.** Rejected as the same problem one layer
  out, with the added cost of putting transaction management in routers, which
  `backend/CLAUDE.md` §12 asks to keep thin.
