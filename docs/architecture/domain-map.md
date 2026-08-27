# EMC Church Management System — Domain Map (Phase 0)

This document establishes the official domain taxonomy, entity boundaries, and ownership mapping for the system.

---

## 1. Domain Taxonomy & Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE DOMAIN BOUNDARIES                             │
└─────────────────────────────────────────────────────────────────────────────┘

 1. IDENTITY & ACCESS (IAM)       2. MEMBERSHIP (CRM)
    ├── Authentication               ├── Members Directory
    ├── Roles & Permissions          ├── Families & Linkages
    ├── Users & Profiles             ├── Converts Management
    └── Multi-Branch Management      └── Member History & Documents

 3. FINANCE & STEWARDSHIP         4. ATTENDANCE & CHECK-IN
    ├── Tithes & Offerings           ├── Service Attendance
    ├── Pledges & Donations          ├── QR Check-in & Kiosk
    ├── Income Records               ├── Group / Department Attendance
    ├── Expenses & Disbursements     └── Attendance History & Trends
    └── Budgets & Allocations

 5. GROUPS & MINISTRIES           6. DEPARTMENTS & TEAMS
    ├── Small Groups / Cells         ├── Church Departments
    ├── Group Roles & Leaders        ├── Leadership & Volunteers
    └── Group Meetings & Events      └── Department Meetings

 7. SUNDAY SCHOOL                 8. EVENTS & CALENDAR
    ├── Classes & Ages               ├── Event Scheduling
    ├── Teachers & Assignments       ├── Registrations & Tickets
    ├── Students & Enrollment        └── Categories & Templates
    └── Materials & Curriculum

 9. COMMUNICATIONS & OUTREACH    10. ASSET & INVENTORY
    ├── Bulk SMS Campaigns           ├── Physical Assets & Equipment
    ├── Email & Newsletters          ├── Categories & Maintenance
    └── Internal Announcements       └── Disposal & Asset Valuation

11. PRAYER & CARE                12. AUDIT & ACTIVITY
    ├── Prayer Requests              ├── Security Audit Logs
    ├── Confidential Requests        └── User Activity Tracking
    └── Follow-ups & Intercession

13. REPORTING & ANALYTICS
    ├── Executive KPIs
    ├── Attendance Analytics
    ├── Financial Analytics
    └── Custom Report Builder
```

---

## 2. Detailed Domain Matrix

| Domain | Core Entities | Current Service(s) | Current Types | Target Service Package |
| :--- | :--- | :--- | :--- | :--- |
| **IAM** | `User`, `Role`, `Permission`, `Branch` | `auth-service.ts` | `auth.ts`, `permissions.ts` | `services/auth/` |
| **Members** | `Member`, `Family`, `Convert`, `Document` | `members-service.ts`, `documents-service.ts` | `members.ts` | `services/members/` |
| **Finance** | `Giving`, `Income`, `Expense`, `Budget`, `Allocation` | `finance-service.ts`, `giving-service.ts`, `income-service.ts`, `expense-service.ts`, `budget-service.ts` | `finance.ts` | `services/finance/` |
| **Attendance** | `AttendanceSession`, `AttendanceRecord`, `CheckIn` | `attendance-service.ts` | `attendance.ts` | `services/attendance/` |
| **Groups** | `Group`, `GroupMember`, `GroupMeeting` | `groups-service.ts` | `groups.ts` | `services/groups/` |
| **Departments** | `Department`, `DepartmentMember`, `DepartmentMeeting` | `departments-service.ts` | `departments.ts` | `services/departments/` |
| **Sunday School** | `Class`, `Teacher`, `Student`, `Material` | `sunday-school-service.ts` | `sunday-school.ts` | `services/sunday-school/` |
| **Events** | `Event`, `EventRegistration`, `EventCategory` | `events-service.ts` | `types.ts` | `services/events/` |
| **Communications**| `SMSMessage`, `EmailCampaign`, `Announcement` | `communications-service.ts` | `types.ts` | `services/communications/` |
| **Assets** | `Asset`, `AssetCategory`, `AssetMaintenance` | `asset-service.ts` | `assets.ts` | `services/assets/` |
| **Prayer** | `PrayerRequest`, `PrayerCategory`, `Response` | inlined in page | `types.ts` | `services/prayer-requests/` |
| **Audit** | `AuditEvent`, `ActivityLog` | inlined in page | `types.ts` | `services/audit/` |
| **Reports** | `ReportMetric`, `AnalyticsOverview` | `reports-service.ts` | `types.ts` | `services/reports/` |

---

## 3. Invariants & Segregation Rules

1. **No Direct Inter-Service Mutation**: A domain service may not directly mutate the internal database tables of another domain. It must consume the target domain's public service contract.
2. **Context Ownership**:
   - `services/members/` owns member identity and family graph.
   - `services/finance/` references `memberId` purely as a foreign identifier and does not modify member profile data.
   - `services/attendance/` references `memberId` purely for attendance logging.
3. **Tenant & Branch Scope**:
   - Every domain entity must be partitioned by `tenantId` and optionally `branchId`.
