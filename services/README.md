# EMC Church Management System — Application Services Layer

The services layer encapsulates all business logic, remote API communications, and data transformation for the EMC CMS platform. It is structured into modular **domain packages** located in `services/<domain>/` alongside dedicated **member portal services** in `services/member/`, with a centralized master barrel export at `services/index.ts`.

---

## 📁 Domain Services Architecture

```
services/
├── member/                    # Dedicated Member Self-Service Portal Services (16 modules)
│   ├── dashboard.service.ts   # Personal metrics, spiritual verse & overview data
│   ├── attendance.service.ts  # Personal attendance history & touchless QR pass
│   ├── events.service.ts      # Member event catalog, RSVPs & digital tickets
│   ├── family.service.ts      # Household graph & family linking requests
│   ├── giving.service.ts      # Contribution history, pledge tracking & tax PDF generation
│   ├── groups.service.ts      # Enrolled small groups, cell meetings & join requests
│   ├── journey.service.ts     # Discipleship milestones & certificate records
│   ├── ministries.service.ts  # Serving teams, ministry rosters & sign-ups
│   ├── notifications.service.ts # Alert notifications, mark-as-read & category filters
│   ├── pastoral-care.service.ts # Pastoral counseling appointments & visitation requests
│   ├── prayer.service.ts      # Prayer petition submission & answered prayer testimonies
│   ├── profile.service.ts     # Member profile details, photo updates & contact info
│   ├── resources.service.ts   # Digital sermon guides, study notes & PDF downloads
│   ├── settings.service.ts    # Notification delivery preferences & password updates
│   ├── announcements.service.ts # Church bulletins & general member notices
│   └── index.ts               # Barrel export for member services
│
├── members/                   # Membership & CRM Domain
│   ├── members-service.ts     # Directory, CRUD, photos, statistics, families
│   ├── documents-service.ts   # Member certificates, baptism records, uploads
│   └── index.ts               # Domain barrel export
│
├── finance/                   # Financial Operations & Stewardship
│   ├── finance-service.ts     # Master finance controller & summaries
│   ├── giving-service.ts      # Donations, pledges, fundraising drives
│   ├── income-service.ts      # Revenue stream tracking & income categories
│   ├── expense-service.ts     # Expenditures, vouchers, receipts, approvals
│   ├── budget-service.ts      # Fiscal budget plans, line items, allocations
│   └── index.ts
│
├── attendance/                # Attendance & Check-In Domain
│   ├── attendance-service.ts  # Headcount roll call, QR kiosk check-in, history
│   └── index.ts
│
├── events/                    # Events & Calendar Domain
│   ├── events-service.ts      # Scheduling, registrations, RSVPs, calendar
│   └── index.ts
│
├── groups/                    # Small Groups & Cell Fellowships
│   ├── groups-service.ts      # Small groups, cell rosters, group meetings
│   └── index.ts
│
├── departments/               # Church Departments & Ministries
│   ├── departments-service.ts # Departments, volunteer rosters, staff meetings
│   └── index.ts
│
├── sunday-school/             # Sunday School & Children's Ministry
│   ├── sunday-school-service.ts # Classes, teachers, student rosters, materials
│   └── index.ts
│
├── communications/            # Messaging & Outreach Domain
│   ├── communications-service.ts # Mass SMS, email newsletters, bulletins
│   └── index.ts
│
├── assets/                    # Physical Assets & Inventory
│   ├── assets-service.ts      # Asset register, maintenance logs, valuations
│   └── index.ts
│
├── reports/                   # Executive Analytics & Reporting
│   ├── reports-service.ts     # Analytics overviews, trends, export builders
│   └── index.ts
│
├── auth/                      # Identity & Authentication
│   ├── auth-service.ts        # Login, register, token refresh, password resets
│   └── index.ts
│
├── upload/                    # File Upload & Media Infrastructure
│   ├── upload-service.ts      # Multi-part file uploads & validation
│   └── index.ts
│
├── api-client.ts              # Base Axios client with JWT bearer interceptors
└── index.ts                   # Master backward-compatible barrel export
```

---

## 🔧 Base API Client (`api-client.ts`)

Configured Axios instance providing:
* **Base URL**: Set via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`).
* **JWT Interception**: Attaches `Authorization: Bearer <token>` from `localStorage` on outgoing requests.
* **401 Unauthorized**: Clears expired credentials and redirects to `/login`.
* **403 Forbidden**: Logs access violation and propagates structured `AuthorizationError`.

---

## 🛡️ Cross-Cutting Domain Integration

Each domain service works in tandem with:

1. **Validation Schemas (`lib/validation/<domain>.ts`)**:
   Inputs to service methods (such as `createMember`, `createExpense`, `recordAttendance`, `submitPrayerRequest`) are validated using domain Zod schemas before API transmission.

2. **Authorization Guards (`lib/authorization/guards.ts` & `member-guards.ts`)**:
   Server-side role and permission assertions ensure the active principal has appropriate authority before executing mutations.

3. **Tenant & Branch Scoping (`lib/authorization/scope.ts`)**:
   Applies `tenantId` and optional `branchId` to all search queries and creation payloads.

4. **Deterministic Finance Math (`lib/finance/finance-math.ts`)**:
   Calculations in `finance-service`, `expense-service`, and `budget-service` utilize `roundToTwoDecimals` and `calculateBudgetUtilization` to ensure 100% mathematical precision.

5. **Structured Audit Logging (`lib/audit/audit-logger.ts`)**:
   Sensitive actions emit immutable audit records.