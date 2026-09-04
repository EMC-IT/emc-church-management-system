# ADR-011: Authorization Resolves Permission Codes, and Phase 2B-4B Builds Only the Pipeline

**Status:** Accepted
**Resolves:** OQ-SEC-11 (fail-closed branch scope)
**Relates to:** ADR-003, ADR-008, ADR-009, ADR-010
**Date:** 2026-09-03

## Context

Phase 2B-4A produced a relational RBAC model rich enough to support a general
policy engine: per-tenant roles, a 164-code catalogue, role-permission grants,
branch assignments, all with database-enforced tenant integrity. That richness
is the risk. The natural next move is to build an authorization *framework* —
policy registries, rule DSLs, resource-policy hierarchies — before a single
endpoint is protected.

The security plan §3.5 already sketches seven resource policies
(`BranchScopePolicy`, `OwnershipPolicy`, `ConfidentialityPolicy`,
`DocumentAccessPolicy`, `ChildRecordPolicy`, …). Those are real requirements,
but they belong to the domains that own the resources, and several depend on
tables that do not exist yet. Building their abstractions now means designing
against imagined callers.

This ADR fixes the shape of authorization and the boundary of Phase 2B-4B.

## Decision 1 — The permission code is the only authorization primitive

Authorization asks one question:

```python
has_permission(context, "members.view")
```

The role determines the permissions; the permissions determine authorization.
No code outside the resolution step may branch on a role name. This is
forbidden anywhere in the application:

```python
if principal.role_key in ("Admin", "SuperAdmin"):   # NO
```

The reason is not style. Churches can create their own roles
(`settings.roles.create`) and can narrow the built-in ones
(`settings.roles.edit`). A role-name check is invisible to both: a custom
"Youth Pastor" role granted `members.view` would be denied, and an `Admin`
role a church deliberately stripped of `members.delete` would still pass.
Role-name checks silently ignore the customisation the schema was built to
support. `backend/CLAUDE.md` §8 already forbids `if user.role == "admin"`;
this extends it to every equivalent form, including membership tests and
role-set constants.

```text
Role  ──▶  role_permissions  ──▶  effective permissions  ──▶  authorization
                                                              (never the role)
```

`SuperAdmin` is not special-cased. It passes every check because its role
genuinely grants all 164 codes (ADR-009), resolved through the same path as
any other role — not because a branch short-circuits (ADR-010).

## Decision 2 — Tokens carry identity; permissions resolve server-side

JWT claims carry stable identity only: `sub` (user), `tid` (tenant), `sid`
(session), `typ`, `exp`, `iat`, `jti`. **The permission list is not a claim.**

The security plan §2.2 already requires this ("permissions are resolved
server-side from `role_permissions` on every request … a stale token must not
carry a revoked permission"), and it matters more than it looks: an access
token outlives a permission change, so an embedded list means revoking a
permission does not actually revoke it until every issued token expires. For
a permission like `finance.expenses.delete` that is a real window of
unauthorised access.

`rid` (role_id) is **not** a claim either. It is derived from the user record
during resolution, so reassigning a user's role takes effect on their next
request rather than at token expiry. The claims list above is the whole of it.

The login *response* still echoes `user.role.permissions[]` for the frontend's
`hasPermission()` affordance, per the API contract. That is response data, not
a token claim, and is never read back as an authorization input.

Caching resolved permissions in Redis is an explicitly permitted later
optimisation (the security plan already lists permission definitions as
cacheable), but only with an invalidation path tied to role and grant changes.
Phase 2B-4B resolves per request, with no cache.

## Decision 3 — Tenant scope is derived, never accepted

The tenant is taken from the authenticated principal and applied to every
tenant-scoped query. A `tenant_id`/`church_id` arriving in a path, query
string or request body is **never** an authorization input. Where a route
carries one for addressing, it is validated to equal the principal's tenant
and otherwise treated as not found.

```text
request  ──▶  principal.tenant_id  ──▶  query filter
                     ▲
                     └── never from the client
```

This is what ADR-002 already established for registration (tenant bound
server-side, never a client-supplied `church_id`), generalised to every
endpoint.

## Decision 4 — Branch scope is a separate axis, enforced fail-closed

Tenant access and branch access are independent checks. A user assigned to
branches A and B must not read branch C, and the check happens server-side.

`lib/authorization/scope.ts` treats an **empty** assignment list as
unrestricted. Server-side that is inverted where it matters:

| Assignment state | Frontend | Backend |
| :-- | :-- | :-- |
| Branches assigned | restricted to them | restricted to them |
| No branches assigned | unrestricted (fail-open) | **church-wide only if the principal's permissions are church-wide; never a silent grant of every branch's operational data** |

This resolves OQ-SEC-11 in the direction ADR-003 already required
("must be implemented fail-closed server-side"). Tenant-wide reference data
(roles, categories, church profile — `backend-domain-map.md` §5) stays
readable regardless of branch assignment; branch-scoped *operational* data
does not.

`SuperAdmin` spans every branch of its own church, which is not an exception:
its permission set is church-wide by construction, and the tenant boundary
still bounds it (ADR-010).

## Decision 5 — Phase 2B-4B builds the pipeline, not a policy engine

In scope, in this order:

```text
1. SecurityContext        one representation of the authenticated principal
2. Token claims           identity only, per Decision 2
3. get_current_user()     one authentication dependency
4. Tenant enforcement     derived scope on every tenant-scoped query
5. Branch enforcement     the second axis, fail-closed
6. require_permission()   one authorization dependency, permission codes only
```

`SecurityContext` is built once per request and is the single source of the
principal. Its shape follows the frontend's `SecurityContext` vocabulary so
the two stay legible together:

```python
SecurityContext(
    user_id=...,
    tenant_id=...,
    role_id=...,
    role_key=...,  # for audit/display, never for a check
    permissions=frozenset[str],
    assigned_branch_ids=frozenset[UUID],
    primary_branch_id=...,
)
```

`role_key` is carried because audit records require the actor's role
(`audit_logs.actor_role`) and the login response echoes `user.role.name`. It
is display and audit data. Branching on it is a Decision 1 violation.

**Explicitly out of scope for 2B-4B:**

- A policy registry, rule DSL, or generic policy-evaluation framework.
- The seven named resource policies from the security plan §3.5. Each lands
  with the domain that owns its resource, where there is a real caller to
  design against. `BranchScopePolicy` is the exception only because branch
  scope is item 5 above and is a property of the principal, not of a resource.
- Role and permission management endpoints (create/edit/delete roles, assign
  roles, edit grants). The tables and seed exist; the CRUD is a Settings-domain
  feature and needs its own phase. Note that deleting a *system* role is a
  service-layer obligation with no database constraint behind it (ADR-008), so
  it must be implemented when that CRUD lands.
- Row-Level Security (OQ-DB-10), permission caching, and 2FA.
- Any reference to the permission families ADR-009 deferred. No dependency,
  policy or endpoint may name `finance.expenses.approve`, `files.*` or
  `pastoral-care.view-confidential`, and none may substitute a role-name check
  in their absence. Those capabilities are unavailable, not implicitly allowed.

## Consequences

- Authorization behaviour is fully determined by data (`role_permissions`),
  so a church's custom role works identically to a built-in one and no code
  change is needed to support one.
- Every protected endpoint reads as `require_permission("<code>")`. A reviewer
  can compare an endpoint against the permission matrix without reading its
  body, and the security plan §7's "one test per role per endpoint" becomes
  mechanical.
- Revoking a permission takes effect on the next request, not at token expiry.
- Adding a permission family later (ADR-009) requires no authorization code
  change — only seed data and a `ROLE_PERMISSIONS` entry.
- A grep for `role_key ==`, `role_key in`, or `role.name ==` outside audit and
  serialisation code is a defect by this ADR, and is a cheap thing to check in
  review.

## Alternatives Considered

- **Embed permissions in the JWT** for stateless checks with no per-request
  lookup. Rejected: it makes revocation ineffective for the token's lifetime,
  which the security plan already ruled out. The lookup it saves is one indexed
  join, and Redis caching is available later if it ever measures.
- **Build the general policy engine now**, since the schema supports it.
  Rejected: the seven policies depend on tables that do not exist
  (`pastoral_cases`, `member_documents`, Sunday School records), so their
  interfaces would be designed against imagined callers and rewritten when the
  real ones arrive. `backend/CLAUDE.md` §19 warns against exactly this
  half-built state.
- **Allow role checks for "obviously fixed" cases** such as restricting
  role management to `SuperAdmin`. Rejected: `settings.roles.*` and
  `settings.permissions.manage` already exist as codes for precisely this, and
  one sanctioned exception is how the pattern spreads.
- **Mirror `scope.ts`'s fail-open branch behaviour** for consistency with the
  frontend. Rejected per ADR-003, which already requires the server-side
  implementation be fail-closed.

## Addendum (2026-09-03, Phase 2B-4B): Two Clarifications From Implementing It

### The claim set is smaller than Decision 2 listed

Decision 2 named `sub`, `tid`, `sid`, `typ`, `exp`, `iat`, `jti`, following the
security plan §2.2. The implemented token carries **five**:

```text
sub  tid  typ  exp  iat
```

`sid` and `jti` are deferred, not dropped. `sid` identifies a row in a
`sessions` table and `jti` is only meaningful against a revocation list; neither
table exists (both are in the database plan, unbuilt). A claim naming a store
that does not exist advertises a capability the server cannot honour — a
reviewer seeing `jti` would reasonably assume tokens can be revoked before
expiry, and they cannot. Both land with the session/refresh-token phase, which
is also when the refresh flow that needs them arrives.

`typ` is kept and verified. It is the one claim of the three that earns its
place today: a later phase will sign refresh tokens with the same key, and
without a type check the two kinds would be interchangeable.

### Branch scope is assignment membership, with no exceptions

Decision 4's table said a principal with no branch assignments gets
"church-wide only if the principal's permissions are church-wide". That was too
loose to implement, because "permissions are church-wide" has no definition in
the catalogue — there is no code meaning *branch-unrestricted*.

The implemented rule is uniform and has no special cases:

> **A principal's branch scope is exactly its `user_branch_assignments`. An
> empty set denies every branch.**

This is the only rule consistent with the rest of the ADR. Any "church-wide"
carve-out would have to be recognised from the role — which Decision 1 forbids
— or from an `is_super_admin` flag, which ADR-010 forbids. Deriving it from a
permission code would mean inventing one, which ADR-009 forbids.

`SuperAdmin` therefore reaches every branch of its church the same way any role
does: by holding an assignment for each. That is explicit, auditable data
rather than an implicit code path, and it is what
`test_super_admin_branch_access_still_comes_from_assignments` pins — an
unassigned SuperAdmin is denied, and adding the assignment is what grants
access.

The operational consequence is that **tenant provisioning must create branch
assignments for the founding administrator**, alongside `seed_tenant_roles`.
Until that flow exists, a freshly seeded church has no principal with
branch-scoped access. That is correct fail-closed behaviour and the remedy is
data, not code — but it is a real prerequisite for the first branch-scoped
domain, and is recorded here so it is not discovered as a bug later.

Note that branch scope is **opt-in per endpoint**: it applies only where a
resource is branch-scoped. Tenant-wide reference data — roles, categories,
church profile (`backend-domain-map.md` §5) — is unaffected, so an
unassigned principal is not locked out of the application.

## Addendum (2026-09-03, Phase 2B-5): Provisioning Closes the Founding-Administrator Gap

The addendum above recorded a prerequisite: because branch access is
assignment data with no role-based shortcut, a church seeded with roles but no
`user_branch_assignments` has nobody who can act in its branches. Seeding roles
is not enough, and the remedy is data.

`app/domains/identity/provisioning.py` is that data step.

### The transaction boundary

One `transaction_scope`, covering the whole sequence:

```text
Church -> Branches -> canonical roles -> founding User -> branch assignments
```

A church with roles but no administrator, or an administrator with no branch
access, is precisely the half-provisioned state this exists to prevent, so it
must not be reachable by a partial failure. `transaction_scope` nests via
SAVEPOINT when the caller already holds a transaction, so provisioning composes
inside a larger unit of work (an onboarding request, say) without either
committing early or abandoning the outer work.

### The founding-administrator rule

- The founding administrator is assigned to **every branch created during
  provisioning**, one explicit row each.
- The **first** branch in the caller's sequence becomes primary. Ordering is
  the caller's rather than inferred from `BranchType.HEADQUARTERS`, so
  provisioning never guesses which of several branches the administrator
  primarily works in, and a church with no HQ-typed branch still gets a
  primary.
- They hold the church's own `SuperAdmin` role by default — a tenant role like
  any other (ADR-010). The role is validated against `CANONICAL_ROLES`, so a
  founding administrator cannot be provisioned into a role that does not exist.
- `require_password_change` is `False`: they chose this password during
  onboarding, unlike an admin-created user whose password someone else picked.

Nothing here special-cases a role name. An administrator's branch reach is the
rows in `user_branch_assignments` and nothing else, which
`test_no_assignment_never_means_unrestricted` pins by stripping them and
asserting the founder is then locked out of their own church's branches.

### Idempotency

Provisioning is safe to re-run, which is what makes a retry after a partial
failure a repair rather than a duplication. Every step matches on an identity
**the database already enforces as unique**, so the idempotency cannot drift
from the constraint that backs it:

| Step | Matched on | Constraint |
| :-- | :-- | :-- |
| Branches | `(tenant_id, name)` | `uq_branches_tenant_id_name` |
| Roles | `(tenant_id, key)` | `uq_roles_tenant_id_key`, via `seed_tenant_roles` |
| Founding user | `(tenant_id, email)` | `uq_users_tenant_id_email` |
| Branch assignments | `(user_id, branch_id)` | `uq_user_branch_assignments_user_id_branch_id` |
| Permissions / categories | `code` / `key` | via `sync_permission_registry` |

A re-run never overwrites what a church has since customised — not a renamed
role, not an edited grant, not a rotated administrator password. Provisioning
running again is not a reason to undo an intentional change.

### Deferred, with what each is waiting on

Phase 2B-5 implemented `POST /auth/login` and `GET /auth/me` only. The rest of
the documented `/auth` surface is deferred:

| Endpoint | Waiting on |
| :-- | :-- |
| `POST /auth/refresh`, `POST /auth/logout` | The `sessions`/`refresh_tokens` tables, deferred with `sid`/`jti` above. `refreshToken` is optional in the frontend's `AuthResponse` and nothing reads one that login did not store, so omitting it breaks nothing today. |
| `PUT /auth/change-password` | `require_password_change` is **surfaced** on the login and `/auth/me` payloads so the client can route into a change flow; the endpoint that completes it is a Settings-domain concern. The state is carried, not discarded. |
| `POST /auth/register` | OQ-API-04 — whether public self-registration exists at all, and which church a self-registered user would land in. |
| `POST /auth/forgot-password`, `POST /auth/reset-password` | The `password_reset_tokens` table and an email integration. |
| `PUT /auth/profile` | Settings domain. |

Provisioning itself is exposed as a **service function, not an endpoint**.
`/onboarding` is listed in `backend-api-map.md` §14 as documented-but-unwired
with no request contract, and inventing one is out of scope here.

---

## Addendum (Phase 2B-8): first domain enforced, and the readiness audit

### The audit came first, and it decided most of the phase

Before writing anything, every backend domain package was inspected rather than
inferred from the documentation. **17 of the 20 packages under `app/domains/`
contain nothing but an empty `__init__.py`.** Only `churches` (Church, Branch),
`identity` (RBAC, authentication, authorization) and `members` (a `Member`
model) have any implementation at all, and before this phase there were exactly
two routers: `auth` and `system`.

Authorization cannot be enforced on a domain that has no schema, no service and
no endpoint. Attendance, Finance, Pastoral Care, Prayer Requests, Departments,
Groups, Events, Sunday School, Assets, Communications, Files and Analytics are
therefore all **category D** — not blocked on a policy question, simply absent.
Writing authorization for them now would be authorizing an imaginary resource.

### Members: enforced

Members is the one domain with a table, a documented Rank-1 contract, and a
settled classification. `backend-security-plan.md` §6 classifies it
**INTERNAL — tenant + branch + RBAC**, with no further resource policy, which
is what made it safe: the rule did not have to be invented, only applied.

| Endpoint | Permission | Scope |
| :-- | :-- | :-- |
| `GET /members` | `members.view` | tenant + assigned branches |
| `GET /members/{id}` | `members.view` | tenant + assigned branches |
| `POST /members` | `members.create` | tenant from context; branch validated |
| `PUT /members/{id}` | `members.edit` | current *and* target branch validated |

Both scope axes are **query predicates**, not post-fetch checks: a row outside
the caller's tenant or branches is never loaded, so there is no window in which
it exists in memory and something forgets to look at it.

**404, not 403, for a resource outside scope.** Another church's member, an
unassigned branch's member, a branchless member and a random UUID all return
byte-identical 404s. 403 would confirm the id names a real record somewhere,
which is an existence oracle across the tenant boundary.

**A member with no branch is invisible.** `members.branch_id` is nullable, and
`branch_id IS NULL` is in nobody's assignment set. This is the mirror of the
rule above: reading "no branch" as "every branch" would reopen fail-open branch
scope through the *data* rather than through the code, and would let anyone who
can create a member create one that escapes branch containment. Creation
therefore always lands a member in a real, reachable branch — a supplied
`branchId` must be one the caller holds, an omitted one falls back to their
primary assignment, and a principal with no assignments cannot create at all.

### A defence-in-depth gap the mutation testing exposed

Removing `Member.tenant_id == context.tenant_id` from the query broke **no
test**. The branch predicate masks it: branch ids are unique platform-wide and
`user_branch_assignments` is itself tenant-scoped by composite foreign key, so
a caller can never hold a branch belonging to another church, and tenant
isolation was being enforced *transitively*.

That is fine until the first tenant-wide endpoint, or the first branch-less
resource, at which point it silently is not. `backend/CLAUDE.md` §7 requires the
repository layer to re-apply tenant scope in its own right, so the predicate is
now asserted directly against the compiled SQL. No behavioural test could have
caught it, which is exactly why it is asserted structurally instead.

### A real bug the tests caught

`payload.model_dump(exclude_unset=True)` returns **camelCase** keys, because
these models set `serialize_by_alias=True`. The update path therefore tested
`"branch_id" in fields` against a dict containing `branchId` — always false —
so **the branch check on update was silently skipped** while the endpoint
reported success, and field writes landed on non-existent attributes. Fixed
with `by_alias=False`, plus a `_WRITABLE_COLUMNS` allow-list so a future schema
field with no column fails loudly instead of writing nothing. Both the alias
bug and the allow-list are mutation-tested.

### No migration

Nothing here needed one. Head remains `0005`.

### Stopped items — Phase 2B-8

Every one is blocked on a missing contract or a missing domain. **None is
blocked on a missing permission code, and no permission was invented.**

| Domain | Endpoint / use case | Why it cannot safely be authorized | Permission | ADR / OQ | Decision required |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Members | `DELETE /members/{id}`, `POST /members/bulk-delete` | Deletion semantics unresolved: `membershipStatus` already has `Archived`/`Transferred`, and financial and attendance history will reference `member_id`. Soft archive and hard delete are different operations with different consequences. | `members.delete` (exists) | **OQ-API-06** | Is `DELETE` a soft archive or a hard delete? |
| Members | `/members/{id}/documents` | The Files domain has no schema. Member documents in `medical`/`legal`/`financial` are **CONFIDENTIAL** in §6's classification and need a resource policy that does not exist. | `members.documents` (exists) | OQ-SEC-05 (`files.*` deferred, ADR-009) | Document confidentiality tiers and the file-vault permission family. |
| Members | `/members/{id}/giving` | The Finance domain has no schema. Giving is **CONFIDENTIAL**. | `members.giving` (exists) | — | Finance domain must exist first. |
| Members | `/members/{id}/attendance`, `/members/{id}/history` | Neither the Attendance domain nor any history/timeline table exists. | `members.history` (exists) | — | Those domains must exist first. |
| Members | `/members/{id}/family`, `/family/link` | The Families domain package is empty; there is no relationship table. | `members.family` (exists) | — | Family/household schema. |
| Members | `/members/import`, `/members/export`, `/members/{id}/photo` | No file storage, no job pipeline, no import/export contract. Export of member data is a bulk-disclosure surface needing its own rules. | `members.import`, `members.export` (exist) | — | Storage and job contracts; export scope. |
| Members | `/members/converts/*` | No convert schema in the backend; `newConvertSchema` hard-codes five branch names as an enum, which contradicts branches being tenant data. | `members.converts` (exists) | — | Convert model, and how branch is identified. |
| Attendance | all | Domain package is empty. | `attendance.*` (exist) | — | Domain implementation. |
| Finance | all | Domain package is empty. **`finance.expenses.approve` remains deliberately deferred** — no approval workflow, approver/requester separation, threshold ladder or accounting-period rule exists. Nothing in the backend claims to implement approval. | `finance.*` (partly exist) | ADR-009, **OQ-SEC-09** | Approval workflow before any approval endpoint. |
| Pastoral Care | all | Domain package is empty, **and** the confidentiality tier is unresolved: only `pastoral-care.view`/`.manage` exist, with no `view-confidential`. Counselling notes are **CONFIDENTIAL**. Implementing `view`/`manage` alone would have to decide, silently, whether they expose counselling notes. | `pastoral-care.view`, `.manage` | ADR-009, ADR-011 §10 | Whether a confidential tier exists, and who holds it. |
| Prayer Requests | all | Domain package is empty. Unlike pastoral care this one *does* have `prayer-requests.view-confidential`, so its tier is defined — but there is no schema to enforce it on. | `prayer-requests.*` (exist) | — | Domain implementation. |
| Departments, Groups, Events, Sunday School, Assets, Communications | all | Domain packages are empty. | permissions exist | — | Domain implementation. |
| Files / Documents | all | Domain package is empty **and** the permission family does not exist at all. | **none — `files.*` deferred** | ADR-009 | Whether `files.*` is added to the canonical catalogue. |
| Reports / Analytics | all | Domain package is empty; `reports.*` has no permission family and `analytics.*` is only the nearest neighbour. | `analytics.*` (exist), `reports.*` (none) | OQ-SEC-05 | Whether reports are gated by `analytics.*` or need their own family. |
| Settings / Identity | user, role and branch CRUD | Out of this phase's scope by §22; `settings.*` permissions exist and the domain is partly present. | `settings.*` (exist) | — | A later phase. |

## Addendum (2026-09-04, Phase 2B-9): Churches & Branches — the First Tenant-Wide Endpoint

Phase 2B-8 wired Members, a **branch-scoped** domain. This phase audited the
Churches & Branches / tenant-administration surface and implemented the one
operation pair the repository can actually prove: the church profile, which is
the first **tenant-wide** endpoint and therefore the first place the tenant
predicate stands on its own.

### The audit

Category A = safe to authorize now; B = permission exists, resource policy
unresolved; C = permission missing from the canonical catalogue; D = the
capability does not exist.

| Operation | Permission | Table | Scope settled? | Category |
| :-- | :-- | :-- | :-- | :-- |
| `GET /settings/church-profile` | `settings.church-profile` | `churches` ✅ | tenant-wide, stated three times | **A — implemented** |
| `PUT /settings/church-profile` | `settings.church-profile` | `churches` ✅ | tenant-wide, stated three times | **A — implemented** |
| `GET /settings/branches` | `settings.branches.view` | `branches` ✅ | **no** — see OQ-SEC-22 | B |
| `GET /settings/branches/{id}` | `settings.branches.view` | `branches` ✅ | **no** — see OQ-SEC-22 | B |
| `POST /settings/branches` | `settings.branches.create` | `branches` ✅ | **no** — see OQ-SEC-23 | B |
| `PUT /settings/branches/{id}` | `settings.branches.edit` | `branches` ✅ | **no** — see OQ-SEC-22 | B |
| `DELETE /settings/branches/{id}` | `settings.branches.delete` | `branches` ✅ | **no** — see OQ-DB-13 | B |
| `GET`/`PUT /settings` | `settings.view` / `settings.system` | **no `settings` table** | n/a | D |
| `/settings/users/*` | `settings.users.*` | `users` ✅ | blocked on OQ-AUTH-01 | B |
| `/settings/roles/*`, permission matrix | `settings.roles.*`, `settings.permissions.manage` | `roles` ✅ | role/permission CRUD unresolved | B |
| Integrations, backups, notification defaults, background checks | `settings.integrations`, `.backup`, `.notifications` | **no tables** | n/a | D |

**No category C.** Every operation the route tree implies has a canonical
permission code already. Nothing was invented, and nothing was blocked for
want of a permission — the blockers are contracts and tables.

### Why the church profile was safe, and why it matters

Its scope is not inferred. Three independent sources say the same thing:
`backend-domain-map.md` §5 lists `church_profile` in the "Tenant-wide only"
column; `backend-security-plan.md` §4.2 says tenant-wide reference data "is
readable across branches"; and Decision 4 above names the church profile when
it says branch scope is "opt-in per endpoint". So **no branch predicate
belongs on this endpoint**, and a principal with no branch assignments can
read and write it — which is Decision 4's own promise that an unassigned
principal "is not locked out of the application", executed against a real
endpoint for the first time rather than merely asserted.

The resource is a **singleton addressed from the security context**. The
church row *is* the tenant (ADR-005), so its identity is `context.tenant_id`
and the route takes no identifier at all. That is the strongest available form
of "never trust a client-supplied tenant id": there is nowhere to supply one.
A test asserts the OpenAPI operation exposes zero parameters, so a future
`{church_id}` path cannot be added without a deliberate decision.

This also closes the defence-in-depth gap Phase 2B-8 recorded. That addendum
observed that `members`' tenant predicate was enforced only *transitively*,
through the branch predicate, and that this "is fine until the first
tenant-wide endpoint". This is that endpoint: `Church.id == context.tenant_id`
is the whole of the isolation, with nothing behind it, and removing it now
fails four tests including a direct assertion on the compiled SQL.

### Read is gated on the manage permission, deliberately

No canonical code means "view the church profile". The catalogue offers
`settings.church-profile` ("Manage Church Profile") and the broader
`settings.view` ("Access settings overview and general configurations").
Both endpoints require the former.

Gating the read on the narrower code cannot over-grant. Choosing
`settings.view` would decide, by implementation, that every `Pastor` may read
the church's full profile — its leadership, finances-adjacent contact details
and history — and nothing in the repository makes that decision. Widening
later is a role-permission grant, which is *data*; narrowing later is a
breaking change. Recorded as **OQ-SEC-21**.

### Why branches stopped

`branches` has a table, a field contract (`branchCreateSchema`), and four
canonical permission codes. It stopped anyway, on scope rather than on
plumbing.

**The branch directory's own scope is unspecified (OQ-SEC-22).** Every
enumeration of tenant-wide reference data in this repository — Decision 4
above, `backend-security-plan.md` §4.2, `backend-domain-map.md` §5 — lists
*roles, categories, church profile* and never mentions branches. The
branch-scoped list does not mention it either, because `branches` is the
branch axis rather than a resource carrying a `branch_id`. Both readings are
defensible and they disagree: read literally, Decision 4's "applies only where
a resource is branch-scoped" makes the directory tenant-wide; read
cautiously, a single-branch Pastor should not see sibling branches' pastors,
phone numbers and addresses. Choosing either is a product decision, so neither
was taken.

**Creation has an unresolved reachability consequence (OQ-SEC-23).** Branch
access is assignment data with no role-based shortcut, so a branch created
through an API has **no `user_branch_assignments` rows and is therefore
reachable by nobody** — including the `SuperAdmin` who created it, whose
church-wide reach comes from the assignments provisioning gave it, not from
its role. The two exits are auto-assigning the creator, which is exactly the
implicit branch grant this ADR exists to forbid, or a user-branch-assignment
management endpoint, which needs `settings.users.edit` and a contract that
does not exist. This is the founding-administrator invariant reappearing one
level up, and it must be decided before `POST /settings/branches` is built,
not after.

**Deletion has unresolved referential consequences (OQ-DB-13).** `branches`
composes no `SoftDeleteMixin`, so a delete is a hard `DELETE`, while
`branch_scope_fk()` points every branch-scoped table at it with
`ondelete="RESTRICT"`. A branch with members cannot be deleted at all, and
nothing specifies whether the operation should archive, reassign or refuse.
`uq_branches_one_headquarters_per_tenant` adds a second question nobody has
answered: what happens to a church whose only headquarters is removed.

### Stopped items

| Domain | Endpoint / use case | Why authorization cannot safely be implemented | Relevant permission | Relevant ADR/OQ | Decision or contract required |
| :-- | :-- | :-- | :-- | :-- | :-- |
| Churches | `GET /settings/branches`, `GET /settings/branches/{id}` | Branch-directory read scope is unspecified; tenant-wide and assignment-scoped readings both have textual support and disagree | `settings.branches.view` | OQ-SEC-22, ADR-011 D4 | Is the branch directory tenant-wide reference data, or restricted to assigned branches? |
| Churches | `POST /settings/branches` | A created branch has no assignments, so nobody can act in it; the only remedies are an implicit branch grant (forbidden here) or assignment management (no contract) | `settings.branches.create` | OQ-SEC-23, ADR-011 D4 | Who is assigned to a new branch, and through which endpoint? |
| Churches | `PUT /settings/branches/{id}` | Same unspecified scope as the read, plus whether `type` may change (the one-headquarters index) | `settings.branches.edit` | OQ-SEC-22, OQ-DB-13 | Branch-write scope, and whether headquarters status is mutable |
| Churches | `DELETE /settings/branches/{id}` | No soft delete; `RESTRICT` foreign keys from every branch-scoped table; archive-versus-delete undecided | `settings.branches.delete` | OQ-DB-13, OQ-API-25 | Archive or hard delete, and what happens to dependent records and to a sole headquarters |
| Settings | `GET`/`PUT /settings` | Two of the response's three sections (`appearance`, `notifications`) have no table and no model | `settings.view`, `settings.system` | OQ-API-25 | A `settings` table and the `ChurchSettings` contract |
| Identity | `/settings/users/*` | User creation needs the login-identity model that is still open, and role assignment is unresolved | `settings.users.*` | OQ-AUTH-01, ADR-002 | Tenant-resolution model, then the user-provisioning contract |
| Identity | `/settings/roles/*`, permissions matrix | Role and permission CRUD is unresolved; editing a role edits live authority for every holder | `settings.roles.*`, `settings.permissions.manage` | ADR-003, ADR-008, OQ-API-25 | Which roles are editable, and what happens to holders of an edited role |
| Settings | Integrations, backups, notification defaults, background checks | No tables, no models, no contracts | `settings.integrations`, `.backup`, `.notifications` | OQ-API-25 | Whole-domain design |
| Public | Unauthenticated church profile | `backend-security-plan.md` §6 classifies "Church profile (public fields)" as PUBLIC but never says which fields are public | — | OQ-SEC-22 (adjacent) | The public field list, before any unauthenticated endpoint exists |
