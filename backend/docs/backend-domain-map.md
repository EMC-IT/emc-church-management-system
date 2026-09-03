# EMC CMS — Backend Domain Map

**Status:** Phase 0 discovery output. No implementation.
**Derived exclusively from:** `README.md`, `AGENTS.md`, `backend/AGENTS.md`, `API_DOCUMENTATION.md`, `api-documentations/*`, `PROJECT_RULES.md`, `docs/architecture/*`, `services/**`, `lib/types/**`, `lib/validation/**`, `lib/authorization/**`, `tests/unit/**`.

Anything not traceable to those sources is marked **OPEN QUESTION** and is *not* treated as a requirement.

---

## 1. Domain Inventory

The backend scaffold (`backend/app/domains/`) already declares 20 domain packages, and these match `docs/architecture/backend architecture.md` §8 and §33. They are adopted as-is.

| # | Backend package | Frontend counterpart | Source of truth for contract |
| :-- | :-- | :-- | :-- |
| 1 | `identity` | `services/auth/`, `lib/authorization/*` | Wired HTTP contract (`/auth/*`) |
| 2 | `churches` | `app/(admin)/onboarding`, `settings/church-profile`, `settings/branches` | Docs + Zod schemas only (no HTTP) |
| 3 | `members` | `services/members/` | Wired HTTP contract |
| 4 | `families` | `services/members/` (family sub-resource) | Wired HTTP contract |
| 5 | `attendance` | `services/attendance/` | **Mock-only** — docs + service signatures |
| 6 | `finance` | `services/finance/` (giving, income, expense, budget) | Partly wired, partly mock |
| 7 | `pastoral_care` | `services/member/pastoral-care.service.ts`, `dashboard/pastoral-care` | **Mock-only** — docs + service signatures |
| 8 | `departments` | `services/departments/` | **Mock-only** |
| 9 | `groups` | `services/groups/` | **Mock-only** |
| 10 | `events` | `services/events/` | Wired HTTP contract |
| 11 | `sunday_school` | `services/sunday-school/` | **Mock-only** |
| 12 | `assets` | `services/assets/` | Wired HTTP contract |
| 13 | `communications` | `services/communications/` | Wired HTTP contract |
| 14 | `prayer_requests` | `lib/validation/prayer-requests.ts`, `components/prayer-requests/`, `services/member/prayer.service.ts` | **Mock-only** |
| 15 | `files` | `services/upload/`, `services/members/documents-service.ts` | Wired HTTP contract |
| 16 | `analytics` | `services/reports/` | Wired HTTP contract (`/reports/*`) |
| 17 | `notifications` | `services/member/notifications.service.ts`, `lib/config/member/notifications.ts` | **Mock-only** |
| 18 | `audit` | `lib/audit/audit-logger.ts`, `dashboard/activity-logs` | Type contract only, no HTTP |
| 19 | `settings` | `dashboard/settings/*`, `lib/validation/settings.ts` | Docs + Zod schemas only |
| 20 | *(cross-cutting)* `member_portal` | `services/member/*` (16 services) | **Mock-only** — docs + service signatures |

> **Architectural note.** `services/member/*` is *not* a 21st domain. Per `docs/architecture/domain-map.md` §3, it is a **self-scoped read/write facade** over Members, Finance, Attendance, Events, Groups, Departments, Journey, Prayer, Pastoral Care, Files and Notifications. It gets its own router surface (`/member/*`) and its own authorization policy family, but it owns **no tables of its own** except member-scoped preferences and the family-link request workflow.

---

## 2. Entities Per Domain

### 2.1 `identity` — Identity & Access

| Entity | Key fields (from source) | Source |
| :-- | :-- | :-- |
| `User` | `id, email, name, role, avatar, createdAt, updatedAt` | `lib/types/auth.ts`, `API_DOCUMENTATION.md` POST /auth/login |
| `UserAccount` (admin-created) | `firstName, lastName, email, phone, username, password, role, department, status(active/inactive/suspended), sendWelcomeEmail, requirePasswordChange, notes` | `lib/validation/settings.ts` `userAccountCreateSchema` |
| `Role` | `name, description, permissions[]` | `lib/validation/settings.ts` `roleCreateSchema`, `lib/authorization/roles.ts` |
| `Permission` | `id (dot-notation string), name, description, resource, action` | `lib/authorization/permissions.ts`, `lib/types/auth.ts` |
| `Session` / `RefreshToken` | rotatable, revocable, device-associated | `backend architecture.md` §12 |
| `PasswordResetToken` | `token, newPassword` exchange | `lib/validation/auth.ts` `resetPasswordSchema` |
| `UserBranchAssignment` | `assignedBranchIds[]` | `lib/authorization/scope.ts` `SecurityContext` |

Built-in roles (**authoritative list = `lib/authorization/roles.ts`**): `SuperAdmin`, `Admin`, `Pastor`, `Accountant`, `Secretary`, `Teacher`.

### 2.2 `churches` — Tenant & Branch

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `Church` (tenant) | `name, motto, vision, mission, coreValues, history, founded, denomination, email, phone, alternativePhone, website, street, city, state, postalCode, country, facebook, twitter, instagram, youtube, seniorPastor, assistantPastor, secretary, treasurer` | `lib/validation/settings.ts` `churchProfileSchema` |
| `Branch` | `name, type(Headquarters/Branch/Mission/Outreach Center), established, email, phone, alternativePhone, street, city, state, postalCode, country, pastor, assistantPastor, secretary, capacity, currentMembers, serviceSchedule, facilities, description, status(active/inactive/under-construction)` | `lib/validation/settings.ts` `branchCreateSchema` |
| `ChurchSettings` | `church{}, appearance{theme,language,timezone,currency}, notifications{email{},sms{}}` | `api-documentations/Settings_Endpoints.md` |

Known branch value set used in member forms: `Adenta (HQ)`, `Adusa`, `Liberia`, `Somanya`, `Mampong` (`lib/validation/members.ts`). These are **seed data for one tenant**, not an enum — see OQ-11.

### 2.3 `members` — Membership CRM

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `Member` | `firstName, lastName, email, phone, address, dateOfBirth, gender, membershipStatus, joinDate, avatar, familyId, department, branch, emergencyContact{name,phone,relationship}, customFields{}, createdAt, updatedAt` | `lib/types/members.ts`, `API_DOCUMENTATION.md` GET /members |
| `MemberExtendedProfile` | `title, ageGroup, lifeDevelopment, serviceType, status, contact1, contact2, departments[], groups[], waterBaptism, holyGhostBaptism, leadershipRole, specialGuestInvitedBy, location, maritalStatus, occupation` | `lib/validation/members.ts` `memberFullFormSchema` |
| `MemberHistoryEntry` | chronological activity/appointment/role/status change | `GET /members/:id/history`, README §4 |
| `Convert` | `fullName, contact1, gender, dateOfBirth, branch, serviceType, status, location` + follow-up stage | `lib/validation/members.ts` `newConvertSchema`, `convertFollowUpSchema` |
| `ConvertFollowUp` | `convertId, stage(New/Contacted/Assigned Mentor/Foundation School/Baptized/Integrated), notes, mentorId, contactDate, nextFollowUpDate` | `convertFollowUpSchema` |
| `ConvertActivity` | activity log per convert | `api-documentations/Convert_Management_Endpoints.md` |
| `MemberDocument` | `memberId, title, description, category, fileName, fileSize, fileType, fileUrl, uploadedBy, uploadedAt, isPublic, tags[], metadata{}` | `lib/types/common.ts` `Document` |
| `MemberJourneyMilestone` | `title, description, type, status, date, completedDate, targetDate, stepNumber, notes, nextSteps, certificateUrl, relatedEntity*, recordedBy` | `lib/types/member/member-journey.ts` |

`membershipStatus` has **two conflicting value sets** — see **OQ-04**.

### 2.4 `families` — Household Graph

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `Family` | `name, headOfFamily, address, phone, email` | `lib/types/members.ts` |
| `FamilyMember` (link) | `memberId, familyMemberId, relationship` | `lib/validation/members.ts` `familyLinkSchema` |
| `FamilyMemberProfile` | `firstName, lastName, relationship(Head/Spouse/Child/Dependent/Other), dateOfBirth, gender, phone, email, isRegisteredMember, canManagePermissions` | `lib/validation/member/family.schema.ts` |
| `FamilyLinkRequest` | `targetMemberId, relationship` — member-initiated, **requires pastoral verification** | `API_DOCUMENTATION.md` POST /member/family/link, README Part II |

### 2.5 `attendance` — Attendance & Check-In

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `AttendanceSession` | `title, serviceType, date, startTime, endTime, location, expectedAttendees, actualAttendees, attendanceRate, status(scheduled/ongoing/completed/cancelled), createdBy, branch, departmentId, groupId` | `lib/types/attendance.ts` |
| `AttendanceRecord` | `memberId, serviceType, serviceDate, status, checkInTime, checkOutTime, notes, recordedBy, branch` | `lib/types/attendance.ts` |
| `CheckIn` (QR/kiosk) | dynamic personal QR token, kiosk mode + scanner mode | README §7, `GET /member/attendance/qr` |
| `HeadcountTally` | Men, Women, Children, First-Time Visitors, Total | README §7 — **no type/schema exists**, see OQ-08 |
| `GroupAttendance` | `groupId, eventId, memberId, date, status, checkInTime, checkOutTime, notes, recordedBy` | `lib/types/groups.ts` |
| `DepartmentAttendance` | `departmentId, meetingId, eventId, memberId, date, status, ...` | `lib/types/departments.ts` |

`AttendanceStatus` has **three conflicting value sets** — see **OQ-05**.

### 2.6 `finance` — Finance & Stewardship

This is the largest and highest-integrity domain. It has **five sub-aggregates**.

**(a) Giving**

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `Giving` | `memberId?, memberName?, source(individual\|congregational), type, amount, currency, category, campaignId?, serviceEvent?, parentGivingId?, method, date, description, isAnonymous, receiptNumber, status, metadata{}` | `lib/types.ts` |
| `IdentifiedContribution` | `memberId?, memberName?, amount, isAnonymous, notes` — attribution sub-record of a congregational total | `lib/types.ts` |
| `GivingCategoryRef` | admin-managed category master | `/giving/categories`, `dashboard/finance/giving/categories` |
| `Pledge` | `memberId, campaignId?, pledgedAmount, paidAmount, outstandingAmount, currency, pledgeDate, completionDate, status, notes, payments[]` | `lib/types.ts` |
| `PledgePayment` | `pledgeId, givingId?, amount, currency, date, method, notes` | `lib/types.ts` |
| `FundraisingCampaign` | `name, description, targetAmount, pledgedAmount, receivedAmount, outstandingAmount, currency, startDate, endDate, status, fund` | `lib/types.ts` |
| `Receipt` | `receiptNumber, type, amount, currency, date, description, donorName, memberName, branch, generatedBy, generatedAt, pdfUrl` | `lib/types/finance.ts` |

**(b) Tithes & Offerings** — `TitheOffering { memberId?, memberName, type, amount, currency, serviceType, serviceDate, branch, recordedBy, receiptNumber, notes }` (`lib/types/finance.ts`). Overlaps `Giving` — see **OQ-02**.

**(c) Donations** — `Donation { donorName, donorEmail, donorPhone, amount, currency, category, method, status, description, receiptNumber, date, branch, recordedBy, customFields{} }`. Also overlaps `Giving` — see **OQ-02**.

**(d) Income** — `IncomeCategory`, `IncomeRecord { description, amount, currency, categoryId, source, paymentMethod, date, status(received/pending/cancelled), reference, notes }`.

**(e) Expenses & Budgets** — `ExpenseCategory`, `ExpenseRecord { title, description, amount, currency, categoryId, vendor, paymentMethod, date, status, receiptNumber, approvedBy, approvedAt, notes, attachments[] }`, `ExpenseAttachment`, `BudgetRecord`, `BudgetCategory`, `BudgetAllocation { budgetId, department, allocatedAmount, spentAmount, percentage, notes }`.

### 2.7 `pastoral_care` — Confidential

| Entity | Key fields | Source |
| :-- | :-- | :-- |
| `PastoralCase` | `memberId, category, priority, status, assignedPastorId, notes, scheduledDate, lastSessionDate, nextFollowUpDate, totalSessions` | `api-documentations/Pastoral_Care_Endpoints.md` |
| `PastoralSession` | `sessionDate, location, confidentialNotes, nextFollowUpDate, status, pastorName, summary, actionItems` | ibid. |
| `Visitation` | hospital / home / bereavement / prison / sick-call logs with outcomes and follow-up | README §5 |
| `MemberPastoralCareRequest` | `category, preferredMode, preferredDate, preferredTimeSlot, assignedPastor, status, urgency, reason, summaryNotes, scheduledDateTime, locationOrLink` | `lib/types/member/member-pastoral-care.ts` |

Admin and member vocabularies **do not match** — see **OQ-06**.

### 2.8 `departments` — Departments & Teams

`DepartmentCategory`, `Department`, `DepartmentMember`, `DepartmentRole` (`head/assistant_head/secretary/treasurer/coordinator/member`), `DepartmentMeeting` (+ `agenda[]`, `minutes`, `decisions[]`, `actionItems[]`), `DepartmentEvent`, `DepartmentAttendance`. All from `lib/types/departments.ts`.

### 2.9 `groups` — Small Groups & Cells

`Group`, `GroupCategory`, `GroupMember`, `GroupRole`, `GroupEvent`, `GroupAttendance`. From `lib/types/groups.ts`. Member-facing projections `MemberGroup` / `DiscoverableGroup` / `MemberMinistry` / `DiscoverableMinistry` live in `lib/types/member/`.

> **Ministries vs Groups:** the member portal treats *Ministries* as a distinct concept with `MinistryServiceSchedule`, `MinistryAssignment` (rosters/duty schedules) and `myRoles[]`, while the admin side has no `Ministry` entity — the closest admin analogue is `Department`. See **OQ-07**.

### 2.10 `events` — Events & Calendar

`Event`, `EventCategory`, `EventRegistration`, `EventAttendee`, `EventAttendance`, `EventTemplate`. Admin type is `lib/types.ts` `Event` (flat `date`+`time`); member type is `lib/types/member/member-event.ts` (`startDate`/`endDate`, `host`, `schedule[]`, `customQuestions[]`, `fee{}`). See **OQ-09**.

### 2.11 `sunday_school`

`SundaySchoolClass`, `Teacher`, `Student` (+ `parentContact{}`, `medicalInfo`, `allergies[]`, `classHistory[]`), `ClassAttendance`, `TeachingMaterial`. From `lib/types/sunday-school.ts` and `lib/validation/sunday-school.ts`.

**Child safeguarding** fields (allergies, special needs, emergency contacts, authorised pickup persons, teacher background-check notes — README §11, `dashboard/settings/background-checks`) are classed **CONFIDENTIAL** per `backend architecture.md` §37.

### 2.12 `assets`

`Asset`, `AssetCategoryData`, `AssetMaintenance` (+ `partsUsed[]`), `AssetAssignment` (custody check-out/check-in), `AssetDepreciation`. From `lib/types/assets.ts`.

### 2.13 `communications`

`SMSMessage`, `EmailMessage`, `EmailCampaign`, `Newsletter`, `Announcement`, `MessageTemplate`, `RecipientGroup`. From `lib/validation/communications.ts` + the wired `/communications/*` paths.

### 2.14 `prayer_requests`

Admin `PrayerRequest { requesterId, title, description, priority, status, isConfidential, isAnonymous, assignedTo, requesterName/Email/Phone, notifyPrayerTeam, allowPublicPrayers, pastoralNotes }` (`lib/types/common.ts` + `lib/validation/prayer-requests.ts`); member `MemberPrayerRequest { title, category, description, privacy, status, isUrgent, answeredDate, testimony, pastoralNotesCount }`. `PrayerCategory`, `PrayerResponse`. Two vocabularies — see **OQ-10**.

### 2.15 `files`

`FileItem` / `UploadedFile` (vault), `Document` (member-scoped), `DocumentShare`, `DocumentTag`, `UploadSession` (init/chunk/complete for large files).

### 2.16 `analytics`

Query/projection domain. Owns no operational tables. Owns `ReportPreset`, `CustomReportDefinition`, `AnalyticsPreference`, and materialised views (`backend architecture.md` §26).

### 2.17 `notifications`

`Notification` (in-app, per member: `type, title, message, createdAt, isRead, readAt, category, action{label,href}`), `NotificationPreference`, `DeliveryLog`. From `lib/types/member/member-notification.ts`, `lib/types/member/member-settings.ts`.

### 2.18 `audit`

`AuditLog` — immutable. `{ id, timestamp, actor{id,email,name,role}, action, resource, resourceId, tenantId, branchId?, status, before{}, after{}, metadata{}, ipAddress, userAgent, requestId }`. From `lib/audit/audit-logger.ts` + `docs/architecture/security-boundary-map.md` §4 + `backend architecture.md` §25. Field-name reconciliation needed — see **OQ-13**.

### 2.19 `settings`

`ChurchProfile`, `Branch` (owned by `churches`), `SystemSettings`, `IntegrationConfig`, `BackupConfig`, `NotificationDefaults`, `BackgroundCheckRecord`.

### 2.20 `member_portal` (facade)

Owns only: `MemberSettings` (profile/communication/notifications/privacy/appearance), `MemberSecuritySettings` (`twoFactorEnabled`, `sessionTimeoutMinutes`), `FamilyLinkRequest`, `GroupJoinRequest`, `MinistryServeInterest`, `MemberQrToken`. Everything else is a scoped projection.

---

## 3. Entity Relationships

```
Church (tenant)
 └─1..n─ Branch
          ├─1..n─ Member ──0..1─ Family ──1..n─ Member
          │        ├─1..n─ MemberDocument ──1─ File
          │        ├─0..1─ Convert ──1..n─ ConvertFollowUp / ConvertActivity
          │        ├─1..n─ MemberJourneyMilestone
          │        ├─1..n─ AttendanceRecord ──n..1─ AttendanceSession
          │        ├─1..n─ Giving ──0..1─ PledgePayment ──n..1─ Pledge ──0..1─ FundraisingCampaign
          │        ├─1..n─ EventRegistration ──n..1─ Event
          │        ├─n..m─ Group (GroupMember) ──1..n─ GroupRole / GroupEvent / GroupAttendance
          │        ├─n..m─ Department (DepartmentMember) ──1..n─ DepartmentRole / DepartmentMeeting / DepartmentEvent
          │        ├─1..n─ PrayerRequest ──1..n─ PrayerResponse
          │        ├─1..n─ PastoralCase ──1..n─ PastoralSession / Visitation      [CONFIDENTIAL]
          │        ├─0..1─ Student ──n..1─ SundaySchoolClass ──n..1─ Teacher
          │        └─1..n─ Notification
          ├─1..n─ IncomeRecord ──n..1─ IncomeCategory
          ├─1..n─ ExpenseRecord ──n..1─ ExpenseCategory ─┐
          ├─1..n─ BudgetRecord ──1..n─ BudgetAllocation ─┘ (department cap)
          ├─1..n─ Asset ──1..n─ AssetMaintenance / AssetAssignment ──n..1─ AssetCategory
          └─1..n─ Announcement / SMSMessage / EmailCampaign / Newsletter

User ──n..1─ Role ──n..m─ Permission
User ──n..m─ Branch (UserBranchAssignment)
User ──1..n─ Session/RefreshToken
Any mutation ──1..n─ AuditLog (append-only)

Giving.parentGivingId ──self──> Giving   (congregational → identified contribution)
```

**Self-referencing / non-obvious edges worth calling out:**

- `Giving.parentGivingId` — a congregational giving record owns 0..n identified-contribution children. Children are **attribution only** and must be excluded from every aggregate (`lib/types.ts` inline contract).
- `PledgePayment.givingId` — each payment against a pledge creates exactly one `Giving` row that *does* count. The `Pledge` itself never counts.
- `BudgetAllocation.department` links Finance → Departments by **name string** today, not by id. See **OQ-12**.
- `Member.department` and `Member.branch` are free-text strings in `lib/types/members.ts` while `Department` and `Branch` are entities. The backend must key on ids and expose names.

---

## 4. Tenant Ownership

Per `docs/architecture/domain-map.md` §3 and `backend architecture.md` §9–10, **every** operational table carries `church_id` (`tenant_id` in the frontend `SecurityContext` vocabulary).

| Tenant-scoped (`church_id NOT NULL`) | Global / not tenant-scoped |
| :-- | :-- |
| Every entity in §2.3 – §2.20 | `permissions` catalogue (the canonical dot-notation permission list) |
| `churches` rows are the tenant roots themselves | Alembic version table |
| `branches`, `users`, `roles`, `sessions` | System-level feature flags (if introduced) |
| `audit_logs` (carries `church_id`) | |

Rules (`security-boundary-map.md` Rule 1, `backend/AGENTS.md` §7):
1. `church_id` is **always** derived from the verified JWT, never from the request body, query string, or `X-Tenant-ID` header. The `X-Tenant-ID` / `X-Branch-ID` headers documented in `api-documentations/Introduction.md` may be accepted as a *hint* but must be validated against the token; they can never widen access. **OQ-14.**
2. Isolation is enforced at four layers: API context → service → repository → database (RLS considered for `pastoral_*`, `finance_*`, `audit_logs`).
3. A cross-tenant read returns `404`, not `403`, to avoid confirming existence. *(Note: `api-documentations/Errors_Responses.md` §3 says cross-tenant access returns `403`. **OQ-15**.)*

## 5. Branch Ownership

| Branch-scoped (`branch_id` meaningful) | Tenant-wide only |
| :-- | :-- |
| `members`, `attendance_sessions`, `attendance_records`, `giving`, `tithes_offerings`, `donations`, `income`, `expenses`, `budgets`, `events`, `groups`, `departments`, `sunday_school_classes`, `assets`, `pastoral_cases`, `prayer_requests`, `communications_*`, `files` | `church_profile`, `roles`, `permissions`, `system_settings`, `giving_categories`, `expense_categories`, `income_categories`, `asset_categories`, `group_categories`, `department_categories`, `event_categories` |

- `branch_id` is nullable on the shared mixin (`backend/app/core/database/base.py::TenantScopedMixin`) so tenant-wide rows can share the table shape.
- Branch access derives from `UserBranchAssignment`. `lib/authorization/scope.ts::validateBranchScope` encodes the rule: an empty `assignedBranchIds` list means "no branch restriction"; a non-empty list is an allow-list. **This "empty = unrestricted" semantic is a security-sensitive default — see OQ-16.**
- `SuperAdmin` bypasses both tenant and branch checks (`scope.ts`). The backend must **not** bypass tenant scope for SuperAdmin unless SuperAdmin is genuinely a platform-operator role. **OQ-17.**

---

## 6. Cross-Domain Dependencies

Permitted direction, per `docs/architecture/domain-map.md` §3 ("no direct inter-service mutation") and `backend architecture.md` §35 ("dependencies flow inward"; no cycles).

| Consumer domain | Depends on | Nature | Allowed? |
| :-- | :-- | :-- | :-- |
| `finance` | `members` | reads `member_id` as a foreign identifier only; never mutates member data | ✅ read-only reference |
| `finance` | `departments` | budget allocations + expense department attribution | ✅ read-only reference |
| `finance` | `files` | expense receipts, giving receipt PDFs | ✅ service interface |
| `attendance` | `members`, `groups`, `departments`, `events` | logging references | ✅ read-only reference |
| `events` | `members`, `groups`, `files` | registrations, group-linked events, cover images | ✅ |
| `groups` / `departments` | `members` | rosters | ✅ |
| `sunday_school` | `members`, `files` | parent/guardian link, materials | ✅ |
| `pastoral_care` | `members`, `notifications` | case subject, appointment reminders | ✅ (confidential payload never crosses back) |
| `prayer_requests` | `members`, `notifications`, `pastoral_care` | assignment + confidential escalation | ✅ |
| `communications` | `members`, `groups`, `departments` | recipient resolution | ✅ read-only |
| `analytics` | **all** | read-only aggregate queries + materialized views | ✅ read-only, never writes |
| `audit` | **all** | receives events; no domain reads audit | ✅ write-only sink |
| `notifications` | **all** | receives events | ✅ write-only sink |
| `files` | `identity` | ownership + signed-URL authorization | ✅ |
| `member_portal` | **all** | self-scoped projections | ✅ read-mostly; writes route through owning domain services |
| `identity` | `churches` | tenant + branch assignment | ✅ |

**Forbidden edges** (would create cycles or violate ownership):
- `members` → `finance` (a member record must never read or write giving)
- `finance` → `attendance`
- any domain → `analytics`
- any domain writing another domain's tables directly (must go via application service)

**Highest-fan-in domains** (build first): `identity`, `churches`, `members`, `files`, `audit`.

---

## 7. Open Questions (Domain Layer)

| ID | Question | Evidence of conflict |
| :-- | :-- | :-- |
| **OQ-01** | Are Members and Users the same principal, or separate? A member portal login (`/portal/*`) and an admin login (`/login`) are described as separate credential sets (`architecture-baseline.md` §3.1: "members authenticate into the member portal with scoped member credentials"), but there is no `MemberUser` type. Does `members.id == users.id`, or is there a `user_id` FK on `members`? | `architecture-baseline.md` §3.1 vs `lib/types/auth.ts` (single `User`) |
| **OQ-02** | `Giving`, `TitheOffering` and `Donation` are three separate types with overlapping semantics and three separate admin route trees (`/finance/giving`, `/finance/tithes-offerings`, `/finance/giving/donations`). Are these one table with a discriminator, or three tables? What is the canonical revenue table? | `lib/types.ts` `Giving` vs `lib/types/finance.ts` `TitheOffering` + `Donation`; routes under `app/(admin)/dashboard/finance/` |
| **OQ-03** | Currency storage unit. `lib/types/finance.ts` and `lib/types/assets.ts` declare `type Amount = number; // Always in smallest currency unit (pesewas for GHS)`, but every Zod schema, every API example, `finance-math.ts::roundToTwoDecimals`, and `api-documentations/Income_Endpoints.md` ("decimal numbers with 2 decimal places") use **major units**. Which is authoritative for the wire format? | `lib/types/finance.ts:7` vs `lib/finance/finance-math.ts`, `api-documentations/Income_Endpoints.md` §Currency |
| **OQ-04** | `membershipStatus` value set. Three variants exist: `New/Active/Inactive/Transferred/Archived` (`lib/types/members.ts`), `Active/Inactive/Pending/Suspended/Deceased` (`lib/validation/members.ts`), `Member/Attender/Special Guest/Stop Coming` (`memberFullFormSchema.status`), plus `Active/New/Associate/Pending` (`member-profile.ts`). Which is canonical? Are `status` and `membershipStatus` two different fields? | four sources listed |
| **OQ-05** | `AttendanceStatus` value set: `present/absent/late/excused/partial` (`lib/types/attendance.ts`), `Present/Absent/Late/Excused` (`lib/types/sunday-school.ts`, `lib/validation/attendance.ts`), `present/online/excused/absent` (`lib/types/member/member-attendance.ts`). Is `online` a status or a check-in method? README §7 lists "Present, Absent, Excused, Online". | three sources |
| **OQ-06** | Pastoral care taxonomy. Admin categories are `Marriage/Bereavement/Health/Spiritual/Financial` and statuses `New/In_Progress/Follow_Up/Closed`; member categories are `Counseling/Hospital Visit/Bereavement/Home Visit/Spiritual Guidance/Dedication / Blessing/Other` and statuses `Requested/Scheduled/In Progress/Completed/Follow-up Needed/Cancelled`. Is a member request a *distinct entity* that is triaged into a `PastoralCase`, or the same row? | `api-documentations/Pastoral_Care_Endpoints.md` vs `lib/types/member/member-pastoral-care.ts` |
| **OQ-07** | Is `Ministry` a first-class entity or a projection of `Department` / `Group`? The member portal has full `MemberMinistry`, `MinistryAssignment` (serving rosters, call times) and a `/portal/ministries` page, but there is no admin ministry module, no `ministries` backend package, and no admin type. | `lib/types/member/member-ministry.ts` vs `backend/app/domains/*`, admin routes |
| **OQ-08** | Aggregate headcount tally (Men / Women / Children / First-Time Visitors / Total) is a documented feature of `/dashboard/attendance/take` but has **no type, schema, or endpoint**. Is it a separate `AttendanceHeadcount` entity alongside per-member records? | README §7 vs absence in `lib/types/attendance.ts` |
| **OQ-09** | Event model shape. Admin `Event` uses `date` + `time` strings; member `MemberEvent` uses `startDate`/`endDate` ISO datetimes plus `host`, `schedule[]`, `customQuestions[]`, `fee{}`. Is the admin shape a legacy view over a richer model, or are the extra member fields aspirational? Are paid events (`EventFee.amount`) in scope, and do they create `Giving` records? | `lib/types.ts` `Event` vs `lib/types/member/member-event.ts` |
| **OQ-10** | Prayer privacy model. Admin uses a boolean `isConfidential` + `isAnonymous` + `allowPublicPrayers`; member uses a 4-value enum `Pastoral Team Only / Church Prayer Team / Public / Anonymous`. Which is canonical, and how do they map? | `lib/validation/prayer-requests.ts` vs `lib/types/member/member-prayer.ts` |
| **OQ-11** | Are branches and service types tenant-configurable master data, or fixed enums? `memberFullFormSchema` hard-codes 5 branch names and 4 service types as Zod enums; `branchCreateSchema` implies branches are user-created rows. | `lib/validation/members.ts` vs `lib/validation/settings.ts` |
| **OQ-12** | `BudgetAllocation.department`, `ExpenseRecord` department, `Member.department` and `Group.leader` are name strings, not ids. Should the backend expose id-based fields (breaking the current shape) or keep name strings and resolve server-side? | `lib/types/finance.ts`, `lib/types/members.ts` |
| **OQ-13** | Audit event shape mismatch. `lib/audit/audit-logger.ts` uses `resource` + `resourceId` and has no `ipAddress`/`userAgent`/`requestId`; `security-boundary-map.md` §4 uses `resource{type,id,name}` + `scope{tenantId,branchId}` + `ipAddress`/`userAgent`; `backend architecture.md` §25 uses `entity_type`/`entity_id`/`before_data`/`after_data`/`request_id`. Which is the wire contract for `/activity-logs`? | three sources |
| **OQ-14** | Should `X-Tenant-ID` / `X-Branch-ID` request headers be honoured at all? They are documented as "Optional / Resolved via JWT" but Rule 1 forbids trusting client scope. | `api-documentations/Introduction.md` vs `security-boundary-map.md` Rule 1 |
| **OQ-15** | Cross-tenant access response code: `403` (documented) or `404` (non-enumerable, security best practice)? | `api-documentations/Errors_Responses.md` §3 |
| **OQ-16** | `validateBranchScope` treats an empty `assignedBranchIds` array as *unrestricted*. Is that intended (fail-open), or should an unassigned user be denied all branch-scoped data (fail-closed)? | `lib/authorization/scope.ts` |
| **OQ-17** | Does `SuperAdmin` cross **tenant** boundaries (platform operator) or only branch boundaries within one tenant? `validateTenantScope` returns early for SuperAdmin, which would allow cross-church access. | `lib/authorization/scope.ts` |
| **OQ-18** | The public/landing portal (11 routes: giving gateway, contact form, anonymous prayer, public event RSVP, sermons archive) is **entirely static** — no service, no types (`lib/types/landing.ts` referenced in `domain-map.md` does not exist), no endpoints. Is a public API in scope for this backend phase? | `docs/architecture/domain-map.md` row "Public Portal" vs `components/landing/*` and `ls lib/types/` |
| **OQ-19** | Is a `Sermon` entity in scope? It appears in `domain-map.md`'s Public Portal row and README Part I, but has no type, service, admin route, or backend package. | as above |
| **OQ-20** | Multi-currency: is there an `ExchangeRate` entity and is it authoritative server-side? `backend architecture.md` §6/§15 lists `ExchangeRate` and `financial_transactions.exchange_rate`, but the frontend `CurrencyContext` holds rates client-side and no rate API exists. | `backend architecture.md` §6 vs `architecture-baseline.md` §3 |
