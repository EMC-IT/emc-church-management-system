# ADR-005: `tenant_id` Is the Canonical Column Name; Church Is the Tenant Root

**Status:** Accepted
**Resolves:** OQ-DB-01
**Date:** 2026-09-03

## Context

`backend-database-plan.md` §1 and its open-questions table (OQ-DB-01) left
open which column name carries the tenant key: `tenant_id` (the frontend's
`SecurityContext` vocabulary, and what `TenantScopedMixin` already ships) or
`church_id` (`backend architecture.md` §9's vocabulary). Changing this later
is a full-schema migration touching every tenant-owned table, so it has to be
settled before the first tenant-owned table (`branches`) is built.

Separately, `backend-domain-map.md` §4 already states, without qualification,
that "churches rows are the tenant roots themselves" — i.e. there is no
separate `Tenant` entity; the `Church` row's own `id` *is* the tenant id
everywhere else in the schema.

## Decision

- **`tenant_id`** is the canonical column name on every tenant-owned table.
  `church_id` is discarded as a competing convention.
- **`Church` is the tenant root.** There is no separate `Tenant` table.
  `churches.id` is used directly as the value stored in every other table's
  `tenant_id` column. `churches` itself carries no `tenant_id` column, since
  a church cannot be scoped to itself.
- "Church" remains the *entity* name (what the row represents — a
  congregation's profile); "tenant" remains the *architectural role* that
  entity plays (the isolation boundary every other table is scoped to). The
  two words describe the same table from two angles, not two tables.

This was already the de facto implementation before this ADR: `TenantScopedMixin`
(`app/core/database/base.py`) has shipped `tenant_id` since Phase 1, and
`Branch.tenant_id` (Phase 2B-1, `app/domains/churches/models.py`) is declared
as a real foreign key to `churches.id`. This ADR makes that implementation
choice the recorded decision rather than leaving it as an unconfirmed
recommendation.

## Rationale

- `tenant_id` is what's actually built and tested: `TenantScopedMixin`,
  `lib/authorization/scope.ts`'s `SecurityContext.tenantId`, and every
  authorization test in `tests/unit/authorization.test.ts` already use this
  vocabulary. Adopting `church_id` instead would mean renaming a shipped,
  tested column and every future domain's tenant-scoping code for a purely
  cosmetic reason.
- A separate `Tenant` table would be a duplicate tenant concept with no
  behavior of its own — every field a `Tenant` row could hold (name, contact
  info, branding, settings) already belongs to `Church`. `backend-domain-map.md`
  §4 already treats them as one entity; introducing a second table would
  contradict a decision already made elsewhere in the documented architecture,
  not resolve an open one.
- Keeping "church" as the entity name and "tenant" as the architectural role
  (rather than renaming the table to `tenants`) matches how the rest of the
  system already talks about it — `churchProfileSchema`, `/settings/church-profile`,
  `onboarding` — without forcing a vocabulary change onto the frontend
  contract for no functional gain.

## Consequences

- Every future domain-owning table (members, giving, events, ...) declares
  `tenant_id` as a foreign key to `churches.id`, following the pattern
  established by `Branch.tenant_id` in Phase 2B-1 — not a bare indexed
  column with no referential integrity, and not `church_id`.
- `TenantScopedMixin` itself is unchanged by this ADR: its `tenant_id`
  column has no foreign key today, because Phase 1 had no `churches` table
  for it to reference. Whether to add one now that `churches` exists is
  resolved below, in the addendum.
- `backend-database-plan.md`'s OQ-DB-01 entry (§1 and its open-questions
  table) is marked resolved, pointing here.

## Alternatives Considered

- **`church_id`.** Rejected: would require renaming a column that is
  already shipped, tested, and referenced throughout the frontend's
  authorization vocabulary, for a change that is naming-only.
- **A separate `Tenant` table, with `Church` referencing it.** Rejected: no
  field or behavior has been identified anywhere in the documented contract
  that would belong to `Tenant` but not `Church`; `backend-domain-map.md`
  already describes churches as the tenant roots. Adding one now would be
  exactly the kind of duplicate/invented model `backend/CLAUDE.md` §19
  warns against.

## Addendum (2026-09-03, Phase 2B-1.5): `TenantScopedMixin.tenant_id` Foreign Key

### Context

The Consequences section above deferred one question: now that `churches`
exists, should `TenantScopedMixin.tenant_id` itself carry
`ForeignKey("churches.id")`, or should every tenant-scoped domain redeclare
its own FK the way `Branch.tenant_id` does? No real domain composes
`TenantScopedMixin` yet — Phase 2B-2 (Users, Members) is the first — so this
is the last point at which the answer costs nothing to apply retroactively.

### Options Considered

**Option A — the mixin owns the FK.** `TenantScopedMixin.tenant_id` becomes
`mapped_column(UUID(as_uuid=True), ForeignKey("churches.id", ondelete="RESTRICT"), nullable=False, index=True)`.
Every table composing the mixin gets the constraint automatically.

**Option B — every domain declares its own FK.** `TenantScopedMixin.tenant_id`
stays a bare indexed column (today's shape); each domain repeats what
`Branch.tenant_id` already does by hand.

### Decision

**Option A.** `TenantScopedMixin.tenant_id` now carries
`ForeignKey("churches.id", ondelete="RESTRICT")` directly.

### Rationale

- **Directly satisfies the stated goal** — "future tenant-scoped models
  cannot accidentally have an unconstrained `tenant_id`" — in a way Option B
  structurally cannot: Option B's guarantee depends on every future domain,
  including ones built by a different engineer or a different AI agent
  session with no memory of this decision, remembering to redeclare the FK
  correctly every single time. Option A makes the unconstrained state
  impossible to reach by composing the mixin at all.
- **No import cycle.** `ForeignKey("churches.id")` is a string target,
  resolved lazily by SQLAlchemy against the shared declarative registry at
  mapper-configuration time. `app/core/database/base.py` (core) never
  imports `app.domains.churches.models` (a domain package) — the dependency
  direction the project's layering requires (`backend-implementation-plan.md`
  §2: "Layering: Router → Application Service → Domain → Repository →
  Infrastructure. Dependencies flow inward.") is preserved. This was
  confirmed empirically, not just argued: `alembic revision --autogenerate`
  after the change reports zero schema drift on the two already-migrated
  tables, and the full test suite (227 tests) passes unchanged.
- **`churches` is not an arbitrary domain the core layer would be reaching
  into.** It is *the* tenant root for the entire system
  (`backend-domain-map.md` §4). A shared tenancy mixin referencing the one
  canonical tenant-root table is the tenancy primitive doing its job, not a
  layering violation — core infrastructure (`TenantScopedMixin`) referencing
  the one table that defines what "tenant" means is a narrower, more
  defensible coupling than, say, core code importing a domain's business
  logic or service layer.
- **No migration cost to defer further.** Making this change now, before any
  real domain uses the mixin, costs one line and zero migrations. Deferring
  it until after Members, Giving, and other domains exist would mean N
  retrofitted migrations instead of zero.

### Consequences

- Every future tenant-scoped domain (Members, Giving, Events, ...) that
  composes `TenantScopedMixin` gets a real `tenant_id → churches.id` foreign
  key automatically, with `ON DELETE RESTRICT` — consistent with
  `Branch.tenant_id`'s manually-declared FK.
- `Branch` continues to declare `tenant_id` by hand rather than composing
  `TenantScopedMixin`, and this remains correct: the mixin also carries a
  nullable `branch_id`, which would be a branch self-reference. `Branch` is
  the genuine exception (branches are what `branch_id` points *at*), not a
  gap in the mixin's coverage.
- `TenantScopedMixin.branch_id` still has **no** foreign key. Constraining it
  correctly is harder than `tenant_id`'s case: a row's `branch_id` must
  belong to the *same* tenant as its own `tenant_id`, which a plain
  `ForeignKey("branches.id")` cannot express — it would only prove the
  branch exists somewhere, not that it belongs to the right church. That
  needs either a composite foreign key against a `UNIQUE(tenant_id, id)` on
  `branches`, or a trigger/check, and is a large enough design question to
  deserve its own decision when the first branch-scoped domain (e.g.
  attendance) is built, not folded into this addendum.
- Proven with live integration tests against a throwaway probe model
  (`tests/integration/test_tenant_scoped_mixin.py`): a tenant-scoped row can
  reference an existing church, cannot reference a nonexistent one, a church
  with dependents cannot be deleted, and rows do not leak across tenants in a
  scoped query.

### Alternatives Considered

- **Option B (explicit per-domain FK).** Rejected for the reasons above:
  weaker guarantee, and the task that motivated this addendum explicitly
  named "future AI agents cannot accidentally create an unconstrained
  `tenant_id`" as the success criterion Option B cannot structurally meet.
