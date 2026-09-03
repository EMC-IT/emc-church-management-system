# EMC CMS — Backend Database Plan

**Status:** Phase 0 discovery output. No migrations written, no tables created.

Per `backend/AGENTS.md` §17, no table is proposed here without a traced source. Tables that exist only because a screen would find them convenient are **not** included; where a screen implies a table with no supporting type or contract, it is listed under §9 Open Questions instead.

---

## 1. Conventions

| Concern | Decision | Source |
| :-- | :-- | :-- |
| Engine | PostgreSQL | `backend/AGENTS.md` §2 |
| ORM | SQLAlchemy 2.x, async (`asyncpg`) | `backend/AGENTS.md` §13, `backend/app/core/database/session.py` |
| Migrations | Alembic, one per schema change, reviewed for data loss / indexes / FKs / nullability / uniqueness / tenant isolation / performance | `backend/AGENTS.md` §13 |
| PK | `UUID` (`uuid4`), `id` | `backend/app/core/database/base.py` uses `UUID(as_uuid=True)` |
| Timestamps | `created_at`, `updated_at` — `TIMESTAMPTZ NOT NULL` | `TimestampMixin` (already implemented) |
| Tenant column | `tenant_id UUID NOT NULL` indexed | `TenantScopedMixin` (already implemented) |
| Branch column | `branch_id UUID NULL` indexed | `TenantScopedMixin` |
| Money | `NUMERIC(14,2)`; never `float`/`double` | `backend/AGENTS.md` §10, `api-documentations/Introduction.md` §3 |
| Currency | `CHAR(3)`, default `'GHS'` | `currencySchema` = `GHS\|USD\|EUR\|GBP\|NGN` |
| Enums | PostgreSQL native `ENUM` **only** where the value set is settled; `VARCHAR` + CHECK where OQ-flagged | see §9 |
| Soft delete | `deleted_at TIMESTAMPTZ NULL` on member, financial, and file tables | implied by `Archived`/`Transferred` statuses and audit immutability |
| Naming | `snake_case`, plural table names | `backend architecture.md` §23 |

> **Column-name mapping.** The frontend `SecurityContext` uses `tenantId`; `backend architecture.md` §9 uses `church_id`; the already-written `TenantScopedMixin` uses `tenant_id`. **Recommendation:** keep `tenant_id` in the database (matches the shipped mixin, avoids a rewrite) and treat "church" as the *entity* name (`churches.id` is the tenant id). Confirm — **OQ-DB-01**.

---

## 2. Identity & Organization

### `churches` *(tenant root)*
`id`, `name`, `motto`, `vision`, `mission`, `core_values`, `history`, `founded`, `denomination`, `email`, `phone`, `alternative_phone`, `website`, `street`, `city`, `state`, `postal_code`, `country`, `facebook`, `twitter`, `instagram`, `youtube`, `senior_pastor`, `assistant_pastor`, `secretary`, `treasurer`, `default_currency`, `timezone`, `status`, timestamps.
- **UNIQUE** (`slug`) if a tenant slug is introduced — **OQ-DB-02**.
- No `tenant_id` (it *is* the tenant).

### `branches`
`id`, `tenant_id`, `name`, `type` (`Headquarters|Branch|Mission|Outreach Center`), `established`, `email`, `phone`, `alternative_phone`, `street`, `city`, `state`, `postal_code`, `country`, `pastor`, `assistant_pastor`, `secretary`, `capacity INT`, `service_schedule`, `facilities`, `description`, `status` (`active|inactive|under-construction`), timestamps.
- **UNIQUE** (`tenant_id`, `name`).
- **INDEX** (`tenant_id`, `status`).
- Exactly one branch per tenant should carry `type='Headquarters'` — enforce with a partial unique index.

### `users`
`id`, `tenant_id`, `first_name`, `last_name`, `name` (display), `email`, `username`, `phone`, `password_hash`, `role_id FK→roles`, `department`, `status` (`active|inactive|suspended`), `avatar_url`, `require_password_change BOOL`, `last_login_at`, `failed_login_count`, `locked_until`, `notes`, timestamps, `deleted_at`.
- **UNIQUE** (`tenant_id`, `lower(email)`), **UNIQUE** (`tenant_id`, `lower(username)`).
- Password hashing: **Argon2id** (`backend architecture.md` §12). The scaffold's `passlib[bcrypt]` dependency must be replaced — **OQ-DB-03**.
- `member_id UUID NULL FK→members` if members and users are linked — blocked on domain **OQ-01**.

### `roles`
`id`, `tenant_id NULL` (NULL ⇒ system role), `name`, `description`, `is_system BOOL`, timestamps.
- **UNIQUE** (`tenant_id`, `name`).
- Seed the six roles from `lib/authorization/roles.ts`: `SuperAdmin`, `Admin`, `Pastor`, `Accountant`, `Secretary`, `Teacher`.

### `permissions` *(global, not tenant-scoped)*
`id`, `code` (dot-notation, e.g. `finance.expenses.create`), `name`, `description`, `category`, `resource`, `action`.
- **UNIQUE** (`code`). Seed from the 158 codes in `lib/authorization/permissions.ts` (see security plan §3).

### `role_permissions`
`role_id FK`, `permission_id FK`. PK (`role_id`, `permission_id`). Seed from `ROLE_PERMISSIONS`.

### `user_branch_assignments`
`user_id FK`, `branch_id FK`, `is_primary BOOL`. PK (`user_id`, `branch_id`). Backs `SecurityContext.assignedBranchIds`.

### `sessions` / `refresh_tokens`
`id`, `user_id FK`, `token_hash`, `device`, `user_agent`, `ip_address INET`, `issued_at`, `expires_at`, `revoked_at`, `rotated_from_id` self-FK.
- **INDEX** (`user_id`, `revoked_at`), **INDEX** (`expires_at`) for cleanup job.
- Store hashes only, never raw tokens.

### `password_reset_tokens`
`id`, `user_id FK`, `token_hash`, `expires_at`, `used_at`. Single-use.

---

## 3. Membership

### `members`
`id`, `tenant_id`, `branch_id`, `title`, `first_name`, `last_name`, `full_name`, `email`, `phone` (contact1), `alternate_phone` (contact2), `address`, `location`, `date_of_birth DATE`, `gender`, `marital_status`, `age_group`, `occupation`, `membership_status`, `status`, `service_type`, `life_development`, `join_date DATE`, `avatar_url`, `family_id FK→families NULL`, `water_baptism BOOL`, `baptism_date DATE`, `holy_ghost_baptism BOOL`, `leadership_role`, `special_guest_invited_by`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relationship`, `custom_fields JSONB`, timestamps, `deleted_at`.
- **INDEX** (`tenant_id`, `branch_id`, `membership_status`)
- **INDEX** (`tenant_id`, `family_id`)
- **INDEX** GIN on `to_tsvector(first_name || last_name || email || phone)` for `/members/search`
- **UNIQUE** (`tenant_id`, `lower(email)`) `WHERE email IS NOT NULL AND deleted_at IS NULL` — `Errors_Responses.md` §5 requires a 409 on email/phone collision
- **UNIQUE** (`tenant_id`, `phone`) `WHERE deleted_at IS NULL` — same source
- `membership_status` / `status` value sets are **blocked on domain OQ-04**; use `VARCHAR` + CHECK until resolved.

### `families`
`id`, `tenant_id`, `branch_id`, `name`, `head_of_family_id FK→members NULL`, `address`, `phone`, `email`, timestamps.
- **INDEX** (`tenant_id`, `name`).

### `family_relationships`
`id`, `tenant_id`, `member_id FK`, `related_member_id FK NULL`, `family_id FK`, `relationship` (`Head|Spouse|Child|Dependent|Other|…`), `is_family_head BOOL`, `can_manage_permissions BOOL`, timestamps.
- **UNIQUE** (`member_id`, `related_member_id`, `relationship`).
- **CHECK** `member_id <> related_member_id`.
- Unregistered household members (`isRegisteredMember=false`) have `related_member_id IS NULL` and carry inline `first_name`/`last_name`/`date_of_birth`/`gender`/`phone`/`email` columns.

### `family_link_requests`
`id`, `tenant_id`, `requested_by_member_id FK`, `target_member_id FK`, `relationship`, `status` (`pending|approved|rejected`), `reviewed_by_user_id FK NULL`, `reviewed_at`, timestamps. Backs `POST /member/family/link` ("requires pastoral verification").

### `member_history`
`id`, `tenant_id`, `member_id FK`, `event_type`, `title`, `description`, `occurred_at`, `recorded_by_user_id FK`, `metadata JSONB`, `created_at`. Append-only.

### `converts`
`id`, `tenant_id`, `branch_id`, `member_id FK NULL`, `full_name`, `contact1`, `gender`, `date_of_birth`, `service_type`, `status`, `location`, `stage` (`New|Contacted|Assigned Mentor|Foundation School|Baptized|Integrated`), `mentor_id FK→members NULL`, `promoted_at`, timestamps.
- **INDEX** (`tenant_id`, `branch_id`, `stage`).

### `convert_follow_ups`
`id`, `tenant_id`, `convert_id FK`, `stage`, `notes`, `mentor_id FK NULL`, `contact_date DATE`, `next_follow_up_date DATE`, `recorded_by_user_id FK`, timestamps.
- **INDEX** (`tenant_id`, `next_follow_up_date`) — drives reminder jobs.

### `convert_activities`
`id`, `tenant_id`, `convert_id FK`, `activity_type`, `description`, `occurred_at`, `recorded_by_user_id`, `created_at`.

### `member_journey_milestones`
`id`, `tenant_id`, `member_id FK`, `type`, `title`, `description`, `status`, `step_number INT`, `date DATE`, `completed_date DATE`, `target_date DATE`, `notes`, `next_steps`, `certificate_file_id FK→files NULL`, `related_entity_type`, `related_entity_id`, `recorded_by_user_id`, timestamps.
- **INDEX** (`tenant_id`, `member_id`, `status`).

---

## 4. Finance *(highest integrity — see §7)*

### `giving`
`id`, `tenant_id`, `branch_id`, `member_id FK NULL`, `member_name`, `source` (`individual|congregational`), `type`, `amount NUMERIC(14,2) NOT NULL`, `currency CHAR(3)`, `category`, `campaign_id FK→fundraising_campaigns NULL`, `service_event`, **`parent_giving_id FK→giving NULL`**, `method`, `date DATE NOT NULL`, `description`, `is_anonymous BOOL NOT NULL DEFAULT false`, `receipt_number`, `status`, `metadata JSONB`, `recorded_by_user_id FK`, `reversed_by_giving_id FK→giving NULL`, timestamps, `deleted_at`.
- **CHECK** `amount > 0` (`titheOfferingCreateSchema`, `donationCreateSchema`, `incomeCreateSchema` all require positive)
- **CHECK** `member_id IS NOT NULL OR is_anonymous OR source='congregational'` — encodes "memberId required unless isAnonymous" from `giving-service.ts`
- **CHECK** `parent_giving_id IS NULL OR source='individual'` — breakdowns are individual attributions of a congregational parent
- **UNIQUE** (`tenant_id`, `receipt_number`) `WHERE receipt_number IS NOT NULL`
- **INDEX** (`tenant_id`, `branch_id`, `date`)
- **PARTIAL INDEX** (`tenant_id`, `date`) `WHERE parent_giving_id IS NULL` — this is the index every aggregate must use
- **INDEX** (`tenant_id`, `member_id`, `date`)
- **INDEX** (`tenant_id`, `campaign_id`)

> **Aggregation invariant.** Every SUM/COUNT over `giving` must include `parent_giving_id IS NULL`. Recommend a database **view** `giving_countable` that hard-codes this predicate, and forbid domain code from aggregating the base table directly. This is the single most likely source of a silent financial defect in the system.

### `giving_categories`, `giving_types`
`id`, `tenant_id`, `name`, `code`, `description`, `color`, `is_active`, timestamps. UNIQUE (`tenant_id`, `code`).

### `pledges`
`id`, `tenant_id`, `branch_id`, `member_id FK NOT NULL`, `campaign_id FK NULL`, `pledged_amount NUMERIC(14,2)`, `paid_amount NUMERIC(14,2) DEFAULT 0`, `currency`, `pledge_date DATE`, `completion_date DATE`, `status` (`active|partially_paid|fulfilled|cancelled`), `frequency`, `installment_amount NUMERIC(14,2)`, `notes`, timestamps.
- **CHECK** `pledged_amount > 0`, **CHECK** `paid_amount >= 0`, **CHECK** `paid_amount <= pledged_amount` — **OQ-DB-04** (does an overpayment become a separate giving record, or is this CHECK wrong?)
- `outstanding_amount` is **derived** (`pledged_amount - paid_amount`), exposed as a generated column or in the read model, never stored independently.
- **INDEX** (`tenant_id`, `member_id`, `status`), (`tenant_id`, `campaign_id`).

### `pledge_payments`
`id`, `tenant_id`, `pledge_id FK`, `giving_id FK→giving NOT NULL`, `amount NUMERIC(14,2)`, `currency`, `date DATE`, `method`, `notes`, timestamps.
- **UNIQUE** (`giving_id`) — one payment ↔ one giving record.
- `pledges.paid_amount` maintained transactionally with insert/delete here.

### `fundraising_campaigns`
`id`, `tenant_id`, `branch_id`, `name`, `title`, `description`, `target_amount NUMERIC(14,2)`, `currency`, `start_date`, `end_date`, `status`, `fund` (giving category), `category`, timestamps.
- `pledged_amount`, `received_amount`, `outstanding_amount` are **derived aggregates**, not stored columns — computed from `pledges` and `giving`. Storing them invites drift.

### `tithes_offerings` — **conditional, see domain OQ-02**
If tithes/offerings are *not* folded into `giving`: `id`, `tenant_id`, `branch_id`, `member_id NULL`, `member_name`, `tithe_type`, `amount NUMERIC(14,2)`, `currency`, `service_type`, `service_date DATE`, `payment_method`, `payment_reference`, `receipt_number`, `notes`, `recorded_by_user_id`, timestamps. **Recommendation: fold into `giving` with `type IN ('tithe','offering','first_fruits','thanksgiving',…)` and do not create this table.**

### `donations` — **conditional, see domain OQ-02 / OQ-API-08**
Same recommendation: model as `giving` rows with a non-member donor. If kept separate, it needs `donor_name`, `donor_email`, `donor_phone`, `category`, `method`, `status`, `receipt_number`, `custom_fields JSONB`.

### `income_categories`
`id`, `tenant_id`, `name`, `code`, `description`, `is_active`, timestamps. UNIQUE (`tenant_id`, `code`).

### `income_records`
`id`, `tenant_id`, `branch_id`, `description`, `amount NUMERIC(14,2)`, `currency`, `category_id FK`, `source`, `payment_method`, `date DATE`, `status` (`received|pending|cancelled`), `reference`, `notes`, `recorded_by_user_id`, timestamps, `deleted_at`.
- **CHECK** `amount > 0 AND amount < 1000000` (`api-documentations/Income_Endpoints.md` validation rules)
- **CHECK** `length(description) BETWEEN 1 AND 255`, `length(source) BETWEEN 1 AND 100`
- **CHECK** `date <= current_date + interval '1 year'` ("date cannot be more than 1 year in the future")
- **UNIQUE** (`tenant_id`, `reference`) `WHERE reference IS NOT NULL` ("reference numbers must be unique")
- **INDEX** (`tenant_id`, `branch_id`, `date`), (`tenant_id`, `category_id`)
- FK to category must be restricted to **active** categories on insert ("Category must exist and be active").

### `expense_categories`
`id`, `tenant_id`, `name`, `code`, `description`, `color`, `group`, `is_active`, timestamps. UNIQUE (`tenant_id`, `code`).

### `expense_records`
`id`, `tenant_id`, `branch_id`, `title`, `description`, `amount NUMERIC(14,2)`, `currency`, `category_id FK`, `vendor`, `payment_method`, `date DATE`, `status` (`pending|approved|paid|rejected|cancelled`), `receipt_number`, `budget_id FK→budgets NULL`, `department_id FK NULL`, `is_recurring BOOL`, `requested_by_user_id FK`, `approved_by_user_id FK NULL`, `approved_at`, `disbursed_at`, `notes`, timestamps, `deleted_at`.
- **CHECK** `amount > 0`
- **CHECK** `(status IN ('approved','paid')) = (approved_by_user_id IS NOT NULL)` — approval provenance cannot be forged by a status flip
- **CHECK** `approved_by_user_id <> requested_by_user_id` — segregation of duties. **OQ-DB-05**: is self-approval ever permitted?
- **INDEX** (`tenant_id`, `branch_id`, `status`, `date`), (`tenant_id`, `category_id`), (`tenant_id`, `budget_id`)

### `expense_attachments`
`id`, `tenant_id`, `expense_id FK`, `file_id FK→files`, `filename`, `mime_type`, `size_bytes`, `created_at`.

### `budgets`
`id`, `tenant_id`, `branch_id`, `name`, `description`, `amount NUMERIC(14,2)`, `currency`, `period`, `period_year INT`, `start_date`, `end_date`, `category_id FK NULL`, `department_id FK NULL`, `owner_user_id FK NULL`, `status`, `priority`, `notes`, timestamps.
- **CHECK** `amount > 0`, **CHECK** `end_date >= start_date`
- `spent` is **derived** from `expense_records` where `budget_id` matches and `status IN ('approved','paid')` — not stored. See **OQ-DB-06**.
- **INDEX** (`tenant_id`, `period_year`, `status`), (`tenant_id`, `department_id`)

### `budget_allocations`
`id`, `tenant_id`, `budget_id FK`, `department_id FK`, `allocated_amount NUMERIC(14,2)`, `notes`, timestamps.
- **CHECK** `allocated_amount >= 0`
- **UNIQUE** (`budget_id`, `department_id`)
- **Constraint to enforce in the service layer, transactionally:** `SUM(allocated_amount) <= budgets.amount`. A DB-level assertion needs a trigger — **OQ-DB-07**.
- `spent_amount` derived from expenses attributed to that department within the budget period.

### `receipts`
`id`, `tenant_id`, `receipt_number`, `type` (`Donation|Tithe|Offering|Expense`), `source_type`, `source_id`, `amount NUMERIC(14,2)`, `currency`, `date`, `description`, `donor_name`, `member_name`, `branch_id`, `generated_by_user_id`, `generated_at`, `pdf_file_id FK→files NULL`.
- **UNIQUE** (`tenant_id`, `receipt_number`). Receipt numbering should be a tenant-scoped sequence, allocated inside the same transaction as the financial record.

### `exchange_rates` — **conditional, domain OQ-20**
`id`, `tenant_id`, `base_currency`, `quote_currency`, `rate NUMERIC(18,8)`, `effective_from`, `source`, timestamps. Only if server-side multi-currency conversion is confirmed in scope.

---

## 5. Operations

### `attendance_sessions`
`id`, `tenant_id`, `branch_id`, `title`, `service_type`, `date DATE`, `start_time`, `end_time`, `location`, `expected_attendees INT`, `status` (`scheduled|ongoing|completed|cancelled`), `department_id FK NULL`, `group_id FK NULL`, `event_id FK NULL`, `created_by_user_id`, timestamps.
- `actual_attendees` / `attendance_rate` **derived** from records.
- **INDEX** (`tenant_id`, `branch_id`, `date`), (`tenant_id`, `service_type`, `date`).

### `attendance_records`
`id`, `tenant_id`, `branch_id`, `session_id FK NULL`, `member_id FK`, `service_type`, `service_date DATE`, `status`, `check_in_time`, `check_out_time`, `check_in_method` (`QR Code|Manual|Self Check-in|Kiosk`), `notes`, `recorded_by_user_id`, timestamps.
- **UNIQUE** (`tenant_id`, `session_id`, `member_id`) — prevents the duplicate check-in that `Errors_Responses.md` §5 says returns 409.
- **UNIQUE** (`tenant_id`, `member_id`, `service_date`, `service_type`) `WHERE session_id IS NULL` — same protection for session-less marks.
- **INDEX** (`tenant_id`, `member_id`, `service_date DESC`) — drives member attendance profile and streak calculation.
- **INDEX** (`tenant_id`, `branch_id`, `service_date`).

### `attendance_headcounts` — **conditional, domain OQ-08**
`id`, `tenant_id`, `branch_id`, `session_id FK`, `men INT`, `women INT`, `children INT`, `first_time_visitors INT`, `total INT`, `recorded_by_user_id`, timestamps.

### `member_qr_tokens`
`id`, `tenant_id`, `member_id FK`, `token_hash`, `issued_at`, `expires_at`, `consumed_at`. Rotating; backs `GET /member/attendance/qr`.

### `events`
`id`, `tenant_id`, `branch_id`, `title`, `description`, `category_id FK`, `start_at TIMESTAMPTZ`, `end_at TIMESTAMPTZ`, `date DATE`, `time`, `venue`, `address`, `location`, `is_online BOOL`, `online_link`, `organizer`, `host_name`, `host_title`, `host_avatar_file_id`, `requires_registration BOOL`, `capacity INT`, `is_featured BOOL`, `cover_image_file_id FK NULL`, `is_recurring BOOL`, `recurrence_pattern`, `template_id FK NULL`, `fee_is_free BOOL`, `fee_amount NUMERIC(14,2)`, `fee_currency`, `status`, `created_by_user_id`, timestamps.
- **INDEX** (`tenant_id`, `branch_id`, `start_at`), (`tenant_id`, `category_id`), partial index `WHERE is_featured`.
- Dual `start_at/end_at` + `date/time` columns exist only because the admin and member types disagree — **domain OQ-09**. Resolve before migrating; do not ship both.

### `event_categories`, `event_templates`
`id`, `tenant_id`, `name`, `color`, `description`, timestamps.

### `event_registrations`
`id`, `tenant_id`, `event_id FK`, `member_id FK NULL`, `attendee_name`, `attendee_email`, `attendee_phone`, `attendance_type` (`In-Person|Online`), `number_of_tickets INT`, `answers JSONB`, `status` (`confirmed|pending|waitlisted|cancelled`), `ticket_reference`, `notes`, `registered_at`, timestamps.
- **UNIQUE** (`event_id`, `member_id`) `WHERE member_id IS NOT NULL AND status <> 'cancelled'`
- **UNIQUE** (`tenant_id`, `ticket_reference`)
- Capacity enforcement (`registered_count <= capacity`, else `waitlisted`) is a **transactional service rule** with `SELECT … FOR UPDATE` on the event row.

### `event_attendance`
`id`, `tenant_id`, `event_id FK`, `member_id FK`, `status`, `checked_in_at`, `recorded_by_user_id`, timestamps. UNIQUE (`event_id`, `member_id`).

### `event_custom_questions`
`id`, `tenant_id`, `event_id FK`, `label`, `type` (`text|select|radio|checkbox`), `required BOOL`, `options JSONB`, `placeholder`, `sort_order`.

### `groups`
`id`, `tenant_id`, `branch_id`, `name`, `description`, `category_id FK`, `type`, `leader_member_id FK NULL`, `leader_name`, `leader_email`, `leader_phone`, `max_members INT`, `meeting_schedule`, `meeting_day`, `meeting_time`, `location`, `venue`, `is_accepting_members BOOL`, `status` (`Active|Inactive|Archived`), timestamps.
- `members_count`, `engagement` **derived**.
- **INDEX** (`tenant_id`, `branch_id`, `status`), (`tenant_id`, `category_id`).

### `group_members`
`id`, `tenant_id`, `group_id FK`, `member_id FK`, `role`, `joined_at`, `status`, timestamps. **UNIQUE** (`group_id`, `member_id`) `WHERE status <> 'Inactive'`.
- **Service rule:** reject insert when active count would exceed `groups.max_members`.

### `group_roles`, `group_events`, `group_attendance`, `group_categories`
Per `lib/types/groups.ts`. `group_attendance` gets **UNIQUE** (`group_id`, `member_id`, `date`).

### `group_join_requests`
`id`, `tenant_id`, `group_id FK`, `member_id FK`, `preferred_role`, `message`, `status` (`pending|approved|rejected`), `reviewed_by_user_id`, `reviewed_at`, timestamps. Backs `POST /member/groups/{id}/join`.

### `departments`, `department_categories`, `department_members`, `department_roles`, `department_meetings`, `department_events`, `department_attendance`
Per `lib/types/departments.ts`. Notable:
- `department_meetings.agenda`, `.decisions`, `.action_items` → `JSONB` (arrays of objects).
- `department_members.availability` → `JSONB`; `.skills` → `TEXT[]`.
- **UNIQUE** (`department_id`, `member_id`) on `department_members` where active.
- **UNIQUE** (`department_id`, `role_type`) `WHERE role_type='head' AND is_active` — one head per department.
- `departments.budget NUMERIC(14,2)`.

### `sunday_school_classes`
`id`, `tenant_id`, `branch_id`, `name`, `description`, `age_group`, `min_age INT`, `max_age INT`, `teacher_id FK→sunday_school_teachers`, `max_students INT`, `capacity INT`, `day_of_week`, `start_time`, `end_time`, `schedule`, `location`, `room`, `status`, `curriculum`, `objectives JSONB`, timestamps.
- **CHECK** `max_age >= min_age`, **CHECK** `capacity > 0`.
- Duplicate column pairs (`max_students`/`capacity`, `location`/`room`, structured schedule vs string) exist only because schema and type disagree — **OQ-API-17**; resolve before migrating.

### `sunday_school_teachers`
`id`, `tenant_id`, `branch_id`, `member_id FK NULL`, `first_name`, `last_name`, `email`, `phone`, `qualifications JSONB`, `bio`, `experience`, `specializations JSONB`, `background_check_status`, `background_check_date`, `background_check_notes`, `join_date`, `status`, `avatar_file_id`, timestamps.
- `background_check_*` is **CONFIDENTIAL** (child safeguarding, README §11).

### `sunday_school_class_teachers`
`class_id FK`, `teacher_id FK`, `is_assistant BOOL`. PK both.

### `sunday_school_students`
`id`, `tenant_id`, `branch_id`, `member_id FK NULL`, `first_name`, `last_name`, `date_of_birth DATE`, `gender`, `current_class_id FK NULL`, `enrollment_date`, `status` (`Active|Inactive|Graduated`), `parent_name`, `parent_relationship`, `parent_phone`, `parent_email`, `parent_address`, `guardian_member_id FK→members NULL`, `emergency_contact`, `medical_info`, `allergies JSONB`, `authorized_pickup JSONB`, `notes`, `avatar_file_id`, timestamps.
- `medical_info`, `allergies`, `authorized_pickup`, `emergency_contact` are **CONFIDENTIAL**.
- `age` is **derived** from `date_of_birth`, never stored.
- **INDEX** (`tenant_id`, `current_class_id`, `status`).

### `sunday_school_class_history`
`id`, `student_id FK`, `class_id FK`, `start_date`, `end_date`.

### `sunday_school_attendance`
`id`, `tenant_id`, `class_id FK`, `student_id FK`, `date DATE`, `status`, `notes`, `recorded_by_user_id`, `recorded_at`. **UNIQUE** (`class_id`, `student_id`, `date`).

### `teaching_materials`
`id`, `tenant_id`, `title`, `description`, `type`, `age_group`, `class_id FK NULL`, `file_id FK→files NULL`, `external_url`, `tags TEXT[]`, `is_public BOOL`, `download_count INT DEFAULT 0`, `uploaded_by_user_id`, `upload_date`, timestamps.

### `assets`
`id`, `tenant_id`, `branch_id`, `name`, `description`, `category_id FK`, `status`, `condition`, `priority`, `purchase_price NUMERIC(14,2)`, `current_value NUMERIC(14,2)`, `depreciation_rate NUMERIC(5,2)`, `currency`, `location`, `assigned_to`, `assigned_department_id FK NULL`, `assigned_group_id FK NULL`, `purchase_date DATE`, `warranty_expiry DATE`, `last_maintenance DATE`, `next_maintenance DATE`, `serial_number`, `model`, `manufacturer`, `barcode`, `qr_code`, `tags TEXT[]`, `notes`, `created_by_user_id`, `updated_by_user_id`, timestamps, `deleted_at`.
- **CHECK** `purchase_price >= 0 AND current_value >= 0`, **CHECK** `depreciation_rate BETWEEN 0 AND 100`
- **UNIQUE** (`tenant_id`, `serial_number`) `WHERE serial_number IS NOT NULL`
- **UNIQUE** (`tenant_id`, `barcode`) `WHERE barcode IS NOT NULL`
- **INDEX** (`tenant_id`, `branch_id`, `status`), (`tenant_id`, `category_id`), (`tenant_id`, `next_maintenance`) for the "needs maintenance" alert, (`tenant_id`, `warranty_expiry`) for the 30-day warranty alert.

### `asset_categories`
`id`, `tenant_id`, `name`, `code`, `description`, `color`, `icon`, `requires_serial BOOL`, `requires_warranty BOOL`, `default_depreciation_rate NUMERIC(5,2)`, timestamps. UNIQUE (`tenant_id`, `code`).

### `asset_maintenance`
`id`, `tenant_id`, `asset_id FK`, `type`, `status`, `priority`, `title`, `description`, `scheduled_date DATE`, `completed_date DATE`, `estimated_duration_hours NUMERIC(6,2)`, `actual_duration_hours NUMERIC(6,2)`, `assigned_to`, `performed_by`, `service_provider`, `estimated_cost NUMERIC(14,2)`, `actual_cost NUMERIC(14,2)`, `currency`, `parts_used JSONB`, `notes`, timestamps.

### `asset_assignments`
`id`, `tenant_id`, `asset_id FK`, `type`, `status`, `assigned_to`, `assigned_to_type` (`person|department|group|location`), `assigned_by_user_id`, `assigned_date DATE`, `expected_return_date DATE`, `actual_return_date DATE`, `condition_at_assignment`, `condition_at_return`, `assignment_notes`, `return_notes`, timestamps.
- **Partial UNIQUE** (`asset_id`) `WHERE status='active'` — an asset cannot be in two active custodies. This is the "prevent asset loss" control from README §12.

---

## 6. Ministry, Communications, Infrastructure

### `pastoral_cases` *(CONFIDENTIAL)*
`id`, `tenant_id`, `branch_id`, `member_id FK`, `category`, `priority`, `status`, `assigned_pastor_user_id FK`, `notes`, `scheduled_date`, `next_follow_up_date`, `closed_at`, `closing_notes`, `created_by_user_id`, timestamps.
- **INDEX** (`tenant_id`, `assigned_pastor_user_id`, `status`), (`tenant_id`, `next_follow_up_date`).
- Candidate for PostgreSQL **RLS** (`backend/AGENTS.md` §7).

### `pastoral_sessions` *(CONFIDENTIAL)*
`id`, `tenant_id`, `case_id FK`, `session_date TIMESTAMPTZ`, `location`, `summary`, `confidential_notes`, `action_items`, `next_follow_up_date`, `status`, `pastor_user_id FK`, timestamps.
- `confidential_notes` is the highest-sensitivity column in the system. Consider column-level encryption — **OQ-DB-08**.

### `pastoral_case_assignments`
`case_id FK`, `user_id FK`, `assigned_at`, `assigned_by_user_id`, `revoked_at`. Supports the "Pastor A assigned → allow; Pastor B not assigned → deny" rule (`backend architecture.md` §17) for multi-pastor cases.

### `pastoral_care_requests` *(member-initiated)*
`id`, `tenant_id`, `member_id FK`, `category`, `preferred_mode`, `preferred_date`, `preferred_time_slot`, `reason`, `urgency`, `status`, `assigned_pastor_user_id FK NULL`, `case_id FK NULL`, `scheduled_datetime`, `location_or_link`, `summary_notes`, timestamps.

### `visitations` *(CONFIDENTIAL, conditional — OQ-API-21)*
`id`, `tenant_id`, `member_id FK`, `case_id FK NULL`, `type` (hospital/home/bereavement/prison/sick call), `scheduled_at`, `completed_at`, `location`, `outcome`, `prayer_needs`, `follow_up_required BOOL`, `pastor_user_id`, timestamps.

### `prayer_requests`
`id`, `tenant_id`, `branch_id`, `requester_member_id FK NULL`, `requester_name`, `requester_email`, `requester_phone`, `title`, `description`, `category_id FK`, `priority`, `status`, `privacy`, `is_confidential BOOL`, `is_anonymous BOOL`, `allow_public_prayers BOOL`, `notify_prayer_team BOOL`, `assigned_to_user_id FK NULL`, `answered_date`, `testimony`, `pastoral_notes`, timestamps.
- **CHECK** `length(title) BETWEEN 3 AND 120`, `length(description) BETWEEN 10 AND 1000`
- **INDEX** (`tenant_id`, `status`, `is_confidential`), (`tenant_id`, `requester_member_id`)
- `pastoral_notes` readable only with `prayer-requests.view-confidential`.
- Boolean vs enum privacy model is **domain OQ-10** — do not migrate both.

### `prayer_categories`, `prayer_responses`
`prayer_responses`: `id`, `tenant_id`, `prayer_request_id FK`, `responder_user_id FK`, `response`, `is_public BOOL`, timestamps.

### `announcements`
`id`, `tenant_id`, `branch_id`, `title`, `content`, `type` (`general|urgent|event|reminder`), `target_audience`, `priority`, `status` (`draft|published|archived`), `published_at`, `expires_at`, `image_file_id`, `created_by_user_id`, timestamps.
- **INDEX** (`tenant_id`, `status`, `published_at`, `expires_at`) — backs `/communications/announcements/active`.

### `communication_messages`
`id`, `tenant_id`, `branch_id`, `channel` (`SMS|Email`), `subject`, `body`, `sender_id`, `template_id FK NULL`, `campaign_id FK NULL`, `recipient_group_id FK NULL`, `status` (`draft|queued|sending|sent|failed|cancelled`), `scheduled_at`, `sent_at`, `priority`, `segment_count INT`, `recipient_count INT`, `delivered_count INT`, `failed_count INT`, `job_id FK→jobs NULL`, `created_by_user_id`, timestamps.
- **CHECK** `length(body) <= 1600` for SMS (`smsSendSchema`).

### `communication_recipients`
`id`, `tenant_id`, `message_id FK`, `member_id FK NULL`, `address` (phone/email), `status`, `provider_message_id`, `error`, `delivered_at`. **INDEX** (`message_id`, `status`).

### `communication_campaigns`, `newsletters`, `message_templates`, `recipient_groups`, `recipient_group_members`
Per `lib/validation/communications.ts` and the wired `/communications/*` paths.

### `files`
`id`, `tenant_id`, `branch_id`, `storage_key` (S3 object key), `bucket`, `file_name`, `original_name`, `mime_type`, `size_bytes BIGINT`, `checksum`, `category`, `entity_type`, `entity_id`, `folder`, `tags TEXT[]`, `is_public BOOL`, `uploaded_by_user_id FK`, `thumbnail_key`, `metadata JSONB`, timestamps, `deleted_at`.
- **UNIQUE** (`bucket`, `storage_key`)
- **INDEX** (`tenant_id`, `entity_type`, `entity_id`), (`tenant_id`, `category`)
- Key layout (`backend architecture.md` §18): `churches/{tenant_id}/members/{member_id}/documents/…`, `.../finance/receipts/…`, `.../communications/campaigns/…`
- Access is **always** via short-lived signed URL; never a public bucket.

### `member_documents`
`id`, `tenant_id`, `member_id FK`, `file_id FK`, `title`, `description`, `category` (`identification|baptism|confirmation|marriage|medical|legal|financial|education|employment|other`), `is_public BOOL`, `tags TEXT[]`, `metadata JSONB`, `uploaded_by_user_id`, timestamps, `deleted_at`.
- **INDEX** (`tenant_id`, `member_id`, `category`).
- `medical` / `legal` / `financial` categories are **CONFIDENTIAL**.

### `document_shares`
`id`, `tenant_id`, `document_id FK`, `shared_with_user_id FK NULL`, `shared_with_email`, `permission` (`view|download`), `expires_at`, `token_hash`, `created_by_user_id`, timestamps.

### `upload_sessions`
`id`, `tenant_id`, `user_id FK`, `upload_id`, `file_name`, `total_size BIGINT`, `chunk_size INT`, `chunks_received INT`, `status`, `expires_at`, timestamps. Backs `/upload/init|chunk|complete`.

### `notifications`
`id`, `tenant_id`, `member_id FK NULL`, `user_id FK NULL`, `type`, `category`, `title`, `message`, `action_label`, `action_href`, `is_read BOOL DEFAULT false`, `read_at`, `created_at`.
- **INDEX** (`tenant_id`, `member_id`, `is_read`, `created_at DESC`) — backs the unread badge and the inbox.
- **CHECK** `member_id IS NOT NULL OR user_id IS NOT NULL`.

### `notification_preferences`
`id`, `tenant_id`, `member_id FK UNIQUE`, `channel_email BOOL`, `channel_sms BOOL`, `channel_push BOOL`, `channel_in_app BOOL`, `cat_events BOOL`, `cat_groups BOOL`, `cat_ministries BOOL`, `cat_prayer BOOL`, `cat_pastoral_care BOOL`, `cat_resources BOOL`, `cat_announcements BOOL`, timestamps.

### `member_settings`
`id`, `tenant_id`, `member_id FK UNIQUE`, `display_name`, `language`, `preferred_branch_id FK NULL`, `theme` (`system|light|dark`), `directory_visibility BOOL`, `profile_photo_visibility BOOL`, `two_factor_enabled BOOL`, `session_timeout_minutes INT` (15–1440), timestamps.

### `resources` *(member portal library)*
`id`, `tenant_id`, `title`, `description`, `category`, `type`, `access_type` (`Public|Member|Ministry|Restricted`), `published_at`, `file_id FK NULL`, `external_url`, `thumbnail_file_id`, `duration_seconds INT`, `author`, `speaker`, `ministry`, `tags TEXT[]`, `is_featured BOOL`, timestamps.
- `access_type` gates delivery — `Restricted` must be policy-checked, not just hidden.

### `audit_logs` *(append-only)*
`id`, `tenant_id`, `branch_id`, `actor_user_id`, `actor_email`, `actor_name`, `actor_role`, `action`, `entity_type`, `entity_id`, `entity_name`, `status` (`SUCCESS|FAILURE`), `before_data JSONB`, `after_data JSONB`, `metadata JSONB`, `ip_address INET`, `user_agent`, `request_id`, `created_at`.
- **NO** `updated_at`, **NO** `deleted_at` — immutable by design.
- **REVOKE UPDATE, DELETE** on the table from the application role; grant INSERT/SELECT only. This is the only mechanism that actually makes the trail immutable.
- **INDEX** (`tenant_id`, `created_at DESC`), (`tenant_id`, `actor_user_id`, `created_at DESC`), (`tenant_id`, `entity_type`, `entity_id`), (`tenant_id`, `action`).
- Partition by month once volume warrants it.

### `jobs` *(background job tracking)*
`id`, `tenant_id`, `branch_id`, `type` (`MEMBER_BULK_IMPORT|COMMUNICATIONS_SMS_CAMPAIGN|COMMUNICATIONS_EMAIL_NEWSLETTER|REPORT_GENERATION|DOCUMENT_OCR_PROCESSING|DATABASE_BACKUP_EXPORT`), `requested_by_user_id`, `requested_by_email`, `payload JSONB`, `status` (`PENDING|RUNNING|COMPLETED|FAILED|CANCELLED`), `progress_total INT`, `progress_processed INT`, `progress_failed INT`, `result JSONB`, `error`, `celery_task_id`, `created_at`, `started_at`, `completed_at`.
- Mirrors `lib/jobs/job-types.ts` exactly.

### `settings`
`id`, `tenant_id UNIQUE`, `church JSONB`, `appearance JSONB`, `notifications JSONB`, `integrations JSONB`, timestamps. Single row per tenant.

### `background_checks`
`id`, `tenant_id`, `subject_type` (`user|member|teacher`), `subject_id`, `status`, `provider`, `reference`, `completed_at`, `expires_at`, `notes`, `document_file_id`, timestamps. **CONFIDENTIAL**.

---

## 7. Financial Integrity Controls

Consolidated so they can be reviewed as a set:

1. **Decimal only.** `NUMERIC(14,2)` for every money column. No `float`. (`backend/AGENTS.md` §10.)
2. **Positive amounts.** `CHECK amount > 0` on giving, pledges, income, expenses, budgets.
3. **Breakdown exclusion.** Every aggregate filters `parent_giving_id IS NULL`. Enforce via a `giving_countable` view; forbid raw aggregation.
4. **Pledges are not giving.** No query may sum `pledges.pledged_amount` into revenue.
5. **Pledge payment ↔ giving 1:1.** `UNIQUE(pledge_payments.giving_id)`; both rows created in one transaction.
6. **Derived, never duplicated.** `outstanding_amount`, `spent`, `received_amount`, `members_count`, `actual_attendees`, `attendance_rate`, `registered_count` are computed or maintained by trigger — never client-supplied.
7. **Approval provenance.** `expense_records` CHECK ties `status IN ('approved','paid')` to a non-null `approved_by_user_id`.
8. **Corrections, not rewrites.** Posted financial records get a reversal/correction row (`reversed_by_giving_id`), not an in-place edit. Conflicts with the currently wired `PUT`/`DELETE` endpoints — **OQ-API-13**.
9. **Receipt numbers.** Tenant-scoped sequence, unique, allocated inside the financial transaction.
10. **Atomicity.** Every multi-row financial operation runs inside `transaction_scope` (already implemented at `backend/app/core/database/transaction.py`) plus an audit insert in the same transaction.
11. **Audit on every mutation.** Insert into `audit_logs` in the same transaction as the financial write, so a rollback discards both.

---

## 8. Migration Order

Foreign-key dependencies dictate this order. Each numbered group is one or more Alembic revisions.

| # | Revision | Contents |
| :-- | :-- | :-- |
| 1 | `0001_extensions` | `uuid-ossp`/`pgcrypto`, `citext`, `pg_trgm` |
| 2 | `0002_tenancy` | `churches`, `branches` |
| 3 | `0003_identity` | `permissions`, `roles`, `role_permissions`, `users`, `user_branch_assignments`, `sessions`, `refresh_tokens`, `password_reset_tokens` |
| 4 | `0004_audit` | `audit_logs` (+ revoke UPDATE/DELETE grants) |
| 5 | `0005_files` | `files`, `upload_sessions`, `document_shares` |
| 6 | `0006_membership` | `families`, `members`, `family_relationships`, `family_link_requests`, `member_history`, `member_documents`, `member_journey_milestones` |
| 7 | `0007_converts` | `converts`, `convert_follow_ups`, `convert_activities` |
| 8 | `0008_org_units` | `department_categories`, `departments`, `department_members`, `department_roles`, `department_meetings`, `department_events`, `department_attendance` |
| 9 | `0009_groups` | `group_categories`, `groups`, `group_members`, `group_roles`, `group_events`, `group_attendance`, `group_join_requests` |
| 10 | `0010_events` | `event_categories`, `event_templates`, `events`, `event_custom_questions`, `event_registrations`, `event_attendance` |
| 11 | `0011_attendance` | `attendance_sessions`, `attendance_records`, `attendance_headcounts`, `member_qr_tokens` |
| 12 | `0012_finance_reference` | `giving_categories`, `income_categories`, `expense_categories`, `receipts` sequence |
| 13 | `0013_finance_giving` | `fundraising_campaigns`, `giving`, `pledges`, `pledge_payments`, `giving_countable` view, `receipts` |
| 14 | `0014_finance_ledger` | `income_records`, `budgets`, `budget_allocations`, `expense_records`, `expense_attachments` |
| 15 | `0015_pastoral` | `pastoral_cases`, `pastoral_sessions`, `pastoral_case_assignments`, `pastoral_care_requests`, `visitations` (+ RLS policies) |
| 16 | `0016_prayer` | `prayer_categories`, `prayer_requests`, `prayer_responses` |
| 17 | `0017_sunday_school` | `sunday_school_teachers`, `sunday_school_classes`, `sunday_school_class_teachers`, `sunday_school_students`, `sunday_school_class_history`, `sunday_school_attendance`, `teaching_materials`, `background_checks` |
| 18 | `0018_assets` | `asset_categories`, `assets`, `asset_maintenance`, `asset_assignments` |
| 19 | `0019_communications` | `message_templates`, `recipient_groups`, `recipient_group_members`, `communication_campaigns`, `communication_messages`, `communication_recipients`, `newsletters`, `announcements` |
| 20 | `0020_notifications` | `notifications`, `notification_preferences`, `member_settings`, `resources` |
| 21 | `0021_jobs_settings` | `jobs`, `settings` |
| 22 | `0022_analytics_views` | materialised views: `monthly_member_growth`, `weekly_attendance`, `monthly_giving`, `monthly_expenses`, `branch_statistics`, `department_statistics`, `member_retention` (`backend architecture.md` §26) |

Every revision must be verified with a from-clean-database run and a `downgrade()` that is either correct or explicitly refuses (`backend/AGENTS.md` §20).

---

## 9. Open Questions — Database Layer

| ID | Question |
| :-- | :-- |
| **OQ-DB-01** | Column name for the tenant key: `tenant_id` (shipped mixin, frontend vocabulary) or `church_id` (`backend architecture.md` §9)? Changing later is a full-schema migration. |
| **OQ-DB-02** | Does a tenant need a URL-safe `slug` / subdomain for tenant resolution, or is tenancy purely token-derived? |
| **OQ-DB-03** | Password hashing: `backend architecture.md` §12 mandates **Argon2id**, but `backend/pyproject.toml` pins `passlib[bcrypt]`. Confirm Argon2id and swap the dependency to `argon2-cffi`. Also: `pyproject.toml` sets `requires-python = ">=3.11"` while `backend/AGENTS.md` §2 mandates Python 3.13+. |
| **OQ-DB-04** | Can a pledge be overpaid? The proposed `CHECK paid_amount <= pledged_amount` would reject it. |
| **OQ-DB-05** | Is expense self-approval ever permitted (small church, one finance officer)? Determines whether the segregation-of-duties CHECK ships. |
| **OQ-DB-06** | `BudgetRecord.spent` and `BudgetAllocation.spentAmount` are frontend fields. Computed live, or maintained by trigger? Live computation is correct but costs a join on every budget list; a trigger is faster but can drift. |
| **OQ-DB-07** | Should `SUM(budget_allocations.allocated_amount) <= budgets.amount` be a DB trigger or a service-layer rule only? |
| **OQ-DB-08** | Should `pastoral_sessions.confidential_notes` (and `prayer_requests.pastoral_notes`) be encrypted at column level, or is disk encryption + RLS sufficient? |
| **OQ-DB-09** | Retention policy for `audit_logs`, `sessions`, `notifications`, `communication_recipients`. No source specifies one. Needed before partitioning decisions. |
| **OQ-DB-10** | Is RLS actually enabled, and for which tables? `backend/AGENTS.md` §7 says "consider"; the recommendation here is `pastoral_*`, `prayer_requests`, `member_documents`, `giving`, `expense_records`, `audit_logs`. RLS requires a per-request `SET LOCAL app.tenant_id` and a non-superuser application role. |
| **OQ-DB-11** | Does the system need `financial_transactions`, `funds` and `accounts` as a general ledger (`backend architecture.md` §6/§15/§23), or is the domain-specific model (giving / income / expenses / budgets) the actual design? The frontend has no ledger, fund, or account concept at all. **Recommendation: no general ledger** — it is not supported by any frontend contract. |
| **OQ-DB-12** | Seed data: which tenant, branches, roles, categories and admin user are provisioned by the onboarding wizard vs. by a seed script? |
