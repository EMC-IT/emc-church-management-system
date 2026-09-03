# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick Start Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run Next.js linting
npm run lint
```

### Testing & Quality Assurance
```bash
# Run all automated tests with Vitest
npm test

# Type check TypeScript strictly without emitting files
npx tsc --noEmit
```

### Common Development Tasks
```bash
# Run development server (starts on http://localhost:3000)
npm run dev

# Build the production application
npm run build
```

---

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 16.2.10 (App Router, Server & Client Components)
- **UI Library**: React 19.2.7 & React DOM 19.2.7
- **Language**: TypeScript 5.7.0 with strict type checking
- **Styling**: Tailwind CSS 3.3.3 + shadcn/ui design primitives
- **Animations**: Framer Motion 12.23.5
- **State Management**: React Context (`AuthProvider`, `CurrencyProvider`, `ThemeProvider`)
- **HTTP Client**: Axios 1.10.0 with JWT Bearer interceptors & automatic 401 redirection
- **Data Presentation**: TanStack Table v8.21.3 & Recharts 2.15.4
- **Form & Validation**: React Hook Form 7.60.0 + Zod 3.25.76 (`@hookform/resolvers/zod`)
- **Icons**: Lucide React
- **Fonts**: Montserrat (Google Fonts) & modern typography tokens
- **Testing**: Vitest test runner

---

### Project Structure (204 Routes Across 3 Primary Facets)

```
emc-church-management-system/
├── app/                              # Next.js App Router (204 pages)
│   ├── (admin)/                      # Authenticated Back-Office & Setup (175 pages)
│   │   ├── dashboard/                # Main Operations Dashboard (173 pages across 17 domains)
│   │   │   ├── activity-logs/        # Audit trails & security event timelines (2 pages)
│   │   │   ├── analytics/            # Executive KPI dashboards & custom report builder (5 pages)
│   │   │   ├── assets/               # Physical asset register, valuations, maintenance (11 pages)
│   │   │   ├── attendance/           # Headcounts, QR kiosk, volunteer roll calls (9 pages)
│   │   │   ├── communications/       # Bulk SMS, scheduled campaigns, email newsletters (16 pages)
│   │   │   ├── departments/          # Ministry departments, volunteer rosters, minutes (7 pages)
│   │   │   ├── events/               # Event scheduling, registrations, master calendar (12 pages)
│   │   │   ├── files/                # Document vault & church file manager (1 page)
│   │   │   ├── finance/              # Tithes, offerings, expenses, budgets, reports (62 pages)
│   │   │   ├── groups/               # Small groups, cell fellowships, growth metrics (13 pages)
│   │   │   ├── members/              # CRM, directory, converts, family links, documents (17 pages)
│   │   │   ├── pastoral-care/        # Counseling cases, hospital/home visitations (1 page)
│   │   │   ├── prayer-requests/      # Intercessory requests & pastoral notes (5 pages)
│   │   │   ├── profile/              # Personal user profile & password management (1 page)
│   │   │   ├── settings/             # Church profile, branches, users, roles, permissions (11 pages)
│   │   │   ├── sunday-school/        # Classes, students, safety, teachers, curriculum (18 pages)
│   │   │   ├── test-lazy-loading/    # Developer utility & dynamic import testing (1 page)
│   │   │   ├── layout.tsx            # Protected dashboard shell layout with Sidebar & Header
│   │   │   └── page.tsx              # Executive dashboard overview (1 page)
│   │   ├── login/                    # Secure administrative login portal (1 page)
│   │   └── onboarding/               # First-time church setup wizard (1 page)
│   ├── (landing)/                    # Public Ministry & Community Web Portal (11 pages)
│   │   ├── about/                    # Church story, mission/vision, doctrine, leadership (5 pages)
│   │   ├── contact/                  # Campus directions, inquiry form, visit planner (1 page)
│   │   ├── events/                   # Public upcoming events & RSVP registrations (1 page)
│   │   ├── give/                     # Online giving & donations portal (1 page)
│   │   ├── ministries/               # Active church ministry directory (1 page)
│   │   ├── sermons/                  # Media library, sermon video/audio archive (1 page)
│   │   ├── layout.tsx                # Public portal layout with Navbar & Footer
│   │   └── page.tsx                  # Public homepage (1 page)
│   ├── (member)/                     # Member Self-Service Portal (18 pages)
│   │   └── portal/                   # Authenticated member area with MemberShell
│   │       ├── attendance/           # Personal & family attendance records & check-in QR
│   │       ├── events/               # Member events catalog & registration tickets
│   │       ├── family/               # Household members & relationship linkages
│   │       ├── giving/               # Personal contribution ledger & giving statements
│   │       ├── groups/               # Small groups & cell fellowships
│   │       ├── journey/              # Discipleship milestones & spiritual growth path
│   │       ├── ministries/           # Serving teams & ministry involvement
│   │       ├── notifications/        # Announcements, inbox & direct alerts
│   │       ├── pastoral-care/        # Pastoral appointments & counseling requests
│   │       ├── prayer/               # Prayer petition submission & answered prayers
│   │       ├── profile/              # Member profile, photo upload & personal info
│   │       ├── resources/            # Digital study materials, sermon guides & media
│   │       ├── settings/             # Notification preferences & password management
│   │       ├── error-preview/        # Error boundary and empty state preview
│   │       ├── layout.tsx            # MemberShell layout with persistent sidebar & header
│   │       └── page.tsx              # Member personal dashboard overview
│   ├── globals.css                   # Global theme tokens, typography, and CSS variables
│   └── layout.tsx                    # Root layout with AuthProvider & CurrencyProvider
├── components/                       # React Presentation Components
│   ├── auth/                         # Authentication forms & login widgets
│   ├── departments/                  # Department forms and volunteer selectors
│   ├── errors/                       # Standard UI error boundaries & recovery components
│   ├── forms/                        # Backward-compatible form adapters
│   ├── landing/                      # Public website sections (Hero, Sermons, Giving, etc.)
│   ├── layout/                       # Admin shell components (Header, Sidebar, Search)
│   ├── member/                       # Member Portal UI domain submodules (18+ modules)
│   ├── members/                      # Member registration multi-tab forms
│   ├── motion/                       # Framer Motion animation containers
│   ├── prayer-requests/              # Intercessory prayer dialogs & components
│   ├── theme/                        # Light/Dark mode theme provider
│   └── ui/                           # 40+ atomic shadcn/ui design primitives
├── services/                         # Application Domain API Services
│   ├── assets/                       # Asset & equipment API calls
│   ├── attendance/                   # Attendance & check-in service
│   ├── auth/                         # Authentication & user profile service
│   ├── communications/               # Bulk SMS & email campaign service
│   ├── departments/                  # Ministry department service
│   ├── events/                       # Events & registration service
│   ├── finance/                      # Tithes, giving, expenses, and budget services
│   ├── groups/                       # Cell groups & fellowship service
│   ├── member/                       # 16 dedicated services for the Member Portal
│   ├── members/                      # Member CRM & documents service
│   ├── reports/                      # Analytics & custom report generation service
│   ├── sunday-school/                # Sunday school classes & student service
│   ├── upload/                       # File and image upload service
│   ├── api-client.ts                 # Axios instance with Bearer JWT interceptors
│   └── index.ts                      # Service barrel export
├── lib/                              # Core Domain Logic, Security & Utilities
│   ├── audit/                        # Structured audit logging engine
│   ├── authorization/                # RBAC engine, canonical permissions, member guards
│   ├── contexts/                     # AuthContext, CurrencyContext
│   ├── errors/                       # Standard domain error hierarchy (AppError)
│   ├── finance/                      # Deterministic precision math & variance engine
│   ├── types/                        # Strongly typed domain models & interfaces
│   ├── validation/                   # Zod schemas for all domain mutations & queries
│   ├── date-utils.ts                 # Centralized date-fns parsing & formatters
│   ├── permissions.ts                # Canonical permission constants & adapters
│   └── utils.ts                      # ClassName merging and general utilities
├── tests/                            # Automated Test Suites
│   └── unit/                         # Unit tests (Notifications, Finance Math, Validation)
└── docs/                             # Engineering Architecture & Blueprints
    ├── architecture/                 # UI pages map (204 routes), domain map, backend arch
    └── member-portal/                # UX/UI consistency checklist & design contract
```

---

## Important Project Rules

### Brand Standards
- Primary: `#2E8DB0` (Deep Blue), Secondary: `#28ACD1` (Light Blue)
- Accent: `#C49831` (Gold), Success: `#A5CF5D` (Green), Dark: `#080A09`
- Typography: Montserrat & Cabinet Grotesk font family tokens
- Mobile-first responsive design mandatory across all 204 pages

### UI/UX Contracts
- Strictly adhere to `AGENTS.md` and `PROJECT_RULES.md`
- No unnecessary decorative badges, icons, or nested cards
- Standard page hierarchy: single `<h1>`, contextual action bar, flat content sections
- Deterministic currency display with text symbols (never symbol icons)
