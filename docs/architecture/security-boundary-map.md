# EMC Church Management System — Security Boundary Map

This document establishes the security boundaries, tenant/branch isolation models, and authorization checkpoints across all 204 routes in the EMC Church Management System.

---

## 1. Multi-Tier Security Boundary Model

The system enforces three distinct security and trust boundaries:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 UNTRUSTED CLIENT CLIENT                                │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┼────────────────────────────┐
               │ HTTPS Request              │ HTTPS Request + Bearer JWT │ HTTPS Request + Bearer JWT
               │ Anonymous                  │ Member Session             │ Admin / Staff Session
               ▼                            ▼                            ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌─────────────────────────┐
│ TIER 1: PUBLIC OUTREACH      ││ TIER 2: MEMBER SELF-SERVICE  ││ TIER 3: ADMIN BACK-OFFICE│
│ Boundary: /(landing)/*       ││ Boundary: /(member)/portal/* ││ Boundary: /(admin)/*    │
│ Rate Limiting & Input San.   ││ User Isolation (Self-Scope)  ││ Multi-Tenant / Branch RBAC│
└──────────────┬───────────────┘└──────────────┬───────────────┘└────────────┬────────────┘
               │                               │                             │
               ▼                               ▼                             ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌─────────────────────────┐
│ Public Form Validations      ││ Member Authorization Engine  ││ Administrative Policy   │
│ - Contact Inquiries          ││ - lib/authorization/         ││ - lib/authorization/    │
│ - Anonymous Prayer Requests  ││   member-guards.ts           ││   guards.ts             │
│ - Public Event RSVP          ││ - MEMBER_PERMISSIONS         ││ - PERMISSIONS Matrix    │
└──────────────┬───────────────┘└──────────────┬───────────────┘└────────────┬────────────┘
               │                               │                             │
               └───────────────────────────────┼─────────────────────────────┘
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN APPLICATION SERVICES                               │
│                         Zod Runtime Validation (lib/validation/*)                      │
│                         Audit Event Generation (lib/audit/audit-logger.ts)             │
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SECURE DATA ACCESS LAYER                                  │
│                         Enforces tenant_id & branch_id isolation                       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Invariant Rules for Security & Tenancy

### Rule 1: Never Trust Client-Supplied Scope Identifiers
* A client must **never** specify `tenantId` in request bodies or query parameters to grant itself cross-tenant access.
* The active `tenantId` is always resolved from the authenticated server token/session.
* When switching branches within the authorized tenant, the active `branchId` must be verified against the user's permitted branch assignments.

### Rule 2: Member Isolation (Principle of Least Privilege)
* Authenticated members accessing `/portal/*` are strictly confined to self-scoped records (`userId === principal.userId` or verified household members).
* A member cannot inspect or mutate another member's giving statements, attendance records, personal prayers, or pastoral care sessions.

### Rule 3: UI Hiding Is Not Security
* Hiding a button or table column in the UI via `hasPermission(...)` is a UX affordance, not a security boundary.
* Every service invocation and API endpoint must perform server-side authorization checks.

### Rule 4: Standardized Permission Format
* **Admin Operations**: Dot-notation `<domain>.<resource>.<action>` (e.g. `finance.expenses.create`, `members.view`, `attendance.take`).
* **Member Operations**: Colon-notation `<domain>:<action>:self` (e.g. `profile:read:self`, `giving:read:self`, `prayer:create`).

---

## 3. High-Integrity & Sensitive Operations Matrix

The following domains and operations require mandatory authorization checks, runtime input validation, and audit event generation:

| Operational Tier | Domain | Action / Mutation | Required Permission / Scope | Audit Event Required |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Core** | **IAM** | User Role Assignment / Change | `settings.roles.edit` (SuperAdmin) | `iam.role.assigned` |
| **Admin Core** | **IAM** | Branch Creation / Modification | `settings.branches.create` (Tenant Admin)| `iam.branch.updated` |
| **Admin Core** | **Finance** | Expense Approval / Disbursement | `finance.expenses.approve` | `finance.expense.approved`|
| **Admin Core** | **Finance** | Tithe / Giving Record Entry | `finance.tithes.create` | `finance.giving.recorded` |
| **Admin Core** | **Finance** | Budget Modification / Allocation| `finance.budgets.create` | `finance.budget.modified` |
| **Admin Core** | **Members** | Member Record Creation / Delete | `members.create` / `members.delete` | `members.record.mutated` |
| **Admin Core** | **Members** | Bulk Member CSV Import | `members.import` | `members.bulk.imported` |
| **Admin Core** | **Communications** | Mass SMS / Email Broadcast | `communications.send` | `communications.campaign.sent`|
| **Admin Core** | **Attendance** | Service Roll Call Submission | `attendance.take` | `attendance.session.recorded`|
| **Admin Core** | **Pastoral Care** | Log Counseling / Hospital Case | `pastoral-care.edit` | `pastoral.case.recorded` |
| **Member Portal** | **Profile** | Update Personal Contact Info | `profile:update:self` | `member.profile.updated` |
| **Member Portal** | **Prayer** | Submit Confidential Prayer | `prayer:create` | `member.prayer.submitted` |
| **Member Portal** | **Pastoral Care** | Request Pastoral Counseling | `pastoral-care:create` | `member.pastoral.requested` |
| **Member Portal** | **Events** | RSVP Registration & Ticket | `events:register` | `member.event.registered` |
| **Public** | **Giving** | Public Online Donation | Anonymous (Payment Gateway Webhook) | `donation.public.received` |

---

## 4. Audit Event Architecture Contract

All sensitive mutations produce an immutable audit log payload adhering to the standard schema:

```typescript
export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  action: string;
  resource: {
    type: string;
    id: string;
    name?: string;
  };
  scope: {
    tenantId: string;
    branchId?: string;
  };
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}
```
