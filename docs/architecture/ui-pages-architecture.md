# EMC Church Management System — UI Pages Architecture & Route Map

This document establishes the architecture, service bindings, validation schemas, and authorization requirements for every user interface page across the EMC Church Management System.

---

## 🏛️ Architecture Layer Flow for UI Pages

Every page follows the clean unidirectional execution flow:

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Page Route (page.tsx)                  │
                  │             Loading State (loading.tsx)                │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │         Domain Presentation & Forms Layer              │
                  │     (components/<domain>/*, components/ui/*)           │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │              Application Domain Service                │
                  │               (services/<domain>/*)                    │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                         ┌────────────────────┴───────────────────┐
                         ▼                                        ▼
      ┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
      │      Runtime Validation Layer       │  │        Authorization Engine         │
      │        (lib/validation/*)           │  │       (lib/authorization/*)         │
      └─────────────────────────────────────┘  └─────────────────────────────────────┘
```

---

## 📋 Comprehensive Domain UI Matrix

### 1. Membership Management (`/dashboard/members`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/members` | Member directory, search, stats, & listing | `DataTable`, `StatCard`, `StatusBadge` | `membersService` | `memberSearchSchema` | `members.view` (`canViewMembers`) |
| `/dashboard/members/add` | Multi-tab member registration form | `MemberFullForm`, `MemberForm` | `membersService` | `memberCreateSchema` | `members.create` |
| `/dashboard/members/import` | Bulk CSV/spreadsheet member import | `FileUpload`, `DataTable` | `membersService` | `memberCreateSchema` | `members.import` |
| `/dashboard/members/[id]` | Member profile, overview, & activity | `PageHeader`, `Badge`, `Avatar` | `membersService` | — | `members.view` |
| `/dashboard/members/[id]/edit` | Edit member profile details | `MemberFullForm` | `membersService` | `memberUpdateSchema` | `members.edit` (`canEditMembers`) |
| `/dashboard/members/[id]/convert` | New convert tracking & mentor assignment | `DataTable`, `StatusBadge` | `membersService` | `memberUpdateSchema` | `members.converts` |
| `/dashboard/members/[id]/convert/edit`| Update convert follow-up status | `Form`, `Select` | `membersService` | `memberUpdateSchema` | `members.converts` |
| `/dashboard/members/[id]/family` | Family ties, spouse, and children view | `Card`, `DataTable` | `membersService` | — | `members.family` |
| `/dashboard/members/[id]/family/add` | Create & add new family member | `MemberForm` | `membersService` | `memberCreateSchema` | `members.family` |
| `/dashboard/members/[id]/family/link`| Link existing church member as family | `Select`, `Button` | `membersService` | `familyLinkSchema` | `members.family` |
| `/dashboard/members/[id]/documents` | Member baptism, marriage & ID docs | `DataTable`, `FileUpload` | `documentsService` | — | `members.documents` |
| `/dashboard/members/[id]/documents/upload` | Upload new member document | `FileUpload`, `FormInput` | `documentsService` | — | `members.documents` |
| `/dashboard/members/[id]/giving` | Member personal tithing & giving history | `DataTable`, `CurrencyDisplay` | `givingService` | — | `members.giving` |
| `/dashboard/members/[id]/giving/add` | Record personal donation for member | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.manage` |
| `/dashboard/members/[id]/giving/[givingId]` | Inspect giving receipt record | `Card`, `CurrencyDisplay` | `givingService` | — | `members.giving` |
| `/dashboard/members/[id]/giving/[givingId]/edit` | Edit member giving transaction | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.manage` |
| `/dashboard/members/[id]/history` | Timeline of member milestones & attendance | `ScrollArea`, `Badge` | `membersService` | — | `members.history` |

---

### 2. Financial Management (`/dashboard/finance`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance` | Financial overview, KPIs, recent revenue/spend | `StatCard`, `CurrencyDisplay`, `DataTable` | `financeService` | — | `finance.view` (`canViewFinance`) |
| `/dashboard/finance/tithes-offerings` | Tithes & offerings transaction ledger | `DataTable`, `StatusBadge` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.view` |
| `/dashboard/finance/tithes-offerings/add` | Record new tithe or offering collection | `Form`, `CurrencyDisplay` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.create` |
| `/dashboard/finance/tithes-offerings/[id]` | Inspect tithe transaction receipt | `Card`, `CurrencyDisplay` | `financeService` | — | `finance.tithes.view` |
| `/dashboard/finance/tithes-offerings/[id]/edit` | Modify tithe transaction | `Form`, `CurrencyDisplay` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.edit` |
| `/dashboard/finance/tithes-offerings/categories` | Tithe & offering designation categories | `DataTable`, `Dialog` | `financeService` | — | `finance.tithes.categories` |
| `/dashboard/finance/tithes-offerings/reports` | Tithing growth & loyalty reports | `Chart`, `StatCard` | `reportsService` | — | `finance.tithes.reports` |
| `/dashboard/finance/giving` | General giving, pledges, & donations | `DataTable`, `GivingCategoryBadge` | `givingService` | — | `finance.giving.view` |
| `/dashboard/finance/giving/donations` | Donation receipts & transactions | `DataTable`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.donations` |
| `/dashboard/finance/giving/donations/add`| Record donor contribution | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.donations` |
| `/dashboard/finance/giving/pledges` | Building fund & special pledges | `DataTable`, `Progress` | `givingService` | — | `finance.giving.pledges` |
| `/dashboard/finance/giving/fundraising` | Special fundraising campaigns | `Card`, `Progress`, `Button` | `givingService` | — | `finance.giving.fundraising` |
| `/dashboard/finance/giving/reports` | Donor statements & giving analytics | `Chart`, `DataTable` | `reportsService` | — | `finance.giving.reports` |
| `/dashboard/finance/income` | Miscellaneous church revenue directory | `DataTable`, `CurrencyDisplay` | `incomeService` | — | `finance.income.view` |
| `/dashboard/finance/income/add` | Record income entry | `Form`, `CurrencyDisplay` | `incomeService` | — | `finance.income.create` |
| `/dashboard/finance/income/reports` | Revenue breakdown & trend analysis | `Chart`, `StatCard` | `reportsService` | — | `finance.income.reports` |
| `/dashboard/finance/expenses` | Ministry expenditures & bills directory | `DataTable`, `StatusBadge` | `expenseService` | `expenseCreateSchema` | `finance.expenses.view` |
| `/dashboard/finance/expenses/add` | Submit expense voucher / receipt | `Form`, `FileUpload` | `expenseService` | `expenseCreateSchema` | `finance.expenses.create` |
| `/dashboard/finance/expenses/[id]` | Inspect expense voucher details | `Card`, `CurrencyDisplay` | `expenseService` | — | `finance.expenses.view` |
| `/dashboard/finance/expenses/[id]/edit` | Edit expense record | `Form`, `CurrencyDisplay` | `expenseService` | `expenseCreateSchema` | `finance.expenses.edit` |
| `/dashboard/finance/expenses/reports` | Spending by department & category | `Chart`, `DataTable` | `reportsService` | — | `finance.expenses.reports` |
| `/dashboard/finance/budgets` | Annual & departmental budget directory | `DataTable`, `Progress` | `budgetService` | `budgetCreateSchema` | `finance.budgets.view` |
| `/dashboard/finance/budgets/add` | Create new fiscal budget plan | `Form`, `CurrencyDisplay` | `budgetService` | `budgetCreateSchema` | `finance.budgets.create` |
| `/dashboard/finance/budgets/[id]` | Inspect budget lines & utilization | `Card`, `Progress`, `DataTable` | `budgetService` | — | `finance.budgets.view` |
| `/dashboard/finance/budgets/allocations` | Department fund allocations | `DataTable`, `Button` | `budgetService` | — | `finance.budgets.allocations` |
| `/dashboard/finance/budgets/reports` | Budget variance & utilization reports | `Chart`, `StatCard` | `budgetService` | — | `finance.budgets.reports` |
| `/dashboard/finance/reports` | Unified Financial Reports Hub | `ChartHeader`, `StatCard` | `reportsService` | — | `finance.reports.view` |

---

### 3. Attendance Management (`/dashboard/attendance`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/attendance` | Attendance overview, headcounts, & trends | `StatCard`, `DataTable` | `attendanceService` | `attendanceQuerySchema`| `attendance.view` |
| `/dashboard/attendance/take` | Mark headcount & individual roll call | `DataTable`, `Select`, `Button` | `attendanceService` | `bulkAttendanceSchema` | `attendance.take` |
| `/dashboard/attendance/qr-checkin` | Live QR code kiosk & scanner | `Card`, `Badge` | `attendanceService` | `attendanceRecordSchema`| `attendance.qr` |
| `/dashboard/attendance/history` | Historical service sessions log | `DataTable`, `DatePicker` | `attendanceService` | `attendanceQuerySchema`| `attendance.history` |
| `/dashboard/attendance/reports` | Attendance retention & growth reports | `Chart`, `StatCard` | `reportsService` | — | `attendance.reports` |
| `/dashboard/attendance/department` | Departmental volunteer attendance | `DataTable`, `Select` | `attendanceService` | `bulkAttendanceSchema` | `attendance.department` |
| `/dashboard/attendance/groups` | Small group attendance records | `DataTable`, `Select` | `attendanceService` | `bulkAttendanceSchema` | `attendance.groups` |
| `/dashboard/attendance/member` | Member attendance search | `DataTable`, `Avatar` | `attendanceService` | — | `attendance.member` |
| `/dashboard/attendance/member/[id]`| Member attendance profile timeline | `Card`, `Chart` | `attendanceService` | — | `attendance.member` |

---

### 4. Communications & Outreach (`/dashboard/communications`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/communications` | Communications hub & delivery metrics | `StatCard`, `DataTable` | `communicationsService`| — | `communications.view` |
| `/dashboard/communications/messages` | Direct SMS and Email message history | `DataTable`, `Badge` | `communicationsService`| `smsSendSchema` | `communications.messages` |
| `/dashboard/communications/messages/new` | Compose & dispatch direct message | `Form`, `Textarea` | `communicationsService`| `smsSendSchema` | `communications.send` (`canSendSMS`) |
| `/dashboard/communications/campaigns` | Multi-channel broadcast campaigns | `DataTable`, `StatusBadge` | `communicationsService`| — | `communications.campaigns` |
| `/dashboard/communications/campaigns/add`| Create scheduled broadcast campaign | `Form`, `DatePicker` | `communicationsService`| `smsSendSchema` | `communications.campaigns` |
| `/dashboard/communications/announcements` | Bulletin notices & announcements | `DataTable`, `Badge` | `communicationsService`| `announcementCreateSchema`| `communications.announcements` |
| `/dashboard/communications/announcements/add` | Publish church bulletin notice | `Form`, `Select` | `communicationsService`| `announcementCreateSchema`| `communications.announcements` |
| `/dashboard/communications/newsletters` | Email newsletters & subscriber lists | `DataTable`, `Card` | `communicationsService`| `emailSendSchema` | `communications.newsletters` |
| `/dashboard/communications/newsletters/add` | Draft & design newsletter | `Form`, `Textarea` | `communicationsService`| `emailSendSchema` | `communications.newsletters` |

---

### 5. Departments & Ministries (`/dashboard/departments`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/departments` | Church departments directory & leaders | `DataTable`, `DepartmentForm` | `departmentsService` | `departmentCreateSchema`| `departments.view` |
| `/dashboard/departments/add` | Create new ministry department | `DepartmentForm` | `departmentsService` | `departmentCreateSchema`| `departments.create` |
| `/dashboard/departments/[id]` | Department details & overview | `Card`, `PageHeader` | `departmentsService` | — | `departments.view` |
| `/dashboard/departments/[id]/members` | Department volunteer roster | `DataTable`, `Avatar` | `departmentsService` | — | `departments.members` |
| `/dashboard/departments/[id]/meetings`| Meeting schedules & minutes | `DataTable`, `Dialog` | `departmentsService` | `departmentMeetingSchema`| `departments.meetings` |
| `/dashboard/departments/[id]/roles` | Department leadership role assign | `DataTable`, `Select` | `departmentsService` | — | `departments.roles` |
| `/dashboard/departments/categories` | Department classifications | `DataTable`, `Dialog` | `departmentsService` | — | `departments.categories` |

---

### 6. Events & Calendar (`/dashboard/events`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/events` | Events directory & listing | `DataTable`, `PageHeader` | `eventsService` | `eventCreateSchema` | `events.view` |
| `/dashboard/events/add` | Create & schedule church event | `Form`, `DateTimePicker` | `eventsService` | `eventCreateSchema` | `events.create` |
| `/dashboard/events/[id]` | Event overview, date, and venue | `Card`, `PageHeader` | `eventsService` | — | `events.view` |
| `/dashboard/events/[id]/edit` | Modify event schedule and details | `Form`, `DateTimePicker` | `eventsService` | `eventCreateSchema` | `events.edit` |
| `/dashboard/events/[id]/registrations`| Attendee RSVP & ticket management | `DataTable`, `Badge` | `eventsService` | `eventRegistrationSchema`| `events.registrations` |
| `/dashboard/events/[id]/attendance` | Event gate check-in & roll call | `DataTable`, `Button` | `eventsService` | — | `events.attendance` |
| `/dashboard/events/calendar` | Interactive calendar grid view | `Calendar`, `Badge` | `eventsService` | — | `events.calendar` |
| `/dashboard/events/categories` | Event categories & colors | `DataTable`, `Dialog` | `eventsService` | — | `events.categories` |
| `/dashboard/events/templates` | Recurring event templates | `Card`, `DataTable` | `eventsService` | — | `events.templates` |
| `/dashboard/events/bulk-actions` | Bulk update attendee statuses | `DataTable`, `Select` | `eventsService` | — | `events.bulk` |
| `/dashboard/events/export` | Export event registrations to CSV | `Card`, `Button` | `eventsService` | — | `events.export` |

---

### 7. Sunday School (`/dashboard/sunday-school`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/sunday-school` | Sunday school dashboard & metrics | `StatCard`, `DataTable` | `sundaySchoolService` | — | `sunday-school.view` |
| `/dashboard/sunday-school/classes` | Classes directory & age brackets | `DataTable`, `Badge` | `sundaySchoolService` | `sundaySchoolClassSchema`| `sunday-school.classes.view` |
| `/dashboard/sunday-school/classes/add`| Create Sunday school class | `Form`, `Select` | `sundaySchoolService` | `sundaySchoolClassSchema`| `sunday-school.classes.create` |
| `/dashboard/sunday-school/classes/[id]`| Class details, roster, & teacher | `Card`, `PageHeader` | `sundaySchoolService` | — | `sunday-school.classes.view` |
| `/dashboard/sunday-school/classes/[id]/attendance` | Record Sunday school class roll call | `DataTable`, `Select` | `sundaySchoolService` | — | `sunday-school.attendance` |
| `/dashboard/sunday-school/students` | Enrolled children directory | `DataTable`, `Badge` | `sundaySchoolService` | `studentEnrollSchema` | `sunday-school.students.view` |
| `/dashboard/sunday-school/teachers` | Teachers roster & assignments | `DataTable`, `Avatar` | `sundaySchoolService` | — | `sunday-school.teachers.view` |
| `/dashboard/sunday-school/teachers/add`| Register Sunday school teacher | `Form`, `Input` | `sundaySchoolService` | — | `sunday-school.teachers.manage` |
| `/dashboard/sunday-school/materials` | Curriculum & lesson worksheets | `DataTable`, `FileUpload` | `sundaySchoolService` | — | `sunday-school.materials.view` |
| `/dashboard/sunday-school/materials/upload`| Upload Sunday school lesson material | `FileUpload`, `Form` | `sundaySchoolService` | — | `sunday-school.materials.manage` |
| `/dashboard/sunday-school/reports` | Sunday school growth reports | `Chart`, `StatCard` | `sundaySchoolService` | — | `sunday-school.reports` |

---

### 8. Assets & Inventory (`/dashboard/assets`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/assets` | Asset inventory & valuation directory | `DataTable`, `StatusBadge` | `assetService` | `assetCreateSchema` | `assets.view` |
| `/dashboard/assets/add` | Register new church equipment | `Form`, `CurrencyDisplay` | `assetService` | `assetCreateSchema` | `assets.create` |
| `/dashboard/assets/[id]` | Inspect asset specs, warranty, valuation | `Card`, `PageHeader` | `assetService` | — | `assets.view` |
| `/dashboard/assets/[id]/edit` | Edit asset details | `Form`, `Select` | `assetService` | `assetUpdateSchema` | `assets.edit` |
| `/dashboard/assets/[id]/maintenance` | Log asset servicing & repairs | `DataTable`, `Form` | `assetService` | — | `assets.edit` |
| `/dashboard/assets/[id]/assignment` | Custody assignment to department/staff | `Form`, `Select` | `assetService` | — | `assets.edit` |
| `/dashboard/assets/categories` | Asset categories & classifications | `DataTable`, `Dialog` | `assetService` | — | `assets.categories` |
| `/dashboard/assets/reports` | Asset depreciation & inventory reports | `Chart`, `StatCard` | `assetService` | — | `assets.reports` |

---

### 9. Groups & Fellowships (`/dashboard/groups`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/groups` | Small groups & fellowships directory | `DataTable`, `StatCard` | `groupsService` | `groupCreateSchema` | `groups.view` |
| `/dashboard/groups/add` | Create new small group / cell | `Form`, `Select` | `groupsService` | `groupCreateSchema` | `groups.create` |
| `/dashboard/groups/[id]` | Group details, schedule, & leader | `Card`, `PageHeader` | `groupsService` | — | `groups.view` |
| `/dashboard/groups/[id]/edit` | Edit small group parameters | `Form`, `Input` | `groupsService` | `groupCreateSchema` | `groups.edit` |
| `/dashboard/groups/[id]/members` | Group member roster | `DataTable`, `Avatar` | `groupsService` | `groupMemberAddSchema` | `groups.members` |
| `/dashboard/groups/[id]/members/add`| Add member to small group | `Select`, `Button` | `groupsService` | `groupMemberAddSchema` | `groups.members` |
| `/dashboard/groups/[id]/attendance` | Small group meeting roll call | `DataTable`, `Select` | `groupsService` | — | `groups.attendance` |
| `/dashboard/groups/[id]/events` | Group-specific events & meetings | `DataTable`, `Button` | `groupsService` | — | `groups.events` |
| `/dashboard/groups/[id]/roles` | Group leaders, hosts, assistants | `DataTable`, `Select` | `groupsService` | — | `groups.roles` |
| `/dashboard/groups/[id]/reports` | Small group attendance health report | `Chart`, `StatCard` | `groupsService` | — | `groups.reports` |
| `/dashboard/groups/categories` | Group classifications (Cell/Ministry) | `DataTable`, `Dialog` | `groupsService` | — | `groups.categories` |

---

### 10. Prayer Requests (`/dashboard/prayer-requests`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/prayer-requests` | Prayer request directory & status | `DataTable`, `StatusBadge` | `apiClient` | — | `prayer-requests.view` |
| `/dashboard/prayer-requests/add` | Submit new prayer petition | `Form`, `Textarea` | `apiClient` | — | `prayer-requests.create` |
| `/dashboard/prayer-requests/[id]` | View prayer details & responses | `Card`, `ScrollArea` | `apiClient` | — | `prayer-requests.view` |
| `/dashboard/prayer-requests/[id]/edit`| Edit prayer request | `Form`, `Textarea` | `apiClient` | — | `prayer-requests.edit` |
| `/dashboard/prayer-requests/categories`| Prayer categories & tags | `DataTable`, `Dialog` | `apiClient` | — | `prayer-requests.categories` |

---

### 11. Settings & System Administration (`/dashboard/settings`)

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/settings` | Settings overview & system health | `Card`, `Button` | `apiClient` | — | `settings.view` |
| `/dashboard/settings/church-profile` | Church branding, address, & legal info | `Form`, `FileUpload` | `apiClient` | — | `settings.church-profile` |
| `/dashboard/settings/branches` | Church campuses & satellite branches | `DataTable`, `StatusBadge` | `apiClient` | — | `settings.branches.view` |
| `/dashboard/settings/branches/add` | Register new church branch | `Form`, `Input` | `apiClient` | — | `settings.branches.create` |
| `/dashboard/settings/branches/[id]/edit` | Edit satellite branch details | `Form`, `Input` | `apiClient` | — | `settings.branches.edit` |
| `/dashboard/settings/users` | System user accounts directory | `DataTable`, `Badge` | `authService` | `registerSchema` | `settings.users.view` |
| `/dashboard/settings/users/add` | Invite new system user / operator | `Form`, `Select` | `authService` | `registerSchema` | `settings.users.create` |
| `/dashboard/settings/users/[id]/edit`| Modify user permissions & status | `Form`, `Select` | `authService` | — | `settings.users.edit` |
| `/dashboard/settings/roles` | Access roles & authority bundles | `DataTable`, `Badge` | `apiClient` | — | `settings.roles.view` |
| `/dashboard/settings/roles/add` | Create custom access role | `Form`, `Checkbox` | `apiClient` | — | `settings.roles.create` |
| `/dashboard/settings/roles/[id]/edit` | Edit role privileges | `Form`, `Checkbox` | `apiClient` | — | `settings.roles.edit` |
| `/dashboard/settings/permissions` | System-wide Permission Matrix | `Table`, `Checkbox` | `apiClient` | — | `settings.permissions.manage` |

---

### 12. Analytics, Activity Logs & Profile

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/analytics` | Executive KPI analytics dashboard | `StatCard`, `Chart`, `Select` | `reportsService` | — | `analytics.view` (`VIEW_ANALYTICS`) |
| `/dashboard/analytics/reports` | Standard generated analytics reports | `DataTable`, `Button` | `reportsService` | — | `analytics.view` |
| `/dashboard/analytics/report-builder` | Custom report generation wizard | `Form`, `Checkbox`, `Select` | `reportsService` | — | `analytics.view` |
| `/dashboard/activity-logs` | Audit trail & security event logs | `DataTable`, `Badge` | `apiClient`, `auditLogger` | — | `activity-logs.view` (`VIEW_AUDIT_LOGS`) |
| `/dashboard/activity-logs/user/[userId]` | Individual user activity trail | `DataTable`, `PageHeader` | `apiClient`, `auditLogger` | — | `activity-logs.view` |
| `/dashboard/profile` | Personal user account & security | `Card`, `Form`, `Avatar` | `authService` | `changePasswordSchema` | `profile.view` |
| `/onboarding` | Church initial onboarding wizard | `Card`, `FormInput`, `Button`| `apiClient` | — | Public / Authenticated |
| `/` | Landing / Login redirect router | `LoginForm`, `Card` | `authService` | `loginSchema` | Public |
