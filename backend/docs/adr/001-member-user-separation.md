# ADR-001: Member and User Are Separate Entities

**Status:** Accepted
**Resolves:** OQ-01
**Date:** 2026-09-03

## Context

`backend-implementation-plan.md` §10 left open whether `Member` and `User` are
the same principal or distinct entities linked by a foreign key. This decision
determines the identity schema that every downstream domain (Phase 4 onward)
FKs into, so it has to be settled before Phase 2.

Two real-world cases the schema must support:

- A person on the church roll with no portal account (e.g. a child, an elderly
  member who never logs in, someone entered via bulk import who hasn't
  activated an account yet).
- A system principal with no membership record (e.g. a super-admin operator,
  an external auditor, a future integration/service account).

Collapsing these into one table forces every non-member user to carry
membership fields it doesn't need, and forces every member without portal
access to carry authentication fields (password hash, sessions) it will never
use.

## Decision

`User` and `Member` are separate tables with an optional one-to-one
relationship:

```
members.user_id  →  users.id   (nullable)
```

- `User` is the authenticated system principal: credentials, sessions,
  role/permission assignments, tenant/branch scope for staff-side access.
- `Member` is the person in the church's membership domain: profile, family
  linkages, giving history, attendance, pastoral records.
- A `Member` may have zero or one linked `User`. A `User` may have zero or one
  linked `Member`.
- `member.user_id` is the FK direction (not `user.member_id`), so a member
  record can exist and later be linked to a user account without touching the
  user table.

```
User ──────── Member
 0..1           0..1
```

## Rationale

- Matches how the frontend already models these concerns separately
  (`AuthContext` / session vs. member profile/family/giving types).
- Avoids forcing authentication fields onto every membership record and vice
  versa.
- Supports the real lifecycle: a member is usually created first (roll entry,
  bulk import, visitor conversion), and a portal account is provisioned later,
  if at all.
- Keeps `Member` as the FK target for the finance/attendance/pastoral domains
  (Phase 4+), independent of whether that person ever gets portal access —
  matches `backend/CLAUDE.md` §7's tenant/branch scoping model, which is
  keyed off resource ownership, not login identity.

## Consequences

- Every service that resolves "who is this member's portal account" must
  handle the null case explicitly (e.g. inviting a member to create an
  account is a distinct operation from creating the member record).
- Authorization context (`SecurityContext` in `lib/authorization/scope.ts`)
  is derived from `User`, then optionally joined to `Member` when a request
  needs member-scoped data (e.g. member self-service portal, Phase 12).
- Staff-only `User`s (no `Member` link) are valid and must not break any
  query that joins through `Member` for audit/display purposes — those joins
  must be `LEFT JOIN`, not `INNER JOIN`.

## Alternatives Considered

- **Single `Member` table with nullable auth fields.** Rejected: conflates
  two lifecycles, complicates the schema for the common no-portal-account
  case, and makes it awkward to model non-member system users.
- **`User` owns `member_id` (reverse FK).** Rejected: would require a user
  row to exist before a member could be created, which inverts the actual
  onboarding flow (members are usually entered before any portal account
  exists).
