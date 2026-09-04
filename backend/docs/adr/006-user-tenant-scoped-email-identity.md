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
  `backend/CLAUDE.md` §19 warns against. Revisit only if a real requirement
  for unified cross-tenant login appears.

---

## Addendum (Phase 2B-6): OQ-AUTH-01 and OQ-AUTH-02 remain open

Phase 2B-6 was asked to choose one of three login tenant-resolution designs —
a tenant hint, a post-authentication church picker, or globally unique email —
using repository evidence rather than authentication convention. **None of the
three is supported by the repository as it stands.** This addendum records
what each would need, so the decision can be made in one step rather than
rediscovered.

The decision is a *product* decision, not an engineering one. It is recorded
here rather than resolved because inventing it would create exactly the
"implicit security assumption" the phase forbade.

### The security half is already closed

Nothing below is a live vulnerability. `authenticate()` refuses an address
held by more than one live tenant, fails closed, and discloses nothing:

| Property | Status |
| :-- | :-- |
| Never guesses a tenant | Enforced — two matches returns `None` |
| Never picks the first match, or by ordering, role or branch | Enforced; mutation-tested (pick-first is caught by four tests) |
| A correct password does not select a tenant | Tested |
| Ambiguity is indistinguishable from an unknown address | Tested |
| The response never names a church, or its id | Tested |

What is open is what a legitimate multi-church person should *experience*.
Today they experience a locked account.

### Why each option is blocked

**Option A — tenant hint (slug/subdomain on the login request).**
Blocked by **OQ-DB-02**, which is still open: `churches` has no slug,
`churchProfileSchema` has no slug field, the onboarding flow collects no slug,
and no subdomain contract exists anywhere. `loginSchema` and the documented
`POST /auth/login` request body are both `{email, password}`. Choosing this
means inventing a slug format, which Phase 2B-6 explicitly forbade, *and*
changing the frontend login contract.

**Option B — post-authentication church picker.**
Requires the product to state that one person belongs to several churches,
and a frontend contract for the selection step. Neither exists. This ADR's own
rationale offers only a hypothetical ("a person *could plausibly* need
independent accounts"), and its Consequences section defers cross-tenant
identity linking as "a distinct future feature". There is no picker UI, no
church-switcher anywhere in the app, and no `AuthResponse` variant that could
carry a list of choices. The login page is single-tenant branded.

**Option C — globally unique email.**
Directly contradicts the decision above, which was reasoned from the
multi-tenant model, from `citext` being provisioned for per-tenant
uniqueness, and from ADR-002. Nothing in the repository establishes that one
address identifies exactly one account platform-wide. It would also require a
migration and a cross-tenant deduplication of any live data.

### The unenforced constraint this leaves

Until OQ-AUTH-01 is answered, the platform carries a product invariant that
**no constraint enforces**: at most one live account per email address across
all churches. Create a second and login stops working for *both* — correctly,
fail-closed, and silently from the operator's point of view.

Whoever resolves OQ-AUTH-02 should decide whether provisioning and user
creation ought to *detect* this at write time. That was deliberately not
added here: refusing or warning is itself a policy, and picking one would
pre-empt the decision this addendum exists to leave open.

### Status

- **OQ-AUTH-01 — open.** Blocked on a product decision. Option A additionally
  blocked on OQ-DB-02.
- **OQ-AUTH-02 — open.** Depends on OQ-AUTH-01: prevention only makes sense
  once the intended multi-church login experience is known.
- **This ADR is unchanged.** `UNIQUE(tenant_id, email)` stands. Phase 2B-6
  made no schema change and created no migration.

---

## Addendum (Phase 2B-7): the sweep was repeated independently; OQ-AUTH-01 stands

Phase 2B-7 re-ran the search from scratch rather than trusting the Phase 2B-6
addendum above, on the principle that a prior report is not evidence. Every
term the phase named was searched across the whole repository — TypeScript,
TSX, Markdown and JSON, excluding `node_modules` and `.next`:

| Searched | Result |
| :-- | :-- |
| `churchCode`, `church_code`, `tenantCode`, `tenant_code` | **0 files** |
| `churchPicker`, `churchSwitcher`, `switchChurch`, `selectChurch` | **0 files** |
| `organizationSelector`, `tenantSelector`, `tenantHint`, `loginTenant` | **0 files** |
| `multiChurch` | **0 files** |
| `subdomain` | 3 files — all of them *this* backend's own planning documents |
| church `slug` | 6 files — 3 are this backend's documents; the other 3 are `formatSlug`, a breadcrumb helper turning a URL segment into a title |
| `registrationToken` / `registration_token` | only ADR-002, ADR-012 and the api map — i.e. only where *this backend* recorded that the mechanism is missing |
| `membership` | 71 files, every one of them a member's or group member's *status* (`membershipStatus: 'Active' \| 'Inactive' \| …`). None denotes a person belonging to two churches. |

Two further checks, neither of which had been made explicitly before:

- **`churchProfileSchema`** (`lib/validation/settings.ts`) carries name, motto,
  vision, mission, core values, history, founded, denomination, contact,
  address, socials and leadership — and **no** slug, code, subdomain or
  identifier of any kind.
- The settings route is `dashboard/settings/church-profile`, singular. There is
  no churches list, no switcher, and no surface anywhere that presents more
  than one church to a user.

### Conclusion

**OQ-AUTH-01 remains open**, for the reasons already recorded above, now
confirmed by direct search rather than inherited from a report. No tenant
selection mechanism was invented. This ADR is unchanged: `UNIQUE(tenant_id,
email)` stands, and no migration was created.

The fail-closed behaviour is preserved and was strengthened with the one
property §14 lists that a response body cannot demonstrate — see the Phase 2B-7
addendum to [ADR-012](./012-login-identity-and-credential-failure.md) on equal
work across failure paths.


## Addendum (2026-09-04, Phase 2B-10): The Sweep Re-Run Independently

Phase 2B-10 repeated the keyword sweep above from scratch rather than citing
it, and reached the same result: the only repository-wide hits for a tenant
identifier are an HSTS `includeSubDomains` header and this backend's own
planning documents. `UNIQUE(tenant_id, email)` and `UNIQUE(tenant_id,
username)` are unchanged, and a mutation replacing the former with a global
`UNIQUE(email)` is caught by the existing tests.

One finding is new and belongs here rather than in the sweep table: the
uniqueness model is not merely undecided at the *login* layer, it is
unrepresentable at the *schema* layer. `users.tenant_id` is `NOT NULL`, and no
table links two `users` rows as one person, so "the same person in two
churches" has no encoding today. Changing to global email identity would
therefore not be a constraint swap; it would need an identity model that does
not exist. See the Phase 2B-10 addendum to
[ADR-012](./012-login-identity-and-credential-failure.md).
