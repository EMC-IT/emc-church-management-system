# ADR-007: Composite Foreign Keys Enforce Same-Tenant Integrity for Member's Optional Relationships

**Status:** Accepted
**Date:** 2026-09-03

## Context

`Member` has two optional relationships that a plain single-column foreign
key cannot safely express:

```text
members.branch_id -> branches.id
members.user_id   -> users.id
```

A plain FK only proves the referenced row *exists somewhere* — not that it
belongs to the *same tenant* as the `Member` row referencing it. Concretely:

```text
Member.tenant_id = Church A
Member.branch_id -> a Branch belonging to Church B
```

passes a plain `branch_id -> branches.id` FK cleanly, because that FK never
looks at `tenant_id` at all. This is a real cross-tenant leak, not a
hypothetical: nothing in the application layer is forced to check it, and a
single missed check anywhere in a future service is enough to create it. The
identical shape of problem exists for `members.user_id -> users.id`.

`ADR-005`'s addendum flagged this exact gap for `TenantScopedMixin.branch_id`
and deliberately deferred it: "needs either a composite foreign key against
a `UNIQUE(tenant_id, id)` on `branches`, or a trigger/check... deserves its
own decision when the first branch-scoped domain... is built." `Member` is
that domain.

## Decision

**Composite foreign keys**, not triggers, not application-only checks:

```text
(members.tenant_id, members.branch_id) -> branches(tenant_id, id)
(members.tenant_id, members.user_id)   -> users(tenant_id, id)
```

Both `branches` and `users` gained a new `UNIQUE(tenant_id, id)` constraint
in this migration (0004) — Postgres requires an FK's target columns to be
covered by a unique constraint or PK, and the existing PK on `id` alone
does not cover `tenant_id`.

Postgres composite foreign keys default to `MATCH SIMPLE`: if *any* column
in the composite key is `NULL`, the row is exempt from the check entirely.
Since both `branch_id` and `user_id` are nullable by design (a member may
have neither), this is exactly the right semantic — a tenant-wide,
branch-unassigned member, or a member with no linked user account, is
simply not checked, with no special-casing required.

`TenantScopedMixin.branch_id`'s composite FK is implemented once, in
`app/core/database/base.py`, via a standalone `branch_scope_fk()` function
(not inlined into the mixin's own `__table_args__`) so that a subclass
needing additional `__table_args__` of its own — as `Member` does, for its
unique email/phone constraints and status CHECK — can call it directly and
combine it with its own entries, rather than losing it silently (a
subclass's own `__table_args__` fully shadows a mixin's `declared_attr`
version; it does not merge automatically). `Member.user_id`'s composite FK
is declared directly in `Member`, since that relationship is specific to
this domain, not part of the shared tenant/branch mixin.

## ON DELETE Behaviour

| Relationship | `ON DELETE` | Reasoning |
| :-- | :-- | :-- |
| `(tenant_id, branch_id) -> branches` | `RESTRICT` | Matches every other ownership relationship in this schema (`branches.tenant_id -> churches`, `users.tenant_id -> churches`) — an entity with active dependents cannot be deleted out from under them. A branch with members assigned should not be silently deletable. |
| `(tenant_id, user_id) -> users` | `RESTRICT` | `SET NULL` was the first choice, and is wrong for a composite key: Postgres's `ON DELETE SET NULL` nulls *every* column in the FK, which would null `members.tenant_id` too — a `NOT NULL` column. This was caught empirically, not by inspection: an integration test deleting a linked `User` failed with `NotNullViolationError` on `tenant_id` before this ADR settled on `RESTRICT`. Postgres 15+ supports column-scoped `SET NULL (user_id)`, but the project's minimum supported version is 14 (`tests/integration/test_database.py`), so that syntax isn't portable here. `RESTRICT` still satisfies "do not automatically delete a Member when its User is deleted" — nothing happens to the Member either way, since the User hard-delete itself is blocked while a Member links to it. It also matches every other FK already in this schema (`branches.tenant_id`, `users.tenant_id`, `members.tenant_id`, and `members`' own `branch_id` FK above), and a `User` is normally deactivated via `SoftDeleteMixin` in any case, which is a plain `UPDATE` and never triggers this FK at all. |

## Rationale

- **This is a security boundary, not a convenience.** `backend/AGENTS.md`
  §7 requires tenant isolation "at the database layer where appropriate."
  A cross-tenant `branch_id`/`user_id` reference is precisely the kind of
  invariant that must not depend on every future service function
  remembering to check it correctly.
- **The relational approach is genuinely simpler than the alternative.**
  A trigger achieving the same guarantee would need to run on every
  `INSERT`/`UPDATE` of `members`, re-implement the same join Postgres
  already does natively for FK checking, and be re-verified by hand on
  every schema change. A composite FK is declarative, is understood by
  `\d members`, participates correctly in `EXPLAIN` plans, and is exactly
  as fast as a normal FK check.
- **Symmetry with `TenantScopedMixin.tenant_id`.** Phase 2B-1.5 already
  established the pattern of giving `tenant_id` a real FK rather than a
  bare indexed column, specifically so "future tenant-scoped models cannot
  accidentally have an unconstrained `tenant_id`." Leaving `branch_id`
  unconstrained while `tenant_id` is constrained would be an inconsistent,
  half-finished version of the same principle.

## Consequences

- Every future domain that composes `TenantScopedMixin` and sets
  `branch_id` gets the same-tenant guarantee automatically, with zero
  additional code, unless it also needs its own `__table_args__` — in
  which case it must call `branch_scope_fk()` itself and include it,
  exactly as `Member` does. This is a real sharp edge worth flagging: the
  mixin's `declared_attr __table_args__` is silently shadowed, not merged,
  by a subclass defining its own. A future domain that defines
  `__table_args__` without remembering to include `branch_scope_fk()`
  would silently lose the constraint. There is no compiler/mypy check that
  catches this omission — it can only be caught by inspecting the
  generated migration (as this phase's own review process did) or a test
  proving the constraint exists.
- Any future domain needing the equivalent guarantee for its own optional
  cross-references (the way `Member.user_id` does for `users`) should
  follow the same pattern: add `UNIQUE(tenant_id, id)` to the referenced
  table if it doesn't already have one, then declare a composite
  `ForeignKeyConstraint` rather than a plain one.
- Proven with live integration tests (`tests/integration/test_members.py`):
  a member in tenant A can reference a branch/user in tenant A; the same
  cross-tenant reference is rejected for both relationships; `NULL`
  `branch_id`/`user_id` bypasses the check entirely, as intended.

## Alternatives Considered

- **Trigger-enforced same-tenant check.** Rejected per the task's own
  guidance ("do not introduce triggers or speculative complexity without
  evaluating the simpler relational approach first") and the Rationale
  above — strictly more code, more failure surface, and no behavioural
  benefit over a composite FK for this case.
- **Application-layer-only enforcement** (service code checks
  `branch.tenant_id == member.tenant_id` before writing). Rejected: this is
  exactly the "must not be left solely to application code if the database
  can enforce it cleanly" case the task explicitly calls out — a single
  missed check anywhere (a bulk import path, a future admin tool, a bug)
  silently creates a cross-tenant leak with no database-level backstop.
- **Leaving `branch_id`/`user_id` as plain, unconstrained FKs**, deferring
  the integrity question further. Rejected: the task explicitly required
  addressing it now, and deferring a security boundary further after
  already having a concrete domain (`Member`) that needs it would only
  make the eventual fix more expensive (a live-data backfill/migration
  instead of a day-one constraint).
