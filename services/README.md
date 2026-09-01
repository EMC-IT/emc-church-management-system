# EMC Church Management System — Application Services Layer

The services layer encapsulates all business logic, remote API communications, and data transformation for the EMC CMS platform. It is structured into **domain packages** located in `services/<domain>/` with a centralized, backwards-compatible master barrel export at `services/index.ts`.

---

## 📁 Domain Services Architecture

```
services/
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
   Inputs to service methods (such as `createMember`, `createExpense`, `recordAttendance`) are validated using domain Zod schemas before API transmission.

2. **Authorization Guards (`lib/authorization/guards.ts`)**:
   Server-side role and permission assertions ensure the active principal has appropriate authority before executing mutations.

3. **Tenant & Branch Scoping (`lib/authorization/scope.ts`)**:
   Applies `tenantId` and optional `branchId` to all search queries and creation payloads.

4. **Deterministic Finance Math (`lib/finance/finance-math.ts`)**:
   Calculations in `finance-service`, `expense-service`, and `budget-service` utilize `roundToTwoDecimals` and `calculateBudgetUtilization` to ensure 100% mathematical precision.

5. **Structured Audit Logging (`lib/audit/audit-logger.ts`)**:
   Sensitive actions emit immutable audit records.

---

## 🚀 Domain Services Reference

### 1. Members Domain (`services/members/`)
```typescript
import { membersService, documentsService } from '@/services/members';

// Or via master export:
import { membersService } from '@/services';

// Query paginated members list
const response = await membersService.getMembers({ page: 1, limit: 20, status: 'Active' });

// Create a new member
const newMember = await membersService.createMember(memberData);
```

### 2. Finance Domain (`services/finance/`)
```typescript
import { 
  financeService, 
  givingService, 
  expenseService, 
  incomeService, 
  budgetService 
} from '@/services/finance';

// Record Sunday collection tithe & offering
await financeService.createTitheOffering(titheData);

// Log an expenditure voucher
await expenseService.createExpense(expenseData);

// Get budget utilization & variance
const budget = await budgetService.getBudget(budgetId);
```

### 3. Attendance Domain (`services/attendance/`)
```typescript
import { attendanceService } from '@/services/attendance';

// Record batch roll call for a Sunday service
await attendanceService.recordBulkAttendance({
  serviceType: 'Sunday Service',
  serviceDate: '2026-08-27',
  records: [
    { memberId: 'mem_1', status: 'Present' },
    { memberId: 'mem_2', status: 'Late', checkInTime: '09:15' }
  ]
});
```

### 4. Communications Domain (`services/communications/`)
```typescript
import { communicationsService } from '@/services/communications';

// Send mass SMS broadcast
await communicationsService.sendSMS({
  recipients: ['+233241234567', '+233201234568'],
  message: 'Reminder: All-night prayer service begins tonight at 10 PM.',
  priority: 'high'
});
```

### 5. Sunday School Domain (`services/sunday-school/`)
```typescript
import { sundaySchoolService } from '@/services/sunday-school';

// Get classes and enrolled student stats
const classes = await sundaySchoolService.getClasses();
```

---

## 🔄 Backwards Compatibility Protocol (`OLD -> ADAPTER -> NEW`)

To prevent breaking existing pages and components:
1. **Flat file imports** such as `import { departmentsService } from '@/services/departments-service'` redirect seamlessly through adapter re-exports.
2. **Master barrel imports** `import { membersService, financeService } from '@/services'` continue to work unchanged.
3. **Domain package imports** `import { membersService } from '@/services/members'` provide clean domain isolation for all new development.