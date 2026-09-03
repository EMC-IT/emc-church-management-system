# ADR-004: Argon2id via `pwdlib[argon2]`, Python 3.13

**Status:** Accepted
**Resolves:** OQ-DB-03
**Date:** 2026-09-03

## Context

`backend-implementation-plan.md` §10 flagged two unresolved mismatches:

- `backend architecture.md` §12 mandates Argon2id for password hashing, but
  the previous scaffold had `passlib[bcrypt]` pinned as a dependency.
- The stack is mandated as Python 3.13+ (`backend/AGENTS.md` §2), but
  `pyproject.toml` at the time had `requires-python = ">=3.11"`.

`backend/README.md`'s "Notes from Phase 1" already records that
`python-jose` and `passlib[bcrypt]` were dropped in anticipation of this
decision, so this ADR formalizes and closes that. Verified against the
current repo: `backend/pyproject.toml` already sets
`requires-python = ">=3.13"` and `.python-version` is `3.13` — the version
floor was already corrected during Phase 1, not still drifted. `passlib` and
`python-jose` are confirmed absent from `pyproject.toml`. `pwdlib` is not yet
a dependency; adding it is the one action item this ADR leaves open (see
Consequences).

## Decision

- **Password hashing:** Argon2id, via `pwdlib[argon2]`.
- **Python version floor:** 3.13, matching `pyproject.toml`'s
  `requires-python` and the `.python-version` file already in the repo.

Passwords are never stored in plaintext or hashed with general-purpose
cryptographic hashes (MD5, SHA-1, SHA-256, SHA-512, or unsalted/legacy
schemes). Hashing parameters (memory cost, iterations, parallelism) are
configuration, not hardcoded constants, so they can be tuned per environment
and upgraded over time without a code change.

## Rationale

- Argon2id is the OWASP-recommended default for password storage and is
  what `backend architecture.md` §12 already mandates — this ADR adopts the
  existing architectural decision rather than overriding it.
- `pwdlib` is a maintained, modern wrapper with first-class Argon2 support,
  replacing the dropped `passlib` (last major release predates active
  maintenance concerns) and `python-jose` (superseded by dedicated JWT
  libraries chosen separately in Phase 2 for token issuance).
- Python 3.13 was already the mandated floor in `backend/AGENTS.md` §2; the
  `>=3.11` floor in `pyproject.toml` was drift from the scaffold stage, not
  a considered alternative.

## Consequences

- `pwdlib[argon2]` must be added as a runtime dependency via `uv add`
  (per `backend/README.md`'s dependency conventions — no hand-written
  `requirements.txt`). This is the only outstanding action from this ADR;
  the Python floor and the removal of `passlib`/`python-jose` are already
  done.
- The password hashing interface (hash / verify / needs-rehash) is
  implemented once as a shared utility, not per-domain, so Phase 2's
  identity domain and any future service that touches credentials use the
  same code path.
- `needs_rehash` support (via `pwdlib`'s hasher) should be checked on every
  successful login, so parameter upgrades roll out transparently as users
  authenticate rather than requiring a bulk migration.
- CI (once stood up per the project roadmap's Phase E) should pin and test
  against Python 3.13 specifically, not a range, to prevent silent drift
  back to an older floor.

## Alternatives Considered

- **bcrypt via `passlib`.** Rejected: contradicts the already-mandated
  Argon2id requirement in `backend architecture.md` §12, and `passlib` was
  already removed from the scaffold in anticipation of this decision.
- **`argon2-cffi` directly, without `pwdlib`.** Viable alternative, but
  `pwdlib` provides the same Argon2id backend with a smaller, more current
  maintenance surface and a cleaner hash/verify/needs-rehash API — no
  material reason to hand-roll that layer.
- **Python 3.11/3.12 floor.** Rejected: contradicts `backend/AGENTS.md` §2's
  explicit Python 3.13+ requirement. Moot in practice — `pyproject.toml`
  already reflects the 3.13 floor, confirmed during this ADR's review.
