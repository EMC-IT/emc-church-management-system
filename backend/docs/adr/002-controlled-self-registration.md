# ADR-002: Controlled, Tenant-Bound Self-Registration

**Status:** Accepted
**Resolves:** OQ-API-04
**Date:** 2026-09-03

## Context

`backend-implementation-plan.md` §10 left open whether `POST /auth/register`
is public self-registration, and if so, which tenant a self-registered user
lands in. This is a multi-tenancy and abuse-surface question, not just a
UX one: `backend/CLAUDE.md` §7 is explicit that tenant context must never be
derived from client-supplied input, and a naive `{ "church_id": "123", ... }`
registration payload would let any caller register into any church.

## Decision

Self-registration is **tenant-bound and controlled**, not global.

Tenant (and optionally branch) context is established server-side, from a
trusted registration context — a registration token, church-specific
registration link, branch-specific link, or invitation — never from a
client-supplied `church_id`/`branch_id` field.

```
Registration Token / Link
        │
        ▼
Server resolves Church (+ optional Branch)
        │
        ▼
Member/User created under that resolved tenant
        │
        ▼
Pending verification / approval
```

**Phase 2 scope:** implement controlled tenant-bound registration only
(token/link resolves tenant, then creates the account). Do **not** implement
unrestricted global self-registration where a caller supplies or chooses a
church at signup time.

**Extensible for later:** the token/link mechanism generalizes cleanly to
invitation-based registration, QR-code registration, branch-specific
registration, and event registration — none of those require a schema
change, only additional ways to mint a valid registration context.

If the current frontend registration flow assumes global self-registration
(pick-your-church-at-signup), that flow must be changed to token/link-based
registration as part of Phase 2 — this is a case where backend integration
legitimately requires a frontend change, per `backend/CLAUDE.md` §5.

## Rationale

- Prevents the single most direct tenant-isolation bypass: a client choosing
  its own tenant.
- Matches `backend/CLAUDE.md` §7: "Never trust a client-provided church_id
  for authorization... Derive tenant context from the authenticated
  user/session" — extended here to registration, where there is no session
  yet, so the trusted source is the registration token instead.
- Gives churches (the actual customers) control over who can register into
  their tenant, rather than exposing an open signup surface per church.

## Consequences

- A `registration_tokens` (or equivalent) table/mechanism is needed:
  token → church_id, optional branch_id, expiry, optional max-uses,
  optional invitee email binding.
- The onboarding flow (`app/(admin)/onboarding`) needs to be reconciled
  against this: is onboarding for the *first* super-admin of a brand-new
  tenant (which has no registration token yet, by definition), vs. ordinary
  member/staff registration (which does)? These are different flows and
  should not share one endpoint.
- Rate limiting and abuse protection (Phase E in the project roadmap) apply
  to whatever endpoint mints or resolves registration tokens/links, since
  it's the pre-auth surface most exposed to enumeration/abuse.

## Alternatives Considered

- **Unrestricted global registration with client-chosen church.** Rejected:
  direct tenant-isolation violation, matches none of the security posture
  already established for every other endpoint in the system.
- **No self-registration at all; all accounts staff-provisioned.** Rejected
  as the default — the frontend has member-facing registration/portal
  surfaces implying self-service signup is a real requirement — but staff-
  provisioned accounts remain a valid path alongside token-based
  registration, not a replacement for it.
