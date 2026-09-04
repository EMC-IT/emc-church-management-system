# ADR-010: `SuperAdmin` Is a Tenant Role. No Role Bypasses Tenant Isolation.

**Status:** Accepted
**Resolves:** OQ-SEC-12, domain OQ-17
**Relates to:** ADR-005 (Church is the tenant root), ADR-008 (roles are
per-tenant instances), ADR-011 (authorization architecture)
**Date:** 2026-09-03

## Context

`lib/authorization/scope.ts` returns early for `isSuperAdmin` in **both**
scope checks:

```ts
export function validateTenantScope(context, targetTenantId) {
  if (context.isSuperAdmin) return;      // <-- crosses churches
  ...
}
export function validateBranchScope(context, targetBranchId) {
  if (context.isSuperAdmin || !targetBranchId) return;
  ...
}
```

The tenant one is the problem. `ROLE_PERMISSIONS[SuperAdmin]` is a *church*
permission set — it grants `settings.church-profile`, `settings.branches.*`,
`members.delete` and so on, all of which are operations within one church. Yet
the guard treats the same role as licence to read any church's data. The
security plan flagged this as OQ-SEC-12 and the domain map as OQ-17; neither
was resolved.

Phase 2B-4B is where this stops being a documentation question. The moment an
authorization dependency is written, it either bypasses tenant scope for this
role or it does not, and that choice is very hard to reverse once endpoints
depend on it.

## Decision

**`SuperAdmin` is a tenant-scoped role with no cross-tenant capability
whatsoever. No role, permission, or flag in this system bypasses tenant
isolation.**

Specifically:

1. A `SuperAdmin` row belongs to exactly one church (`roles.tenant_id NOT NULL`,
   ADR-008). It means "holds every permission **within this church**."
2. The backend must never implement a tenant-scope bypass. Concretely,
   this pattern is forbidden anywhere in the codebase:

   ```python
   if principal.role_key == "SuperAdmin":
       return  # skip tenant scoping
   ```

3. `tenant_id` is derived from the authenticated principal on every request and
   is applied to every tenant-scoped query unconditionally. There is no code
   path in which a role changes whether that filter is applied.
4. **Branch scope is a separate axis and `SuperAdmin` *does* span every branch
   of its own church.** That is not a bypass of anything: the role's permission
   set is church-wide by construction, and branch access is bounded by the
   tenant boundary either way. This mirrors the frontend's
   `validateBranchScope` behaviour and breaks nothing.
5. `SecurityContext` carries no `is_super_admin` field. A boolean whose only
   purpose is to skip checks is an invitation to skip them; authorization asks
   `has_permission(context, code)` and the answer for a SuperAdmin is "yes"
   because the role genuinely grants every code, not because a branch was
   taken (ADR-011).

**A genuine platform operator is a separate concept and is out of scope.** If
Anthropic-style cross-tenant support access is ever required — an operator
inspecting a customer church for a support ticket — it will be a distinct
principal type with its own authentication path, its own explicit audit trail,
and its own ADR. It will not be a `roles` row, and it will not be reached by
adding a flag to this one.

```text
Platform Operator                Church SuperAdmin
      |                                 |
   separate principal type          a roles row
   own auth path                    tenant_id NOT NULL
   heavily audited                  every permission, one church
   NOT YET DESIGNED                 crosses branches, never churches
```

## Rationale

- **The frontend behaviour is not evidence of intent; it is UX.**
  `backend/CLAUDE.md` §6 and the security plan §1 both state that frontend
  permission checks are affordances and the server re-checks everything.
  `scope.ts` runs in the browser against data the server already scoped, so its
  `isSuperAdmin` early return never actually crossed a tenant boundary in
  practice — it was a no-op that would become a real vulnerability the moment
  it was mirrored server-side. Copying it would be inferring security
  behaviour from a UX helper.
- **The role's own permission list says it is a tenant role.** Nothing in
  `ROLE_PERMISSIONS[SuperAdmin]` is a platform operation. There is no
  "list all churches", no "impersonate tenant", no cross-tenant reporting
  permission. Reading a church-scoped permission set as platform authority is
  not supported by the canonical source.
- **A bypass is unbounded and untestable.** Every cross-tenant test written in
  Phase 2B-4A — `test_a_role_from_another_church_is_rejected`,
  `test_a_user_cannot_reach_another_churchs_permissions_through_a_role`,
  and the rest — asserts that the *database* refuses. A service-layer bypass
  sits above those constraints and cannot be expressed as one, so it would be
  the single unverifiable path through an otherwise relationally-enforced
  boundary.
- **The database already refuses to model it.** ADR-008 made `roles.tenant_id`
  non-nullable precisely so `users.(tenant_id, role_id) → roles(tenant_id, id)`
  could exist. There is no way to represent a cross-tenant role in this schema
  without dismantling that constraint. The schema and this decision are
  mutually reinforcing.
- **It is the reversible direction.** Starting tenant-scoped and later adding a
  deliberately-designed platform principal is additive. Starting with a bypass
  and later removing it means auditing every endpoint that came to rely on it.

## Consequences

- The frontend's `validateTenantScope` early return is **not** mirrored
  server-side. This is a deliberate, documented divergence, in the same class
  as the two fail-open patterns ADR-003 already requires be implemented
  fail-closed server-side (`validateBranchScope`'s empty-list case, and
  `hasMemberPermission`'s default-allow).
- OQ-SEC-12 and domain OQ-17 are resolved.
- Support and operations have **no** cross-tenant read path until a platform
  operator is designed. That is the intended posture: no such path exists
  today, so nothing regresses, and the absence is now a recorded decision
  rather than an oversight.
- Any future work that needs cross-tenant access must write its own ADR and
  must not reach for this role.

## Alternatives Considered

- **Mirror `scope.ts` exactly and let `SuperAdmin` cross tenants.** Rejected:
  it makes one role a global reader of every church's giving records,
  counselling notes and member data in a multi-tenant SaaS, on the strength of
  a browser-side helper. This is the outcome the security plan explicitly
  warned about ("If `SuperAdmin` is a *tenant* role … then bypassing **tenant**
  scope is a cross-church data leak").
- **Keep an `is_super_admin` flag on `SecurityContext` but never act on it.**
  Rejected: an unused bypass flag is a trap. The next person to add an
  authorization branch will find it and use it, and it reads as sanctioned.
- **Add a `PlatformOperator` role now**, as the security plan's OQ-SEC-12
  recommendation sketches. Rejected as premature: no requirement, screen, or
  contract in this repository describes cross-tenant support access, so its
  authentication path, audit requirements and scope would all be invented.
  Deferred as a named future concept instead.
