# EMC Church Management System — Dependency Map (Phase 0)

This document diagrams the dependency relationships across UI, Domain Components, Application Services, Validation, Authorization, and Data layers.

---

## 1. Architectural Layer Hierarchy

Dependencies MUST strictly flow downwards:

```
┌────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                   │
│   Next.js App Router (app/dashboard/*)                 │
└───────────────────────────┬────────────────────────────┘
                            │ imports
                            ▼
┌────────────────────────────────────────────────────────┐
│               DOMAIN COMPONENT LAYER                   │
│   (components/members, components/finance, etc.)       │
└───────────────────────────┬────────────────────────────┘
                            │ imports
                            ▼
┌────────────────────────────────────────────────────────┐
│             APPLICATION & SERVICE LAYER                │
│   (services/<domain>/*, lib/authorization/*)           │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
      imports │                   imports │
              ▼                           ▼
┌───────────────────────────┐   ┌────────────────────────┐
│   DOMAIN VALIDATION LAYER │   │  DOMAIN TYPES & MODELS │
│   (lib/validation/*)      │   │  (lib/types/*)         │
└─────────────┬─────────────┘   └─────────┬──────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │ imports
                            ▼
┌────────────────────────────────────────────────────────┐
│               INFRASTRUCTURE & UTILITIES               │
│   (services/api-client.ts, lib/date-utils.ts, etc.)    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Permitted vs Prohibited Dependency Directions

### ✅ Permitted Dependencies:
1. `app/dashboard/**` → `components/**`, `services/**`, `lib/**`, `hooks/**`
2. `components/<domain>/**` → `components/ui/**`, `services/<domain>/**`, `lib/validation/<domain>/**`, `lib/types/**`
3. `components/ui/**` → Generic utilities only (`lib/utils.ts`, `lib/date-utils.ts`). **Zero domain imports.**
4. `services/<domain>/**` → `services/api-client.ts`, `lib/validation/**`, `lib/types/**`, `lib/errors/**`

### ❌ Prohibited Dependencies (Violations):
1. **Inverted Dependency**: `services/**` or `lib/**` importing from `components/**` or `app/**`.
2. **Polluted Primitives**: `components/ui/**` importing domain models, domain services, or domain components.
3. **Bypassing Services**: `app/dashboard/**` or `components/**` directly executing raw HTTP mutations without going through the designated domain service.
4. **Circular Domain Dependencies**: `services/members/**` ↔ `services/finance/**` direct mutual recursion.

---

## 3. Current Codebase Dependency Inventory

### Core Libraries & Utilities (`lib/`)
* **`lib/utils.ts`**: Pure UI styling helpers (`clsx`, `tailwind-merge`). No upstream dependencies.
* **`lib/date-utils.ts`**: Date-fns based parsing and standard formatting. Independent utility.
* **`lib/permissions.ts`**: Exports RBAC dictionaries (`PERMISSIONS`, `ROLES`, `ROLE_PERMISSIONS`).
* **`lib/contexts/auth-context.tsx`**: Consumes `lib/permissions.ts` and `lib/types`.
* **`lib/contexts/currency-context.tsx`**: Manages active currency and formatting symbols.

### Services Layer (`services/`)
* **`services/api-client.ts`**: Axios instance configuring bearer token auth and 401 interception.
* **Domain Services (`*-service.ts`)**: Flat modules calling `apiClient` with typed responses.

### Target Migration Path
* Shift from flat `services/*.ts` to domain-oriented packages (`services/members/`, `services/finance/`, `services/attendance/`, etc.) with barrel index exports to ensure seamless backwards compatibility (`OLD -> ADAPTER -> NEW`).
