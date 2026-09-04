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

`TenantScopedMixin.branch_id`'s composite FK is defined once, in
`app/core/database/base.py`, by the `branch_scope_fk()` function. Every
tenant-scoped model attaches it through `tenant_scoped_table_args()`,
passing any constraints of its own to that call — as `Member` does, for its
unique email/phone constraints and status CHECK. The mixin does not attach
it implicitly; see the Phase 2B-3.5 addendum for why that was removed.
`Member.user_id`'s composite FK is declared directly in `Member`, since that
relationship is specific to this domain, not part of the shared
tenant/branch mixin.

## ON DELETE Behaviour

| Relationship | `ON DELETE` | Reasoning |
| :-- | :-- | :-- |
| `(tenant_id, branch_id) -> branches` | `RESTRICT` | Matches every other ownership relationship in this schema (`branches.tenant_id -> churches`, `users.tenant_id -> churches`) — an entity with active dependents cannot be deleted out from under them. A branch with members assigned should not be silently deletable. |
| `(tenant_id, user_id) -> users` | `RESTRICT` | `SET NULL` was the first choice, and is wrong for a composite key: Postgres's `ON DELETE SET NULL` nulls *every* column in the FK, which would null `members.tenant_id` too — a `NOT NULL` column. This was caught empirically, not by inspection: an integration test deleting a linked `User` failed with `NotNullViolationError` on `tenant_id` before this ADR settled on `RESTRICT`. Postgres 15+ supports column-scoped `SET NULL (user_id)`, but the project's minimum supported version is 14 (`tests/integration/test_database.py`), so that syntax isn't portable here. `RESTRICT` still satisfies "do not automatically delete a Member when its User is deleted" — nothing happens to the Member either way, since the User hard-delete itself is blocked while a Member links to it. It also matches every other FK already in this schema (`branches.tenant_id`, `users.tenant_id`, `members.tenant_id`, and `members`' own `branch_id` FK above), and a `User` is normally deactivated via `SoftDeleteMixin` in any case, which is a plain `UPDATE` and never triggers this FK at all. |

## Rationale

- **This is a security boundary, not a convenience.** `backend/CLAUDE.md`
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

- Every future domain that composes `TenantScopedMixin` must declare
  `__table_args__ = tenant_scoped_table_args(...)` to get the same-tenant
  guarantee, exactly as `Member` does. Omitting it is not a type error and
  raises nothing at runtime, so it is caught by
  `tests/unit/test_tenant_scope_guard.py`; see the Phase 2B-3.5 addendum
  below.
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

## Addendum (2026-09-03, Phase 2B-3.5): Guarding the `__table_args__` Shadowing

A focused review of the above sharp edge confirmed it empirically. A model
composing `TenantScopedMixin` while declaring its own `__table_args__`
produces a table with a `branch_id` column and **no** composite foreign key —
no exception, no warning, no mypy error. Because almost every real domain
eventually needs an index or a unique constraint of its own, the shadowing
path is the *common* path, not an exotic one. The failure is silent and lands
on a security boundary, so it was judged materially dangerous and worth
mitigating rather than merely documenting.

### Rejected: appending the constraint automatically

The obvious "fix" is to have the mixin re-attach the constraint after the
subclass's `__table_args__` has been applied, via `__declare_last__` (or an
equivalent mapper event) calling `table.append_constraint()`. This was
prototyped and **rejected on evidence**: those hooks run at mapper
configuration time, whereas `migrations/env.py` reads `Base.metadata`
directly and never calls `configure_mappers()`. Measured on a probe model,
the constraint was absent from the metadata as Alembic sees it and present
only after `configure_mappers()` ran.

That combination is strictly worse than the footgun it removes: the test
suite (which configures mappers by using the ORM) would see the constraint
and pass, while the generated migration would omit it and the deployed
database would have no such foreign key. A silent divergence between what
the tests prove and what production enforces is a worse outcome than a
missing constraint that is at least missing everywhere.

Auto-appending would also make a table's constraints non-local — reading the
model would no longer show what the table enforces — which works against the
migration-review discipline this project treats as the final integrity layer.

### Accepted: one explicit spelling plus a mechanical guard

1. **`tenant_scoped_table_args(*extra)`** in `app/core/database/base.py` is
   now the *only* way to build `__table_args__` on a tenant-scoped model. It
   prepends `branch_scope_fk()` to whatever the domain adds.

   The mixin's own `declared_attr __table_args__` was **removed** rather than
   kept as a fallback. Keeping it would have left two paths with different
   failure modes — composing the mixin alone worked, adding `__table_args__`
   silently broke — whereas one spelling that always applies has nothing to
   shadow. It also keeps a table's constraints readable in the model itself,
   which the migration-review discipline depends on. `Member` and both test
   probes now declare it explicitly.

   Removing it additionally cleared a real type error: `declared_attr.directive`
   types the attribute as `_declared_directive[tuple[SchemaItem, ...]]`, so
   `Member`'s plain-tuple override was a `reportAssignmentType` error under
   Pyright/Pylance (`typeCheckingMode = "standard"`, configured in
   `pyproject.toml`) from the moment the directive was introduced in Phase
   2B-3. MyPy accepted it, so CI never flagged it; it surfaced in the editor.
   There is now no `declared_attr` anywhere in the codebase, and Pyright
   reports zero errors project-wide.
2. **`tests/unit/test_tenant_scope_guard.py`** sweeps every table in
   `Base.metadata` and fails when a table's columns promise tenant scoping
   that its constraints do not deliver:
   - a `tenant_id` column without a foreign key to `churches.id`;
   - a `branch_id` column without the `(tenant_id, branch_id) -> branches(tenant_id, id)`
     composite foreign key;
   - a composite `(tenant_id, X) -> T(tenant_id, id)` reference where `T`
     lacks the `UNIQUE(tenant_id, id)` that Postgres requires as its target.

The helper is the convention; the guard is the guarantee. Neither changes any
existing schema behaviour — the constraints emitted are byte-identical, as
confirmed by Alembic autogenerate producing an empty migration both before and
after the mixin's `declared_attr` was removed.

The guard is deliberately column-driven rather than mixin-driven: it flags any
table that *looks* tenant-scoped, so a future model that declares `tenant_id`
by hand (as `Branch` and `User` legitimately do) is checked on the same terms
as one composing the mixin. `churches` carries no `tenant_id` and is skipped
by that same rule rather than by an allowlist, so the tenant root needs no
special-casing. Underscore-prefixed probe tables, which no migration creates,
are excluded; one of them is deliberately broken to prove the guard fails when
it should, and the guard was additionally mutation-tested against each of the
three rules by regressing `Member` and `User` in turn.

---

## Addendum (Phase 2B-7): the guard now covers every cross-tenant reference

The guard written with this ADR checked two things: that a tenant-scoped table
has `tenant_id -> churches.id`, and that a table with a `branch_id` carries the
composite `(tenant_id, branch_id) -> branches(tenant_id, id)`.

A Phase 2B-7 mutation sweep found it did **not** cover the more general form of
the same mistake. Replacing

```python
ForeignKeyConstraint(["tenant_id", "user_id"], ["users.tenant_id", "users.id"])
```

with a plain

```python
ForeignKeyConstraint(["user_id"], ["users.id"])
```

on `user_branch_assignments` passed **305 tests**, the architectural guard
included. The same was true of `users.(tenant_id, role_id) -> roles`, which
ADR-008 identifies as the single most dangerous edge in the RBAC model: a plain
`role_id -> roles.id` lets a user in church A hold a role belonging to church B.

### Scope of the finding

This was a gap in the *guard*, not in the schema. Every migrated table already
carries the correct composite constraints, and `alembic check` reports no drift.
Nor was it exploitable at runtime: `_load_branch_assignments` filters on both
`user_id` and the authenticated user's stored `tenant_id`, so a mis-scoped row
would not have been returned anyway.

What was lost was the layer this ADR exists to insist on. Its own rationale is
that composite integrity must be enforced by the database rather than by
service code, and `backend/CLAUDE.md` §17 says not to rely exclusively on
service-layer validation. A guard that cannot see the constraint disappearing
leaves exactly that reliance in place, silently.

### Rule added

For any table carrying `tenant_id`: a foreign key into another **tenant-scoped**
table (one that itself has a `tenant_id`) must include `tenant_id` in the
constraint. References to the tenant root (`churches`) and to global catalogue
tables (`permissions`, `permission_categories`, which have no `tenant_id`) are
correctly single-column and are not flagged.

`_PlainCrossTableProbe` demonstrates the footgun in the metadata, so the rule is
proven to fire rather than merely asserted to exist. Both mutations above now
fail the build with a message naming the table, the columns and the fix.

No schema change, no migration.
