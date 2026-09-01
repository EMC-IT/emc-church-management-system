# ⛪ EMC Church Management System & Ministry Platform

A modern, high-integrity, domain-driven Church Management System (CMS) and public ministry web platform built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**.

The platform delivers a complete end-to-end solution for modern churches—unifying a high-impact public ministry portal with an enterprise-grade administrative back-office covering membership CRM, multi-currency finance, attendance kiosks, pastoral care, volunteer management, communications, Sunday school, asset tracking, executive analytics, and role-based security.

---

## 📑 Table of Contents

- [Overview & Key Highlights](#-overview--key-highlights)
- [System Architecture](#-system-architecture)
- [Complete Feature Catalog](#-complete-feature-catalog)
  - [1. Public Ministry & Community Web Portal](#1-public-ministry--community-web-portal)
  - [2. Authentication, Onboarding & User Profiles](#2-authentication-onboarding--user-profiles)
  - [3. Executive Command Center & Dashboard](#3-executive-command-center--dashboard)
  - [4. Membership Management & CRM](#4-membership-management--crm)
  - [5. Pastoral Care, Counseling & Visitation](#5-pastoral-care-counseling--visitation)
  - [6. Financial Management & Multi-Currency Accounting](#6-financial-management--multi-currency-accounting)
  - [7. Attendance Tracking & Smart Kiosk](#7-attendance-tracking--smart-kiosk)
  - [8. Communications & Broadcast Outreach](#8-communications--broadcast-outreach)
  - [9. Departments, Ministries & Volunteer Management](#9-departments-ministries--volunteer-management)
  - [10. Events & Master Church Calendar](#10-events--master-church-calendar)
  - [11. Sunday School & Children's Ministry](#11-sunday-school--childrens-ministry)
  - [12. Assets & Equipment Inventory](#12-assets--equipment-inventory)
  - [13. Small Groups, Cells & Fellowships](#13-small-groups-cells--fellowships)
  - [14. Prayer Requests & Intercession Ministry](#14-prayer-requests--intercession-ministry)
  - [15. File Vault & Central Document Repository](#15-file-vault--central-document-repository)
  - [16. Executive Analytics & Custom Report Builder](#16-executive-analytics--custom-report-builder)
  - [17. Security, Multi-Branch & System Administration](#17-security-multi-branch--system-administration)
- [Technology Stack](#-technology-stack)
- [Directory Structure](#-directory-structure)
- [Design System & UI/UX Standards](#-design-system--uiux-standards)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Development & Production Scripts](#development--production-scripts)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Documentation Index](#-documentation-index)
- [License & Support](#-license--support)

---

## 🌟 Overview & Key Highlights

* **All-in-One Church Operating System**: Combines public outreach, media streaming, discipleship pipelines, operations, and financial auditing into one unified platform.
* **Domain-Driven Architecture**: Structured separation between UI components, domain services, validation schemas, and security authorization.
* **Strict Multi-Branch & Multi-Tenant Support**: Enforce data isolation across multiple church campuses, satellite locations, and ministries.
* **Deterministic Financial Precision**: Multi-currency engine with specialized precision arithmetic (`lib/finance/finance-math.ts`) preventing floating-point rounding errors.
* **Granular Role-Based Access Control (RBAC)**: Comprehensive permission matrix with pre-built and custom access roles.
* **Zero-Bloat, Purpose-Driven UI/UX**: Designed strictly according to human interface guidelines with no decorative clutter, clear typography, and mobile-first responsiveness.
* **Type-Safe & Validated**: 100% TypeScript strict type safety with runtime Zod schema validation across all inputs and mutations.

---

## 🏛️ System Architecture

The application is structured into clean, decoupled layers following a unidirectional data flow:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                               │
│     /(landing) (Public Portal)      │     /(admin)/dashboard (Admin Core) │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Domain Presentation Layer                           │
│       Presentation Components (components/<domain>/*, components/ui/*)    │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      Application Domain Services                          │
│               (services/<domain>/*, services/api-client.ts)               │
└──────────────────┬─────────────────────────────────────┬──────────────────┘
                   │                                     │
                   ▼                                     ▼
┌─────────────────────────────────────┐   ┌─────────────────────────────────┐
│       Runtime Zod Validation        │   │    RBAC Authorization Engine    │
│         (lib/validation/*)          │   │      (lib/authorization/*)      │
└─────────────────────────────────────┘   └─────────────────────────────────┘
                   │                                     │
                   └──────────────────┬──────────────────┘
                                      │
                                      ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                       Backend REST API & Database                         │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Complete Feature Catalog

### 1. Public Ministry & Community Web Portal
*Located at `app/(landing)/*`*

* **Homepage & Welcome Experience (`/`)**:
  * **Dynamic Hero Section**: Church mission, spiritual focus, and quick call-to-actions.
  * **Service Times & Live Stream**: Display worship schedule and links to join online.
  * **Vision, Mission & Core Values**: Visual presentation of church pillars and mandate.
  * **Ministry & Event Highlights**: Curated previews of upcoming programs and active departments.
  * **Testimonies & Fruitfulness**: Member stories, life transformations, and spiritual reflections.
  * **Plan Your Visit**: Welcome guide for first-time visitors with campus directions and FAQ.
* **About Us Hub (`/about`)**:
  * **Our Story (`/about/our-story`)**: Historical origin, founders, milestones, and foundational journey.
  * **Vision & Mission (`/about/mission-vision`)**: Doctrinal mission statements and generational mandate.
  * **What We Believe (`/about/what-we-believe`)**: Complete statement of faith and scriptural foundations.
  * **Leadership & Pastoral Board (`/about/leadership`)**: Profiles and bios of Senior Pastors, Resident Pastors, and Department Heads.
* **Ministries Directory (`/ministries`)**:
  * Comprehensive index of church ministries (Men of Valor, Women of Grace, Youth on Fire, Children of Light, Worship & Creative Arts, Evangelism & Missions).
  * Meeting schedules, leadership contacts, and registration forms.
* **Sermons & Media Hub (`/sermons`)**:
  * Rich media archive of audio and video messages.
  * Filterable by preacher, sermon series, scripture passage, and topic.
  * Embedded video and podcast playback with sermon notes download.
* **Events & Community Calendar (`/events`)**:
  * Upcoming conferences, revivals, retreats, workshops, and weekly services.
  * Event details, venue maps, schedules, and public attendee RSVP/ticket registration.
* **Online Giving Portal (`/give`)**:
  * Secure online giving with fund designations (Tithes, General Offering, Missions, Building Project, Welfare).
  * Multi-currency support (GHS, USD, EUR, GBP) and multiple payment method integrations (Mobile Money, Card, Bank Transfer).
* **Contact & Connect (`/contact`)**:
  * Interactive campus location map, service office hours, direct telephone and email contacts.
  * Online contact inquiry form and public prayer request submission box.

---

### 2. Authentication, Onboarding & User Profiles
*Located at `app/(admin)/login`, `app/(admin)/onboarding`, `app/(admin)/dashboard/profile`*

* **Secure Authentication & Session Management (`/login`)**:
  * JWT-based authentication with encrypted storage.
  * Automatic Bearer token attachment via Axios interceptors.
  * Automatic token refresh and protected route authorization guards.
  * Password reset and forgot-password flows.
* **Tenant & Campus Onboarding Wizard (`/onboarding`)**:
  * Step-by-step setup wizard for newly provisioned church installations.
  * Configure organization details, headquarters campus, default currency, and superuser admin credentials.
* **User Profile & Account Security (`/dashboard/profile`)**:
  * Personal profile management (Name, Email, Phone, Title, Avatar upload).
  * Password change with strength validation (`changePasswordSchema`).
  * Personal audit trail showing recent logins and actions taken on the system.

---

### 3. Executive Command Center & Dashboard
*Located at `app/(admin)/dashboard/page.tsx`*

* **Real-Time Church Health Metrics**:
  * Total Membership count and active percentage.
  * New converts in active discipleship pipelines.
  * Monthly revenue collections, expenditures, and net surplus/deficit.
  * Average weekly attendance and visitor counts.
* **Interactive Visualizations**:
  * Monthly financial inflow vs. outflow charts.
  * Sunday attendance trend lines with historical comparisons.
* **Quick-Action Shortcuts**:
  * Direct action buttons to Add Member, Record Tithe, Take Attendance, and Send Bulk SMS.
* **Live Activity Feed**:
  * Real-time stream of recent system transactions, member registrations, and administrative events.

---

### 4. Membership Management & CRM
*Located at `app/(admin)/dashboard/members/*`*

* **Member Directory & Master List (`/dashboard/members`)**:
  * Searchable table with instant filtering by membership status (Active, Inactive, Visitor, Probation), gender, marital status, branch, and department.
  * Dynamic statistics cards showing member counts and demographic distributions.
  * CSV and Excel export of member directories.
* **Multi-Tab Registration Form (`/dashboard/members/add`)**:
  * **Personal Information**: Full legal name, preferred name, DOB, gender, marital status, nationality.
  * **Contact Details**: Residential address, GPS coordinates, primary phone, WhatsApp number, email.
  * **Spiritual Milestones**: Date of salvation, water baptism, Holy Spirit baptism, confirmation, ordination.
  * **Church Affiliation**: Campus branch, home cell/group, ministry department, membership category.
  * **Emergency & Occupation**: Emergency contact details, occupation, employer, and educational background.
* **Bulk Member Import (`/dashboard/members/import`)**:
  * Upload member rosters via CSV / Excel spreadsheets.
  * Column mapping engine with validation feedback and batch error reporting.
* **Comprehensive 360° Member Profiles (`/dashboard/members/[id]`)**:
  * Unified member overview containing biographical data, family links, documents, giving history, and attendance records.
* **New Convert & Discipleship Tracking (`/dashboard/members/[id]/convert`)**:
  * Convert milestone progression (New Convert $\rightarrow$ Follow-up $\rightarrow$ Foundation Class $\rightarrow$ Baptism $\rightarrow$ Full Member).
  * Mentor / Pastor assignment with follow-up status notes and prayer focus points.
* **Family & Household Management (`/dashboard/members/[id]/family`)**:
  * Group members into household units.
  * Define relationships (Spouse, Child, Parent, Sibling, Guardian).
  * Create new family members directly or link existing church members.
* **Document & Certificate Vault (`/dashboard/members/[id]/documents`)**:
  * Upload and archive baptism certificates, marriage certificates, child dedication records, pastoral letters, and government IDs.
  * Secure file previews and direct downloads.
* **Personal Giving Ledger (`/dashboard/members/[id]/giving`)**:
  * Historical record of individual tithes, offerings, pledges, and donations.
  * Generate and print individual annual donor tax contribution statements.
* **Member Milestone History & Audit (`/dashboard/members/[id]/history`)**:
  * Chronological timeline of member activities, appointments, leadership roles, and status changes.

---

### 5. Pastoral Care, Counseling & Visitation
*Located at `app/(admin)/dashboard/pastoral-care/*`*

* **Pastoral Counseling Case Management**:
  * Create and maintain counseling records for marriage counseling, pre-marital guidance, bereavement, spiritual deliverance, and crisis care.
  * Assign counseling cases to designated pastors or licensed counselors.
  * Track case status (New Request, Active Counseling, Follow-up Scheduled, Resolved/Closed).
* **Visitation Scheduling & Tracking**:
  * Log and schedule hospital visits, home visits, bereavement visits, prison ministry, and sick calls.
  * Record visitation outcomes, prayer needs, and follow-up requirements.
* **Confidentiality & Access Control**:
  * Strict authorization barriers ensuring confidential pastoral notes are only accessible to authorized pastoral staff.
* **Pastoral Reminders & Notifications**:
  * Automated alerts for upcoming counseling appointments and follow-up dates.

---

### 6. Financial Management & Multi-Currency Accounting
*Located at `app/(admin)/dashboard/finance/*`*

* **Financial Overview Hub (`/dashboard/finance`)**:
  * Consolidated financial KPIs: Total revenue, total expenses, net balance, and budget utilization.
  * Quick transaction shortcuts and financial health summary widgets.
* **Tithes & Offerings Module (`/dashboard/finance/tithes-offerings`)**:
  * Record collections across multiple channels: Cash, Bank Transfer, Mobile Money, Check, POS/Card.
  * Designation classification: General Tithe, First Fruit, Sunday Offering, Thanksgiving, Special Appeal.
  * Digital receipt generation with printable donor receipts.
  * Tithing loyalty, frequency, and growth trend reports (`/finance/tithes-offerings/reports`).
* **Giving, Donations & Pledges (`/dashboard/finance/giving`)**:
  * **General Donations (`/donations`)**: Record special gifts, missionary support, and designated contributions.
  * **Pledge Management (`/pledges`)**: Track financial pledges (e.g., Building Project), recording target amounts, installment payments, and fulfillment percentages.
  * **Fundraising Campaigns (`/fundraising`)**: Create special fundraising goals with live progress bars and donor recognition.
* **Miscellaneous Income Tracking (`/dashboard/finance/income`)**:
  * Log non-tithe revenue streams (Bookshop sales, venue rentals, conference registrations, grants).
* **Expense Management & Vouchers (`/dashboard/finance/expenses`)**:
  * Multi-category expense tracking: Utilities, staff payroll/stipends, honorariums, missions, facilities maintenance, welfare.
  * Upload expense receipts/invoices as proof of expenditure.
  * Expense voucher approval status tracking (Draft, Pending Approval, Approved, Disbursed, Rejected).
* **Budgeting & Departmental Allocations (`/dashboard/finance/budgets`)**:
  * Annual, quarterly, and project-based budget creation.
  * Departmental fund allocations and expenditure cap tracking.
  * Real-time Budget vs. Actual variance analysis calculations.
* **Multi-Currency Engine**:
  * Global switching between **GHS (₵)**, **USD ($)**, **EUR (€)**, and **GBP (£)** via `CurrencyContext`.
  * Persistent currency preferences saved to local storage.
  * Deterministic precision math (`lib/finance/finance-math.ts`) ensuring financial calculations are exact without JavaScript floating-point errors.
* **Unified Financial Reports Hub (`/dashboard/finance/reports`)**:
  * Generate Balance Sheets, Income & Expenditure Statements, Departmental Expense Summaries, and Category Breakdown reports.

---

### 7. Attendance Tracking & Smart Kiosk
*Located at `app/(admin)/dashboard/attendance/*`*

* **Service Roll Call & Headcount (`/dashboard/attendance/take`)**:
  * Fast headcount logging for rapid tallying: Men, Women, Children, First-Time Visitors, Total.
  * Individual member roll call with status tagging (Present, Absent, Excused, Online).
  * Support for multiple services per day (1st Service, 2nd Service, Youth Service, Midweek Service).
* **Self-Service QR Code Check-in Kiosk (`/dashboard/attendance/qr-checkin`)**:
  * **Kiosk Mode**: Display a large dynamic QR code on tablets/screens at church entryways for attendees to scan and check in.
  * **Scanner Mode**: Use device cameras at the gate to scan member digital badges for instantaneous check-in.
* **Historical Session Logs (`/dashboard/attendance/history`)**:
  * Searchable historical log of all past services and attendance numbers.
  * Filter by service type, campus branch, and date range.
* **Department & Volunteer Attendance (`/dashboard/attendance/department`)**:
  * Dedicated roll call for choir, ushers, media team, protocol, and security at rehearsals and duty rosters.
* **Small Group / Cell Roll Call (`/dashboard/attendance/groups`)**:
  * Attendance records for weekly cell meetings submitted by cell leaders.
* **Individual Member Attendance Timeline (`/dashboard/attendance/member/[id]`)**:
  * Visual consistency score and attendance timeline for individual members.
  * Automatic alerts for members who have been absent for consecutive weeks.
* **Attendance Analytics & Retention Reports (`/dashboard/attendance/reports`)**:
  * Sunday-over-Sunday growth comparisons, visitor retention rates, and holiday impact reports.

---

### 8. Communications & Broadcast Outreach
*Located at `app/(admin)/dashboard/communications/*`*

* **Communications Hub (`/dashboard/communications`)**:
  * Overview of message deliveries, SMS credit balances, and recent broadcast performance.
* **Bulk SMS Messaging (`/dashboard/communications/messages`)**:
  * Compose and dispatch direct SMS broadcasts to entire congregation, specific departments, small groups, or custom contact lists.
  * Personalization placeholders (e.g., `{first_name}`, `{title}`, `{church_name}`).
  * Real-time character counter and SMS segment calculator.
* **Scheduled Broadcast Campaigns (`/dashboard/communications/campaigns`)**:
  * Automated scheduled campaigns for member birthdays, wedding anniversaries, service reminders, and urgent church announcements.
* **Email Newsletters & Rich Campaigns (`/dashboard/communications/newsletters`)**:
  * Rich HTML newsletter composer with image embedding and formatted text.
  * Subscriber list segmentation and broadcast logs.
* **Digital Church Bulletin & Announcements (`/dashboard/communications/announcements`)**:
  * Publish bulletin notices displayed on both the admin dashboard and public church channels.
  * Set announcement start and expiry dates with priority tags (Normal, High, Urgent).

---

### 9. Departments, Ministries & Volunteer Management
*Located at `app/(admin)/dashboard/departments/*`*

* **Department Directory (`/dashboard/departments`)**:
  * Full list of church departments with descriptions, leadership structure, and member headcounts.
* **Department Creation & Profiling (`/dashboard/departments/add`)**:
  * Create departments with custom meeting schedules, budgets, and operational mandates.
* **Volunteer Roster (`/dashboard/departments/[id]/members`)**:
  * Assign church members to departments with specific roles (Leader, Assistant Leader, Secretary, Member, Trainee).
* **Department Meetings & Minutes (`/dashboard/departments/[id]/meetings`)**:
  * Schedule department committee meetings and worker briefings.
  * Record meeting attendance and archive meeting minutes documents.
* **Leadership Roles & Responsibilities (`/dashboard/departments/[id]/roles`)**:
  * Manage department leadership titles and assignments for clear organizational hierarchy.

---

### 10. Events & Master Church Calendar
*Located at `app/(admin)/dashboard/events/*`*

* **Event Scheduler & Directory (`/dashboard/events`)**:
  * Manage church conferences, crusades, revival meetings, youth camps, retreats, and regular services.
  * Configure event dates, start/end times, venue/room allocation, and host ministers.
* **Interactive Calendar Grid (`/dashboard/events/calendar`)**:
  * Visual Month, Week, and Day views color-coded by event category.
* **Online Registration & Ticket RSVP (`/dashboard/events/[id]/registrations`)**:
  * Enable attendee registration with ticket capacities and custom registration questionnaires.
  * Track registered attendees, payment status for paid events, and check-in status.
* **Gate Check-in & Event Attendance (`/dashboard/events/[id]/attendance`)**:
  * Fast check-in interface for event ushers at venue entrances.
* **Event Templates & Presets (`/dashboard/events/templates`)**:
  * Create recurring templates for monthly vigils, quarterly conventions, and annual revivals.
* **Attendee Export (`/dashboard/events/export`)**:
  * Export registered attendee lists and attendance records to CSV/Excel.

---

### 11. Sunday School & Children's Ministry
*Located at `app/(admin)/dashboard/sunday-school/*`*

* **Sunday School Dashboard (`/dashboard/sunday-school`)**:
  * Key metrics on enrolled children, weekly attendance, active classes, and teacher-to-child ratios.
* **Class Management (`/dashboard/sunday-school/classes`)**:
  * Age-bracketed classrooms: Creche (0-2 yrs), Beginners (3-5 yrs), Primary (6-8 yrs), Juniors (9-12 yrs), Teens (13-17 yrs).
  * Assign classrooms, lead teachers, and assistant teachers.
* **Child Safeguarding & Enrollment (`/dashboard/sunday-school/students`)**:
  * Detailed child records linked to parent/guardian member profiles.
  * Critical child safety information: Allergies, special needs, emergency contacts, and authorized pickup persons.
* **Teacher Rostering (`/dashboard/sunday-school/teachers`)**:
  * Directory of Sunday school teachers with background check verification notes and class assignments.
* **Class Attendance Roll Call (`/dashboard/sunday-school/classes/[id]/attendance`)**:
  * Rapid digital roll call interface specifically designed for Sunday school classes.
* **Curriculum & Teaching Materials (`/dashboard/sunday-school/materials`)**:
  * Upload and download weekly lesson plans, Bible study worksheets, coloring sheets, and multimedia lessons.

---

### 12. Assets & Equipment Inventory
*Located at `app/(admin)/dashboard/assets/*`*

* **Asset Register (`/dashboard/assets`)**:
  * Complete catalog of physical assets: Audio-visual gear, musical instruments, vehicles, furniture, power generators, properties.
  * Record serial numbers, model numbers, purchase dates, warranty expiry, and purchase costs.
* **Asset Valuation & Depreciation**:
  * Track current estimated market values and calculate annual asset depreciation.
* **Custody & Location Tracking (`/dashboard/assets/[id]/assignment`)**:
  * Assign equipment custody to specific departments, rooms, or staff custodians.
  * Prevent asset loss with check-out and check-in audit logs.
* **Servicing & Maintenance Logs (`/dashboard/assets/[id]/maintenance`)**:
  * Schedule preventive maintenance for equipment (e.g., generator servicing, AC repair, instrument tuning).
  * Maintain repair histories, service costs, and vendor contacts.
* **Asset Categorization & Reports (`/dashboard/assets/reports`)**:
  * Generate inventory valuation reports and asset replacement forecasts.

---

### 13. Small Groups, Cells & Fellowships
*Located at `app/(admin)/dashboard/groups/*`*

* **Cell Group Directory (`/dashboard/groups`)**:
  * Directory of home cells, campus fellowships, Bible study groups, and zonal fellowships.
* **Group Details & Leadership (`/dashboard/groups/[id]`)**:
  * Configure cell leader, assistant leader, host home address, meeting day, and meeting time.
* **Group Member Rostering (`/dashboard/groups/[id]/members`)**:
  * Add and manage members belonging to each cell group.
* **Meeting Attendance Reporting (`/dashboard/groups/[id]/attendance`)**:
  * Weekly cell meeting attendance logs submitted by cell leaders.
* **Cell Health & Growth Reports (`/dashboard/groups/[id]/reports`)**:
  * Track cell attendance consistency, visitor conversions, and cell multiplication readiness.

---

### 14. Prayer Requests & Intercession Ministry
*Located at `app/(admin)/dashboard/prayer-requests/*`*

* **Prayer Request Registry (`/dashboard/prayer-requests`)**:
  * Centralized directory of prayer requests submitted online or in person.
  * Categories: Healing, Salvation, Family, Financial Breakthrough, Deliverance, Thanksgiving.
  * Privacy flags: Confidential (Pastors only) vs. Intercessory Team.
* **Intercession Status Workflow**:
  * Track request state: Received $\rightarrow$ Under Intercession $\rightarrow$ Answered Praise Report $\rightarrow$ Archived.
* **Pastoral Encouragement & Notes**:
  * Pastors and intercessors can attach spiritual encouragement notes and scriptures to requests.

---

### 15. File Vault & Central Document Repository
*Located at `app/(admin)/dashboard/files/*`*

* **Categorized Document Management**:
  * Central repository for church policies, constitutions, official forms, financial audits, legal deeds, and graphic assets.
* **File Metadata & Filters**:
  * Filter by file type (PDF, Spreadsheets, Word Documents, Images).
  * View file size, upload dates, uploader identity, and version notes.
* **Secure Download & Preview**:
  * High-speed direct downloads and browser previews of documents.

---

### 16. Executive Analytics & Custom Report Builder
*Located at `app/(admin)/dashboard/analytics/*`*

* **Executive KPI Analytics Dashboard (`/dashboard/analytics`)**:
  * Visual intelligence across all domains: Church membership growth, attendance retention, revenue vs. expense trajectories, and group engagement.
  * Dynamic charts powered by Recharts (Area charts, Bar graphs, Line charts, Pie distributions).
* **Pre-Built Standard Reports (`/dashboard/analytics/reports`)**:
  * Instant generation of standard reports: Demographic Distribution, Annual Giving Summaries, Attendance Retention Index, and Asset Inventories.
* **Custom Report Builder Wizard (`/dashboard/analytics/report-builder`)**:
  * Interactive wizard allowing administrators to build bespoke reports.
  * Select data source domain (Members, Attendance, Tithes, Expenses, Sunday School, Assets).
  * Configure custom filters, column selection, date ranges, and sorting rules.
  * Export custom reports directly to **CSV**, **PDF**, or **Excel**.

---

### 17. Security, Multi-Branch & System Administration
*Located at `app/(admin)/dashboard/settings/*` & `app/(admin)/dashboard/activity-logs/*`*

* **Multi-Branch Campus Management (`/dashboard/settings/branches`)**:
  * Register main headquarters campus and satellite branches.
  * Enforce branch-scoped data isolation so branch administrators only access their campus data.
* **Church Profile & Branding (`/dashboard/settings/church-profile`)**:
  * Configure church legal name, motto, logo, tax ID, physical address, default timezone, and contact information.
* **User Administration (`/dashboard/settings/users`)**:
  * Create and invite administrative users, pastors, finance officers, and ministry heads.
  * Manage account statuses (Active, Suspended, Deactivated) and reset credentials.
* **Role-Based Access Control (RBAC) (`/dashboard/settings/roles`)**:
  * Pre-configured roles: Super Admin, Branch Pastor, Finance Officer, Membership Admin, Sunday School Leader, Department Lead, Usher/Data Entry.
  * Create custom roles with tailored permission bundles.
* **Granular Permission Matrix (`/dashboard/settings/permissions`)**:
  * System-wide interactive matrix controlling View, Create, Edit, Delete, and Export permissions across all 14+ modules.
* **Immutable Audit Trail (`/dashboard/activity-logs`)**:
  * Structured logging of all sensitive mutations and security events via `lib/audit/audit-logger.ts`.
  * Logs actor identity, action type, target entity, timestamp, IP address, and changed data diffs.
  * Individual user activity log view (`/dashboard/activity-logs/user/[userId]`).

---

## 💻 Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router) | High-performance React framework with React 19 and Server Components |
| **Language** | TypeScript 5.7+ | Strict type checking across domain models, props, and API interfaces |
| **Styling** | Tailwind CSS 3.3 | Utility-first styling with custom brand color tokens |
| **UI Primitives** | Radix UI & shadcn/ui | Accessible, unstyled UI primitives styled with Tailwind |
| **Icons** | Lucide React | Clean, consistent, lightweight SVG icon system |
| **Forms & Validation**| React Hook Form & Zod | High-performance form handling with schema-driven validation |
| **HTTP Client** | Axios | HTTP client with automatic Bearer JWT interceptors and error handling |
| **Data Visualization**| Recharts 2.15 | Responsive SVG charts (Line, Bar, Area, Pie) |
| **Date Processing** | date-fns 3.6 | Centralized date parsing, formatting, and time calculations |
| **Animations** | Framer Motion 12 | Smooth page transitions and micro-animations |
| **Testing** | Vitest 4.1 | Fast unit test runner for business logic, math, and validation |

---

## 📁 Directory Structure

```
emc-church-management-system/
├── app/                              # Next.js App Router root
│   ├── (admin)/                      # Authenticated Admin Back-Office Route Group
│   │   ├── dashboard/                # Main Operations Dashboard
│   │   │   ├── activity-logs/        # Audit trails & security event timelines
│   │   │   ├── analytics/            # Executive KPI dashboards & custom report builder
│   │   │   ├── assets/               # Physical asset register, valuations, maintenance
│   │   │   ├── attendance/           # Headcounts, QR kiosk, volunteer roll calls
│   │   │   ├── communications/       # Bulk SMS, scheduled campaigns, email newsletters
│   │   │   ├── departments/          # Ministry departments, volunteer rosters, minutes
│   │   │   ├── events/               # Event scheduling, registrations, master calendar
│   │   │   ├── files/                # Document vault & church file manager
│   │   │   ├── finance/              # Tithes, offerings, expenses, budgets, reports
│   │   │   ├── groups/               # Small groups, cell fellowships, growth metrics
│   │   │   ├── members/              # CRM, directory, converts, family links, documents
│   │   │   ├── pastoral-care/        # Counseling cases, hospital/home visitations
│   │   │   ├── prayer-requests/      # Intercessory requests & pastoral notes
│   │   │   ├── profile/              # Personal user profile & password management
│   │   │   ├── settings/             # Church profile, branches, users, roles, permissions
│   │   │   ├── sunday-school/        # Classes, students, safety, teachers, curriculum
│   │   │   ├── layout.tsx            # Protected dashboard shell layout with Sidebar & Header
│   │   │   └── page.tsx              # Executive dashboard overview
│   │   ├── login/                    # Secure administrative login portal
│   │   └── onboarding/               # First-time church setup wizard
│   ├── (landing)/                    # Public Ministry & Outreach Web Portal
│   │   ├── about/                    # Church story, mission/vision, doctrine, leadership
│   │   ├── contact/                  # Campus directions, inquiry form, visit planner
│   │   ├── events/                   # Public upcoming events & RSVP registrations
│   │   ├── give/                     # Online giving & donations portal
│   │   ├── ministries/               # Active church ministry directory
│   │   ├── sermons/                  # Media library, sermon video/audio archive
│   │   ├── layout.tsx                # Public portal layout with Navbar & Footer
│   │   └── page.tsx                  # Public homepage
│   ├── globals.css                   # Global theme tokens, typography, and CSS variables
│   └── layout.tsx                    # Root layout with AuthProvider & CurrencyProvider
├── components/                       # React Presentation Components
│   ├── auth/                         # Authentication forms & login widgets
│   ├── departments/                  # Department forms and volunteer selectors
│   ├── forms/                        # Backward-compatible form adapters
│   ├── landing/                      # Public website sections (Hero, Sermons, Giving, etc.)
│   ├── layout/                       # Admin shell components (Header, Sidebar, Search)
│   ├── members/                      # Member registration multi-tab forms
│   ├── motion/                       # Framer Motion animation containers
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
│   ├── members/                      # Member CRM & documents service
│   ├── reports/                      # Analytics & custom report generation service
│   ├── sunday-school/                # Sunday school classes & student service
│   ├── upload/                       # File and image upload service
│   ├── api-client.ts                 # Axios instance with Bearer JWT interceptors
│   └── index.ts                      # Service barrel export
├── lib/                              # Core Domain Logic, Security & Utilities
│   ├── audit/                        # Structured audit logging engine
│   ├── authorization/                # RBAC engine, canonical permissions, guards
│   ├── contexts/                     # AuthContext, CurrencyContext
│   ├── errors/                       # Standard domain error hierarchy (AppError)
│   ├── finance/                      # Deterministic precision math & variance engine
│   ├── jobs/                         # Background asynchronous job readiness contracts
│   ├── motion/                       # Motion animation presets
│   ├── types/                        # Strongly typed domain models & interfaces
│   ├── validation/                   # Zod schemas for all domain mutations & queries
│   ├── date-utils.ts                 # Centralized date-fns parsing & formatters
│   ├── permissions.ts                # Canonical permission constants & adapters
│   └── utils.ts                      # ClassName merging and general utilities
├── tests/                            # Automated Test Suites
│   └── unit/                         # Unit tests (Authorization, Finance Math, Validation)
└── docs/                             # Engineering Architecture & Blueprints
    └── architecture/                 # Domain map, Dependency map, Security boundaries
```

---

## 🎨 Design System & UI/UX Standards

The system adheres strictly to the UI/UX contracts specified in [`AGENTS.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/AGENTS.md) and [`PROJECT_RULES.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/PROJECT_RULES.md):

### 1. Brand Color Palette
```css
--brand-primary:   #2E8DB0;  /* Deep Blue - Primary actions, active states */
--brand-secondary: #28ACD1;  /* Light Blue - Secondary accents, highlights */
--brand-accent:    #C49831;  /* Gold - Status highlights, warnings */
--brand-success:   #A5CF5D;  /* Green - Confirmations, completed states */
--brand-dark:      #080A09;  /* Dark - High-contrast text, dark mode surfaces */
```

### 2. Core UI/UX Invariants
- **Design for Hierarchy, Not Decoration**: Every visual element must solve a clear user problem. Avoid decorative shapes, gratuitous gradients, and unneeded cards.
- **Currency-Neutral Icons**: Universal financial icons (`Wallet`, `Receipt`, `Banknote`) are used instead of hardcoded currency symbols ($ or €). The active currency (₵, $, €, £) is displayed as formatted text.
- **Mobile-First Responsiveness**: All tables, forms, and navigation collapse into responsive mobile layouts with minimum touch targets of 40px.
- **Montserrat Typography**: Professional, modern Google Font typography with structured scale hierarchy (`text-3xl` for titles down to `text-xs` for labels).

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20.x or higher
* **Package Manager**: `npm`, `pnpm`, or `yarn`
* **TypeScript**: 5.7+

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/EMC-IT/emc-church-management-system.git
   cd emc-church-management-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME="EMC Church Management System"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment Variables

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend REST API | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_NAME` | Display name of the church application | `EMC Church Management System` |

---

### Development & Production Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start Next.js local development server on `http://localhost:3000` |
| `npm run build` | Build the optimized production bundle |
| `npm run start` | Run the compiled production server |
| `npm run lint` | Run Next.js ESLint verification |
| `npm test` | Run automated unit tests with Vitest |
| `npx tsc --noEmit` | Validate strict TypeScript type correctness without emitting files |

---

## 🧪 Testing & Quality Assurance

The codebase includes automated test suites covering mission-critical business logic:

```bash
# Execute all unit tests
npm test
```

### Verified Test Suites:
* **Finance Math Tests (`tests/unit/finance-math.test.ts`)**: Validates exact currency precision math, multi-currency conversions, and budget variance calculations.
* **Authorization & RBAC Tests (`tests/unit/authorization.test.ts`)**: Verifies canonical permission checks, role hierarchy inheritance, and access guards.
* **Validation Schema Tests (`tests/unit/validation.test.ts`)**: Validates Zod schemas for member registration, donation transactions, attendance marking, and asset creation.

---

## 📖 Documentation Index

For in-depth architectural specifications and API contracts, consult the documentation library:

| Document | Purpose |
| :--- | :--- |
| [`docs/architecture/ui-pages-architecture.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/ui-pages-architecture.md) | **Master UI Page Matrix** mapping every route to components, services, validation, and permissions |
| [`API_DOCUMENTATION.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/API_DOCUMENTATION.md) | Comprehensive REST API specifications and request/response payloads |
| [`PROJECT_RULES.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/PROJECT_RULES.md) | Official brand design system, UI/UX contracts, and engineering guidelines |
| [`AGENTS.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/AGENTS.md) | Core UI/UX design contract and anti-vibe coding principles |
| [`docs/architecture/domain-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/domain-map.md) | Domain entity taxonomy, boundaries, and ownership mapping |
| [`docs/architecture/dependency-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/dependency-map.md) | Layer hierarchy, permitted dependencies, and forbidden import rules |
| [`docs/architecture/security-boundary-map.md`](file:///Users/bismarkabban/Documents/projects/EMC/emc-church-management-system/docs/architecture/security-boundary-map.md) | Multi-tenant trust model, branch isolation, and audit contracts |

---

## 📄 License & Support

Developed for **Empowerment Mountain Church (EMC)**.  
For technical support, feature requests, or system administration inquiries, contact the IT & Media Ministry.