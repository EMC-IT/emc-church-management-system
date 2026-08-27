# EMC Church Management System — Architecture Baseline (Phase 0)

**Date**: August 2026  
**Status**: Baseline Established  
**Repository**: EMC-IT/emc-church-management-system  

---

## 1. System Overview

The EMC Church Management System (CMS) is a multi-tenant, multi-branch church operations and administrative enterprise web application built on Next.js App Router and TypeScript.

### Technology Stack Baseline
* **Framework**: Next.js 16.2.10 (App Router, Client Components & RSC foundations)
* **Language & Runtime**: TypeScript 5.7.0, Node.js v20+
* **UI & Styling**: Tailwind CSS 3.3.3, shadcn/ui, Radix UI primitives, Lucide icons, Framer Motion
* **Data Presentation**: TanStack Table v8, Recharts 2.15.4
* **Form & Validation**: React Hook Form 7.60.0, Zod 3.25.76, Hookform Resolvers 3.10.0
* **HTTP Client**: Axios 1.10.0
* **Typography**: Montserrat / Cabinet Grotesk & Satoshi font tokens

---

## 2. Baseline Architecture Inventory

```
                               ┌────────────────────────────────┐
                               │   Next.js App Router (app/)    │
                               │  14 Dashboard Domain Routes    │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │  UI & Layout Components        │
                               │ (components/ui, forms, layout) │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │   Flat Services Layer          │
                               │  (services/*.ts via Axios)     │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │       External REST API        │
                               │ (process.env.NEXT_PUBLIC_API)  │
                               └────────────────────────────────┘
```

### Key Component Inventories

| Layer | Path | Status & Composition |
| :--- | :--- | :--- |
| **Routing** | `app/dashboard/*` | 14 domain submodules, 90+ route pages with loading & error skeletons |
| **Components** | `components/ui/*` | 40+ shadcn/ui primitives, custom pickers, brand components |
| **Forms** | `components/forms/*` | Centralized forms + inlined page forms (needs domain segregation) |
| **Layouts** | `components/layout/*` | Dashboard shell, header, sidebar, global command palette |
| **Services** | `services/*.ts` | 18 flat service classes/modules utilizing Axios `apiClient` |
| **Types** | `lib/types/*` | 11 domain TypeScript definition files |
| **State / Context** | `lib/contexts/*` | `AuthContext` (auth state), `CurrencyContext` (multi-currency) |
| **Permissions** | `lib/permissions.ts` | Role-permission mappings, permission dictionaries |
| **Date / Time** | `lib/date-utils.ts` | Centralized formatting and parsing utilities |

---

## 3. Current Cross-Cutting Concerns Analysis

### 3.1 Authentication Flow
* **Mechanism**: JWT tokens stored in `localStorage` (`token`, `user`).
* **Session Lifecycle**: `apiClient` request interceptor attaches `Authorization: Bearer <token>`. Response interceptor redirects to `/login` on HTTP 401.
* **Current Gap**: Server-side session verification and cookie-based secure session propagation are not yet enforced on edge/middleware.

### 3.2 Authorization Flow
* **Mechanism**: Role-Based Access Control (RBAC) with `SuperAdmin`, `Admin`, `Pastor`, `FinanceOfficer`, `DepartmentLeader`, `Member`.
* **Current Gap**: Permission constants have mixed naming conventions (e.g. `canViewMembers` vs `members.create`). Authorization checks are client-side UI visibility guards rather than layered policy guards.

### 3.3 Multi-Tenant & Multi-Branch Isolation
* **Current Mechanism**: Tenant and branch IDs are partially embedded in member models, branch selector state, or query params.
* **Current Gap**: Scope injection is not systematically derived from trusted server context on every service request.

### 3.4 Data Validation
* **Current Mechanism**: Zod and React Hook Form are used in select form components.
* **Current Gap**: Service layer inputs and API boundaries lack runtime schema enforcement, relying primarily on compile-time TypeScript types.

### 3.5 Error Handling & Observability
* **Current Mechanism**: Basic `try/catch` blocks throwing native `new Error(error.response?.data?.message)`.
* **Current Gap**: No structured domain error hierarchy (`AppError`, `AuthorizationError`, `ValidationError`, `NotFoundError`). No telemetry or sanitized error logging.

### 3.6 Audit Logging
* **Current Mechanism**: Presentation layer has an activity log table (`app/dashboard/activity-logs/`).
* **Current Gap**: No formal audit event schema (`actor`, `action`, `resource`, `resourceId`, `tenantId`, `branchId`, `before`, `after`, `metadata`) produced across sensitive operations.

### 3.7 Financial Calculations
* **Current Mechanism**: Spread across `finance-service.ts`, `expense-service.ts`, `giving-service.ts`, `income-service.ts`, and `budget-service.ts`.
* **Current Gap**: Need unified domain models, explicit rounding rules, deterministic totals, and immutable audit trail.

### 3.8 Automated Testing
* **Current Baseline**: 0 unit/integration/e2e tests in codebase.

---

## 4. Verification & Baseline Status

* **TypeScript Typecheck (`npx tsc --noEmit`)**: **PASSING (0 errors)**
* **Project Build**: **PASSING**
* **Known Violations to Address**:
  1. Flat `services/` directory with overlapping cross-domain responsibilities.
  2. Inlined forms inside page files vs generic `components/forms/`.
  3. Mixed permission string formats (`canView...` vs `domain.action`).
  4. Absence of runtime Zod validation at service/application boundaries.
  5. Absence of unit and domain test suites.
