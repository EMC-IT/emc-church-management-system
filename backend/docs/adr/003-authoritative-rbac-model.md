# ADR-003: `lib/authorization/roles.ts` Is the Authoritative RBAC Model

**Status:** Accepted
**Resolves:** OQ-SEC-06
**Date:** 2026-09-03

## Context

Three conflicting role definitions exist in the codebase
(`backend-implementation-plan.md` §11, conflict #7):

1. `lib/authorization/roles.ts` — 6 roles: `SuperAdmin`, `Admin`, `Pastor`,
   `Accountant`, `Secretary`, `Teacher`, each mapped to an explicit
   dot-notation permission array in `ROLE_PERMISSIONS`.
2. `docs/architecture/architecture-baseline.md` §86 — a 5-role list:
   `SuperAdmin`, `Admin`, `Pastor`, `FinanceOfficer`, `DepartmentLeader`.
3. A third admin colon-notation scheme (`giving:read`, `income:write`)
   referenced in the finance API docs.

Only one of these can be the schema the backend implements.

## Decision

**`lib/authorization/roles.ts` is authoritative**, specifically:

- The 6-role list: `SUPER_ADMIN` ('SuperAdmin'), `ADMIN` ('Admin'),
  `PASTOR` ('Pastor'), `ACCOUNTANT` ('Accountant'), `SECRETARY`
  ('Secretary'), `TEACHER` ('Teacher').
- Its `ROLE_PERMISSIONS` map as the source for which permissions each role
  gets by default.
- Dot-notation permission strings (`members.view`, `finance.expenses.create`,
  ...) from `lib/authorization/permissions.ts` as the canonical admin-side
  permission format.
- Colon-notation member-scoped permissions (`giving:read:self`,
  `profile:update:self`, ...) from `lib/authorization/member-permissions.ts`
  as the canonical format for member self-service (Phase 12), which is a
  deliberately distinct namespace from admin permissions, not a competing
  scheme for the same thing.
- The third scheme (`giving:read`, `income:write` from the finance API docs)
  is **discarded**.
- `docs/architecture/architecture-baseline.md`'s 5-role list is **discarded**
  and should be corrected to match this ADR (tracked as a follow-up doc fix,
  not a blocker for Phase 2).

This choice is not arbitrary preference: `tests/unit/authorization.test.ts`
already asserts behavior against the 6-role list and `ROLE_PERMISSIONS`
(SuperAdmin universal access, Admin excluded from `members.delete`,
Accountant granted `finance.expenses.create`, etc.), and
`tests/unit/authorization.test.ts` also asserts the tenant/branch isolation
engine (`validateTenantScope`, `validateBranchScope`, `applyScopeFilters`)
against `SecurityContext`. Adopting anything else means the passing frontend
test suite no longer describes the real system.

## Rationale

- It's the only one of the three with executable tests behind it.
- It's already wired into the frontend's live authorization guards, so
  adopting it costs zero frontend rework; adopting either alternative would
  require rewriting frontend authorization code that already works.
- Its permission taxonomy (dot-notation, hierarchical by domain:
  `finance.expenses.approve`, `sunday-school.classes.manage`, etc.) matches
  the domain-driven module boundaries the backend is already organized
  around (`backend/CLAUDE.md` §3, §8).

## Architecture Implications

```
Role
 ├── ROLE_PERMISSIONS[role] → Permission[]   (dot-notation, admin side)
 └── scope: church_id, branch_id[] (per user_role assignment)

Permission
 └── PERMISSIONS.* constants, grouped into PERMISSION_CATEGORIES

user_roles (join table)
 ├── user_id
 ├── role_id
 ├── church_id
 └── branch_id  NULL = church-wide, not branch-restricted
```

- Roles must map to granular permissions server-side via a seeded
  `permission_registry`, mirroring `PERMISSION_CATEGORIES` — not
  hardcoded `if user.role == "admin"` checks, per `backend/CLAUDE.md` §8.
- Role assignment is scoped by church and optionally branch, matching
  `SecurityContext.assignedBranchIds` in `lib/authorization/scope.ts` — a
  user with no assigned branches is church-wide; one with assigned branches
  is restricted to them.
- Two known gaps in the current permission set must be closed during Phase 2
  build-out, not deferred: `finance.expenses.approve` is required by
  `security-boundary-map.md` but absent from `permissions.ts`, and File
  Vault has no permissions defined at all (conflict #15 in the
  implementation plan). These are additions to the existing model, not
  changes to this decision.
- Two fail-open patterns identified in the frontend (`validateBranchScope`
  treating an empty branch assignment as unrestricted, and
  `hasMemberPermission` defaulting to the full member permission set) must
  be implemented fail-closed server-side (conflict #16) — the frontend
  behavior is UX-only per `backend/CLAUDE.md` §6, and must not be mirrored
  server-side.

## Consequences

- `docs/architecture/architecture-baseline.md` needs a correction pass to
  remove the conflicting 5-role list (tracked as follow-up documentation
  work).
- The finance API docs' colon-notation admin permissions
  (`giving:read`, `income:write`) should be flagged as superseded wherever
  they appear in `api-documentations/`.
- Phase 2's permission-registry seed data is now unambiguous: seed exactly
  the roles and permissions in `roles.ts` / `permissions.ts`, plus the two
  closed gaps above.

## Alternatives Considered

- **`architecture-baseline.md`'s 5-role list.** Rejected: no test coverage,
  not wired into any live frontend guard, and `FinanceOfficer`/
  `DepartmentLeader` don't map cleanly onto the existing
  `Accountant`/`Secretary` permission sets without rework.
- **The colon-notation admin scheme from the finance docs.** Rejected: used
  nowhere in actual frontend code, and having two notations for admin
  permissions (dot and colon) would be pure ambiguity with no benefit.
