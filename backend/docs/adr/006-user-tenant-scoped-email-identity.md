# ADR-006: User Email/Username Uniqueness Is Tenant-Scoped

**Status:** Accepted
**Date:** 2026-09-03

## Context

`users.email` and `users.username` need a uniqueness scope: globally unique
across the whole platform (Option A), or unique per tenant (Option B,
`UNIQUE(tenant_id, email)`). This has to be decided before the first
migration creating `users`, since changing it later means deduplicating
live data across tenants.

The two churches in this system (e.g. two unrelated congregations both using
the platform) are separate customers, not divisions of one organization —
each is its own `Church`/tenant row (ADR-005). A person could plausibly need
independent accounts at two such unrelated tenants: an itinerant pastor, a
freelance bookkeeper who does the books for two different churches, a
denominational auditor, or simply someone changing churches whose old
account is retained for historical/audit purposes while a new one is created
elsewhere.

## Decision

**Option B: tenant-scoped uniqueness.** `UNIQUE(tenant_id, email)` and
`UNIQUE(tenant_id, username)`, not global uniqueness.

## Rationale

- **Already the documented direction, now confirmed rather than assumed.**
  `backend-database-plan.md`'s own `users` table description already
  specified `UNIQUE (tenant_id, lower(email))` — this ADR formalizes that
  as a decision with recorded reasoning rather than leaving it as an
  unconfirmed line in a discovery document.
- **The `citext` extension was provisioned in migration 0001 specifically
  for this.** Its docstring says: "case-insensitive text, for email and
  username uniqueness (users, members) without a functional index on
  `lower()`." That comment only makes sense if the uniqueness constraint is
  scoped in a way that needs comparing case-insensitively *within* a scope
  — consistent with a per-tenant unique index using the `citext` type
  directly, rather than a global index needing no additional scope column.
- **Consistent with ADR-002 (controlled, tenant-bound registration).**
  Registration already resolves tenant context *before* an account is
  created, from a token or link — there is no "global" registration surface
  where a bare email is checked against every tenant at once. A login flow
  built on the same premise (tenant context established first, e.g. via a
  church-specific URL or a chosen tenant) is naturally compatible with
  per-tenant identity; a flow requiring a single global email lookup across
  all tenants is not what ADR-002 already committed to.
- **Consistent with the planned JWT claims.** `backend-security-plan.md` §2
  lists `sub` (user_id) and `tid` (tenant_id) as separate, co-equal claims —
  a session is already modeled as belonging to one user *within* one tenant,
  not one global identity spanning tenants.
- **Matches the real-world requirement.** Two unrelated churches are
  unrelated customers of the platform; there is no reason one church's user
  directory should constrain who can register at a completely different
  church. Global uniqueness would force that same person to invent a second
  email address purely to satisfy the platform's data model — a workaround
  for a self-imposed constraint, not a real requirement anywhere in the
  documented contract.

## Consequences

- The same email can have independent `User` rows — independent
  credentials, independent status, independent password — at two different
  tenants. These are not linked in any way at this layer; if "one person,
  multiple church accounts" ever needs a unified login experience, that is
  a distinct future feature (e.g. an identity-linking table), not something
  this schema needs to anticipate now.
- A login flow (a later phase) must resolve *which tenant* a login attempt
  belongs to before or alongside checking credentials — email alone is not
  a unique lookup key platform-wide. This is already consistent with
  ADR-002's tenant-bound registration model, so it does not introduce a new
  requirement, only confirms one already implied.
- `email`/`username` use the `CITEXT` column type (not `VARCHAR` plus a
  `lower()` functional index), so case-insensitive comparison and the
  unique constraint both fall out of the column type itself, with no
  application-side normalization step required before every query or write.

## Alternatives Considered

- **Option A (global uniqueness).** Rejected: contradicts the multi-tenant
  model already established (unrelated churches as unrelated tenants),
  provides no benefit evidenced anywhere in the documented contract, and
  would force an artificial workaround for a person legitimately
  interacting with two unrelated tenants.
- **Global uniqueness with a platform-level "identity" table separate from
  per-tenant `User` rows** (i.e. a person has one global identity that maps
  to several tenant-scoped accounts). Rejected as premature: nothing in the
  current contract asks for cross-tenant identity linking, and building it
  now would be exactly the kind of speculative, unevidenced structure
  `backend/AGENTS.md` §19 warns against. Revisit only if a real requirement
  for unified cross-tenant login appears.
