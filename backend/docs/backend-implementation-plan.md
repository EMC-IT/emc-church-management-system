# EMC CMS — Backend Implementation Plan

**Phase 0 — Discovery & Blueprint.** No backend feature code has been written. This document is the plan of record.

**Companion documents**
- [`backend-domain-map.md`](./backend-domain-map.md) — domains, entities, relationships, tenant/branch ownership, cross-domain dependencies
- [`backend-api-map.md`](./backend-api-map.md) — endpoint inventory ranked by contract authority, payloads, conflicts
- [`backend-database-plan.md`](./backend-database-plan.md) — tables, keys, indexes, constraints, migration order
- [`backend-security-plan.md`](./backend-security-plan.md) — authN/authZ, isolation, permissions, confidentiality, audit

---

## 1. What Was Inspected

| Source | What it gave us |
| :-- | :-- |
| `README.md` (51 KB) | Complete feature catalogue: 204 routes across 3 tiers, 17 admin domains |
| `AGENTS.md` | UI/UX design contract (frontend-only; no backend bearing beyond "don't redesign the UI") |
| `backend/AGENTS.md` | The engineering contract: stack, modular monolith, tenancy, RBAC, finance, audit, testing, definition of done |
| `API_DOCUMENTATION.md` (97 KB, 5056 lines) | ~200 documented endpoints with payload samples |
| `api-documentations/*` (22 files, 180 KB) | Deeper per-domain specs for giving, income, expenses, converts, attendance, departments, groups, Sunday School, pastoral care, analytics, settings, errors |
| `PROJECT_RULES.md` | Mostly frontend design/process rules; §1361–1407 carries the architecture invariants |
| `docs/architecture/ui-pages-architecture.md` | Route matrices for all 204 pages |
| `docs/architecture/domain-map.md` | Official 16-domain taxonomy + segregation invariants |
| `docs/architecture/dependency-map.md` | Permitted/prohibited dependency directions |
| `docs/architecture/security-boundary-map.md` | 3-tier trust model, isolation rules, sensitive-operations matrix, audit contract |
| `docs/architecture/backend architecture.md` (39 KB, 41 sections) | The existing backend design — adopted wholesale |
| `services/**` (60 files) | **The binding API contract.** Extracted every `apiClient` path. |
| `lib/types/**` (26 files, ~4,000 lines) | Entity field-level shapes |
| `lib/validation/**` (23 files) | Every input constraint |
| `lib/authorization/**` | 158 admin permissions, 22 member permissions, 6 roles, scope guards |
| `lib/audit/`, `lib/errors/`, `lib/finance/`, `lib/jobs/` | Audit contract, error taxonomy, money math, job types |
| `tests/unit/**` (19 suites) | Behaviour already asserted — authorization, tenant/branch isolation, finance math, member services |
| `backend/**` | Existing scaffold: FastAPI app, config, async session, tenant mixin, transaction scope, Celery worker, 20 empty domain packages |

**Key discovery about the frontend's real state:** of the 16 service packages, only **10 issue real HTTP calls** (auth, members, documents, giving, income, expenses, budgets, events, assets, communications, reports, upload). Six are **entirely mock-backed** — attendance, groups, departments, sunday-school, the aggregate finance service, and *all sixteen* `services/member/*` services. The public landing tier makes no calls at all.

This matters for planning: for the wired domains the contract is fixed and testable; for the mock-backed ones we have real *shapes* (types + Zod are genuine) but the *paths* must be agreed before implementation. That distinction drives the phasing in §9.

---

## 2. Adopted Architecture

Unchanged from `docs/architecture/backend architecture.md` and `backend/AGENTS.md`. Restated for completeness:

```
Next.js  →  REST/JSON  →  FastAPI Domain-Driven Modular Monolith
                              ├── SQLAlchemy 2.x (async) → PostgreSQL
                              ├── Redis (cache, rate limit, Celery broker)
                              ├── Celery workers (+ beat)
                              └── S3-compatible object storage
```

Layering: Router → Application Service → Domain → Repository → Infrastructure. Dependencies flow inward. No microservices. No cross-domain table access.

Per-domain structure (`backend architecture.md` §34): `router.py`, `models.py`, `schemas.py`, `repository.py`, `service.py`, `permissions.py`, `exceptions.py`, `commands/`, `queries/`, `tests/`.

The existing scaffold already matches this and is kept as-is.

---

## 3. Financial Rules

These are requirements extracted from source, not proposals. They are the highest-risk part of the build.

| # | Rule | Source |
| :-- | :-- | :-- |
| F1 | Money is `NUMERIC(14,2)` in PostgreSQL and `Decimal` in Python. Float arithmetic on money is forbidden anywhere in the stack. | `backend/AGENTS.md` §10; `api-documentations/Introduction.md` §3 |
| F2 | Congregational giving may carry identified-contribution children (`parent_giving_id`). **Children are attribution only and must never be counted in any aggregate.** Every stat, total, report, and export applies the exclusion. | `lib/types.ts` `Giving.parentGivingId`, `IdentifiedContribution`, `GivingSearchParams.excludeBreakdowns`; `giving-service.ts` comments |
| F3 | A pledge is a *commitment*, not giving. `pledgedAmount` must never appear in Total Giving or revenue. | `lib/types.ts` `Pledge` |
| F4 | A pledge payment is real money: it creates exactly one countable `Giving` record and links back via `PledgePayment.givingId`. | `lib/types.ts` `PledgePayment` |
| F5 | `GivingAnalytics.totalAmount` = actual giving received only; `activePledgesCount` counts unfulfilled pledges separately. | `lib/types.ts` `GivingAnalytics` |
| F6 | Campaign `receivedAmount` (actual) and `pledgedAmount` (commitments) are distinct; `outstandingAmount = pledged − received`. | `lib/types.ts` `FundraisingCampaign` |
| F7 | Financial operations are transactional and atomic; a financial write and its audit record share one transaction. | `backend/AGENTS.md` §10, §11 |
| F8 | Historical financial records are corrected by reversal/correction entries, not silently overwritten. | `backend/AGENTS.md` §10; `backend architecture.md` §16 |
| F9 | Every financial mutation produces an audit record. | `backend/AGENTS.md` §10 |
| F10 | Budget utilisation: `remaining = budget − spent`; status `SAFE` < 80%, `WARNING` ≥ 80%, `EXCEEDED` when `spent > budget`; percentage clamped to [0,100]. The backend must reproduce `calculateBudgetUtilization` exactly. | `lib/finance/finance-math.ts` + `tests/unit/finance-math.test.ts` |
| F11 | Rounding is half-away-from-zero to 2 dp, matching `roundToTwoDecimals`. Python `Decimal` with `ROUND_HALF_UP` reproduces this. | `lib/finance/finance-math.ts` |
| F12 | Expense workflow states: `pending → approved → paid`, plus `rejected` / `cancelled`. Approval requires `finance.expenses.approve` and produces `finance.expense.approved`. | `api-documentations/Expenses_Endpoints.md`; `security-boundary-map.md` §3 |
| F13 | Receipt numbers are unique per tenant, allocated inside the financial transaction. | `Receipt` type; `Errors_Responses.md` §5 |
| F14 | Amounts are strictly positive; income additionally < 1,000,000 with a reference unique per tenant and a date no more than one year in the future. | `lib/validation/finance.ts`; `api-documentations/Income_Endpoints.md` |
| F15 | Aggregates (`spent`, `outstanding`, `received`, `paid_amount`) are derived from the ledger, never accepted from the client. | derived from F2–F6 |

**Two unresolved financial questions block finance implementation:**
- **OQ-03 / OQ-DB (units).** `type Amount = number; // Always in smallest currency unit (pesewas for GHS)` in `lib/types/finance.ts` and `lib/types/assets.ts` contradicts every schema, every API sample, and `finance-math.ts`. Wire format must be settled before the first finance endpoint. *(Evidence strongly favours major units with 2 dp; `fromMinorUnits`/`toMinorUnits` exist but are unused by any service.)*
- **OQ-API-13 (corrections).** F8 requires reversal entries, but `PUT /giving/{id}`, `PUT /income/{id}`, `PUT /expenses/{id}` and `DELETE` variants are all wired and used by live edit pages. Reconcile — likely "editable until posted/approved, reversal thereafter."

---

## 4. Audit Requirements

Full matrix in [`backend-security-plan.md`](./backend-security-plan.md) §7. Summary:

- 15 mandated audit events from `security-boundary-map.md` §3, spanning IAM, finance, members, communications, attendance, pastoral care, member portal, and public giving.
- Plus, from `backend architecture.md` §25: user creation, permission changes, **pastoral record access (read, not just write)**, **document access (read)**, configuration changes.
- Record carries actor / tenant / branch / action / entity type / entity id / timestamp / IP / user agent / request id / before / after.
- **Immutable in fact, not just in policy:** the application database role has `UPDATE` and `DELETE` revoked on `audit_logs`.
- Audit insert shares the mutation's transaction.
- `before`/`after` diffs pass through a redaction allow-list (no secrets, no confidential notes, no child medical data).
- Three conflicting record shapes exist across the docs — **OQ-13 / OQ-SEC-15** must be settled before `/activity-logs` ships.

---

## 5. Background Jobs

`backend/AGENTS.md` §14 and `backend architecture.md` §19 require Celery + Redis. `lib/jobs/job-types.ts` already fixes the job taxonomy and the tracking shape the frontend expects:

| Job type (from `JobType`) | Trigger | Notes |
| :-- | :-- | :-- |
| `MEMBER_BULK_IMPORT` | `POST /members/import` | CSV/Excel with column mapping, per-row validation, batch error report. Currently the endpoint returns `{success, errors[]}` synchronously — **needs an async job + polling contract (OQ-JOB-01)** |
| `COMMUNICATIONS_SMS_CAMPAIGN` | `POST /communications/sms`, campaign dispatch | Segment calculation, per-recipient delivery tracking, provider callbacks |
| `COMMUNICATIONS_EMAIL_NEWSLETTER` | `POST /communications/emails`, newsletters | |
| `REPORT_GENERATION` | `POST /reports/custom`, `/reports/*/export`, `/finance/reports/consolidated/export` | CSV / Excel / PDF |
| `DOCUMENT_OCR_PROCESSING` | document upload | **No UI, no endpoint, no requirement anywhere except this enum — OQ-JOB-02: is OCR actually in scope?** |
| `DATABASE_BACKUP_EXPORT` | `settings.backup` | |

Job state is persisted in a `jobs` table mirroring `BackgroundJob` (`id, type, tenantId, branchId, requestedBy{id,email}, payload, status, progress{total,processed,failed,percentage}, result, error, createdAt, startedAt, completedAt`).

**Scheduled work (Celery beat)** — required by README/architecture but with no defined schedule or endpoint:
- Birthday and anniversary messages (README §8: "Automated scheduled campaigns for member birthdays, wedding anniversaries")
- Service reminders and event reminders
- Pastoral appointment and follow-up reminders (README §5)
- Consecutive-absence alerts (README §7: "Automatic alerts for members who have been absent for consecutive weeks")
- Asset maintenance due and warranty-expiring-within-30-days alerts (`AssetAnalytics.alerts`)
- Pledge fulfilment reminders
- Materialised-view refresh
- Session/token cleanup

> **OQ-JOB-03.** None of the scheduled jobs has a defined cadence, template, opt-out path, or configuration surface. `notification_preferences` gives per-member opt-out for categories, which is a start.

**Rule:** no HTTP request blocks on bulk SMS, email campaigns, large exports, imports, PDF generation, or report generation (`backend/AGENTS.md` §14).

---

## 6. External Integrations

All behind replaceable interfaces (`backend/AGENTS.md` §15). The scaffold already has `app/integrations/{payments,sms,email,storage,maps}/`.

| Interface | Purpose | Concrete providers named in sources | Status |
| :-- | :-- | :-- | :-- |
| `PaymentGateway` | Public online giving, member `initiateGiving`, paid event fees | MTN MoMo, Vodafone/Telecel, card gateway, bank API (`backend architecture.md` §20); README lists Mobile Money, Card, Bank Transfer | **No provider chosen, no webhook contract, no reconciliation model — OQ-INT-01.** `security-boundary-map.md` §3 requires a `donation.public.received` audit on the gateway webhook, so signature verification and idempotency are mandatory. |
| `SmsProvider` | Bulk SMS, campaigns, alerts | Twilio or local providers (`backend architecture.md` §2) | Provider unchosen. Needs: sender-id registration, segment counting, delivery receipts, credit balance (`/communications/stats` exposes an SMS balance). **OQ-INT-02.** |
| `EmailProvider` | Newsletters, receipts, password reset, welcome emails | SES / SendGrid (`backend architecture.md` §2) | Provider unchosen. **OQ-INT-03.** |
| `FileStorageProvider` | Documents, certificates, receipts, media, avatars | S3 / MinIO / R2. `config.py` already has `STORAGE_BACKEND`, `AWS_*`, `S3_ENDPOINT_URL` and defaults to `local` | Ready to implement; key layout fixed by `backend architecture.md` §18 |
| `MapsProvider` | Campus location map, GPS coordinates on member addresses | listed in `backend/AGENTS.md` §15 and the scaffold | **No UI consumer found beyond the static contact page — OQ-INT-04: in scope?** |

---

## 7. File Storage Requirements

| Requirement | Detail | Source |
| :-- | :-- | :-- |
| Split storage | Metadata in PostgreSQL, bytes in object storage | `backend architecture.md` §18 |
| Key layout | `churches/{tenant_id}/members/{member_id}/documents/…`, `.../certificates/…`, `.../finance/receipts/…`, `.../finance/invoices/…`, `.../communications/campaigns/…` | ibid. |
| Access | Short-lived signed URLs after policy evaluation. No public buckets. | ibid.; `backend/AGENTS.md` §15 |
| Upload modes | Simple multipart (`/upload/file`), multi-file (`/upload/files`), **chunked** (`/upload/init` → `/upload/chunk` → `/upload/complete`) | `services/upload/upload-service.ts` |
| Derivatives | Thumbnail generation, image resize | `/upload/files/{id}/thumbnail`, `/resize` |
| Consumers | Member documents & certificates, expense receipts, giving receipts (PDF), event cover images, teaching materials, member resources library, newsletter images, asset photos/documents, member avatars, journey certificates, backup exports | across README + types |
| Validation | Extension + MIME sniff + size cap + optional AV scan; strip EXIF; store under generated keys | `backend/AGENTS.md` §16 hygiene, standard practice |

Open: `/upload` vs `/files` prefix (**OQ-API-22**), multipart vs base64 (**OQ-API-23**), a single size/type policy (**OQ-SEC-17**).

---

## 8. Analytics & Reporting Requirements

**Approach** (`backend architecture.md` §26): query PostgreSQL directly with optimised queries, promote hot aggregates to materialised views. No separate analytics store.

**Materialised views to build:** `monthly_member_growth`, `weekly_attendance`, `monthly_giving`, `monthly_expenses`, `branch_statistics`, `department_statistics`, `member_retention`.

**Report surfaces required:**

| Surface | Response type | Source |
| :-- | :-- | :-- |
| Executive KPI overview | `AnalyticsOverview` | `/reports/analytics/overview` |
| Attendance report + member history + export | `AttendanceReport` | `/reports/attendance*` |
| Giving report + member history + export | `GivingReport` | `/reports/giving*` |
| Member report + demographics + export | `MemberReport` | `/reports/members*` |
| Event report + per-event attendance + export | `EventReport` | `/reports/events*` |
| Financial report + budget-vs-actual + export | `FinancialReport` | `/reports/financial*` |
| Custom report builder | config → CSV/PDF/Excel blob | `POST /reports/custom`, README §16 |
| Consolidated financial statement | `ConsolidatedFinancialReport` — fiscal year, statement of activities, monthly trends, department variances, four category distributions | `financeService.getConsolidatedFinancialReport` (**currently computed in the browser**) |
| Financial audit trail records | `FinancialAuditRecord[]` | `financeService.getFinancialAuditRecords` |
| Per-domain stats endpoints | `/members/stats`, `/events/stats`, `/assets/stats`, `/giving/stats`, `/income/stats`, `/expenses/stats`, `/budgets/stats`, `/communications/stats`, `/upload/stats`, `/attendance/stats`, `/groups/stats`, `/departments/stats`, `/sunday-school/stats` | wired + documented |
| Domain analytics objects | `GivingAnalytics`, `IncomeAnalytics`, `ExpenseAnalytics`, `BudgetAnalytics`, `AssetAnalytics`, `AttendanceStats`, `GroupStats`, `DepartmentStats`, `SundaySchoolStats` | `lib/types*` |

**Constraint:** all analytics respect tenant, branch, and confidentiality boundaries. Pastoral and confidential-prayer data never enters an aggregate. Financial aggregates apply the F2 breakdown exclusion. Report exports are background jobs.

**Moving the consolidated report server-side is a `backend/AGENTS.md` §6 requirement** ("the backend is authoritative for financial calculations") and is one of the few places where frontend integration code will legitimately change (permitted by §5).

---

## 9. Recommended Implementation Order

Ordered by dependency, then by risk-reduction. Each phase follows the 15-step discipline in `backend/AGENTS.md` §18 and is not started until the previous one is green (lint, types, tests, migration-from-clean).

### Phase 0 — this document. ✅ Complete.
**Gate:** the blocking open questions in §10 are answered before Phase 2 begins.

### Phase 1 — Platform foundations *(no domain features)*
Core middleware and cross-cutting machinery that every later phase depends on.
- Request context + request id + structured logging; exception handlers mapping `AppError` → the `Errors_Responses.md` envelope
- Pydantic settings hardening (fail startup without `SECRET_KEY` outside development), CORS from config
- Async session, `transaction_scope`, base repository with mandatory `tenant_id`
- Argon2id password hashing; JWT issue/verify; session + refresh-token store
- `PrincipalContext` resolved from a **real** token (the scaffold currently returns a hard-coded SuperAdmin — this is the single most important thing to remove)
- Permission registry seeded from `lib/authorization/permissions.ts`; `require_permission` and policy dependencies
- Tenant/branch scope dependencies mirroring `lib/authorization/scope.ts`
- Audit service + `audit_logs` table with UPDATE/DELETE revoked
- Redis cache + rate limiter; Celery app + `jobs` table
- Pagination, filtering, sorting primitives matching `PaginatedResponse<T>`
- Alembic wired; migrations `0001`–`0004`
- Test harness: throwaway database per run, factory fixtures, an `assert_tenant_isolated(endpoint)` helper reused by every later phase

**Exit:** `/health` green; a protected echo endpoint enforces auth + permission + tenant scope; audit writes; one Celery task round-trips.

### Phase 2 — Identity, Tenancy & Access *(unblocks everything)*
`churches`, `branches`, `users`, `roles`, `permissions`, assignments, sessions.
Endpoints: all of `/auth/*`; `/settings/branches*`, `/settings/users*`, `/settings/roles*`, `/settings/permissions`, `/settings/church-profile`, `/settings`, `/onboarding`.
**Critical:** the `POST /auth/login` response must match the documented shape exactly — `AuthContext` and every permission check in the app depend on it.
Tests: full permission matrix per role, tenant isolation, branch isolation, token lifecycle, lockout, no account enumeration.

### Phase 3 — Files & Audit surface
`files`, `upload_sessions`, `document_shares`, storage provider (local + S3), signed URLs, thumbnails, chunked upload; `/activity-logs*` read API.
Sequenced here because members, finance, communications and Sunday School all attach files.

### Phase 4 — Members, Families & Converts
`/members/*`, `/members/{id}/family*`, `/members/{id}/documents*`, `/documents/*`, `/members/{id}/history`, `/members/import` (as a job), `/members/export`, `/members/search`, `/members/stats`, converts tree.
The largest wired contract and the FK target for nearly everything downstream.

### Phase 5 — Organisational Units
Departments, then Groups (groups reference departments for ministry-style rosters). Both are mock-backed today, so **path sign-off is required first** (OQ-API-16, OQ-07).

### Phase 6 — Attendance & Events
Events first (attendance sessions can reference events). Includes registration capacity control, QR/kiosk check-in, roll-call, headcount.
Blocked on OQ-05 (status enum), OQ-08 (headcount entity), OQ-API-09/14/15.

### Phase 7 — Finance *(highest risk; do not compress)*
Sub-ordered deliberately:
1. Reference data — giving/income/expense/budget categories, receipt sequence
2. Giving — individual + congregational + breakdown model + the `giving_countable` view + receipts
3. Pledges & campaigns — with the "pledges are not giving" invariant under test
4. Income
5. Expenses — including the approval workflow and the missing `finance.expenses.approve` permission
6. Budgets & allocations — including `calculateBudgetUtilization` parity with `tests/unit/finance-math.test.ts`
7. Tithes & offerings (or the decision to fold them into giving)
8. Consolidated reporting + financial audit records + exports

**Do not begin until OQ-03 (currency units), OQ-02 (giving/tithe/donation model) and OQ-API-13 (corrections vs edits) are answered.** Each of these changes the schema.

### Phase 8 — Pastoral Care & Prayer *(highest sensitivity)*
Cases, sessions, assignments, visitations, member requests; prayer requests, categories, responses.
Deliberately after Phase 7 so that the audit, policy and RLS machinery is proven on lower-stakes data first.
Blocked on OQ-06 (taxonomy), OQ-10 (privacy model), OQ-API-20/21 (undefined endpoints), OQ-SEC-05/14 (confidentiality permission and Admin's access).

### Phase 9 — Sunday School & Assets
Sunday School carries child-safeguarding data, so it inherits the Phase 8 confidentiality patterns. Assets are lower risk and can run in parallel.
Blocked on OQ-API-17 / OQ-API-18 (schema-vs-type mismatches).

### Phase 10 — Communications & Notifications
SMS/email providers behind interfaces, campaigns, newsletters, announcements, templates, recipient groups, delivery tracking; in-app notifications and preferences; Celery beat schedules.
Blocked on OQ-API-19 (surface), OQ-INT-02/03 (providers), OQ-JOB-03 (schedules).

### Phase 11 — Analytics & Reporting
Materialised views, all `/reports/*`, custom report builder, exports as jobs, `/analytics/*` aliases.
Last among admin domains because it reads from every other domain's finished schema.

### Phase 12 — Member Self-Service Portal
All of `/member/*` as scoped projections plus the portal-owned tables (settings, QR tokens, join requests, serve interest, family link requests).
Deliberately last: every member endpoint is a projection of an already-built domain, so building it earlier would mean building it twice.
**Blocked on OQ-API-05 (member authentication) — this is the single largest unresolved dependency in the plan**, and on OQ-API-27 (~25 undefined paths).

### Phase 13 — Public / Landing tier *(conditional)*
Only if OQ-SEC-01 / OQ-API-28 confirms it is in scope: public giving gateway + payment webhook, contact inquiries, anonymous prayer, public event RSVP, sermons, service times.
Requires the payment integration (OQ-INT-01) and a distinct anonymous-tier rate-limiting and abuse posture.

### Phase 14 — Hardening
RLS policies, penetration-style isolation sweep across every endpoint, load testing on analytics, backup/restore rehearsal, observability (Sentry + OpenTelemetry per `backend architecture.md` §30), deployment.

---

## 10. Blocking Open Questions

These stop specific phases. Everything else is tracked in the companion documents.

| Blocks | ID | Question |
| :-- | :-- | :-- |
| ~~Phase 1~~ | ~~OQ-API-01~~ | **Closed.** `/api/v1` adopted; `NEXT_PUBLIC_API_URL`, `API_DOCUMENTATION.md` and `api-documentations/*` updated to match. |
| Phase 1 | OQ-API-02/03 | Response envelope: which pagination shape, and is `success` present on every endpoint? Three shapes are currently in use. |
| Phase 1 | OQ-SEC-12 | Does `SuperAdmin` cross tenant boundaries? Determines whether the base repository can ever skip the tenant predicate. |
| Phase 2 | OQ-01 | Are members and users the same principal, or is there a `members.user_id` FK? Determines the identity schema. |
| Phase 2 | OQ-API-04 | Is `POST /auth/register` public self-registration, and if so which tenant does a self-registered user land in? |
| Phase 2 | OQ-SEC-06 | Which role list is authoritative? Recommendation: `lib/authorization/roles.ts` (six roles), because the passing test suite asserts it. |
| Phase 2 | OQ-DB-03 | Argon2id (mandated) vs the pinned `passlib[bcrypt]`; and Python 3.13+ (mandated) vs `requires-python = ">=3.11"`. |
| Phase 4 | OQ-04 | Canonical `membershipStatus` value set — four variants exist. |
| Phase 4 | OQ-API-06 | Is `DELETE /members/{id}` a soft archive or a hard delete? Financial and attendance history reference `member_id`. |
| Phase 6 | OQ-05 | Canonical `AttendanceStatus` value set — three variants. |
| Phase 6 | OQ-09 | Event model shape: admin `date`+`time` vs member `startDate`/`endDate` + host/schedule/questions/fee. |
| **Phase 7** | **OQ-03** | **Money on the wire: minor units (per the type comment) or major units with 2 dp (per every schema, sample, and the math library)?** |
| **Phase 7** | **OQ-02 / OQ-API-07/08/11** | **Are Giving, Tithes-Offerings and Donations one table or three? Which giving endpoint tree is the target?** |
| **Phase 7** | **OQ-API-13** | **Corrections/reversals (mandated) vs the wired PUT/DELETE edit endpoints (in use).** |
| Phase 7 | OQ-API-12 / OQ-SEC-05 | The expense approval endpoint and the `finance.expenses.approve` permission are both missing from the codebase despite being required by the security boundary map. |
| Phase 8 | OQ-06 / OQ-10 | Pastoral care and prayer taxonomies differ between the admin and member sides. |
| Phase 8 | OQ-SEC-14 | Should the general `Admin` role be able to read counselling notes? The role matrix currently says yes; the confidentiality requirement suggests no. |
| **Phase 12** | **OQ-API-05** | **How do members authenticate? There is no member login endpoint anywhere.** |
| Phase 13 | OQ-SEC-01 / OQ-API-28 | Is the public tier in scope at all? |

---

## 11. Architectural Conflicts Found

Recorded plainly, because `backend/AGENTS.md` §4 requires identifying conflicts before implementing through them.

1. **API version prefix** — `/api` (shipped frontend + backend config) vs `/api/v1` (contract + architecture doc).
2. **Endpoint tree divergence, finance** — the documentation describes `/finance/donations|budgets|expenses|reports` and `/giving/donations|reports/*`; the shipped frontend calls `/income`, `/expenses`, `/budgets`, `/giving/individual`, `/giving/congregational`, `/giving/search`. These are disjoint trees for the same capability.
3. **Endpoint tree divergence, analytics** — documented `/analytics/*` vs wired `/reports/*`.
4. **Endpoint tree divergence, communications** — documented `/communications/messages|campaigns|newsletters|overview` vs wired `/communications/sms|emails|announcements|templates|groups`.
5. **Endpoint tree divergence, files** — documented `/files/*` vs wired `/upload/*`.
6. **Permission notation** — three schemes: dot (`finance.expenses.create`, authoritative), member colon (`giving:read:self`, authoritative for the portal), and a third admin colon scheme in the finance API docs (`giving:read`, `income:write`) that must be discarded.
7. **Role definitions** — three different role lists across `roles.ts`, `architecture-baseline.md`, and `README.md`.
8. **Currency units** — type comments say minor units; everything else says major units with 2 dp.
9. **Enum drift** — `membershipStatus` (4 variants), `AttendanceStatus` (3), `ExpenseStatus` (mixed casing in one union), `BudgetStatus` (mixed casing in one union), `GivingCategory` (admin enum vs member string union), prayer privacy (boolean vs 4-value enum), pastoral categories (admin vs member).
10. **Schema/type mismatches** — `lib/validation/sunday-school.ts` vs `lib/types/sunday-school.ts`; `lib/validation/assets.ts` vs `lib/types/assets.ts`; `lib/validation/prayer-requests.ts` vs `lib/types/member/member-prayer.ts`.
11. **Audit record shape** — three incompatible shapes across `audit-logger.ts`, `security-boundary-map.md` §4, and `backend architecture.md` §25.
12. **Pagination envelope** — three shapes (flat, nested-under-`data`, and pastoral care's `{cases, pagination}`).
13. **Attachment transport** — base64-in-body (expenses doc) vs multipart (everywhere else).
14. **Error semantics** — `403` with a tenant-id echo for cross-tenant access (documented) vs non-enumerable `404` (recommended); and `backend architecture.md` §29's nested `{error:{...}}` envelope vs the flat envelope everywhere else.
15. **Missing permissions for mandated operations** — `finance.expenses.approve` is required by the security boundary map but absent from `permissions.ts`; pastoral care has no confidentiality tier while prayer requests do; the File Vault has no permissions at all.
16. **Fail-open authorization defaults** — `validateBranchScope` treats an empty branch assignment as unrestricted; `hasMemberPermission` defaults to granting the full member permission set. Both must be fail-closed server-side.
17. **Placeholder authentication in the scaffold** — `backend/app/api/dependencies.py::get_current_principal` accepts any non-empty bearer string and returns a hard-coded `SuperAdmin` with `permissions=["*"]` and a random tenant id. This must be removed in Phase 1 before any domain router is mounted.
18. **Ministries have no admin home** — a full member-facing ministry model exists with serving rosters and call times, but no admin module, entity, or backend package.
19. **Unimplemented-but-specified surfaces** — prayer requests, tithes-offerings, settings/users/roles/branches, activity logs, event categories/templates, asset maintenance/assignment, check-in/kiosk, and the entire public tier have UI routes and permissions but no endpoint at any authority rank.
20. **General ledger mismatch** — `backend architecture.md` §6/§15/§23 proposes `financial_transactions`, `funds`, `accounts` and `exchange_rates`; the frontend has no ledger, fund, account, or server-side exchange-rate concept. Recommendation: do not build a general ledger.

---

## 12. Definition of Done (per feature, per `backend/AGENTS.md` §20)

Schema exists · migration exists and runs from clean · models exist · Pydantic schemas exist · business logic exists · authorization exists · tenant + branch scope enforced at all four layers · endpoint exists · error handling exists · audit implemented · tests pass (unit + integration + API + authorization + tenant isolation) · Ruff passes · MyPy passes · **API response verified against the frontend contract** · documentation updated.

An endpoint returning HTTP 200 is not a completed feature.
