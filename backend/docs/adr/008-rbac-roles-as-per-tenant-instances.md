# ADR-008: Roles Are Per-Tenant Instances, Not Global System Definitions

**Status:** Accepted
**Relates to:** ADR-003 (authoritative RBAC model), ADR-005 (Church is the
tenant root), ADR-007 (composite foreign keys for same-tenant integrity)
**Date:** 2026-09-03

## Context

Phase 2B-4A stores the canonical authorization model. ADR-003 already settled
*what* the taxonomy is (`lib/authorization/roles.ts` and
`permissions.ts` are authoritative). It did not settle *where a role row
lives*, and the planning documents answer that question two different ways:

- `backend-database-plan.md` §`roles`: `id`, **`tenant_id NULL` (NULL ⇒ system
  role)**, `name`, `description`, `is_system`. One global row per canonical
  role, shared by every church.
- `backend-domain-map.md` §5 lists `roles` among **tenant-wide reference
  data**, alongside `church_profile` and the category tables — i.e. owned by a
  church, readable across its branches.

Both cannot hold. The choice is not cosmetic, because it decides whether the
most dangerous edge in the whole schema can be enforced by the database.

## Decision

**`roles.tenant_id` is `NOT NULL`. Every church gets its own row for each of
the six canonical roles.** `is_system` marks those instances; `key` carries
the canonical identifier (`"SuperAdmin"`, `"Admin"`, …) verbatim from `ROLES`.

`permissions` and `permission_categories` remain **global**, exactly as the
database plan specifies. They are immutable canonical definitions that no
church creates or edits, so there is nothing tenant-specific to protect.

`role_permissions` carries **no `tenant_id`**: `role_id` already determines
the tenancy and permissions are global, so a column here would be a second
copy of a fact the foreign key already fixes — and a redundant tenant column
that can disagree with its parent is a hazard rather than a safeguard.

## Rationale

**A user holding another church's role is privilege escalation, and only a
`NOT NULL` tenant column can prevent it relationally.** `users.role_id` needs
the composite foreign key ADR-007 established:

```text
users.(tenant_id, role_id) -> roles(tenant_id, id)
```

With global roles (`tenant_id IS NULL`), that constraint is impossible.
Postgres composite foreign keys are MATCH SIMPLE, so a NULL on the *referenced*
side is not a wildcard — it simply means no matching row exists, and every
attempt to assign a system role would be rejected. The only remaining options
would be a plain `role_id -> roles.id` (which accepts a role from any church)
plus a trigger or a service-layer check. That is exactly the shape ADR-007
rejected for `members.branch_id`, and the security plan §4 rules out for a
boundary the database can enforce natively.

**Roles are already tenant-mutable, so they cannot be global anyway.** The
canonical permission set includes `settings.roles.create`, `.edit` and
`.delete`, and the live UI has `settings/roles/add` and
`settings/roles/[id]/edit` backed by `roleCreateSchema`. A church can create
its own roles and rename or re-scope the built-in ones. Storing tenant-created
roles in a table whose `tenant_id` is nullable would mean the same table holds
rows with two different ownership models and only one of them protected.

**The domain map already describes this shape.** Listing `roles` as tenant-wide
reference data is the per-tenant-instance model; the database plan's
`tenant_id NULL` line is the outlier, and it predates ADR-005 and ADR-007,
which together established `tenant_id` as a real, non-nullable, foreign-keyed
column and composite FKs as the way same-tenant integrity is proven.

## Consequences

- `backend-database-plan.md` §`roles` is superseded on this point. Its
  `UNIQUE(tenant_id, name)`, `is_system` and seed list all stand.
- The seed has two halves with different lifetimes:
  `sync_permission_registry()` writes the global catalogue once per deployment;
  `seed_tenant_roles(tenant_id)` runs whenever a church is provisioned. Both
  live in `app/domains/identity/rbac_seed.py`, not in a migration, because the
  per-tenant half must run for churches that do not exist at deploy time.
- `roles` carries `UNIQUE(tenant_id, id)` so it can be the target of `users`'
  composite foreign key — the same addition `branches` and `users` received in
  migration 0004.
- Deleting a role is blocked while any user holds it (`ON DELETE RESTRICT`),
  and takes its grants with it when it is deletable (`ON DELETE CASCADE` on
  `role_permissions.role_id`). **Preventing deletion of a *system* role is not
  expressible as a constraint and remains a service-layer obligation** for the
  authorization phase.
- `SuperAdmin` is now unambiguously a *tenant* role: it is a row belonging to
  one church. This supports the security plan's OQ-SEC-12 recommendation that
  the backend must not let any role bypass tenant scope. A future
  platform-operator principal that genuinely crosses tenants would be a
  separate concept, not a `roles` row.

## Role Identity: `key` vs `name`

`key` is the stable canonical identifier and `name` is the editable display
label. They are equal for freshly seeded roles, because the canonical source
provides only one string per role and uses it for both.

Two columns rather than one because the seed must be re-runnable. Matching on
the display name would mean that a church renaming `Admin` to
`Administrator` — a legitimate use of `settings.roles.edit` — causes the next
seed run to find no `Admin` and create a second role. Matching on `key` makes
the re-run a no-op.

`key` is nullable: tenant-created roles have no canonical identity, and
inventing a slug for them would be a naming scheme the canonical source does
not have. Postgres treats NULLs as distinct under a unique constraint, so many
unkeyed custom roles coexist under `UNIQUE(tenant_id, key)`. The CHECK
`NOT is_system OR key IS NOT NULL` keeps every *seeded* role keyed, which is
what the seed's idempotency depends on.

The seed never overwrites an existing role's name, description or permission
grants. Re-running it fills in roles a church is missing and leaves everything
else untouched, because narrowing or renaming a built-in role is a supported
action and a seed run must not silently undo it.

## Recording the Canonical Source's Gaps Without Inventing

> **Resolved since — [ADR-009](./009-permission-catalogue-completeness.md).**
> The `pastoral-care` inconsistency described below was closed in the canonical
> source before Phase 2B-4B; `UNCATEGORISED_PERMISSION_CODES` is now empty and
> SuperAdmin is a true superset of every role. The reasoning is kept because it
> is still why `permissions.name`/`.description`/`.category_id` are nullable.

Transcribing the taxonomy surfaced an inconsistency in the authoritative
files, left as-is and recorded rather than fixed at the time:

`pastoral-care.view` and `pastoral-care.manage` are defined in the flat
`PERMISSIONS` const and granted to `Admin` and `Pastor` by `ROLE_PERMISSIONS`,
but they appear in **no** `PERMISSION_CATEGORIES` entry. Because
`ROLE_PERMISSIONS[SuperAdmin]` is computed by flattening the categories,
**SuperAdmin does not receive two permissions that Admin and Pastor hold** —
which contradicts `policies.ts`, where SuperAdmin short-circuits to universal
access.

The `permissions` table is therefore seeded from the **union** of the flat
const and the categories, so no granted code is unresolvable. Those two rows
get `name`, `description` and `category_id` NULL, because the canonical source
supplies none of the three and this phase does not invent permission metadata.
`tests/unit/test_rbac_registry.py` pins the discrepancy so that fixing it
upstream fails loudly and forces a coordinated change rather than silently
altering what is seeded.

The gaps ADR-003 already flagged — `finance.expenses.approve`, a `files.*`
family, `pastoral-care.view-confidential` — remain open and are likewise
pinned by test. They block the authorization phase, not this one: closing them
adds seed rows, not schema.

## Alternatives Considered

- **Global roles with a plain `role_id -> roles.id` FK plus a service-layer
  same-tenant check.** Rejected: it puts a privilege-escalation boundary
  entirely in application code, which `backend/CLAUDE.md` §7 and the security
  plan §4 both forbid where the database can enforce it. One missed check in
  any future admin tool or bulk import creates a silent cross-tenant
  escalation with no backstop.
- **Global roles plus a trigger enforcing the same-tenant rule.** Rejected for
  the reasons ADR-007 already gave: a trigger re-implements by hand the join
  Postgres does natively for FK checking, must be re-verified on every schema
  change, and is invisible to `\d roles`.
- **Two tables — global `system_roles` and tenant-scoped `custom_roles`.**
  Rejected: `users.role_id` would then need to reference one of two tables,
  which is not expressible as a foreign key at all, and every permission
  resolution would become a union query. It also makes "customise the built-in
  Admin role" — an action the UI already offers — a migration between tables.
- **A `tenant_roles` join between global role definitions and churches.**
  Rejected: it is the per-tenant-instance model with an extra indirection, and
  a church editing its `Admin` permissions would still need somewhere
  tenant-owned to store the result.

## Addendum (2026-09-03, pre-2B-4B): Role Name Uniqueness Is a Product Invariant

`UNIQUE(tenant_id, name)` was carried over from `backend-database-plan.md`
without a stated justification, and Phase 2B-4A's report flagged it as needing
confirmation. It is **confirmed and retained**, and it is a product invariant,
not an incidental constraint:

> **A church cannot have two roles with the same display name.**

Two roles both shown as "Admin" in the roles list, the user-creation role
picker and the permissions editor would be indistinguishable to the person
choosing between them — and choosing wrong grants the wrong authority. Every
place a role is selected in the UI displays `name`, not `key` or `id`, so
ambiguity there is an authorization-relevant defect rather than a cosmetic one.

Consequences worth stating plainly, because they constrain the role CRUD that
a later phase will build:

- The constraint applies to **renames** exactly as it does to creation. Editing
  a custom role to a name another role already holds must be rejected, and the
  database rejects it whether or not the service remembers to check.
- It is scoped per tenant, so "Admin" existing in every church is unaffected —
  that is the per-tenant-instance model this ADR establishes.
- `key` and `name` are independently unique. A church may rename its canonical
  `Admin` role to "Administrator", which frees the *name* "Admin" for a custom
  role while `key = "Admin"` stays with the original. That is intentional: the
  seed follows `key`, so the renamed role is still recognised as the canonical
  one and is not duplicated on a re-run.
- Nothing here constrains `description`, which may legitimately repeat.
