# EMC CMS — Backend API Map

**Status:** Phase 0 discovery output. No implementation.

This document reconciles three sources of API truth and ranks them:

| Rank | Source | Weight |
| :-- | :-- | :-- |
| **1 — BINDING** | Paths actually issued by `services/**` through `services/api-client.ts` | The frontend will break if these change. Highest authority. |
| **2 — DOCUMENTED** | `API_DOCUMENTATION.md` and `api-documentations/*.md` | Authoritative for shape/payload where no wired call exists. |
| **3 — DERIVED** | Method signatures of mock-backed services (`attendance`, `groups`, `departments`, `sunday-school`, `finance`, all of `services/member/*`) | Shape is real (types + Zod are real); the *path* must be agreed. Flagged below. |

`backend/CLAUDE.md` §4 forbids inventing contracts where one is documented, and forbids silently changing frontend behaviour. Where rank 1 and rank 2 disagree, **rank 1 wins and the doc is treated as stale**, and the disagreement is logged as an OPEN QUESTION.

---

## 0. Global Conventions

### 0.1 Base path — **RESOLVED**

`/api/v1` everywhere. `backend/CLAUDE.md` §12 and `backend architecture.md` §21/§32 mandated it, and the sources that still said `/api` were aligned to it.

| Source | Value |
| :-- | :-- |
| `backend/app/config.py` | `API_V1_STR = "/api/v1"` |
| `services/api-client.ts` | `process.env.NEXT_PUBLIC_API_URL \|\| 'http://localhost:8000/api/v1'` |
| `API_DOCUMENTATION.md`, `api-documentations/*` | `http://localhost:8000/api/v1` |
| `README.md` (env table and setup) | `http://localhost:8000/api/v1` |

> **OQ-API-01 — Version prefix. Closed.** Option (b) was taken: adopt `/api/v1` and update the frontend's base URL. This was a one-line code change plus documentation, not a frontend redesign, and is permitted under `backend/CLAUDE.md` §5. No aliasing of `/api` is served — one canonical prefix means a stale client fails loudly with a 404 rather than silently pinning itself to an unversioned surface.

### 0.2 Response envelope

Success (single):
```json
{ "success": true, "data": { }, "message": "..." }
```
Success (paginated) — **two shapes exist in the wild:**
```json
{ "success": true, "data": [ ], "total": 120, "page": 1, "limit": 20, "totalPages": 6 }
```
```json
{ "success": true, "data": { "data": [ ], "total": 150, "page": 1, "limit": 10, "totalPages": 15 } }
```
The nested form is used by `GET /members` in `API_DOCUMENTATION.md`; the flat form by `Errors_Responses.md`. Frontend `PaginatedResponse<T>` (`lib/types/common.ts`) expects the **flat** `{ data, total, page, limit, totalPages }` shape, and `MembersService.getMembers` returns `response.data` directly.

> **OQ-API-02 — Pagination envelope.** Standardise on the flat shape (matches `PaginatedResponse<T>` and `Errors_Responses.md`), or preserve the nested shape for `/members` only?

Some services expect **bare** payloads with no envelope at all: `GivingService.getGiving` returns `response.data` and types it as `Giving`, not `{success,data}`. `AssetService`, `IncomeService`, `ExpenseService`, `BudgetService` likewise consume `{ data, total, page, limit, totalPages }` without `success`.

> **OQ-API-03 — Envelope consistency.** Should *every* endpoint carry `success`, or do finance list endpoints return the bare `{data,total,...}` the services currently destructure? This must be settled before the first endpoint ships.

### 0.3 Errors

Canonical from `api-documentations/Errors_Responses.md`:

| Status | `code` | Trigger |
| :-- | :-- | :-- |
| 400 / 422 | `VALIDATION_ERROR` | schema failure; `errors: [{field, message}]` |
| 401 | `UNAUTHENTICATED` | missing/expired bearer token |
| 403 | `FORBIDDEN` | RBAC failure or cross-tenant/branch access |
| 404 | `NOT_FOUND` | entity absent within active tenant scope |
| 409 | `CONFLICT` | uniqueness / state conflict |
| 500 | `INTERNAL_SERVER_ERROR` | never leaks stack traces, SQL, or secrets |

`backend architecture.md` §29 proposes a nested `{ "error": { code, message, details } }` shape instead. **The flat `Errors_Responses.md` shape wins** — it matches `lib/errors/app-error.ts` (`statusCode`, `code`, `details`) and the frontend interceptors.

Frontend error consumption: `services/api-client.ts` reads `error.response.data.message` everywhere, and hard-redirects to `/login` on **any** 401. Backend must therefore never return 401 for authorization failures (use 403), or the user is logged out spuriously.

### 0.4 Auth transport

`Authorization: Bearer <jwt>` on every protected route. Token read from `localStorage`. Refresh via `POST /auth/refresh`.

---

## 1. Identity & Auth — `/auth`

**Rank 1 (BINDING).**

| Method | Path | Request | Response | Permission |
| :-- | :-- | :-- | :-- | :-- |
| POST | `/auth/login` | `{email, password}` (`loginSchema`, password ≥6) | `{success, data:{user, token, refreshToken}, message}` — `user.role = {name, tenantId, branchId, permissions[]}` | public, **rate-limited per IP** ([ADR-013](./adr/013-login-rate-limiting.md)) — *implemented; no `refreshToken` (no session/refresh-token architecture yet)* |
| POST | `/auth/register` | `{name, email, password, role?, branchId?}` (`registerSchema`, password ≥8) | same as login | **not public.** OQ-API-04 resolved by [ADR-002](./adr/002-controlled-self-registration.md): tenant-bound via a server-resolved registration token. `registerSchema`'s client-supplied `role`/`branchId` is the shape ADR-002 rejected. *Deferred pending the token mechanism.* |
| POST | `/auth/logout` | — | `{success, message}` | authenticated — *deferred.* Documented behaviour is "invalidate token"; no revocation store exists and ADR-011 defers the session model. A stateless 200 would claim success while the token stayed valid to expiry. |
| POST | `/auth/refresh` | `{refreshToken}` | `{token, refreshToken}` | valid refresh token — *deferred.* No `refresh_tokens` table, no session model. |
| GET | `/auth/me` | — | `{success, data: User}` | authenticated — *implemented* |
| PUT | `/auth/profile` | `Partial<User>` | `{success, data: User, message}` | `profile.edit` — *deferred.* No self-service schema (`userAccountUpdateSchema` is the admin form, carrying `role`/`status`); `name` vs `first_name`/`last_name` unresolved; and self-service **email** change can manufacture the OQ-AUTH-01 ambiguity across two tenants. |
| PUT | `/auth/change-password` | `{currentPassword, newPassword}` (≥8) | `{success, message}` | `profile.security` — *implemented* |
| POST | `/auth/forgot-password` | `{email}` | `{success, message}` | public, rate-limited — *deferred.* No reset-token store and **no email infrastructure at all** (no SMTP config, no `EmailProvider`, no Celery task). |
| POST | `/auth/reset-password` | `{token, newPassword}` | `{success, message}` | reset token — *deferred.* Same missing reset-token store; lifetime and one-time-use policy unspecified. |

> **Remaining `/auth` endpoints — concrete blockers (re-audited, Phase 2B-10).**
> Each is blocked by a missing *mechanism*, not a missing decision about shape.
> The database has nine tables and none of them stores a session, a refresh
> token, a reset token or a registration token.
>
> | Endpoint | Blocker | What it needs first |
> | :-- | :-- | :-- |
> | `POST /auth/logout` | Access tokens are stateless and there is no revocation list, so a "logged out" response would be false while the token still works | A session or denylist model |
> | `POST /auth/refresh` | No refresh-token model. `auth-service.refreshToken()` reads `localStorage.refreshToken` and posts it, and the documented login response advertises a `refreshToken` the backend does not issue | Session/refresh architecture |
> | `POST /auth/register` | ADR-002 requires a server-resolved registration token; no `registration_tokens` table, issuing surface or redemption contract exists. `registerSchema`'s client-supplied `role`/`branchId` is exactly the shape ADR-002 rejects | The registration-token mechanism |
> | `POST /auth/forgot-password`, `POST /auth/reset-password` | No reset-token storage and no email delivery infrastructure | Token table + mail provider |
> | `PUT /auth/profile` | Self-service mutation cannot be scoped safely while OQ-AUTH-01 is open: `email` is the login identity, and changing it changes which account an ambiguous address resolves to. Tenant, role, status and branch authorization must never be self-mutable | OQ-AUTH-01, then a writable-field contract |

**Login response contract is load-bearing.** `AuthContext` and every `hasPermission()` call depend on `user.role.permissions` being the flat dot-notation array. `user.role.tenantId` and `user.role.branchId` in the documented sample must also be populated.

> **~~OQ-API-04~~ — Resolved by [ADR-002](./adr/002-controlled-self-registration.md).** Registration is **not** public self-registration: it is tenant-bound, with the church resolved server-side from a registration token or church-specific link, never from a client-supplied field. The original concern — "which `church_id` would a self-registered user land in?" — is answered by never letting the client name one. Implementation is deferred: no `registration_tokens` table, no issuing surface and no redemption contract exist yet. See the Phase 2B-6 addendum to [ADR-012](./adr/012-login-identity-and-credential-failure.md).

> **OQ-API-05 — Member portal login.** No `/auth/member/login` exists. Do members use `/auth/login` with a member role, or a separate credential store? Blocks the whole `/member/*` surface. (See domain OQ-01.)

**Not wired but documented / implied by UI, needs a contract:**
`GET|POST|PUT|DELETE /settings/users`, `/settings/roles`, `/settings/permissions`, `/settings/branches`, `/settings/church-profile`, `/onboarding` — see §14.

---

## 2. Members — `/members`

**Rank 1 (BINDING).**

| Method | Path | Notes |
| :-- | :-- | :-- |
| GET | `/members` | query: `page, limit, search, status, gender, sortBy, sortOrder`. `memberSearchSchema` caps `limit ≤ 100`. **Implemented** — `members.view`, tenant + assigned-branch scoped, **flat** paginated envelope (what `MembersService.getMembers` destructures). `ageGroup` not offered: no age-band definitions exist. |
| GET | `/members/{id}` | full member — **implemented**, `members.view`. Out-of-scope ids return **404**, never 403. |
| POST | `/members` | `memberCreateSchema` — **implemented**, `members.create`. Branch validated against assignments; omitted branch falls back to the caller's primary. Accepts only fields the `members` table stores (see divergence note below). |
| PUT | `/members/{id}` | `memberUpdateSchema` (partial) — **implemented**, `members.edit`. Current *and* target branch both validated, so an update cannot relocate a member out of the caller's reach. |
| DELETE | `/members/{id}` | **not implemented** — blocked on **OQ-API-06** (soft archive vs hard delete). |
| POST | `/members/bulk-delete` | `{ids: string[]}` |
| POST | `/members/{id}/photo` | `multipart/form-data`; returns `{avatar}` |
| GET | `/members/search` | `?q=` → `Member[]` |
| GET | `/members/stats` | counts + demographics |
| GET | `/members/export` | `responseType: blob` — CSV/Excel |
| POST | `/members/import` | `multipart/form-data`, returns `{success: number, errors: []}` — **async, see jobs** |
| GET | `/members/{id}/history` | `any[]` timeline |

**Families (sub-resource of members):**

| Method | Path | Request |
| :-- | :-- | :-- |
| GET | `/members/{id}/family` | → `Member[]` |
| POST | `/members/{id}/family` | `multipart/form-data` — `familyMemberAddSchema` (create a *new* member in the household) |
| POST | `/members/{id}/family/link` | `{familyMemberId, relationship}` — link an *existing* member |
| DELETE | `/members/{id}/family/{familyMemberId}` | unlink |

**Converts — Rank 2 (DOCUMENTED, not wired).** `api-documentations/Convert_Management_Endpoints.md` specifies: `POST /members/converts`, `GET|PUT /members/{id}/convert`, `POST /members/{id}/convert/promote`, `GET /converts`, `GET /converts/stats`, `GET /converts/search`, `DELETE /converts/{id}`, `POST /converts/bulk-delete`, `POST /converts/{id}/activity`, `GET /converts/{id}/activities`. Request shape from `newConvertSchema` / `convertFollowUpSchema`.

> **Field divergence (Phase 2B-8).** `memberCreateSchema` carries `maritalStatus`, `occupation`, `familyId` and a `branch` *name*, none of which exist as columns on `members`. The backend **rejects** them rather than accepting and dropping them, which would look like a successful write that lost data. Closing this needs either a migration (Members-domain work, not authorization work) or a decision to drop the fields from the form.

> **OQ-API-02 note (Phase 2B-8).** `/members` ships the **flat** envelope, matching `PaginatedResponse<T>`, `MembersService.getMembers` and `Errors_Responses.md`. That settles the shape *for this endpoint only*; OQ-API-02 stays open, because `api-documentations/Pastoral_Care` still specifies a third shape and no endpoint exists yet to reconcile it against.

> **OQ-API-06 — Member deletion semantics.** `membershipStatus` includes `Archived`/`Transferred`, and `members.delete` is withheld from the `Admin` role (only `SuperAdmin` has it — see `ROLE_PERMISSIONS`). Is `DELETE /members/{id}` a soft archive or a hard delete? Financial and attendance history reference `member_id`; a hard delete would orphan audit-relevant records.

---

## 3. Member Documents — `/documents`, `/members/{id}/documents`

**Rank 1 (BINDING).**

| Method | Path |
| :-- | :-- |
| GET | `/members/{memberId}/documents` |
| POST | `/members/{memberId}/documents` (multipart) |
| GET | `/members/{memberId}/documents/export` (blob) |
| GET | `/documents/{id}` |
| PUT | `/documents/{id}` |
| DELETE | `/documents/{id}` |
| POST | `/documents/bulk-delete` |
| GET | `/documents/{id}/download` (blob) |
| GET | `/documents/{id}/preview` |
| POST | `/documents/{id}/share` |
| GET | `/documents/shared` |
| PATCH | `/documents/{id}/tags` |
| GET | `/documents/tags` |
| GET | `/documents/categories` |
| GET | `/documents/search` |

`Document` shape from `lib/types/common.ts`; `DocumentCategory` enum includes `medical`, `legal`, `financial` — these carry heightened access requirements (see security plan §6).

Documented but not wired: `GET /documents/stats`.

---

## 4. Finance — Giving `/giving`

**Rank 1 (BINDING) — and this section contradicts the docs badly.**

| Method | Path | Wired by | Notes |
| :-- | :-- | :-- | :-- |
| GET | `/giving/search` | `searchGiving` | `GivingSearchParams` incl. `excludeBreakdowns` |
| GET | `/giving/{id}` | `getGiving` | bare `Giving`, no envelope |
| POST | `/giving/individual` | `createIndividualGiving` | `GivingFormData`; `memberId` required unless `isAnonymous` |
| POST | `/giving/congregational` | `createCongregationalGiving` | `GivingFormData` + `identifiedContributions[]` |
| PUT | `/giving/{id}` | `updateGiving` | |
| DELETE | `/giving/{id}` | `deleteGiving` | |
| POST | `/giving/bulk-delete` | `bulkDeleteGiving` | `{givingIds: string[]}` |
| GET | `/giving/stats` | `getGivingStats()` | `?excludeBreakdowns=true` |
| GET | `/giving/types` | | reference list |
| GET | `/giving/categories` | | reference list |
| POST | `/giving/{id}/receipt` | | → `{receiptUrl, receiptNumber}` |
| POST | `/giving/{id}/receipt/send` | | `{email}` |
| GET | `/giving/campaigns` · `/giving/campaigns/{id}` | | `FundraisingCampaign` |
| POST | `/giving/campaigns` · PUT · DELETE `/giving/campaigns/{id}` | | |
| GET | `/giving/pledges` · `/giving/pledges/{id}` | | `Pledge` |
| POST | `/giving/pledges` · PUT · DELETE `/giving/pledges/{id}` | | |
| POST | `/giving/pledges/{id}/payments` | | `PledgePaymentFormData` → creates a `Giving` row |
| GET | `/members/{id}/giving` | | member ledger |
| POST | `/members/{id}/giving` | | legacy member-scoped create |
| GET | `/members/{id}/giving/stats` · `/analytics` · `/trends` · `/export` | | |

**Conflicts with `api-documentations/Giving_Endpoints.md`** (rank 2), which specifies a wholly different tree: `/giving/donations`, `/giving/donations/{id}/receipt`, `/giving/categories/{id}` CRUD, `/giving/reports/summary|by-category|by-member|trends|pledges`, `POST /giving/reports/export`, `GET /members/{id}/giving/summary`, `GET /giving/pledges/{id}/payments`.

> **OQ-API-07 — Giving surface.** The wired tree (`/giving/individual`, `/giving/congregational`, `/giving/search`) and the documented tree (`/giving/donations`, `/giving/reports/*`) are disjoint. Which is the target? **Recommendation:** implement the wired tree as primary (it encodes the congregational/breakdown model that the docs lack), and additionally implement `/giving/reports/*` and `/giving/categories` CRUD from the doc, since `dashboard/finance/giving/reports` and `.../giving/categories` routes exist in the app but are mock-fed.

> **OQ-API-08 — Donations.** `Donation` is a distinct type with its own admin routes (`/finance/giving/donations/*`) and its own Zod schema, but there is **no wired donation endpoint** and `financeService.getDonations()` is mock-only. Are donations `Giving` rows with `type=donation`, or a separate resource at `/giving/donations` per the doc? (See domain OQ-02.)

**Financial rules that the API must enforce (from `lib/types.ts` inline contracts — these are requirements, not comments):**
1. `parentGivingId != null` ⇒ the record is an identified-contribution breakdown of a congregational total and **must never be counted in any aggregate**. Every stat/total/report query must apply `excludeBreakdowns`.
2. A `Pledge` is a commitment, **not** giving. `pledgedAmount` must never appear in Total Giving.
3. A `PledgePayment` creates exactly one `Giving` record which *does* count, and links back via `PledgePayment.givingId`.
4. `FundraisingCampaign.receivedAmount` = actual money; `pledgedAmount` = commitments; `outstandingAmount = pledgedAmount − receivedAmount`.
5. `GivingAnalytics.totalAmount` = "actual giving received only. Never includes pledged amounts."

---

## 5. Finance — Income `/income`, Expenses `/expenses`, Budgets `/budgets`

**Rank 1 (BINDING).** Note these are **top-level**, *not* under `/finance/*`.

| Resource | Endpoints |
| :-- | :-- |
| Income | `GET /income`, `GET /income/{id}`, `POST /income`, `PUT /income/{id}`, `DELETE /income/{id}`, `GET /income/stats`, `GET /income/export`, `GET /income/categories`, `GET /income/categories/{id}`, `POST /income/categories`, `PUT /income/categories/{id}`, `DELETE /income/categories/{id}` |
| Expenses | `GET /expenses`, `GET /expenses/{id}`, `POST /expenses`, `PUT /expenses/{id}`, `DELETE /expenses/{id}`, `GET /expenses/stats`, `GET /expenses/export`, `GET /expenses/categories`, `GET /expenses/categories/{id}`, `POST /expenses/categories`, `PUT /expenses/categories/{id}`, `DELETE /expenses/categories/{id}` |
| Budgets | `GET /budgets`, `GET /budgets/{id}`, `POST /budgets`, `PUT /budgets/{id}`, `DELETE /budgets/{id}`, `GET /budgets/stats`, `GET /budgets/export`, `GET /budgets/categories`, `GET /budgets/{id}/spending` |

Request payloads: `incomeCreateSchema`, `expenseCreateSchema`, `budgetCreateSchema` (`lib/validation/finance.ts`). Response payloads: `IncomeRecord`/`IncomeAnalytics`, `ExpenseRecord`/`ExpenseAnalytics`, `BudgetRecord`/`BudgetAnalytics` (`lib/types.ts`).

Documented-only additions (rank 2): `POST /expenses/bulk`, `GET /expenses/analytics`, `GET /expenses/search`, `GET /expenses/reports/summary|trends`, `GET /expenses/categories/{id}/expenses`, `GET /income/search`, `GET /income/reports/summary|by-category|trends|export`, `GET /income/categories/{id}/records`.

**Conflicts with `api-documentations/Finance_Endpoints.md` and `API_DOCUMENTATION.md`**, which document `/finance/donations`, `/finance/budgets`, `/finance/expenses`, `/finance/reports`.

> **OQ-API-09 — `/finance/*` prefix.** The documented `/finance/{donations,budgets,expenses,reports}` tree is **not used by any wired service**; the wired services use `/income`, `/expenses`, `/budgets`, `/giving`, `/reports/financial`. Do we implement both, or retire `/finance/*`? **Recommendation:** implement the wired flat tree; mount an aggregate-only `/finance/summary` and `/finance/consolidated-report` (see below) rather than duplicating CRUD.

**Consolidated reporting (rank 3 — DERIVED, currently computed client-side in `financeService`):**
`getConsolidatedFinancialReport(fiscalYear)` → `ConsolidatedFinancialReport`, `getFinancialSummary({start,end})` → `FinancialSummary`, `getFinancialAuditRecords({domain,search})` → `FinancialAuditRecord[]`, `exportConsolidatedReport(year, format)` → Blob, `getTithesOfferings()`, `createTitheOffering()`, `getDonations()`, `createDonation()`.

> **OQ-API-10 — Consolidated financial report ownership.** `financeService.getConsolidatedFinancialReport` builds a full statement of activities, monthly trends, department variances and category distributions **in the browser from mock data**. `backend/CLAUDE.md` §6 makes the backend authoritative for financial calculations. Proposed endpoints: `GET /finance/reports/consolidated?fiscalYear=`, `GET /finance/summary?start=&end=`, `GET /finance/audit-records`, `GET /finance/reports/consolidated/export?format=`. Paths need sign-off; the response shapes are fixed by `ConsolidatedFinancialReport` / `FinancialSummary` / `FinancialAuditRecord`.

> **OQ-API-11 — Tithes & offerings.** `/finance/tithes-offerings/*` is a full admin route tree (list, add, edit, categories, reports) with a `titheOfferingCreateSchema`, but has **no endpoint at any rank**. Required paths must be agreed — likely `GET|POST /tithes-offerings`, `/tithes-offerings/{id}`, `/tithes-offerings/categories`, `/tithes-offerings/reports`.

> **OQ-API-12 — Expense approval workflow.** `README` §6 and `security-boundary-map.md` §3 require an approval/disbursement action gated by `finance.expenses.approve`... but **`finance.expenses.approve` does not exist in `lib/authorization/permissions.ts`**. The permission list has `finance.expenses.{view,create,edit,delete,categories,reports}` only. And no approve endpoint exists. Required: add the permission, and define `POST /expenses/{id}/approve`, `/reject`, `/disburse`. Status enum from the docs: `pending → approved → paid`, plus `rejected`/`cancelled`.

> **OQ-API-13 — Correction/reversal workflow.** `backend/CLAUDE.md` §10 and `backend architecture.md` §16 require corrections/reversals rather than in-place edits of historical financial records — yet `PUT /giving/{id}`, `PUT /income/{id}`, `PUT /expenses/{id}` and `DELETE` variants are all wired and used by edit pages. Reconciliation needed: allow edits only before posting/approval, and require a reversal record afterwards? This changes UI behaviour and must be agreed before implementation.

---

## 6. Attendance — `/attendance` *(Rank 2/3 — no wired calls)*

From `api-documentations/Analytics_Attendance_Endpoints.md` + `attendanceService` signatures + `lib/validation/attendance.ts`:

| Method | Path | Request | Response |
| :-- | :-- | :-- | :-- |
| GET | `/attendance/sessions` | `AttendanceSearchParams` | `PaginatedResponse<AttendanceSession>` |
| GET | `/attendance/sessions/{id}` | | `AttendanceSession` |
| POST | `/attendance/sessions` | `AttendanceFormData` | `AttendanceSession` |
| GET | `/attendance/records` | `AttendanceSearchParams` | `PaginatedResponse<AttendanceRecord>` |
| POST | `/attendance/mark` | `attendanceRecordSchema` | `AttendanceRecord` |
| POST | `/attendance/bulk` | `bulkAttendanceSchema` / `BulkAttendanceData` | `AttendanceRecord[]` |
| GET | `/attendance/members/{id}/profile` | | `MemberAttendanceProfile` |
| GET | `/attendance/reports` | | `AttendanceReport` |
| GET | `/attendance/stats` | | `AttendanceStats` |
| GET | `/attendance/export` | derived from `exportAttendanceData` | Blob (CSV) |

Missing endpoints implied by UI but undocumented: QR check-in submit (`/dashboard/attendance/qr-checkin` kiosk + scanner modes), group roll call submit, department roll call submit, aggregate headcount submit.

> **OQ-API-14 — Check-in endpoints.** Required (naming to be agreed): `POST /attendance/checkin` (scan a member QR token), `GET /attendance/kiosk/token` (rotating kiosk display code), `POST /attendance/groups/{groupId}/roll-call`, `POST /attendance/departments/{departmentId}/roll-call`, `POST /attendance/sessions/{id}/headcount`. See domain OQ-08 for the headcount entity.

---

## 7. Events — `/events` *(Rank 1 — BINDING)*

| Method | Path |
| :-- | :-- |
| GET | `/events`, `/events/{id}`, `/events/upcoming?limit=`, `/events/stats`, `/events/export`, `/events/category/{category}` |
| POST | `/events`, `/events/bulk-delete` |
| PUT | `/events/{id}` |
| DELETE | `/events/{id}` |
| GET | `/events/{id}/attendees` |
| POST | `/events/{id}/register` |
| PUT | `/events/{id}/register/{memberId}` |
| DELETE | `/events/{id}/register/{memberId}` |
| GET | `/events/{id}/attendance`, `/events/{id}/attendance/export` |
| POST | `/events/{id}/attendance`, `/events/{id}/attendance/bulk` |
| PUT | `/events/{id}/attendance/{memberId}` |

Payloads: `eventCreateSchema`, `eventRegistrationSchema`, `eventBulkActionSchema`, `eventCategorySchema`.

Not wired but backed by routes: `/events/categories` CRUD (`dashboard/events/categories`), `/events/templates` CRUD (`dashboard/events/templates`), `/events/{id}/groups` (`dashboard/events/[id]/groups`). **OQ-API-15.**

---

## 8. Groups — `/groups` *(Rank 2/3)*

`GET /groups`, `GET /groups/{id}`, `POST /groups`, `PUT /groups/{id}`, `DELETE /groups/{id}`, `GET /groups/categories`, `GET /groups/stats`, `GET|POST /groups/{id}/members`, `DELETE /groups/{id}/members/{memberId}`, `PUT /groups/{id}/members/{memberId}/role`, `GET|POST /groups/{id}/roles`, `PUT|DELETE /groups/roles/{roleId}`, `GET|POST /groups/{id}/events`, `GET|PUT|DELETE /groups/events/{eventId}`, `GET|POST /groups/{id}/attendance`, `GET /groups/{id}/reports`.

Payloads: `groupCreateSchema`, `groupMemberAddSchema`, `groupRoleAddSchema`, `groupEventAddSchema`, `groupCategorySchema`, `GroupAttendanceFormData`.

Nested-role paths (`/groups/roles/{roleId}`, `/groups/events/{eventId}`) are **derived from service signatures that take only an id** — path shape needs confirmation. **OQ-API-16.**

## 9. Departments — `/departments` *(Rank 2/3)*

`GET /departments`, `GET /departments/{id}`, `POST /departments`, `PUT /departments/{id}`, `DELETE /departments/{id}`, `GET|POST /departments/categories`, `PUT|DELETE /departments/categories/{id}`, `GET|POST /departments/{id}/members`, `GET|POST /departments/{id}/roles`, `GET|POST /departments/{id}/meetings`, `GET|POST /departments/{id}/events`, `GET /departments/{id}/attendance`, `GET /departments/{id}/stats`, `GET /departments/{id}/report`, `GET /departments/stats`.

Payloads: `departmentCreateSchema`, `departmentMeetingSchema`, `departmentRoleSchema`, `departmentCategorySchema`, plus `DepartmentEventFormData`.

## 10. Sunday School — `/sunday-school` *(Rank 2/3)*

`GET|POST /sunday-school/classes`, `GET|PUT|DELETE /sunday-school/classes/{id}`, `GET /sunday-school/classes/{id}/stats`, `GET|POST /sunday-school/teachers`, `GET|PUT|DELETE /sunday-school/teachers/{id}`, `GET /sunday-school/teachers/{id}/classes`, `GET /sunday-school/teachers/{id}/reports`, `GET|POST /sunday-school/students`, `GET|PUT|DELETE /sunday-school/students/{id}`, `GET|POST /sunday-school/materials`, `GET|POST /sunday-school/attendance`, `GET /sunday-school/stats`, `GET /sunday-school/reports`.

Payloads: `sundaySchoolClassSchema`, `studentEnrollSchema`, `teacherCreateSchema`, `teachingMaterialSchema`, `AttendanceFormData`.

> **OQ-API-17 — Sunday School field mismatch.** `lib/validation/sunday-school.ts` (`minAge`, `maxAge`, `room`, `capacity`, `teacherIds[]`, gender `MALE/FEMALE`, status `ACTIVE/INACTIVE`) does **not** match `lib/types/sunday-school.ts` (`schedule{dayOfWeek,startTime,endTime}`, `location`, `maxStudents`, `teacher{}`, gender `Male/Female`, `TeacherStatus.ACTIVE='Active'`). Which is the wire shape?

## 11. Assets — `/assets` *(Rank 1 — BINDING, partial)*

Wired: `GET /assets`, `GET /assets/{id}`, `POST /assets`, `PUT /assets/{id}`, `DELETE /assets/{id}`, `GET /assets/categories`, `GET /assets/stats`.
Documented (rank 2): `POST /assets/{id}/maintenance`, `POST /assets/categories`.
Implied by routes, undocumented: `GET|POST /assets/{id}/assignment`, `GET /assets/{id}/maintenance`, `GET /assets/reports`, `GET|PUT|DELETE /assets/categories/{id}`, `GET /assets/export`. **OQ-API-18.**

Payloads: `assetCreateSchema`, `assetMaintenanceSchema`, `assetAssignmentSchema`, `assetCategorySchema`. Note `assetMaintenanceSchema` uses `maintenanceType`/`serviceProvider`/`cost` while `AssetMaintenance` type uses `type`/`performedBy`/`estimatedCost`/`actualCost`/`partsUsed[]` — same mismatch class as OQ-API-17.

## 12. Communications — `/communications` *(Rank 1 — BINDING)*

| Method | Path |
| :-- | :-- |
| GET | `/communications/stats`, `/communications/export` |
| GET/POST | `/communications/sms`, `/communications/emails`, `/communications/announcements`, `/communications/templates`, `/communications/groups` |
| GET | `/communications/sms/{id}`, `/communications/emails/{id}`, `/communications/announcements/{id}`, `/communications/templates/{id}`, `/communications/groups/{id}`, `/communications/announcements/active` |
| PUT | `/communications/announcements/{id}`, `/communications/announcements/{id}/publish`, `/communications/announcements/{id}/archive`, `/communications/templates/{id}`, `/communications/groups/{id}` |
| DELETE | `/communications/announcements/{id}`, `/communications/templates/{id}`, `/communications/groups/{id}` |

Payloads: `smsSendSchema` (≤1600 chars), `emailSendSchema`, `announcementCreateSchema`, `campaignCreateSchema`, `newsletterCreateSchema`.

**Conflicts with the docs**, which specify `/communications/overview`, `/communications/messages`, `/communications/campaigns`, `/communications/newsletters` with a structured `recipients: {type, targetIds[]}` body and a `senderId`. The wired service uses `/communications/sms` + `/communications/emails` and a flat `recipients: string[]`.

> **OQ-API-19 — Communications surface.** Reconcile `/communications/{sms,emails}` (wired) vs `/communications/{messages,campaigns,newsletters,overview}` (documented). The admin app has `campaigns/*` and `newsletters/*` route trees that the wired service does not cover, so **both are needed**; the question is whether `/sms` + `/emails` are retained or folded into `/messages`.

**Every send is a background job** (`backend/CLAUDE.md` §14) and generates `communications.campaign.sent` audit.

## 13. Prayer Requests — `/prayer-requests` *(Rank 3 — no path documented at all)*

The admin route tree exists (`/dashboard/prayer-requests`, `/[id]`, `/[id]/edit`, `/add`, `/categories`), Zod schemas exist (`prayerRequestCreateSchema`, `prayerRequestUpdateSchema`, `prayerRequestResponseSchema`), permissions exist (9 of them including `prayer-requests.view-confidential`), but **no endpoint appears in any documentation and no service issues any call** (`domain-map.md` lists the service as `apiClient`, i.e. unimplemented).

> **OQ-API-20 — Prayer request endpoints are entirely undefined.** Proposed, needs sign-off: `GET|POST /prayer-requests`, `GET|PUT|DELETE /prayer-requests/{id}`, `POST /prayer-requests/{id}/responses`, `PUT /prayer-requests/{id}/status`, `PUT /prayer-requests/{id}/assign`, `GET|POST /prayer-requests/categories`, `GET /prayer-requests/stats`.

## 14. Pastoral Care — `/pastoral-care` *(Rank 2)*

| Method | Path | Notes |
| :-- | :-- | :-- |
| GET | `/pastoral-care/cases` | `?status=&category=&assignedPastorId=&page=&limit=`; response nests `{cases:[], pagination:{total,page,limit}}` — **a third pagination shape**, see OQ-API-02 |
| POST | `/pastoral-care/cases` | `{memberId, category, priority, assignedPastorId, notes, scheduledDate}` |
| GET | `/pastoral-care/cases/{id}` | full history + **confidential notes** |
| POST | `/pastoral-care/cases/{id}/sessions` | `{sessionDate, location, confidentialNotes, nextFollowUpDate, status}` |
| PUT | `/pastoral-care/cases/{id}/status` | `{status, closingNotes}` |

Undocumented but implied by README §5: visitation scheduling as a distinct resource, and appointment reminder jobs. **OQ-API-21.**

## 15. Files / Vault — `/upload`, `/files` *(Rank 1 wired = `/upload`; Rank 2 documented = `/files`)*

Wired: `POST /upload/file`, `POST /upload/files`, `POST /upload/init`, `POST /upload/chunk`, `POST /upload/complete`, `GET /upload/files`, `GET /upload/files/{id}`, `DELETE /upload/files/{id}`, `POST /upload/files/bulk-delete`, `POST /upload/files/{id}/thumbnail`, `POST /upload/files/{id}/resize`, `GET /upload/stats`.

Documented: `POST /files/upload`, `GET /files`, `DELETE /files/{id}`.

> **OQ-API-22 — `/upload` vs `/files`.** Two prefixes for one capability. **Recommendation:** implement `/files` per the doc and alias `/upload/*` to it, or implement `/upload/*` (wired, richer: chunked uploads, thumbnails, resize) and treat `/files` as stale.

> **OQ-API-23 — Attachment transport.** `api-documentations/Expenses_Endpoints.md` says attachments are **base64 in the JSON body** (max 5 MB, PDF/JPG/PNG/GIF); `API_DOCUMENTATION.md` File Vault and every wired upload use **multipart/form-data**. Pick one. Multipart is strongly preferred.

## 16. Analytics & Reports — `/reports` *(Rank 1 — BINDING)*

| Method | Path | Response type |
| :-- | :-- | :-- |
| GET | `/reports/analytics/overview` | `AnalyticsOverview` |
| GET | `/reports/attendance` | `AttendanceReport` |
| GET | `/reports/attendance/member/{memberId}` | member history |
| GET | `/reports/giving` | `GivingReport` |
| GET | `/reports/giving/member/{memberId}` | |
| GET | `/reports/members` | `MemberReport` |
| GET | `/reports/members/demographics` | |
| GET | `/reports/events` | `EventReport` |
| GET | `/reports/events/{eventId}/attendance` | |
| GET | `/reports/financial` | `FinancialReport` |
| GET | `/reports/financial/budget-vs-actual` | |
| GET | `/reports/types` | available report types |
| POST | `/reports/custom` | report-builder config → Blob |
| GET | `/reports/{attendance\|giving\|members\|events\|financial}/export` | Blob |

**Conflicts with the documented `/analytics/{overview,attendance,giving}` tree** (`api-documentations/Analytics_Endpoints.md`) and with `backend architecture.md` §21 which lists `/api/v1/analytics`.

> **OQ-API-24 — `/reports` vs `/analytics`.** The wired prefix is `/reports` (with `/reports/analytics/overview` nested inside it). The docs and the architecture spec say `/analytics`. **Recommendation:** implement `/reports/*` as wired and expose `/analytics/*` as thin aliases for the three documented endpoints.

## 17. Settings & System Administration — `/settings` *(Rank 2, thin)*

Documented: `GET /settings`, `PUT /settings` only.

**Implemented (Phase 2B-9):** `GET|PUT /settings/church-profile` — `settings.church-profile` on
both verbs, `SuccessResponse<ChurchProfile>`, fields exactly `churchProfileSchema`. Tenant-wide:
**no branch scope applies**, so a principal with no branch assignments can still use it
(ADR-011 Decision 4). The route takes **no church identifier** — the row is the caller's own
tenant — so there is nothing for a client to supply or for the server to validate. `PUT` is
partial, matching the one documented settings write, and refuses `null` for a `NOT NULL` column
rather than silently skipping it. Read is gated on the *manage* permission because no canonical
code means "view the church profile" — see **OQ-SEC-21**.

Everything else below remains unimplemented; **OQ-API-25 stays open** for it.
Route tree requires far more: branches CRUD, church-profile, users CRUD + suspend, roles CRUD, permission matrix, notifications defaults, integrations, backup, background-checks, and the onboarding wizard submit.

> **OQ-API-25 — Settings endpoints undefined** *(partially closed: `GET|PUT /settings/church-profile` is implemented as above; the rest still needs sign-off)*.** Proposed: `GET|PUT /settings`, `GET|PUT /settings/church-profile`, `GET|POST /settings/branches`, `GET|PUT|DELETE /settings/branches/{id}`, `GET|POST /settings/users`, `GET|PUT|DELETE /settings/users/{id}`, `POST /settings/users/{id}/suspend`, `GET|POST /settings/roles`, `GET|PUT|DELETE /settings/roles/{id}`, `GET /settings/permissions`, `GET|PUT /settings/integrations`, `POST /settings/backup`, `GET|POST /settings/background-checks`, `POST /onboarding`. All need sign-off.

## 18. Audit / Activity Logs — `/activity-logs` *(Rank 3 — undefined)*

Routes exist (`/dashboard/activity-logs`, `/user/[userId]`), permissions exist (`activity-logs.{view,user,filter,export}`), the event type exists (`lib/audit/audit-logger.ts`), but there is no endpoint anywhere.

> **OQ-API-26 — Audit endpoints undefined.** Proposed: `GET /activity-logs` (filterable by actor/action/resource/date/branch), `GET /activity-logs/user/{userId}`, `GET /activity-logs/export`. Read-only by construction — no POST/PUT/DELETE ever.

## 19. Member Self-Service Portal — `/member/*` *(Rank 2, all mock-backed)*

Base path `/api/member`. All require an authenticated **member** session (see OQ-API-05).

| Method | Path | Doc | Service method | Response type |
| :-- | :-- | :-- | :-- | :-- |
| GET | `/member/dashboard` | ✅ | `getDashboardData()` | `MemberDashboardData` — **the doc's sample payload is a much smaller object than the type**, see OQ-API-27 |
| GET | `/member/profile` | ✅ | `getCurrentProfile()` | `MemberProfile` |
| PUT | `/member/profile` | ✅ | `updateProfile(input)` | `memberProfileSchema` → `MemberProfile` |
| GET | `/member/family` | ✅ | `getFamily()` | `MemberFamilyUnit` |
| POST | `/member/family/link` | ✅ | — | `{targetMemberId, relationship}` |
| POST/PUT | `/member/family/members[/{id}]` | ❌ | `addFamilyMember`, `updateFamilyMember` | `familyMemberSchema` |
| GET | `/member/attendance` | ✅ | `getAttendanceRecords(filter)` | `MemberAttendanceRecord[]` |
| GET | `/member/attendance/summary` | ❌ | `getAttendanceSummary()` | `MemberAttendanceSummary` |
| GET | `/member/attendance/trend` | ❌ | `getAttendanceTrend()` | `MemberAttendanceTrendPoint[]` |
| GET | `/member/attendance/insights` | ❌ | `getAttendanceInsights()` | `MemberAttendanceInsight[]` |
| GET | `/member/attendance/qr` | ✅ | — | dynamic check-in token |
| GET | `/member/giving` | ✅ | `getTransactions(filter)` | `MemberGivingTransaction[]` |
| GET | `/member/giving/summary` | ❌ | `getGivingSummary()` | `MemberGivingSummary` |
| GET | `/member/giving/trend` | ❌ | `getGivingTrend()` | `MemberGivingTrendPoint[]` |
| GET | `/member/giving/statements` | ❌ | `getTaxStatements()` | `MemberTaxStatement[]` |
| GET | `/member/giving/statement?year=` | ✅ | — | `application/pdf` |
| POST | `/member/giving` | ❌ | `initiateGiving(input)` | `giveNowSchema` → payment initiation |
| GET | `/member/events` | ✅ | `getEvents(filter)` | `MemberEvent[]` |
| GET | `/member/events/{id}` | ❌ | `getEventById` | `MemberEvent` |
| GET | `/member/events/upcoming` · `/featured` | ❌ | `getUpcomingEvents`, `getFeaturedEvents` | |
| POST | `/member/events/{id}/register` | ✅ | `registerForEvent` | `eventRegistrationSchema` → `MemberEventRegistration` |
| DELETE | `/member/events/{id}/register` | ✅ | `cancelRegistration` | |
| GET | `/member/events/registrations` | ❌ | `getMyRegistrations` | `MemberEventRegistration[]` |
| GET | `/member/groups` | ✅ | `getMyGroups` | `MemberGroup[]` |
| GET | `/member/groups/available` | ❌ | `getAvailableGroups` | `DiscoverableGroup[]` |
| POST | `/member/groups/{id}/join` | ✅ | `requestToJoinGroup` | `joinGroupSchema` |
| GET | `/member/ministries` | ✅ | `getMyMinistries` | `MemberMinistry[]` |
| GET | `/member/ministries/available` | ❌ | `getAvailableMinistries` | `DiscoverableMinistry[]` |
| POST | `/member/ministries/interest` | ❌ | `submitMinistryInterest` | `serveInterestSchema` |
| GET | `/member/journey` | ✅ | `getMyJourney`, `getMilestones` | `MemberSpiritualJourney` |
| GET | `/member/prayer` | ✅ | `getMyPrayerRequests(filter)` | `MemberPrayerRequest[]` |
| POST | `/member/prayer` | ✅ | `createPrayerRequest` | `prayerRequestSchema` |
| PUT | `/member/prayer/{id}/answered` | ❌ | `markPrayerAnswered(id, testimony)` | |
| DELETE | `/member/prayer/{id}` | ❌ | `deletePrayerRequest` | |
| GET | `/member/pastoral-care` | ✅ | `getMyPastoralCareRequests` | `MemberPastoralCareRequest[]` |
| POST | `/member/pastoral-care/request` | ✅ | `requestPastoralCare` | `pastoralCareRequestSchema` |
| DELETE | `/member/pastoral-care/{id}` | ❌ | `cancelPastoralCareRequest` | |
| GET | `/member/resources` | ✅ | `getResources(filter)` | `ResourcePaginatedResult` |
| GET | `/member/notifications` | ✅ | `getNotifications(filter)` | `MemberNotification[]` |
| GET | `/member/notifications/unread-count` | ❌ | `getUnreadCount` | `number` |
| PUT | `/member/notifications/{id}/read` | ✅ | `markAsRead` | |
| PUT | `/member/notifications/read-all` | ❌ | `markAllAsRead` | |
| GET/PUT | `/member/settings` | PUT only | `getSettings`, `updateSettings` | `memberSettingsSchema` → `MemberSettings` |
| GET | `/member/announcements` | ❌ | `getAnnouncements` | `MemberAnnouncement[]` |
| PUT | `/member/security/password` | ❌ | — (`memberPasswordChangeSchema` exists) | |

Rows marked ❌ have **no documented path**; the path shown is a proposal derived from the service method and must be signed off. **OQ-API-27** additionally: the documented `GET /member/dashboard` sample returns `{welcomeMessage, verseOfTheDay, attendanceStreak, totalContributionsThisYear, upcomingEvents[], activeGroupsCount, unreadNotificationsCount}` while `MemberDashboardData` requires ~18 top-level keys including full `profile`, `attentionItems[]`, `quickActions[]`, `journey`, `statCards`, `givingWidget`. The type wins; the doc sample is stale.

## 20. Public / Landing — *(not specified)*

`/give` (online donation gateway + payment webhook), `/contact` (inquiry form), anonymous prayer submission, public event RSVP, sermon archive, service times, leadership profiles. `security-boundary-map.md` §3 lists a public giving flow with a payment-gateway webhook producing a `donation.public.received` audit event.

> **OQ-API-28 — Public API scope.** No endpoint, service, or type exists. Is the public tier in scope for this backend build? If yes, everything about it is undefined and needs specification (rate limits, CAPTCHA, anonymous prayer routing, webhook signature verification).

---

## 21. Consolidated Open Questions — API layer

| ID | Summary |
| :-- | :-- |
| OQ-API-01 | `/api` vs `/api/v1` version prefix |
| OQ-API-02 | Three pagination envelope shapes in play |
| OQ-API-03 | `success` envelope present on all endpoints, or bare payloads for finance lists? |
| ~~OQ-API-04~~ | **Resolved — [ADR-002](./adr/002-controlled-self-registration.md).** Not public: tenant-bound registration via a server-resolved token/link. Implementation deferred — no `registration_tokens` table or issuing contract exists yet. |
| OQ-API-05 | Member portal authentication mechanism undefined |
| OQ-API-06 | `DELETE /members/{id}` — soft archive or hard delete? |
| OQ-API-07 | Giving surface: wired `/giving/individual\|congregational` vs documented `/giving/donations` + `/giving/reports/*` |
| OQ-API-08 | Are Donations a separate resource from Giving? |
| OQ-API-09 | Retire the documented `/finance/*` CRUD prefix? |
| OQ-API-10 | Consolidated financial report endpoints undefined (currently computed client-side) |
| OQ-API-11 | Tithes & offerings has a full UI but no endpoint at any rank |
| OQ-API-12 | Expense approval endpoints **and** the `finance.expenses.approve` permission are both missing |
| OQ-API-13 | Correction/reversal requirement conflicts with the wired PUT/DELETE edit endpoints |
| OQ-API-14 | QR/kiosk check-in, group & department roll-call, headcount endpoints undefined |
| OQ-API-15 | Event categories / templates / group-linking endpoints undefined |
| OQ-API-16 | Nested group role/event path shapes unconfirmed |
| OQ-API-17 | Sunday School Zod schema and TS type disagree on field names and enum casing |
| OQ-API-18 | Asset maintenance/assignment/reports/export endpoints undefined; schema/type mismatch |
| OQ-API-19 | `/communications/{sms,emails}` (wired) vs `/communications/{messages,campaigns,newsletters}` (documented) |
| OQ-API-20 | Prayer request endpoints entirely undefined |
| OQ-API-21 | Visitation as a distinct resource undefined |
| OQ-API-22 | `/upload` vs `/files` |
| OQ-API-23 | Base64-in-body vs multipart attachments |
| OQ-API-24 | `/reports` (wired) vs `/analytics` (documented) |
| OQ-API-25 | Settings / users / roles / branches / onboarding endpoints undefined |
| OQ-API-26 | Audit log endpoints undefined |
| OQ-API-27 | ~25 member-portal endpoints have no documented path; dashboard doc sample is stale |
| OQ-API-28 | Public/landing API entirely unspecified |
