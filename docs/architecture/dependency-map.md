# EMC Church Management System — Dependency Map

This document diagrams the dependency relationships across UI, Domain Components, Application Services, Validation, Authorization, and Data layers across all 204 routes in the system.

---

## 1. Architectural Layer Hierarchy

Dependencies MUST strictly flow downwards across three primary application tiers:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                   │
│  app/(landing)/*              │ app/(member)/portal/*         │ app/(admin)/dashboard/*│
└──────────────┬────────────────┴──────────────┬────────────────┴──────────────┬─────────┘
               │ imports                       │ imports                       │ imports
               ▼                               ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌─────────────────────────┐
│ PUBLIC PRESENTATION LAYER    ││ MEMBER DOMAIN COMPONENTS     ││ ADMIN DOMAIN COMPONENTS │
│ (components/landing/*, ui/*) ││ (components/member/*, ui/*)  ││ (components/<domain>/*) │
└──────────────┬───────────────┘└──────────────┬───────────────┘└──────────────┬──────────┘
               │ imports                       │ imports                       │ imports
               ▼                               ▼                               ▼
┌──────────────────────────────┐┌──────────────────────────────┐┌─────────────────────────┐
│ PUBLIC SERVICES / API        ││ MEMBER APPLICATION SERVICES  ││ ADMIN APPLICATION SVCS  │
│ (events, giving, contact)    ││ (services/member/*)          ││ (services/<domain>/*)   │
└──────────────┬───────────────┘└──────────────┬───────────────┘└──────────────┬──────────┘
               │                               │                               │
               └───────────────────────────────┼───────────────────────────────┘
                                               │ imports
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              DOMAIN VALIDATION & SECURITY                              │
│       Runtime Zod Schemas (lib/validation/*)  │ RBAC & Member Guards (lib/authorization)│
└──────────────────────────────────────────────┬─────────────────────────────────────────┘
                                               │ imports
                                               ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               INFRASTRUCTURE & UTILITIES                               │
│       Axios HTTP Client (services/api-client.ts) │ Date Utilities (lib/date-utils.ts)   │
│       Math Precision (lib/finance/finance-math.ts) │ Design Utilities (lib/utils.ts)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Permitted vs Prohibited Dependency Directions

### ✅ Permitted Dependencies:
1. **Admin Pages**: `app/(admin)/dashboard/**` → `components/**`, `services/<domain>/**`, `lib/**`, `hooks/**`.
2. **Member Portal Pages**: `app/(member)/portal/**` → `components/member/**`, `services/member/**`, `components/ui/**`, `lib/**`, `hooks/**`.
3. **Public Landing Pages**: `app/(landing)/**` → `components/landing/**`, `components/ui/**`, public services.
4. **Member Components**: `components/member/**` → `components/ui/**`, `services/member/**`, `lib/validation/**`, `lib/types/**`.
5. **Generic UI Primitives**: `components/ui/**` → Generic styling helpers (`lib/utils.ts`, `lib/date-utils.ts`) only. **Zero domain imports.**
6. **Services Layer**: `services/<domain>/**` and `services/member/**` → `services/api-client.ts`, `lib/validation/**`, `lib/types/**`, `lib/errors/**`.

### ❌ Prohibited Dependencies (Violations):
1. **Inverted Dependency**: `services/**` or `lib/**` importing from `components/**` or `app/**`.
2. **Polluted Primitives**: `components/ui/**` importing domain models, domain services, or domain components.
3. **Cross-Tier Leakage**: `components/member/**` importing admin domain forms or admin mutation services directly.
4. **Bypassing Services**: Any page under `app/**` directly issuing raw un-typed `fetch` or `axios` calls without routing through designated services.
5. **Circular Domain Dependencies**: `services/members/**` ↔ `services/finance/**` direct mutual recursion.

---

## 3. Codebase Dependency Inventory

### Core Libraries & Utilities (`lib/`)
* **`lib/utils.ts`**: Pure UI styling helpers (`clsx`, `tailwind-merge`). No upstream dependencies.
* **`lib/date-utils.ts`**: Centralized date formatting and parsing (`date-fns`). Independent utility.
* **`lib/finance/finance-math.ts`**: High-precision arithmetic preventing floating point rounding errors in financial transactions.
* **`lib/authorization/`**: Centralized security, role permissions (`PERMISSIONS`), member permissions (`MEMBER_PERMISSIONS`), tenant scope, and policy guards.
* **`lib/contexts/`**: `AuthContext` (session authentication state) and `CurrencyContext` (active currency symbols and exchange rates).

### Services Layer (`services/`)
* **`services/api-client.ts`**: Axios instance configuring JWT bearer token authentication and HTTP 401 interception.
* **Domain Services (`services/<domain>/*`)**: Modular domain service packages (`members`, `finance`, `attendance`, `events`, `groups`, `departments`, `sunday-school`, `communications`, `assets`, `reports`, `auth`, `upload`).
* **Member Services (`services/member/*`)**: 16 dedicated services for member portal operations (`dashboard`, `profile`, `family`, `giving`, `events`, `groups`, `ministries`, `attendance`, `journey`, `prayer`, `pastoral-care`, `resources`, `notifications`, `settings`, `announcements`).
