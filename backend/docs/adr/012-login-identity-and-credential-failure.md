# ADR-012: Login Identifies a User by Email Alone, and Every Failure Looks the Same

**Status:** Accepted
**Relates to:** ADR-006 (tenant-scoped email identity), ADR-010, ADR-011
**Date:** 2026-09-03

## Context

`POST /auth/login` takes `{email, password}` — that is the whole of
`loginSchema` in `lib/validation/auth.ts`, and the whole of the request body in
`API_DOCUMENTATION.md`. Nothing in it names a church.

But ADR-006 made email identity **tenant-scoped**: `users` carries
`UNIQUE(tenant_id, email)`, not `UNIQUE(email)`. Two churches may each have a
`pastor@gmail.com`, and both are legitimate. So the credential the client sends
does not necessarily identify one row, and the login endpoint has to decide
what to do when it identifies more than one.

This was not visible before Phase 2B-5 because nothing had yet looked a user up
by credential.

## Decision

**Email alone identifies the user, and an ambiguous email fails closed.**

The lookup selects live (`deleted_at IS NULL`) users with that address, capped
at two rows. Exactly one match authenticates. Zero matches, or two or more,
raise the same `AuthenticationError` as a wrong password.

Nothing about the ambiguity is disclosed. A caller cannot tell "this address
exists in two churches" from "this address exists nowhere".

**Soft-deleted rows are excluded from the lookup**, so a retired account in one
church cannot make a live account in another unreachable.

### Rejected: a tenant hint on the login request

The obvious alternative is to add a church slug, subdomain or id to the login
payload. Rejected for this phase:

- It is not in the canonical contract. `loginSchema` has two fields, and the
  login form collects two. Adding a third would be a frontend change this phase
  is explicitly scoped out of.
- A client-supplied tenant on the *authentication* request is the exact shape
  ADR-011 Decision 3 rules out for authorization. It would be defensible here —
  a tenant hint before authentication selects a credential store rather than
  granting anything — but the distinction is subtle enough to be worth avoiding
  until there is a contract that needs it.
- There is no tenant slug to send. `churches` has no unique slug; that is
  OQ-DB-02, still open.

### Rejected: pick one, e.g. the oldest account

Guessing which church a person meant to sign into, and then issuing a token
scoped to that guess, is a cross-tenant hazard dressed as a convenience. If it
guesses wrong the user authenticates into a church they did not intend, with
that church's permissions.

## Consequences

- Until a tenant hint exists, **a single email address may hold at most one
  live user account across the whole platform** if that person is to sign in.
  A genuine multi-church administrator needs one address per church.
- This is a real product constraint and it is currently **unenforced**: the
  database permits the duplicate, and the person only discovers the problem
  when login stops working for both accounts. Making it enforceable means
  either a global unique index on live emails — which contradicts ADR-006 — or
  a tenant hint. **Recorded as an open question, not solved here** (see below).
- Nothing in the schema changed. This is a decision about how the lookup reads
  existing data.

## Uniform Credential Failure

Every rejection from `authenticate()` is the same `AuthenticationError` with
the same message and the same 401: unknown email, wrong password, ambiguous
email, soft-deleted account, inactive account, suspended account.

Distinguishing them would turn login into an account-enumeration oracle —
"this address has an account here, it is merely suspended" is exactly what an
attacker wants and exactly what a legitimate user does not need, since their
remedy (contact an administrator) is identical in every case.

The same reasoning already governs `POST /auth/forgot-password`, which the
security plan requires to return an identical response whether or not the email
exists.

### Timing is equalised, not just the response body

A lookup miss returns before any password work, which makes "no such account"
measurably faster than "wrong password" and re-opens enumeration through a side
channel. `authenticate()` therefore verifies the submitted password against a
throwaway Argon2 hash before failing, so both paths pay the same cost.

This is a mitigation, not a guarantee: Argon2 timing varies, and network jitter
usually dominates. It removes the trivially observable difference; it does not
claim constant time.

## Account Lockout Is Deliberately Not Implemented

`users.failed_login_count` and `locked_until` appear in
`backend-database-plan.md`, and the security plan asks for lockout — but
records that **no source specifies the threshold, the window, or the unlock
mechanism** (OQ-SEC-04).

Those three values *are* the policy. Choosing them here would be inventing
security behaviour, which is what this project's conventions forbid, and a
wrong choice is not harmless in either direction: too strict and an attacker
locks out every administrator by guessing badly on purpose; too lax and it
deters nothing.

**No columns were added and no migration was created.** The schema stays at
`0005`. OQ-SEC-04 remains open, and the fields land with the phase that
resolves it.

Note that lockout is not the only defence available: request-level rate
limiting on `/auth/login` is a separate mechanism, and the security plan
already lists Redis-backed rate limits. That is also deferred here, and is not
blocked on OQ-SEC-04.

## Open Questions Raised

| Question | Detail |
| :-- | :-- |
| **OQ-AUTH-01** | How should a person who administers two churches sign in? A tenant hint on the login request (needs OQ-DB-02's church slug), a church picker after authentication, or one address per church. Until resolved, duplicate live emails silently break login for every account sharing the address. |
| **OQ-AUTH-02** | Should the duplicate be *prevented* rather than merely handled — and if so, how, without contradicting ADR-006's per-tenant uniqueness? |

---

## Addendum (Phase 2B-6): password change, registration, lockout

### `PUT /auth/change-password` — implemented

A concrete contract existed, so it was built to that contract and no further:
`Auth_Authentication_Endpoints.md` specifies the method, path, request body
`{currentPassword, newPassword}` and a `{success, message}` response with no
`data`; `changePasswordSchema` supplies the 8-character minimum;
`authService.changePassword` already calls exactly this endpoint.

Three behaviours are worth recording because they are decisions, not
transcription:

**A wrong current password answers 422, not 401.** The caller's session is
perfectly valid — what failed is a field in the body. Answering 401 would log
them out, because `services/api-client.ts` clears local storage and
hard-redirects on *any* 401 (`backend-security-plan.md` §2.3). There is no
enumeration concern to trade against: the caller is already authenticated as
this exact account, so a precise field error tells them nothing they do not
already know.

**The current password is required even though the caller holds a valid
token.** This is what keeps a stolen token from becoming permanent ownership
of the account.

**Reusing the current password is refused.** Without this, a user whose
`require_password_change` was set could clear the flag by "changing" their
password to the one an administrator gave them — leaving them in precisely
the state the flag exists to end. This is the one rule here not read off a
document; it is recorded as a decision rather than left as an unexplained
branch.

**Gated on `profile.security`, not merely on being authenticated.** Two
independent sources say so: `backend-api-map.md` marks that permission binding
for this endpoint, and the canonical catalogue defines `profile.security` as
"Update password, enable 2FA, and inspect active sessions". All six canonical
roles hold it, so no ordinary user is affected -- a test asserts that, because
gating it would otherwise lock a whole role out of its own credentials. The
one account it excludes is a **role-less** user, who by construction can do
nothing else in the application either; making password change the single
exception to fail-closed role resolution would be inventing an exception the
contract does not describe.

`require_password_change` is cleared only on a real change. No column was
added: `password_hash` and `updated_at` already exist, so there is no
migration.

### Registration — deferred, but the *policy* is already decided

**OQ-API-04 is resolved by [ADR-002](./002-controlled-self-registration.md)**
and should no longer be carried as an open authentication question.
Registration is tenant-bound and controlled: a server-resolved registration
token or church-specific link establishes the tenant, never a client-supplied
field.

What is missing is the *mechanism*, not the decision:

| Needed | Status |
| :-- | :-- |
| `registration_tokens` table (token → church, optional branch, expiry, uses, optional email binding) | Does not exist. ADR-002 names it as a consequence; no migration has created it. |
| An endpoint that mints a token | No contract anywhere. |
| A request contract for redeeming one | None. |

The frontend's `registerSchema` — `{name, email, password, role?, branchId?}`
— is the shape ADR-002 explicitly **rejected**: a client naming its own role
and branch is the tenant-isolation and privilege-escalation hole that ADR
exists to close. Implementing `POST /auth/register` against it would be
implementing the rejected alternative. Nothing was built.

Consequently registration remains deferred *pending the token mechanism*, and
that mechanism is a phase of its own — it needs a migration, an issuing
surface, and an answer to ADR-002's own open question about whether
first-super-admin onboarding and ordinary member registration share a flow
(they should not).

### Account lockout — still not implemented

OQ-SEC-04 was re-examined against the security plan and every canonical
source. None supplies a failure threshold, a lockout duration, or an unlock
mechanism — and those three values *are* the policy.

**No `failed_login_count`. No `locked_until`. No migration. OQ-SEC-04 stays
open.**

Login rate limiting ([ADR-013](./013-login-rate-limiting.md)) was added in the
same phase and is deliberately *not* the same control: it is per-IP,
self-healing on a Redis TTL, and holds no per-account state. It reduces the
online-guessing rate; it does not lock an account, and it must not be mistaken
for having answered OQ-SEC-04.

---

## Addendum (Phase 2B-7): equal work across failure paths; remaining endpoints

### Equal work is now a build gate

Phase 2B-6 asserted that every credential failure returns an identical body.
That covers what a caller can *read*, but not what it can *measure*. The one
property in the security posture that a response body cannot demonstrate is
timing, and the path that matters is the ambiguous address: an early return
when two churches share an email would answer measurably faster than a wrong
password, turning login into an oracle for "this address exists in more than
one church" — a fact about a tenant the caller has no relationship with.

It is asserted as **work performed**, not elapsed time. Argon2 verification
dominates the cost of a login by orders of magnitude, so "every failure path
performs exactly one verification" is the property that makes the paths take
the same time, and unlike a wall-clock measurement it is deterministic enough
to gate a build. A wall-clock assertion was deliberately not added: it would be
flaky on shared CI, and a flaky security test gets disabled.

Covered paths: unknown address, ambiguous address, inactive, suspended,
soft-deleted, wrong password. Two mutations prove the tests bite — an early
return for an unknown/ambiguous address fails three, and moving the account
status check *before* verification (so a suspended account answers early) fails
two. A third test asserts the ambiguous path verifies against the throwaway
equaliser hash rather than either real stored hash, so no account is singled
out.

Also pinned: ambiguity is computed over rows that still exist. Soft deletion
removes a row from consideration; account **status** does not. Status is
reversible administrative state, and if an inactive duplicate did not count,
reactivating it would silently break login for a completely different church
with nothing in either tenant to explain why.

### `/auth` endpoint status after Phase 2B-7

Every remaining endpoint was re-examined against §6's rule — implement only
where the request, response *and security* contract already exist. Each is
blocked on something concrete, not on effort:

| Endpoint | Contract | Blocked on |
| :-- | :-- | :-- |
| `POST /auth/logout` | request + response documented | The documented behaviour is "invalidate token". There is no revocation store, and ADR-011/§7 forbid inventing a session or denylist model. A stateless 200 would report `"Logout successful"` while the token stayed valid to expiry — a false security assurance, which is worse than no endpoint. Access tokens live 15 minutes. |
| `POST /auth/refresh` | request + response documented | No `refresh_tokens` table and no session model. Explicitly out of scope. |
| `POST /auth/register` | `registerSchema` exists | Resolved in principle by ADR-002 (tenant-bound, token-resolved); the token issuance/redemption mechanism does not exist anywhere in the repository. `registerSchema`'s client-supplied `role`/`branchId` is the shape ADR-002 rejected. |
| `POST /auth/forgot-password` | request + response documented | No password-reset token store, and **no email infrastructure of any kind** — no SMTP configuration, no `EmailProvider` implementation, no Celery task. Token lifetime and one-time-use policy are unspecified. |
| `POST /auth/reset-password` | request + response documented | Same reset-token store as above. |
| `PUT /auth/profile` | doc sample `{name, email}` | See below. |

### `PUT /auth/profile` deserves its own note

It looks like the most implementable of the six, and it is the one worth being
most careful about.

There is **no self-service profile schema**. `userAccountUpdateSchema` is the
administrator's user-management form: it carries `role`, `status` and
`department` — fields a user must never set on their own account. Reusing it
for a self-service endpoint would recreate exactly the privilege hole ADR-002
was written to close.

The documented sample sends `name` as one field, while the model stores
`first_name` and `last_name`; splitting an arbitrary name across two columns is
a guess, not a contract.

Most importantly, the sample also permits changing `email` — which is the login
identity. While OQ-AUTH-01 is open, letting a user edit their own address means
a user in one church can, by choosing an address already live in another,
manufacture the cross-tenant ambiguity that fails login closed **for both
accounts**, in two different tenants, with nothing surfaced to either. Self-
service email change should not ship before OQ-AUTH-01 is answered.

## Addendum (2026-09-04, Phase 2B-10): OQ-AUTH-01 Re-Audited Independently — Still Unresolved

This phase re-ran the tenant-resolution audit from scratch rather than
trusting the sweep recorded in ADR-006 or the Phase 2B-6/2B-7 reports. The
searches were repeated over `*.ts`, `*.tsx`, `*.py` and `*.md`, excluding
`node_modules` and `.next`, and the conclusion is unchanged. The three
candidate models remain unsupported for three *different* reasons, which is
why the question cannot be closed by picking the least-bad option.

### Option A — tenant hint: there is no identifier to send

Not "the format is undecided" but "no identifier exists at any layer".
`churches` has `name`, `motto`, `vision`, `mission`, `core_values`,
`history`, `founded`, `denomination`, contact, address, socials and
leadership — and no slug, code, subdomain or external identifier of any kind.
`churchProfileSchema` has none either, so there is no form field that could
ever populate one. OQ-DB-02 (does a tenant need a URL-safe slug?) is still
open, and until it is answered there is nothing for a login request to carry.

The only repository-wide matches for `subdomain` are an HSTS
`includeSubDomains` header and this backend's own planning documents.

### Option B — post-authentication selection: the schema cannot represent it

This is the finding that matters most, and it is structural rather than
cosmetic. The database has **nine tables**: `churches`, `branches`, `users`,
`roles`, `permissions`, `permission_categories`, `role_permissions`,
`user_branch_assignments`, `members`. There is no `identities`, `persons`,
`accounts` or `memberships` table, and `users.tenant_id` is `NOT NULL` with a
foreign key to `churches.id`.

**A user belongs to exactly one tenant, and the schema has no way to say that
two `users` rows are the same human being.** A person administering two
churches is two unrelated rows. Post-authentication selection presupposes an
identity that spans tenants, so implementing it means introducing a global
identity/membership domain model — a substantial domain decision that must not
be smuggled in through a login endpoint (ADR-001 already separates `User` from
`Member`; a third identity concept is a larger change than either).

The frontend cannot express it either: `login(email, password)` resolves and
redirects, with no selection step, and there is no church picker, switcher or
list surface anywhere in the route tree.

### Option C — global email identity: no product decision exists

Nothing in the repository asks for it. `UNIQUE(tenant_id, email)` and
`UNIQUE(tenant_id, username)` stand, and this ADR's original reasoning is
untouched.

### Consequence: OQ-AUTH-01 and OQ-AUTH-02 both stay open

OQ-AUTH-02 (duplicate-email policy) is not independently decidable — Policy A,
B and C each presuppose one of the three tenant-resolution models above. With
OQ-AUTH-01 open, choosing a duplicate-email policy would be choosing a
tenant-resolution model by implication.

The current fail-closed behaviour is therefore unchanged and was re-verified
by mutation: **six** distinct pick-a-tenant implementations were injected —
first row, newest `created_at`, the one with a role, the one whose status is
active, the one whose password matches, and reducing the query to `LIMIT 1` —
and every one of them was caught by existing tests (3 to 9 failures each). An
ambiguous address still fails byte-identically to an unknown one, and a
correct password still does not resolve it.

### What is actually required to close this

One product decision, in this order:

1. **Does one human being ever need to administer two churches in this
   platform?** If no, OQ-AUTH-01 closes as Policy A with a documented
   operational rule (one address per church) and no code changes at all.
2. If yes, **which experience?** A tenant hint requires answering OQ-DB-02
   first (what identifier, who assigns it, is it mutable, is it public). A
   picker requires a global identity model, which is a domain phase of its
   own, not an authentication change.

Until (1) is answered, no amount of repository evidence resolves this, because
the evidence needed does not exist in the repository — it is a product
decision that has not been made.
