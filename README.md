# EMC Church Management System — Production Platform

A modern, high-integrity, domain-driven multi-tenant Church Management System built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v20+
* **Package Manager**: npm or yarn or pnpm
* **TypeScript**: 5.7+

### Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd emc-church-management-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME="EMC Church Management System"
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Execute Automated Domain Tests**:
   ```bash
   npm test
   ```

6. **Validate Type Safety**:
   ```bash
   npx tsc --noEmit
   ```

---

## 📁 Project Architecture

The system utilizes a domain-oriented architecture structured strictly underneath the existing Next.js App Router user interface:

```
emc-church-management-system/
├── app/                       # Next.js App Router (Pages, Loading skeletons, Layouts)
│   ├── dashboard/             # 14 Functional Operations Modules
│   │   ├── members/           # CRM, Directory, Converts, Family Ties, Documents
│   │   ├── finance/           # Tithes, Offerings, Expenses, Budgets, Ledger
│   │   ├── attendance/        # Roll call, QR check-in kiosk, Departmental attendance
│   │   ├── events/            # Scheduling, Registrations, Calendar grid
│   │   ├── groups/            # Small groups, Cells, Fellowships
│   │   ├── departments/       # Ministry departments, Leadership, Meetings
│   │   ├── sunday-school/     # Classes, Students, Teachers, Curriculum
│   │   ├── communications/    # Bulk SMS, Email newsletters, Announcements
│   │   ├── assets/            # Physical assets, Equipment valuations, Custody
│   │   ├── prayer-requests/   # Intercession petitions & pastoral responses
│   │   ├── analytics/         # Growth KPIs, Charts, Custom report builder
│   │   ├── activity-logs/     # Audit trails & user access timelines
│   │   ├── profile/           # Personal credentials & security
│   │   └── settings/          # Church profile, Branches, Roles, Permissions matrix
│   ├── globals.css            # Global theme variables & tokens
│   ├── layout.tsx             # Root layout with Auth & Currency providers
│   └── page.tsx               # Auth landing & redirect router
├── components/                # Presentation & UI Components
│   ├── ui/                    # 40+ shadcn/ui design primitives (Zero domain logic)
│   ├── members/               # Domain member forms (MemberForm, MemberFullForm)
│   ├── departments/           # Domain department forms (DepartmentForm)
│   ├── layout/                # Shell layout (Header, Sidebar, Search)
│   ├── forms/                 # Form adapters (Backward-compatible)
│   └── theme/                 # Theme providers & mode toggles
├── services/                  # Domain-Oriented Application Services
│   ├── members/               # MembersService, DocumentsService
│   ├── finance/               # FinanceService, GivingService, ExpenseService, etc.
│   ├── attendance/            # AttendanceService
│   ├── events/                # EventsService
│   ├── groups/                # GroupsService
│   ├── departments/           # DepartmentsService
│   ├── sunday-school/         # SundaySchoolService
│   ├── communications/        # CommunicationsService
│   ├── assets/                # AssetService
│   ├── reports/               # ReportsService
│   ├── auth/                  # AuthService
│   ├── upload/                # UploadService
│   ├── api-client.ts          # Axios base client with Bearer JWT interceptor
│   └── index.ts               # Master barrel export (100% backwards-compatible)
├── lib/                       # Domain Core, Utilities, & Security
│   ├── authorization/         # RBAC engine, canonical permissions, roles, guards
│   ├── validation/            # Zod schemas for all domain mutations & queries
│   ├── finance/               # Deterministic precision math & budget variance engine
│   ├── errors/                # Standard domain error hierarchy (AppError, etc.)
│   ├── audit/                 # Structured audit event emitter
│   ├── jobs/                  # Background asynchronous job readiness contracts
│   ├── contexts/              # AuthContext & CurrencyContext
│   ├── date-utils.ts          # Centralized date-fns parsing & standard formatters
│   ├── permissions.ts         # Backwards-compatible authorization adapter
│   └── types/                 # Strongly typed domain models
├── tests/                     # Automated Test Suites
│   └── unit/                  # Authorization, Finance math, & Validation tests
└── docs/                      # Architectural Documentation & Blueprints
    └── architecture/          # Baseline, Domain map, Dependency map, UI matrix
```

---

## 🏛️ Domain Architecture Standards

### 1. Invariant Rules
1. **Frontend Preservation Contract**: All refactoring is strictly internal. No page layouts, routes, styles, or components are broken or visually altered.
2. **Backward-Compatible Migration (`OLD -> ADAPTER -> NEW`)**: Flat service imports (`@/services/members-service`) and root exports (`@/services`) work interchangeably with domain package paths (`@/services/members`).
3. **Runtime Validation**: External inputs, form payloads, and mutations are validated through centralized Zod schemas in `lib/validation/*`.
4. **Server-Enforced Scope**: Tenant and branch identifiers are resolved from trusted server contexts, preventing cross-tenant data leakage.
5. **Deterministic Financial Math**: Financial operations use centralized precision utilities in `lib/finance/finance-math.ts` to prevent floating-point rounding errors.
6. **Standardized Audit Logging**: Sensitive mutations emit structured, immutable audit records via `lib/audit/audit-logger.ts`.

---

## 📖 Documentation Index

| Document | Purpose |
| :--- | :--- |
| [`docs/architecture/ui-pages-architecture.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/ui-pages-architecture.md) | **Master UI page matrix** mapping all routes to components, services, validation, and permissions |
| [`docs/architecture/domain-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/domain-map.md) | Domain taxonomy, entity boundaries, and ownership |
| [`docs/architecture/dependency-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/dependency-map.md) | Layer hierarchy, permitted dependencies, and prohibited directions |
| [`docs/architecture/security-boundary-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/security-boundary-map.md) | Multi-tenant trust model, branch isolation, and audit contracts |
| [`PROJECT_RULES.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/PROJECT_RULES.md) | Complete brand design system, UI/UX contracts, and engineering guidelines |
| [`API_DOCUMENTATION.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/API_DOCUMENTATION.md) | REST API endpoint documentation and request/response specifications |

---

## 🧪 Testing & Verification

```bash
# Run unit tests across authorization, finance math, and validation
npm test

# Run TypeScript type safety compiler
npx tsc --noEmit

# Build production bundle
npm run build
```