# EMC Church Management System — Security Boundary Map (Phase 0)

This document establishes the security boundaries, tenant/branch isolation model, and authorization checkpoints for the EMC CMS platform.

---

## 1. Multi-Tenant & Multi-Branch Trust Model

```
               [ UNTRUSTED CLIENT BOUNDARY ]
                            │
               HTTPS Request + Bearer JWT
                            ▼
              ┌───────────────────────────┐
              │   Authentication Guard    │  <- Validates JWT Signature & Expiry
              └─────────────┬─────────────┘
                            │
               Resolved Principal Context
               (userId, tenantId, branchId, roles)
                            ▼
              ┌───────────────────────────┐
              │   Authorization Engine    │  <- Policy & Role Guard Checks
              │ (lib/authorization/...)   │
              └─────────────┬─────────────┘
                            │
               Authorized & Tenant-Scoped Query
                            ▼
              ┌───────────────────────────┐
              │  Domain Application Layer │  <- Input Validation (Zod)
              │    (services/<domain>/)   │
              └─────────────┬─────────────┘
                            │
               Audit Event Emitted (for mutations)
                            ▼
              ┌───────────────────────────┐
              │     Data Access Layer     │  <- Injects tenantId & branchId
              └───────────────────────────┘
```

---

## 2. Invariant Rules for Security & Tenancy

### Rule 1: Never Trust Client-Supplied Scope Identifiers
* A client must **never** specify `tenantId` in request bodies or query parameters to grant itself cross-tenant access.
* The active `tenantId` is always resolved from the authenticated server token/session.
* When switching branches within the authorized tenant, the active `branchId` must be verified against the user's permitted branch assignments.

### Rule 2: UI Hiding Is Not Security
* Hiding a button or table column in the UI via `hasPermission(...)` is a UX affordance, not a security boundary.
* Every service invocation and API endpoint must perform server-side authorization checks.

### Rule 3: Strict RBAC Permission Standard
Permissions follow the canonical dot-notation format:
`<domain>.<resource>.<action>`

Examples:
* `members.directory.read`
* `members.record.create`
* `members.record.update`
* `members.record.delete`
* `finance.expenses.approve`
* `finance.giving.create`
* `attendance.session.take`
* `communications.sms.send`

---

## 3. High-Integrity & Sensitive Operations Matrix

The following domains and operations require mandatory authorization checks, runtime input validation, and audit event generation:

| Domain | Action / Mutation | Required Scope | Audit Event Required |
| :--- | :--- | :--- | :--- |
| **IAM** | User Role Assignment / Change | Tenant / SuperAdmin | `iam.role.assigned` |
| **IAM** | Branch Creation / Modification | Tenant Admin | `iam.branch.updated` |
| **Finance** | Expense Approval / Disbursement | Tenant + Branch Finance Officer | `finance.expense.approved` |
| **Finance** | Tithe / Giving Record Entry | Tenant + Branch Finance Officer | `finance.giving.recorded` |
| **Finance** | Budget Modification / Allocation | Tenant Admin / Finance Officer | `finance.budget.modified` |
| **Members** | Member Record Creation / Deletion | Tenant + Branch Member Admin | `members.record.mutated` |
| **Members** | Bulk Member Import | Tenant + Branch Admin | `members.bulk.imported` |
| **Communications** | Bulk SMS / Email Campaign Send | Tenant + Branch Communications | `communications.campaign.sent` |
| **Attendance** | Service Attendance Submission | Tenant + Branch Leader | `attendance.session.recorded` |

---

## 4. Audit Event Architecture Contract

All sensitive mutations must produce an immutable audit log payload adhering to the standard schema:

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
  action: string;             // e.g. 'finance.expense.approve'
  resource: string;           // e.g. 'expense'
  resourceId: string;         // e.g. 'exp_12345'
  tenantId: string;
  branchId?: string;
  status: 'SUCCESS' | 'FAILURE';
  before?: Record<string, any>;
  after?: Record<string, any>;
  metadata?: Record<string, any>;
}
```
