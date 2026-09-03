# EMC Church Management System — Architecture Baseline

**Date**: Updated September 2026  
**Status**: Production Baseline Established & Realigned  
**Repository**: EMC-IT/emc-church-management-system  

---

## 1. System Overview

The EMC Church Management System (CMS) is a multi-tenant, multi-branch church operations, discipleship, and administrative enterprise web application built on Next.js App Router and TypeScript.

### Technology Stack Baseline
* **Framework**: Next.js 16.2.10 (App Router, React Server Components & Client Boundaries)
* **Language & Runtime**: TypeScript 5.7.0, Node.js v20+
* **React**: React 19.2.7 & React DOM 19.2.7
* **UI & Styling**: Tailwind CSS 3.3.3, shadcn/ui, Radix UI primitives, Lucide icons, Framer Motion 12.23.5
* **Data Presentation**: TanStack Table v8.21.3, Recharts 2.15.4
* **Form & Validation**: React Hook Form 7.60.0, Zod 3.25.76, Hookform Resolvers 3.10.0
* **HTTP Client**: Axios 1.10.0 with JWT authentication interceptors
* **Testing**: Vitest test runner (`npm test`)
* **Typography**: Montserrat / Cabinet Grotesk & Satoshi font tokens

---

## 2. Baseline Architecture Inventory

```
                                ┌────────────────────────────────────────────────────────┐
                                │             Next.js App Router (app/)                  │
                                │  204 Routes Across 3 Primary Operational Facets        │
                                ├─────────────────────────┬──────────────────────────────┤
                                │ (landing) (11 Pages)    │ (member)/portal (18 Pages)   │
                                │ (admin)/dashboard (173) │ (admin) login/onboarding (2) │
                                └────────────┬────────────┴──────────────┬───────────────┘
                                             │                           │
                                             ▼                           ▼
                                ┌─────────────────────────┐ ┌────────────────────────────┐
                                │ UI & Layout Components  │ │ Domain Component Packages  │
                                │ (components/ui, layout) │ │ (member, landing, forms)   │
                                └────────────┬────────────┘ └────────────┬───────────────┘
                                             │                           │
                                             └─────────────┬─────────────┘
                                                           │
                                                           ▼
                                ┌────────────────────────────────────────────────────────┐
                                │               Modular Services Layer                   │
                                │  (services/<domain>/*, services/member/*, Axios)       │
                                └──────────────────────────┬─────────────────────────────┘
                                                           │
                                                           ▼
                                ┌────────────────────────────────────────────────────────┐
                                │                   External REST API                    │
                                │             (process.env.NEXT_PUBLIC_API)              │
                                └────────────────────────────────────────────────────────┘
```

### Key Component Inventories

| Layer | Path | Status & Composition |
| :--- | :--- | :--- |
| **Routing — Admin Dashboard** | `app/(admin)/dashboard/*` | 17 domain submodules, 173 route pages with loading skeletons and error boundaries |
| **Routing — Member Portal** | `app/(member)/portal/*` | 18 authenticated self-service pages with `MemberShell`, responsive drawer, and breadcrumbs |
| **Routing — Public Portal** | `app/(landing)/*` | 11 public outreach, sermon archive, and online giving pages |
| **Routing — Auth & Setup** | `app/(admin)/login`, `onboarding` | 2 administrative entry and onboarding routes |
| **Generic UI Primitives** | `components/ui/*` | 40+ shadcn/ui primitives, status badges, currency display, data tables |
| **Member Portal Components**| `components/member/*` | 18+ submodules (attendance, events, family, giving, groups, journey, prayer, pastoral care, etc.) |
| **Public Landing Components**| `components/landing/*` | 15+ public presentation components (Hero, Sermons, Testimonials, Service Times, Live Stream) |
| **Domain Forms** | `components/<domain>/*` | Domain-specific forms (`members/`, `departments/`, `prayer-requests/`) |
| **Services Layer** | `services/*` | Domain packages (`members`, `finance`, `attendance`, `events`, `groups`, `departments`, `sunday-school`, `communications`, `assets`, `reports`, `auth`, `upload`) plus dedicated `services/member/*` (16 services) |
| **Validation Schemas** | `lib/validation/*` | Centralized Zod runtime schemas covering all API input mutations and forms |
| **Security & Authorization** | `lib/authorization/*` | RBAC permission matrix (`permissions.ts`), member permissions (`member-permissions.ts`), and policy guards |
| **State / Context** | `lib/contexts/*` | `AuthContext` (auth & session state), `CurrencyContext` (multi-currency handling) |
| **Testing** | `tests/unit/*` | Vitest unit test suites for member notifications, services, and validation |

---

## 3. Cross-Cutting Concerns Analysis

### 3.1 Authentication Flow
* **Mechanism**: JWT access & refresh tokens stored in `localStorage` (`token`, `user`).
* **Session Lifecycle**: `apiClient` request interceptor attaches `Authorization: Bearer <token>`. Response interceptor redirects to `/login` on HTTP 401.
* **Separation of Contexts**: Administrative users utilize standard admin auth tokens, while church members authenticate into the member portal with scoped member credentials.

### 3.2 Authorization Flow
* **Administrative Core**: Role-Based Access Control (RBAC) with `SuperAdmin`, `Admin`, `Pastor`, `FinanceOfficer`, `DepartmentLeader`. Permissions use dot-notation format (e.g. `members.view`, `finance.expenses.create`).
* **Member Self-Service**: Defined by `MEMBER_PERMISSIONS` in `lib/authorization/member-permissions.ts` enforcing user-isolation policies (`*:read:self`, `*:update:self`).

### 3.3 Multi-Tenant & Multi-Branch Isolation
* **Mechanism**: Tenant and branch scoping injected via `lib/authorization/scope.ts`.
* **Standard**: Requests must resolve `tenantId` and `branchId` from authenticated server session context rather than arbitrary client request bodies.

### 3.4 Data Validation
* **Mechanism**: Zod runtime schema validation in `lib/validation/*` bound to React Hook Form via `@hookform/resolvers/zod`.
* **Coverage**: All critical form inputs across admin, member portal, and public pages enforce validation rules before API transmission.

### 3.5 Financial Calculations
* **Mechanism**: Specialized precision arithmetic in `lib/finance/finance-math.ts` prevents floating-point rounding errors across tithes, offerings, donations, expenses, and budgets.

### 3.6 Automated Testing
* **Mechanism**: Vitest configured with `npm test`. Unit test suites in `tests/unit/` validate notification logic, services, and domain contracts.

---

## 4. Verification & Baseline Status

* **TypeScript Typecheck (`npx tsc --noEmit`)**: **PASSING (0 errors)**
* **Automated Tests (`npm test`)**: **PASSING**
* **Total Pages Documented & Verified**: **204 pages**
