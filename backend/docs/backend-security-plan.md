# EMC CMS — Backend Security Plan

**Status:** Phase 0 discovery output. No implementation.

Sources: `backend/AGENTS.md` §7–§11, `docs/architecture/security-boundary-map.md`, `docs/architecture/backend architecture.md` §12–§17, §36–§37, `lib/authorization/**`, `lib/audit/**`, `lib/errors/**`, `tests/unit/authorization.test.ts`, `api-documentations/Errors_Responses.md`.

---

## 1. Trust Boundaries

Three tiers, per `security-boundary-map.md` §1:

| Tier | Surface | Principal | Isolation model |
| :-- | :-- | :-- | :-- |
| **1 — Public** | `/(landing)/*` → public API | Anonymous | Rate limiting, input sanitisation, CAPTCHA/bot control, webhook signature verification. **Scope of this tier is unresolved — see OQ-SEC-01.** |
| **2 — Member self-service** | `/(member)/portal/*` → `/member/*` | Authenticated member | Self-scope: `subject.member_id == principal.member_id`, or a verified household link |
| **3 — Admin back-office** | `/(admin)/*` → all other routes | Authenticated staff user | Tenant + branch + RBAC + resource policy |

**Rule 3 of the boundary map is the governing principle: UI hiding is not security.** `hasPermission()` in the frontend is a UX affordance only. Every endpoint re-checks server-side, without exception.

---

## 2. Authentication

### 2.1 Mechanism
- JWT access token (short-lived) + rotating refresh token + server-side session record (`backend architecture.md` §12).
- `Authorization: Bearer <token>` on every protected route.
- Refresh tokens: rotatable, revocable, expirable, bound to a session/device, **stored as hashes**.
- Password hashing: **Argon2id**. The scaffold's `passlib[bcrypt]` must be replaced (see database plan OQ-DB-03).

### 2.2 Token claims
The login response contract (`API_DOCUMENTATION.md` POST /auth/login) requires the JWT-derived user object to carry:
```
user.id, user.email, user.name, user.avatar
user.role.name
user.role.tenantId
user.role.branchId
user.role.permissions[]   ← flat dot-notation array, consumed by hasPermission()
```
Server-side claims to embed: `sub` (user_id), `tid` (tenant_id), `bid` (active branch_id), `rid` (role_id), `sid` (session_id), `typ` (`admin`|`member`), `exp`, `iat`, `jti`.

**Permissions are resolved server-side from `role_permissions` on every request** — they are echoed into the response for UI convenience but are never trusted from the token payload for authorization decisions. A stale token must not carry a revoked permission.

### 2.3 Frontend coupling constraints
- `services/api-client.ts` clears `localStorage` and hard-redirects to `/login` on **any 401**. The backend must therefore return **403** — never 401 — for authorization and scope failures, or users get logged out when they merely lack a permission.
- Tokens live in `localStorage`, which is XSS-readable. Mitigations in scope: strict CSP, short access-token TTL, refresh rotation with reuse detection, and session revocation. **OQ-SEC-02**: should the backend also issue an `HttpOnly` refresh cookie?

### 2.4 Session controls
- `member_settings.session_timeout_minutes` (15–1440) and `two_factor_enabled` exist in `memberSecuritySettingsSchema`. **2FA has a schema and a settings toggle but no flow, no endpoint, and no backup-code model — OQ-SEC-03.**
- Login throttling: account lockout after N failures (`users.failed_login_count`, `locked_until`). No source specifies N — **OQ-SEC-04**.
- `POST /auth/forgot-password` must return an identical response whether or not the email exists (no account enumeration).

---

## 3. Authorization Model

**RBAC + policy-based**, per `backend/AGENTS.md` §8. `if user.role == "admin"` is explicitly forbidden.

### 3.1 Evaluation order

```
Request
  → authenticate            (401 if no/invalid token)
  → resolve tenant          (from token; never from body/query)
  → resolve branch scope    (from token + user_branch_assignments)
  → RBAC permission check   (403 if permission absent)
  → resource policy         (403: ownership / assignment / confidentiality / approval authority)
  → validate payload        (422)
  → application service
  → repository (tenant+branch predicate applied again)
  → audit write (same transaction)
  → response
```

Every layer re-applies scope. The repository predicate is not an optimisation — it is the last line of defence if a service forgets.

### 3.2 Admin permission catalogue (dot notation)

158 canonical codes from `lib/authorization/permissions.ts`. These are seeded verbatim into the `permissions` table; the backend **must not invent a parallel scheme** (`backend/AGENTS.md` §19).

| Group | Codes |
| :-- | :-- |
| Dashboard / Analytics | `dashboard.view`, `analytics.view`, `analytics.attendance`, `analytics.finance`, `analytics.demographics`, `analytics.report-builder`, `analytics.preferences`, `analytics.export` |
| Activity logs | `activity-logs.view`, `activity-logs.user`, `activity-logs.filter`, `activity-logs.export` |
| Members | `members.view`, `.create`, `.edit`, `.delete`, `.import`, `.export`, `.contact`, `.converts`, `.family`, `.documents`, `.giving`, `.history` |
| Attendance | `attendance.view`, `.take`, `.qr`, `.history`, `.reports`, `.groups`, `.department`, `.member`, `.edit`, `.delete` |
| Groups | `groups.view`, `.create`, `.edit`, `.delete`, `.categories`, `.members`, `.events`, `.roles`, `.attendance`, `.reports` |
| Departments | `departments.view`, `.create`, `.edit`, `.delete`, `.categories`, `.members`, `.roles`, `.meetings` |
| Sunday School | `sunday-school.view`, `.classes.view/create/edit/delete`, `.students.view/manage`, `.teachers.view/manage`, `.materials.view/manage`, `.attendance`, `.reports` |
| Finance — root | `finance.view`, `finance.export` |
| Finance — giving | `finance.giving.view`, `.manage`, `.categories`, `.donations`, `.pledges`, `.fundraising`, `.reports` |
| Finance — income | `finance.income.view`, `.create`, `.edit`, `.delete`, `.categories`, `.reports` |
| Finance — expenses | `finance.expenses.view`, `.create`, `.edit`, `.delete`, `.categories`, `.reports` |
| Finance — tithes | `finance.tithes.view`, `.create`, `.edit`, `.delete`, `.categories`, `.reports` |
| Finance — budgets | `finance.budgets.view`, `.create`, `.edit`, `.delete`, `.categories`, `.allocations`, `.reports` |
| Finance — reports | `finance.reports.view`, `.assets`, `.comparisons` |
| Prayer | `prayer-requests.view`, **`prayer-requests.view-confidential`**, `.create`, `.edit`, `.delete`, `.respond`, `.assign`, `.categories`, `.status` |
| Pastoral care | `pastoral-care.view`, `pastoral-care.manage` |
| Events | `events.view`, `.create`, `.edit`, `.delete`, `.calendar`, `.categories`, `.templates`, `.registrations`, `.attendance`, `.groups`, `.bulk`, `.export` |
| Assets | `assets.view`, `.create`, `.edit`, `.delete`, `.categories`, `.assignment`, `.maintenance`, `.reports`, `.export` |
| Communications | `communications.view`, `.messages`, `.campaigns`, `.announcements`, `.newsletters`, `.templates`, `.send` |
| Settings | `settings.view`, `.church-profile`, `.branches.view/create/edit/delete`, `.users.view/create/edit/delete/suspend`, `.roles.view/create/edit/delete`, `.permissions.manage`, `.notifications`, `.integrations`, `.backup`, `.system` |
| Profile | `profile.view`, `profile.edit`, `profile.security` |

**Gaps in the catalogue that the requirements depend on:**

| Missing code | Required by |
| :-- | :-- |
| `finance.expenses.approve` | `security-boundary-map.md` §3 ("Expense Approval / Disbursement → `finance.expenses.approve`"), README §6 |
| `finance.transactions.approve` | `backend/AGENTS.md` §8 example permission list |
| `finance.tithes.create` | referenced by name in `security-boundary-map.md` §3 — **it does exist** in `permissions.ts`; no gap |
| `pastoral-care.view-confidential` | implied by `backend/AGENTS.md` §9 ("Confidential pastoral information must be explicitly authorized") — pastoral care has only `view`/`manage`, no confidentiality tier, unlike prayer requests which do |
| `files.*` / `documents.*` | The File Vault (`/dashboard/files`) has **no permissions at all**; `members.documents` only covers member-scoped documents |
| `reports.*` | `/reports/*` endpoints are gated by nothing explicit; `analytics.*` is the closest |
| `converts.*` | covered by `members.converts` |
| `notifications.*` (admin) | no admin notification permissions exist |

> **OQ-SEC-05 — Permission catalogue gaps.** At minimum `finance.expenses.approve`, `pastoral-care.view-confidential`, and a `files.*` family must be added. Adding permissions changes `ROLE_PERMISSIONS` and therefore `tests/unit/authorization.test.ts`, so it is a coordinated frontend+backend change and needs sign-off.

### 3.3 Role → permission seed

From `lib/authorization/roles.ts` (authoritative):

| Role | Shape |
| :-- | :-- |
| `SuperAdmin` | all permissions (flattened from every category) |
| `Admin` | everything except `members.delete`, all `finance.*`, `settings.roles.delete`, `settings.users.delete/suspend`, `settings.permissions.manage`, `settings.branches.delete`, `attendance.delete`, `prayer-requests.delete`. **Notably has no finance access at all.** |
| `Pastor` | members (no delete/import/export), attendance, groups, departments (no create/delete), Sunday School read, prayer incl. `view-confidential`, pastoral care view+manage, events, communications incl. send, `settings.view`, `settings.branches.view` |
| `Accountant` | all of `finance.*`, `analytics.finance`, `analytics.report-builder`, `analytics.export`, `assets.*` (no delete), profile. **No member, attendance, or pastoral access.** |
| `Secretary` | members incl. import/export, attendance, groups (read+members+events), departments (read+members+meetings), events, communications, prayer view/create/status |
| `Teacher` | Sunday School full, `members.view`, `events.view/calendar`, profile |

> **OQ-SEC-06 — Role naming conflict.** `architecture-baseline.md` §3.2 lists roles as `SuperAdmin, Admin, Pastor, FinanceOfficer, DepartmentLeader`; `README` §17 lists `Super Admin, Branch Pastor, Finance Officer, Membership Admin, Sunday School Leader, Department Lead, Usher/Data Entry`; `lib/authorization/roles.ts` (and the passing unit test) defines `SuperAdmin, Admin, Pastor, Accountant, Secretary, Teacher`. **The code wins** — seed the six from `roles.ts`. Confirm whether the README's seven are aspirational custom roles.

### 3.4 Member permission catalogue (colon notation)

22 codes from `lib/authorization/member-permissions.ts`:
`profile:read:self`, `profile:update:self`, `family:read:self`, `family:update:self`, `attendance:read:self`, `attendance:checkin:self`, `giving:read:self`, `giving:statement:download`, `groups:read:self`, `ministries:read:self`, `events:read`, `events:register`, `journey:read:self`, `prayer:create`, `prayer:read:self`, `pastoral-care:create`, `pastoral-care:read:self`, `resources:read`, `notifications:read:self`, `notifications:update:self`, `settings:update:self`.

`DEFAULT_MEMBER_PERMISSIONS` grants **all** of them to every member.

> **OQ-SEC-07 — Member permission storage.** `hasMemberPermission` defaults to granting everything when no list is passed (`lib/authorization/member-guards.ts`). Server-side this must be fail-closed. Are member permissions stored per member (revocable — e.g. a disciplined member losing `prayer:create`), or is the set fixed for all members?

> **OQ-SEC-08 — Two permission notations.** Admin uses `domain.resource.action`, member uses `domain:action:self` (`security-boundary-map.md` Rule 4). Additionally the finance API docs use a **third** notation (`giving:read`, `income:write`, `expenses:read`) for *admin* operations. That third scheme must be discarded in favour of the `permissions.ts` dot notation.

### 3.5 Resource policies (beyond RBAC)

`backend/AGENTS.md` §8 requires policies to also evaluate tenant, branch, role, ownership, assignment, confidentiality and approval authority.

| Policy | Rule |
| :-- | :-- |
| `MemberSelfPolicy` | `resource.member_id == principal.member_id`, or `resource.member_id` is in the principal's **verified** household (`family_relationships` with an approved link) |
| `BranchScopePolicy` | `resource.branch_id ∈ principal.assigned_branch_ids` (or branch-unrestricted role) |
| `PastoralCasePolicy` | see §5 |
| `ConfidentialPrayerPolicy` | `is_confidential ⇒ requires prayer-requests.view-confidential`; `privacy='Pastoral Team Only'` ⇒ same |
| `ExpenseApprovalPolicy` | approver ≠ requester; requires `finance.expenses.approve`; approver's branch covers the expense; amount may need a threshold ladder — **OQ-SEC-09** |
| `DocumentAccessPolicy` | member documents in `medical`/`legal`/`financial` categories require elevated permission, not just `members.documents` |
| `ChildRecordPolicy` | Sunday School student medical/allergy/pickup data and teacher background checks are CONFIDENTIAL — restricted to `sunday-school.students.manage` + safeguarding role — **OQ-SEC-10** |
| `FileDownloadPolicy` | signed URLs are minted only after policy evaluation, are short-lived, and are single-purpose |

---

## 4. Tenant & Branch Isolation

### 4.1 Tenant

Four enforcement layers (`backend/AGENTS.md` §7, `backend architecture.md` §10):

1. **API/context** — `PrincipalContext.tenant_id` derived from the verified JWT. Client-supplied `tenantId`/`church_id` in body, query, or `X-Tenant-ID` header is **ignored** for authorization. If present and mismatched → reject.
2. **Service** — every application service takes the principal and passes tenant scope down; no service accepts a caller-chosen tenant.
3. **Repository** — every query carries `WHERE tenant_id = :tenant_id`. Base repository methods take `tenant_id` as a required argument (cf. `backend architecture.md` §24: `get_by_id(member_id, church_id)`).
4. **Database** — Row-Level Security on the highest-sensitivity tables (`pastoral_*`, `prayer_requests`, `member_documents`, `giving`, `expense_records`, `audit_logs`), driven by `SET LOCAL app.current_tenant_id` per request. Requires a non-superuser application DB role.

### 4.2 Branch

- `assigned_branch_ids` comes from `user_branch_assignments`.
- `lib/authorization/scope.ts::validateBranchScope` treats an **empty** assignment list as unrestricted. Server-side this should be **fail-closed** unless the role is explicitly branch-unrestricted — **OQ-SEC-11** (mirrors domain OQ-16).
- Branch switching within a tenant re-validates against assignments (`security-boundary-map.md` Rule 1).
- Tenant-wide reference data (categories, roles, church profile) is readable across branches; operational data is not.

### 4.3 SuperAdmin

`validateTenantScope` and `validateBranchScope` both return early for `isSuperAdmin`. If `SuperAdmin` is a *tenant* role (per `ROLE_PERMISSIONS`, which grants it tenant-level permissions), then bypassing **tenant** scope is a cross-church data leak.

> **OQ-SEC-12 — SuperAdmin scope.** Recommended split: `PlatformOperator` (crosses tenants, for support/ops, heavily audited) vs `SuperAdmin` (all permissions within one tenant, never crosses tenants). Until resolved, the backend should **not** bypass tenant scope for any role. Mirrors domain OQ-17.

### 4.4 Cross-tenant response code

`Errors_Responses.md` §3 specifies `403 FORBIDDEN` with a `details.tenantId` echo. That both confirms the resource exists and echoes a tenant id. Recommended: `404 NOT_FOUND` for cross-tenant reads, `403` for in-tenant permission failures, and never echo a tenant id in an error body. **OQ-SEC-13** (mirrors domain OQ-15).

---

## 5. Pastoral Care Confidentiality Boundary

The strongest boundary in the system (`backend/AGENTS.md` §9, `backend architecture.md` §17).

**Rule: pastoral records are never returned merely because a user can view the member profile.**

Access to a `pastoral_case` requires **all** of:
1. `pastoral-care.view` (or `.manage` for writes), **and**
2. the case's `branch_id` ∈ principal's assigned branches, **and**
3. principal is the assigned pastor, or a member of `pastoral_case_assignments` for that case, or holds an explicit override role, **and**
4. for `pastoral_sessions.confidential_notes`: an explicit confidentiality permission (does not currently exist — OQ-SEC-05).

Worked examples from `backend architecture.md` §17:
- Pastor A (assigned) → read/write ✅
- Pastor B (has `pastoral-care.view`, not assigned) → **denied** ❌
- Accountant (no pastoral permission) → denied ❌
- Admin role: has `pastoral-care.view` + `.manage` per `ROLE_PERMISSIONS` — **OQ-SEC-14: should a general Admin see counselling notes?** The current role matrix says yes. The confidentiality requirement suggests no.

**Additional controls:**
- Every read of a pastoral case or session emits an audit event (`backend architecture.md` §25 lists "Pastoral record access" as a sensitive action — read-auditing, not just write-auditing).
- Pastoral data never appears in analytics aggregates, exports, member 360 profiles, or search results unless the requester passes the full policy.
- Member self-scope (`pastoral-care:read:self`) returns **the member's own request record only** — never `confidential_notes`, never another member's case, never the pastor's internal summary.
- `prayer_requests` with `is_confidential` / `privacy='Pastoral Team Only'` follow the same pattern via `prayer-requests.view-confidential`.

---

## 6. Data Classification

Per `backend architecture.md` §37, extended with the concrete tables:

| Class | Data | Controls |
| :-- | :-- | :-- |
| **PUBLIC** | Church profile (public fields), published events, sermons, service times, leadership bios | No auth; rate-limited; cacheable |
| **INTERNAL** | Members, families, attendance, groups, departments, events, assets, announcements, resources | Tenant + branch + RBAC |
| **CONFIDENTIAL** | Giving, tithes, donations, income, expenses, budgets, pledges; pastoral cases & sessions; counselling notes; confidential prayer requests; child safeguarding (medical info, allergies, authorised pickup, background checks); member documents in `medical`/`legal`/`financial`; audit logs; credentials & tokens | Tenant + branch + RBAC + resource policy + read-auditing; RLS candidates; no caching; excluded from generic search/export |

**Never logged, never in an error body, never in an audit `before`/`after` diff:** password hashes, JWTs, refresh tokens, reset tokens, QR check-in tokens, payment credentials, `confidential_notes`, `pastoral_notes`, child medical data. Audit diffs must run through a field redaction allow-list.

---

## 7. Audit Requirements

### 7.1 Record shape

Reconciling `lib/audit/audit-logger.ts`, `security-boundary-map.md` §4, and `backend architecture.md` §25 (see domain OQ-13). Proposed superset, stored in `audit_logs`:

```
id, timestamp, tenant_id, branch_id?,
actor { id, email, name, role },
action,                     e.g. "finance.expense.approved"
entity_type, entity_id, entity_name?,
status  SUCCESS | FAILURE,
before  JSONB (redacted), after JSONB (redacted),
metadata JSONB,
ip_address, user_agent, request_id
```
The API response shape for `/activity-logs` must match whichever of the three the frontend settles on — **OQ-SEC-15**.

### 7.2 Mandatory audited actions

From `security-boundary-map.md` §3 (all of these are required, with the listed permission and event name):

| Domain | Action | Permission | Event |
| :-- | :-- | :-- | :-- |
| IAM | Role assignment / change | `settings.roles.edit` | `iam.role.assigned` |
| IAM | Branch create / modify | `settings.branches.create` | `iam.branch.updated` |
| Finance | Expense approval / disbursement | `finance.expenses.approve` *(missing — OQ-SEC-05)* | `finance.expense.approved` |
| Finance | Tithe / giving entry | `finance.tithes.create` | `finance.giving.recorded` |
| Finance | Budget modification / allocation | `finance.budgets.create` | `finance.budget.modified` |
| Members | Create / delete | `members.create` / `members.delete` | `members.record.mutated` |
| Members | Bulk CSV import | `members.import` | `members.bulk.imported` |
| Communications | Mass SMS / email broadcast | `communications.send` | `communications.campaign.sent` |
| Attendance | Roll-call submission | `attendance.take` | `attendance.session.recorded` |
| Pastoral care | Log counselling / hospital case | `pastoral-care.edit` *(code is `pastoral-care.manage` — naming mismatch)* | `pastoral.case.recorded` |
| Member portal | Profile update | `profile:update:self` | `member.profile.updated` |
| Member portal | Confidential prayer submitted | `prayer:create` | `member.prayer.submitted` |
| Member portal | Pastoral counselling requested | `pastoral-care:create` | `member.pastoral.requested` |
| Member portal | Event RSVP | `events:register` | `member.event.registered` |
| Public | Online donation received | anonymous (gateway webhook) | `donation.public.received` |

Plus, from `backend architecture.md` §25: user creation, permission changes, **pastoral record access (read)**, **document access (read)**, configuration changes.

Plus, recommended and not in any source: failed authentication, failed authorization (403), tenant-isolation violations, session revocation, data export, and every financial mutation regardless of type. **OQ-SEC-16.**

### 7.3 Immutability

- `audit_logs` has no `UPDATE`/`DELETE` path in application code, and the application DB role has those grants **revoked**. Application-level discipline alone does not make a trail immutable.
- The audit insert shares the transaction with the mutation, so a rollback discards both and a committed mutation always has its record.
- Retention and archival policy is unspecified — **OQ-DB-09**.

---

## 8. Input Validation

- **Backend validation is mandatory regardless of frontend validation** (`backend/AGENTS.md` §6). Every Zod schema in `lib/validation/**` has a Pydantic v2 counterpart; the Pydantic model is authoritative.
- Constraints that must be re-expressed server-side (non-exhaustive): password ≥8 with uppercase+digit (member), amounts strictly positive, income amount < 1,000,000, income date ≤ +1 year, SMS ≤1600 chars, prayer title 5–120 / description 10–1000, pastoral reason 10–1000, `limit ≤ 100` on paginated queries, giving amount 1–100,000 per transaction (`giveNowSchema`).
- Database constraints are the final integrity layer (`backend/AGENTS.md` §6).
- All SQL through SQLAlchemy parameter binding; no string interpolation.
- Uploads: extension + MIME sniffing + size cap + virus scan hook; never trust `Content-Type`; store under generated keys, never the client filename; strip EXIF from images.
- **OQ-SEC-17:** file size/type limits differ by source (5 MB for expense attachments; unspecified elsewhere). Need a single policy table.

---

## 9. Transport & Infrastructure Controls

| Control | Requirement | Source |
| :-- | :-- | :-- |
| TLS | HTTPS everywhere in production; HSTS | `API_DOCUMENTATION.md` §Security |
| CORS | Explicit allow-list. Current default `http://localhost:3000,http://127.0.0.1:3000` — production origins must be configured, `allow_origins=["*"]` never used with `allow_credentials=True` | `backend/app/main.py`, `backend/.env.example` |
| Security headers | CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy | `backend architecture.md` §36 |
| Rate limiting | Redis-backed. Documented budgets: 1000 req/hour/user general; giving 100/min standard, 20/min reports, 5/min exports; login and forgot-password need much tighter per-IP limits (unspecified — **OQ-SEC-18**) | `api-documentations/Giving_Endpoints.md`, `Income_Endpoints.md` |
| Secrets | Never hard-coded (`backend/AGENTS.md` §19). `config.py` ships a literal default `SECRET_KEY` — must fail startup in non-development if unset — **OQ-SEC-19** |
| Request ID | Every request carries a correlation id, propagated into logs and audit records | `backend architecture.md` §30 |
| Error leakage | No stack traces, SQL, connection strings, or internal service details in responses | `Errors_Responses.md` §6 |
| File access | Signed, short-lived URLs only; no public buckets | `backend architecture.md` §18 |
| Caching | Redis for church config, permission definitions, public listings, rate limits. **Never** cache financial or pastoral data | `backend architecture.md` §27 |

---

## 10. Security Test Requirements

`backend/AGENTS.md` §16 requires stronger coverage for finance, authentication, authorization, tenant isolation, pastoral confidentiality, and audit logging. Concretely, before any domain is "done":

1. **Tenant isolation** — for every tenant-scoped endpoint: user from tenant A cannot read, update, or delete a tenant B resource by id. Parameterised across all endpoints, not sampled.
2. **Branch isolation** — a branch-restricted user cannot reach another branch's records; branch switching to an unassigned branch is rejected.
3. **Permission matrix** — for each endpoint, one test per role asserting allow/deny against `ROLE_PERMISSIONS`.
4. **Pastoral confidentiality** — unassigned pastor denied; accountant denied; member self-scope returns the request without confidential notes; every read produces an audit record.
5. **Financial integrity** — breakdown records excluded from every aggregate; pledged amounts never in totals; pledge payment creates exactly one countable giving row; expense approval requires a different actor; rollback discards both mutation and audit.
6. **Auth** — expired/tampered/revoked token rejected; refresh rotation; reuse detection; lockout; no account enumeration on forgot-password.
7. **Audit** — every action in §7.2 produces a record with the right actor, scope, and redacted diff; no `UPDATE`/`DELETE` path exists.
8. **Validation** — every Pydantic model rejects the boundary cases its Zod counterpart rejects.

---

## 11. Open Questions — Security Layer

| ID | Question |
| :-- | :-- |
| **OQ-SEC-01** | Is the public (Tier 1) API in scope? Anonymous prayer, contact form, public RSVP, and the online giving gateway + payment webhook are all described but entirely unimplemented and unspecified. |
| **OQ-SEC-02** | Keep tokens in `localStorage` (current frontend behaviour) or move refresh to an `HttpOnly` cookie? The latter changes `api-client.ts`. |
| **OQ-SEC-03** | 2FA: `twoFactorEnabled` exists in `memberSecuritySettingsSchema` with no flow, endpoint, TOTP secret storage, or backup codes. In scope? |
| **OQ-SEC-04** | Login lockout threshold, window, and unlock mechanism unspecified. |
| **OQ-SEC-05** | Permission catalogue gaps: `finance.expenses.approve`, `pastoral-care.view-confidential`, a `files.*` family, admin `notifications.*`. Adding them touches `ROLE_PERMISSIONS` and the frontend test suite. |
| **OQ-SEC-06** | Three conflicting role lists (code / baseline doc / README). Code is recommended as authoritative. |
| **OQ-SEC-07** | Are member permissions per-member and revocable, or a fixed set for all members? `hasMemberPermission` currently defaults to fail-open. |
| **OQ-SEC-08** | Three permission notations in play; the finance API docs' `giving:read`-style admin codes must be discarded. Confirm. |
| **OQ-SEC-09** | Does expense approval need an amount-threshold ladder (e.g. > ₵10,000 needs a second approver)? No source specifies one. |
| **OQ-SEC-10** | Child safeguarding: who may read student medical/allergy/pickup data and teacher background checks? `sunday-school.students.view` currently grants the whole record, and `Teacher` role has `students.manage`. |
| **OQ-SEC-11** | `validateBranchScope` fail-open on an empty assignment list — intended? |
| **OQ-SEC-12** | Does `SuperAdmin` cross tenant boundaries? Recommend splitting `PlatformOperator` from tenant `SuperAdmin`. |
| **OQ-SEC-13** | Cross-tenant response: documented `403` with tenant echo vs recommended `404` with no echo. |
| **OQ-SEC-14** | Should the general `Admin` role see pastoral counselling notes? `ROLE_PERMISSIONS` currently grants `pastoral-care.view` + `.manage` to Admin, which sits awkwardly with the confidentiality requirement. |
| **OQ-SEC-15** | Which audit record shape is the wire contract for `/activity-logs`? Three exist. |
| **OQ-SEC-16** | Should failed auth, failed authz, tenant-violation attempts, exports, and session revocations be audited? Not listed in any source but standard practice. |
| **OQ-SEC-17** | Single file size/type policy needed (5 MB is specified only for expense attachments). |
| **OQ-SEC-18** | Rate limits for login, forgot-password, member QR issuance, and public endpoints are unspecified. |
| **OQ-SEC-19** | `config.py` ships a literal default `SECRET_KEY`. Confirm that non-development startup must fail when it is unset, and add a startup assertion. |
| **OQ-SEC-20** | Data-subject rights / deletion: is there any requirement to erase a member's personal data on request, and how does that interact with immutable audit logs and retained financial records? |
