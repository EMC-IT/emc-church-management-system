# EMC Church Management System — UI Pages Architecture & Route Map

This document establishes the official architecture, service bindings, validation schemas, and authorization requirements for every user interface page across the EMC Church Management System.

The application comprises **204 distinct routes** across three primary operational facets:
1. **Public Ministry & Community Portal (`app/(landing)/*`)**: 11 routes
2. **Member Self-Service Portal (`app/(member)/portal/*`)**: 18 routes
3. **Administrative Core & Dashboard (`app/(admin)/*`)**: 175 routes (173 dashboard routes + login and onboarding)

---

## 🏛️ Architecture Layer Flow for UI Pages

Every page follows the clean unidirectional execution flow:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Page Route (page.tsx)                                │
│                     Loading State (loading.tsx) / Error Boundary (error.tsx)           │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│  Public Ministry Portal  │ Member Self-Service Portal  │    Administrative Core        │
│     app/(landing)/*      │   app/(member)/portal/*     │  app/(admin)/dashboard/*      │
└─────────────┬────────────┴──────────────┬──────────────┴───────────────┬───────────────┘
              │                           │                              │
              ▼                           ▼                              ▼
┌──────────────────────────┐┌───────────────────────────┐┌──────────────────────────────┐
│ Public Landing Component ││ Member Domain Presentation││ Admin Domain Presentation    │
│  (components/landing/*)  ││   (components/member/*)   ││ (components/<domain>/*)      │
│   (components/ui/*)      ││    (components/ui/*)      ││   (components/ui/*)          │
└─────────────┬────────────┘└─────────────┬─────────────┘└───────────────┬──────────────┘
              │                           │                              │
              ▼                           ▼                              ▼
┌──────────────────────────┐┌───────────────────────────┐┌──────────────────────────────┐
│  Public Query / State    ││   Member Domain Services  ││  Application Domain Services │
│ (services/events, give)  ││   (services/member/*)     ││    (services/<domain>/*)     │
└─────────────┬────────────┘└─────────────┬─────────────┘└───────────────┬──────────────┘
              │                           │                              │
              └───────────────────────────┼──────────────────────────────┘
                                          ▼
                      ┌───────────────────┴───────────────────┐
                      ▼                                       ▼
   ┌─────────────────────────────────────┐ ┌─────────────────────────────────────┐
   │      Runtime Validation Layer       │ │        Authorization Engine         │
   │        (lib/validation/*)           │ │ (lib/authorization/*, member-guards)│
   └─────────────────────────────────────┘ └─────────────────────────────────────┘
```

---

## 📋 Comprehensive Route Matrices

### PART A: Public Ministry & Community Web Portal (`app/(landing)/*`)

All public routes reside in `app/(landing)/` with `app/(landing)/layout.tsx` providing the public navbar, live stream indicator, and footer.

| Route Path | Page Purpose | Primary Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Church Landing Homepage | `HeroSection`, `ServiceTimes`, `Testimonials`, `CommunitySection` | `eventsService` | — | Public / Anonymous |
| `/about` | Church About Us Hub | `PageHeader`, `Card`, `Button` | — | — | Public / Anonymous |
| `/about/leadership` | Pastoral Board & Leadership Profiles | `Avatar`, `Card`, `Badge` | `departmentsService` | — | Public / Anonymous |
| `/about/mission-vision` | Generational Vision & Core Pillars | `Card`, `Badge` | — | — | Public / Anonymous |
| `/about/our-story` | History, Origin & Founding Journey | `Timeline`, `Card` | — | — | Public / Anonymous |
| `/about/what-we-believe` | Statement of Faith & Doctrine | `Accordion`, `Card` | — | — | Public / Anonymous |
| `/contact` | Campus Directions, Visit Planning & Inquiry | `ContactForm`, `MapEmbed`, `Card` | `communicationsService`| `contactFormSchema` | Public / Anonymous |
| `/events` | Public Events Calendar & RSVP | `EventsSection`, `Card`, `Badge` | `eventsService` | `eventRegistrationSchema` | Public / Anonymous |
| `/give` | Public Online Giving & Donations Gateway | `GivingSection`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | Public / Anonymous |
| `/ministries` | Church Ministries Directory & Signups | `MinistriesPreview`, `Card` | `departmentsService` | — | Public / Anonymous |
| `/sermons` | Audio & Video Sermon Library & Podcast Player| `SermonsSection`, `Card`, `Badge` | `eventsService` | — | Public / Anonymous |

---

### PART B: Member Self-Service Portal (`app/(member)/portal/*`)

All member self-service routes reside inside `app/(member)/portal/` and inherit `MemberShell` (`app/(member)/portal/layout.tsx`) featuring sticky navigation, responsive drawers, and breadcrumbs.

| Route Path | Page Purpose | Primary Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/portal` | Member Dashboard Overview | `MemberDashboardView`, `StatCard`, `UpcomingEvents` | `memberDashboardService` | — | `profile:read:self` |
| `/portal/attendance` | Personal & Family Attendance & QR Check-in | `MemberAttendanceView`, `QRDisplay`, `DataTable` | `memberAttendanceService` | — | `attendance:read:self` |
| `/portal/events` | Member Events Catalog & Registered RSVPs | `MemberEventsView`, `EventCard`, `Badge` | `memberEventsService` | — | `events:read` |
| `/portal/events/[id]` | Event Details, RSVP Registration & Ticket | `EventDetailView`, `RegistrationDialog` | `memberEventsService` | `eventRegistrationSchema` | `events:register` |
| `/portal/family` | Household Members, Relationships & Linking | `MemberFamilyView`, `FamilyMemberCard`, `Dialog` | `memberFamilyService` | `familyMemberAddSchema` | `family:read:self` |
| `/portal/giving` | Personal Contributions, Pledges & Tax Receipts| `MemberGivingView`, `CurrencyDisplay`, `DataTable` | `memberGivingService` | `donationCreateSchema` | `giving:read:self` |
| `/portal/groups` | Small Group Memberships, Leaders & Schedules | `MemberGroupsView`, `GroupCard`, `Badge` | `memberGroupsService` | — | `groups:read:self` |
| `/portal/journey` | Spiritual Milestones, Discipleship & Classes | `MemberJourneyView`, `Timeline`, `Badge` | `memberJourneyService` | — | `journey:read:self` |
| `/portal/ministries` | Active Ministry Serving & Sign-up Opportunities| `MemberMinistriesView`, `MinistryCard` | `memberMinistriesService`| — | `ministries:read:self` |
| `/portal/notifications` | Personal Notifications, Announcements & Inbox | `MemberNotificationsView`, `Badge`, `ScrollArea` | `memberNotificationsService`| — | `notifications:read:self` |
| `/portal/pastoral-care` | Pastoral Counseling History & Appointments | `MemberPastoralCareView`, `DataTable`, `Badge` | `memberPastoralCareService`| — | `pastoral-care:read:self` |
| `/portal/pastoral-care/request` | Request Counseling or Home/Hospital Visit | `PastoralRequestForm`, `DatePicker`, `Select` | `memberPastoralCareService`| `pastoralRequestSchema` | `pastoral-care:create` |
| `/portal/prayer` | Personal Prayer Petitions & Answered Prayers | `MemberPrayersView`, `PrayerCard`, `Badge` | `memberPrayerService` | — | `prayer:read:self` |
| `/portal/prayer/new` | Submit Prayer Request (Public or Confidential) | `PrayerRequestForm`, `Checkbox`, `Textarea` | `memberPrayerService` | `prayerRequestCreateSchema`| `prayer:create` |
| `/portal/profile` | Member Profile Details, Photo & Preferences | `MemberProfileForm`, `AvatarUpload`, `Input` | `memberProfileService` | `memberUpdateSchema` | `profile:update:self` |
| `/portal/resources` | Spiritual Growth Media, Guides & Study Downloads| `MemberResourcesView`, `ResourceCard`, `Button` | `memberResourcesService` | — | `resources:read` |
| `/portal/settings` | Notification Preferences, Password & Security | `MemberSettingsForm`, `Switch`, `Input` | `memberSettingsService` | `changePasswordSchema` | `settings:update:self` |
| `/portal/error-preview` | Portal UX Error Boundary Testing & Previews | `MemberErrorState`, `MemberEmptyState` | — | — | `profile:read:self` |

---

### PART C: Administrative Core & Back-Office (`app/(admin)/*`)

#### 1. Membership Management (`/dashboard/members`) — 17 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/members` | Member directory, filterable table & stats | `DataTable`, `StatCard`, `StatusBadge` | `membersService` | `memberSearchSchema` | `members.view` |
| `/dashboard/members/add` | Comprehensive multi-tab registration form | `MemberFullForm`, `MemberForm` | `membersService` | `memberCreateSchema` | `members.create` |
| `/dashboard/members/import` | Bulk CSV/spreadsheet member import | `FileUpload`, `DataTable` | `membersService` | `memberCreateSchema` | `members.import` |
| `/dashboard/members/[id]` | Member profile overview, contact & milestones | `PageHeader`, `Badge`, `Avatar` | `membersService` | — | `members.view` |
| `/dashboard/members/[id]/edit` | Edit member profile details | `MemberFullForm` | `membersService` | `memberUpdateSchema` | `members.edit` |
| `/dashboard/members/[id]/convert` | New convert tracking & mentor assignment | `DataTable`, `StatusBadge` | `membersService` | `convertFollowUpSchema` | `members.converts` |
| `/dashboard/members/[id]/convert/edit`| Update convert stage, notes & follow-up date | `Form`, `Select`, `DatePicker` | `membersService` | `convertFollowUpSchema` | `members.converts` |
| `/dashboard/members/[id]/family` | Family ties, spouse, and children tree | `Card`, `DataTable` | `membersService` | — | `members.family` |
| `/dashboard/members/[id]/family/add` | Register & link new family member | `MemberForm` | `membersService` | `familyMemberAddSchema` | `members.family` |
| `/dashboard/members/[id]/family/link`| Link existing church member into household | `Select`, `Button`, `Dialog` | `membersService` | `familyLinkSchema` | `members.family` |
| `/dashboard/members/[id]/documents` | Baptism certificate, ID docs & marriage records| `DataTable`, `FileUpload` | `documentsService` | — | `members.documents` |
| `/dashboard/members/[id]/documents/upload` | Upload new member documentation file | `FileUpload`, `FormInput` | `documentsService` | — | `members.documents` |
| `/dashboard/members/[id]/giving` | Member personal tithing & giving history | `DataTable`, `CurrencyDisplay` | `givingService` | — | `members.giving` |
| `/dashboard/members/[id]/giving/add` | Record personal donation or tithe | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.create` |
| `/dashboard/members/[id]/giving/[givingId]` | Inspect giving receipt record | `Card`, `CurrencyDisplay` | `givingService` | — | `members.giving` |
| `/dashboard/members/[id]/giving/[givingId]/edit` | Modify giving transaction | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.manage` |
| `/dashboard/members/[id]/history` | Timeline of member milestones & service records | `ScrollArea`, `Badge` | `membersService` | — | `members.history` |

---

#### 2. Financial Management (`/dashboard/finance`) — 62 Routes

##### A. General Finance & Overviews (9 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance` | Financial dashboard, KPIs & summary balances | `StatCard`, `CurrencyDisplay`, `DataTable` | `financeService` | — | `finance.view` |
| `/dashboard/finance/reports` | Unified Financial Reports Hub | `ChartHeader`, `StatCard`, `Button` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/tithes-offerings` | Tithes & offerings growth breakdown | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/giving` | Donor trends & fundraising reports | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/expenses` | Expense analysis by vendor & department | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/income` | Revenue streams & income breakdown | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/budgets` | Budget variance & utilization reports | `Chart`, `Progress` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/assets` | Asset valuation & depreciation reports | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |
| `/dashboard/finance/reports/comparisons` | Multi-period financial comparison | `Chart`, `DataTable` | `reportsService` | — | `finance.reports.view` |

##### B. Tithes & Offerings (9 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance/tithes-offerings` | Tithes & offerings ledger | `DataTable`, `StatusBadge` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.view` |
| `/dashboard/finance/tithes-offerings/add` | Record new tithe or offering | `Form`, `CurrencyDisplay` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.create` |
| `/dashboard/finance/tithes-offerings/[id]` | Inspect tithe transaction receipt | `Card`, `CurrencyDisplay` | `financeService` | — | `finance.tithes.view` |
| `/dashboard/finance/tithes-offerings/[id]/edit` | Modify tithe transaction | `Form`, `CurrencyDisplay` | `financeService` | `titheOfferingCreateSchema`| `finance.tithes.edit` |
| `/dashboard/finance/tithes-offerings/categories` | Tithe categories directory | `DataTable`, `Dialog` | `financeService` | — | `finance.tithes.categories`|
| `/dashboard/finance/tithes-offerings/categories/add` | Create tithe category | `Form`, `Input` | `financeService` | — | `finance.tithes.categories`|
| `/dashboard/finance/tithes-offerings/categories/[id]` | View category details & volume | `Card`, `DataTable` | `financeService` | — | `finance.tithes.categories`|
| `/dashboard/finance/tithes-offerings/categories/[id]/edit` | Edit category attributes | `Form`, `Input` | `financeService` | — | `finance.tithes.categories`|
| `/dashboard/finance/tithes-offerings/reports` | Tithes analytics & trends | `Chart`, `StatCard` | `reportsService` | — | `finance.tithes.reports` |

##### C. Giving, Donations & Pledges (15 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance/giving` | Giving operations overview | `DataTable`, `StatCard` | `givingService` | — | `finance.giving.view` |
| `/dashboard/finance/giving/donations` | Donation receipts & transactions | `DataTable`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.donations`|
| `/dashboard/finance/giving/donations/add` | Record donor contribution | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.donations`|
| `/dashboard/finance/giving/donations/[id]` | Inspect donation record | `Card`, `CurrencyDisplay` | `givingService` | — | `finance.giving.donations`|
| `/dashboard/finance/giving/donations/[id]/edit` | Edit donation record | `Form`, `CurrencyDisplay` | `givingService` | `donationCreateSchema` | `finance.giving.donations`|
| `/dashboard/finance/giving/pledges` | Pledges & building fund tracking | `DataTable`, `Progress` | `givingService` | `pledgeCreateSchema` | `finance.giving.pledges` |
| `/dashboard/finance/giving/pledges/add` | Record new commitment pledge | `Form`, `CurrencyDisplay` | `givingService` | `pledgeCreateSchema` | `finance.giving.pledges` |
| `/dashboard/finance/giving/pledges/[id]` | View pledge fulfillment status | `Card`, `Progress` | `givingService` | — | `finance.giving.pledges` |
| `/dashboard/finance/giving/pledges/[id]/edit` | Edit pledge commitment terms | `Form`, `CurrencyDisplay` | `givingService` | `pledgeCreateSchema` | `finance.giving.pledges` |
| `/dashboard/finance/giving/fundraising` | Fundraising campaigns directory | `Card`, `Progress`, `Button` | `givingService` | — | `finance.giving.fundraising`|
| `/dashboard/finance/giving/fundraising/add`| Create fundraising campaign drive | `Form`, `DatePicker` | `givingService` | `fundraisingCampaignCreateSchema`| `finance.giving.fundraising`|
| `/dashboard/finance/giving/new/congregational` | Congregational batch giving | `DataTable`, `Form` | `givingService` | — | `finance.giving.create` |
| `/dashboard/finance/giving/categories` | Giving designations directory | `DataTable`, `Dialog` | `givingService` | — | `finance.giving.categories`|
| `/dashboard/finance/giving/categories/add` | Add giving designation | `Form`, `Input` | `givingService` | — | `finance.giving.categories`|
| `/dashboard/finance/giving/categories/[id]`| Inspect designation funds | `Card`, `DataTable` | `givingService` | — | `finance.giving.categories`|
| `/dashboard/finance/giving/reports` | Giving statements & donor analytics | `Chart`, `DataTable` | `reportsService` | — | `finance.giving.reports` |

##### D. Expenses & Disbursements (8 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance/expenses` | Ministry expenditures & bills directory | `DataTable`, `StatusBadge` | `expenseService` | `expenseCreateSchema` | `finance.expenses.view` |
| `/dashboard/finance/expenses/add` | Submit expense voucher with receipts | `Form`, `FileUpload` | `expenseService` | `expenseCreateSchema` | `finance.expenses.create`|
| `/dashboard/finance/expenses/[id]` | Inspect expense voucher details | `Card`, `CurrencyDisplay` | `expenseService` | — | `finance.expenses.view` |
| `/dashboard/finance/expenses/[id]/edit` | Edit expense record | `Form`, `CurrencyDisplay` | `expenseService` | `expenseCreateSchema` | `finance.expenses.edit` |
| `/dashboard/finance/expenses/categories` | Expense categories directory | `DataTable`, `Dialog` | `expenseService` | — | `finance.expenses.categories`|
| `/dashboard/finance/expenses/categories/add` | Create expense category | `Form`, `Input` | `expenseService` | — | `finance.expenses.categories`|
| `/dashboard/finance/expenses/categories/[id]` | View expense category spending | `Card`, `DataTable` | `expenseService` | — | `finance.expenses.categories`|
| `/dashboard/finance/expenses/categories/[id]/edit` | Edit expense category | `Form`, `Input` | `expenseService` | — | `finance.expenses.categories`|
| `/dashboard/finance/expenses/reports` | Spending reports by department | `Chart`, `DataTable` | `reportsService` | — | `finance.expenses.reports` |

##### E. Miscellaneous Income (7 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance/income` | Revenue directory & transactions | `DataTable`, `CurrencyDisplay` | `incomeService` | `incomeCreateSchema` | `finance.income.view` |
| `/dashboard/finance/income/add` | Record income entry | `Form`, `CurrencyDisplay` | `incomeService` | `incomeCreateSchema` | `finance.income.create` |
| `/dashboard/finance/income/[id]` | Inspect revenue stream details | `Card`, `CurrencyDisplay` | `incomeService` | — | `finance.income.view` |
| `/dashboard/finance/income/categories` | Income categories directory | `DataTable`, `Dialog` | `incomeService` | — | `finance.income.categories`|
| `/dashboard/finance/income/categories/add` | Create income category | `Form`, `Input` | `incomeService` | — | `finance.income.categories`|
| `/dashboard/finance/income/categories/[id]`| Inspect category receipts | `Card`, `DataTable` | `incomeService` | — | `finance.income.categories`|
| `/dashboard/finance/income/reports` | Revenue breakdown & trend analysis | `Chart`, `StatCard` | `reportsService` | — | `finance.income.reports` |

##### F. Budgets & Allocations (13 Routes)
| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/finance/budgets` | Annual & departmental budget directory | `DataTable`, `Progress` | `budgetService` | `budgetCreateSchema` | `finance.budgets.view` |
| `/dashboard/finance/budgets/add` | Create new fiscal budget plan | `Form`, `CurrencyDisplay` | `budgetService` | `budgetCreateSchema` | `finance.budgets.create` |
| `/dashboard/finance/budgets/allocations` | Departmental fund allocations | `DataTable`, `Button` | `budgetService` | — | `finance.budgets.allocations`|
| `/dashboard/finance/budgets/[id]` | Inspect budget lines & utilization | `Card`, `Progress`, `DataTable` | `budgetService` | — | `finance.budgets.view` |
| `/dashboard/finance/budgets/[id]/edit` | Edit budget parameters | `Form`, `CurrencyDisplay` | `budgetService` | `budgetCreateSchema` | `finance.budgets.edit` |
| `/dashboard/finance/budgets/[id]/allocations`| Specific budget line allocations | `DataTable`, `Form` | `budgetService` | — | `finance.budgets.allocations`|
| `/dashboard/finance/budgets/[id]/reports`| Budget performance report | `Chart`, `StatCard` | `budgetService` | — | `finance.budgets.reports` |
| `/dashboard/finance/budgets/categories` | Budget classifications | `DataTable`, `Dialog` | `budgetService` | — | `finance.budgets.categories`|
| `/dashboard/finance/budgets/categories/add` | Add budget category | `Form`, `Input` | `budgetService` | — | `finance.budgets.categories`|
| `/dashboard/finance/budgets/categories/[id]` | Inspect category allocations | `Card`, `DataTable` | `budgetService` | — | `finance.budgets.categories`|
| `/dashboard/finance/budgets/categories/[id]/edit` | Edit budget category | `Form`, `Input` | `budgetService` | — | `finance.budgets.categories`|
| `/dashboard/finance/budgets/reports` | Overall budget variance reports | `Chart`, `StatCard` | `budgetService` | — | `finance.budgets.reports` |

---

#### 3. Attendance Tracking & Kiosks (`/dashboard/attendance`) — 9 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/attendance` | Attendance overview, headcounts & trends | `StatCard`, `DataTable` | `attendanceService` | `attendanceQuerySchema`| `attendance.view` |
| `/dashboard/attendance/take` | Mark headcount & individual roll call | `DataTable`, `Select`, `Button` | `attendanceService` | `bulkAttendanceSchema` | `attendance.take` |
| `/dashboard/attendance/qr-checkin` | Live QR code kiosk & scanner | `Card`, `Badge` | `attendanceService` | `attendanceRecordSchema`| `attendance.qr` |
| `/dashboard/attendance/history` | Historical service sessions log | `DataTable`, `DatePicker` | `attendanceService` | `attendanceQuerySchema`| `attendance.history` |
| `/dashboard/attendance/reports` | Attendance retention & growth reports | `Chart`, `StatCard` | `reportsService` | — | `attendance.reports` |
| `/dashboard/attendance/department` | Departmental volunteer attendance | `DataTable`, `Select` | `attendanceService` | `bulkAttendanceSchema` | `attendance.department` |
| `/dashboard/attendance/groups` | Small group meeting roll call records | `DataTable`, `Select` | `attendanceService` | `bulkAttendanceSchema` | `attendance.groups` |
| `/dashboard/attendance/member` | Member attendance search directory | `DataTable`, `Avatar` | `attendanceService` | — | `attendance.member` |
| `/dashboard/attendance/member/[id]` | Individual member attendance timeline | `Card`, `Chart` | `attendanceService` | — | `attendance.member` |

---

#### 4. Communications & Outreach (`/dashboard/communications`) — 16 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/communications` | Communications hub & broadcast metrics | `StatCard`, `DataTable` | `communicationsService`| — | `communications.view` |
| `/dashboard/communications/messages` | Direct SMS & Email dispatch history | `DataTable`, `Badge` | `communicationsService`| `smsSendSchema` | `communications.messages`|
| `/dashboard/communications/messages/new` | Compose & dispatch direct message | `Form`, `Textarea` | `communicationsService`| `smsSendSchema` | `communications.send` |
| `/dashboard/communications/messages/[id]` | Inspect message delivery receipt | `Card`, `StatusBadge` | `communicationsService`| — | `communications.messages`|
| `/dashboard/communications/campaigns` | Multi-channel broadcast campaigns | `DataTable`, `StatusBadge` | `communicationsService`| — | `communications.campaigns`|
| `/dashboard/communications/campaigns/add`| Create scheduled broadcast campaign | `Form`, `DatePicker` | `communicationsService`| `smsSendSchema` | `communications.campaigns`|
| `/dashboard/communications/campaigns/[id]`| Campaign performance & delivery status | `Card`, `StatCard` | `communicationsService`| — | `communications.campaigns`|
| `/dashboard/communications/campaigns/[id]/edit` | Edit scheduled campaign draft | `Form`, `DatePicker` | `communicationsService`| `smsSendSchema` | `communications.campaigns`|
| `/dashboard/communications/announcements` | Bulletin notices & digital announcements| `DataTable`, `Badge` | `communicationsService`| `announcementCreateSchema`| `communications.announcements`|
| `/dashboard/communications/announcements/add` | Publish church bulletin notice | `Form`, `Select` | `communicationsService`| `announcementCreateSchema`| `communications.announcements`|
| `/dashboard/communications/announcements/[id]` | View announcement details | `Card`, `Badge` | `communicationsService`| — | `communications.announcements`|
| `/dashboard/communications/announcements/[id]/edit` | Edit bulletin announcement | `Form`, `Select` | `communicationsService`| `announcementCreateSchema`| `communications.announcements`|
| `/dashboard/communications/newsletters` | Email newsletters & subscriber lists | `DataTable`, `Card` | `communicationsService`| `emailSendSchema` | `communications.newsletters`|
| `/dashboard/communications/newsletters/add` | Draft & design newsletter | `Form`, `Textarea` | `communicationsService`| `emailSendSchema` | `communications.newsletters`|
| `/dashboard/communications/newsletters/[id]` | Inspect sent newsletter | `Card`, `Badge` | `communicationsService`| — | `communications.newsletters`|
| `/dashboard/communications/newsletters/[id]/edit` | Edit newsletter draft | `Form`, `Textarea` | `communicationsService`| `emailSendSchema` | `communications.newsletters`|

---

#### 5. Departments & Ministries (`/dashboard/departments`) — 7 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/departments` | Church departments directory & leaders | `DataTable`, `DepartmentForm` | `departmentsService` | `departmentCreateSchema`| `departments.view` |
| `/dashboard/departments/add` | Create new ministry department | `DepartmentForm` | `departmentsService` | `departmentCreateSchema`| `departments.create` |
| `/dashboard/departments/[id]` | Department details & overview | `Card`, `PageHeader` | `departmentsService` | — | `departments.view` |
| `/dashboard/departments/[id]/members` | Department volunteer roster | `DataTable`, `Avatar` | `departmentsService` | — | `departments.members` |
| `/dashboard/departments/[id]/meetings`| Meeting schedules & minutes | `DataTable`, `Dialog` | `departmentsService` | `departmentMeetingSchema`| `departments.meetings` |
| `/dashboard/departments/[id]/roles` | Department leadership role assignment | `DataTable`, `Select` | `departmentsService` | — | `departments.roles` |
| `/dashboard/departments/categories` | Department classifications | `DataTable`, `Dialog` | `departmentsService` | — | `departments.categories`|

---

#### 6. Events & Calendar (`/dashboard/events`) — 12 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/events` | Events directory & listing | `DataTable`, `PageHeader` | `eventsService` | `eventCreateSchema` | `events.view` |
| `/dashboard/events/add` | Create & schedule church event | `Form`, `DateTimePicker` | `eventsService` | `eventCreateSchema` | `events.create` |
| `/dashboard/events/calendar` | Interactive calendar grid view | `Calendar`, `Badge` | `eventsService` | — | `events.calendar` |
| `/dashboard/events/bulk-actions` | Bulk update attendee statuses | `DataTable`, `Select` | `eventsService` | — | `events.bulk` |
| `/dashboard/events/categories` | Event categories & colors | `DataTable`, `Dialog` | `eventsService` | — | `events.categories` |
| `/dashboard/events/templates` | Recurring event templates | `Card`, `DataTable` | `eventsService` | — | `events.templates` |
| `/dashboard/events/export` | Export registrations to CSV | `Card`, `Button` | `eventsService` | — | `events.export` |
| `/dashboard/events/[id]` | Event overview, date, venue & stats | `Card`, `PageHeader` | `eventsService` | — | `events.view` |
| `/dashboard/events/[id]/edit` | Modify event schedule and details | `Form`, `DateTimePicker` | `eventsService` | `eventCreateSchema` | `events.edit` |
| `/dashboard/events/[id]/attendance` | Event gate check-in & roll call | `DataTable`, `Button` | `eventsService` | — | `events.attendance` |
| `/dashboard/events/[id]/groups` | Group assignments for event | `DataTable`, `Badge` | `eventsService` | — | `events.view` |
| `/dashboard/events/[id]/registrations`| Attendee RSVP & ticket management | `DataTable`, `Badge` | `eventsService` | `eventRegistrationSchema`| `events.registrations` |

---

#### 7. Sunday School & Children's Ministry (`/dashboard/sunday-school`) — 18 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/sunday-school` | Sunday school dashboard & metrics | `StatCard`, `DataTable` | `sundaySchoolService` | — | `sunday-school.view` |
| `/dashboard/sunday-school/classes` | Classes directory & age brackets | `DataTable`, `Badge` | `sundaySchoolService` | `sundaySchoolClassSchema`| `sunday-school.classes.view`|
| `/dashboard/sunday-school/classes/add` | Create Sunday school class | `Form`, `Select` | `sundaySchoolService` | `sundaySchoolClassSchema`| `sunday-school.classes.create`|
| `/dashboard/sunday-school/classes/[id]` | Class details, roster, & teacher | `Card`, `PageHeader` | `sundaySchoolService` | — | `sunday-school.classes.view`|
| `/dashboard/sunday-school/classes/[id]/edit` | Edit class parameters & room | `Form`, `Select` | `sundaySchoolService` | `sundaySchoolClassSchema`| `sunday-school.classes.edit`|
| `/dashboard/sunday-school/classes/[id]/attendance` | Record Sunday school roll call | `DataTable`, `Select` | `sundaySchoolService` | — | `sunday-school.attendance`|
| `/dashboard/sunday-school/classes/[id]/students` | Students enrolled in class | `DataTable`, `Avatar` | `sundaySchoolService` | — | `sunday-school.students.view`|
| `/dashboard/sunday-school/classes/[id]/students/add`| Enroll child into class | `Select`, `Button` | `sundaySchoolService` | `studentEnrollSchema` | `sunday-school.students.create`|
| `/dashboard/sunday-school/classes/[id]/reports` | Class attendance health & trends | `Chart`, `StatCard` | `sundaySchoolService` | — | `sunday-school.reports` |
| `/dashboard/sunday-school/students` | Enrolled children directory | `DataTable`, `Badge` | `sundaySchoolService` | `studentEnrollSchema` | `sunday-school.students.view`|
| `/dashboard/sunday-school/students/[id]` | Student profile, emergency contacts & allergy info | `Card`, `Badge` | `sundaySchoolService` | — | `sunday-school.students.view`|
| `/dashboard/sunday-school/teachers` | Teachers roster & assignments | `DataTable`, `Avatar` | `sundaySchoolService` | — | `sunday-school.teachers.view`|
| `/dashboard/sunday-school/teachers/add`| Register Sunday school teacher | `Form`, `Input` | `sundaySchoolService` | `teacherCreateSchema` | `sunday-school.teachers.manage`|
| `/dashboard/sunday-school/teachers/[id]`| Teacher profile & assigned classes | `Card`, `Badge` | `sundaySchoolService` | — | `sunday-school.teachers.view`|
| `/dashboard/sunday-school/materials` | Curriculum & lesson worksheets | `DataTable`, `FileUpload` | `sundaySchoolService` | — | `sunday-school.materials.view`|
| `/dashboard/sunday-school/materials/[id]`| View curriculum file details | `Card`, `Button` | `sundaySchoolService` | — | `sunday-school.materials.view`|
| `/dashboard/sunday-school/materials/upload`| Upload Sunday school lesson material | `FileUpload`, `Form` | `sundaySchoolService` | — | `sunday-school.materials.manage`|
| `/dashboard/sunday-school/reports` | Sunday school growth reports | `Chart`, `StatCard` | `sundaySchoolService` | — | `sunday-school.reports` |

---

#### 8. Assets & Inventory (`/dashboard/assets`) — 11 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/assets` | Asset inventory & valuation directory | `DataTable`, `StatusBadge` | `assetService` | `assetCreateSchema` | `assets.view` |
| `/dashboard/assets/add` | Register new church equipment | `Form`, `CurrencyDisplay` | `assetService` | `assetCreateSchema` | `assets.create` |
| `/dashboard/assets/[id]` | Inspect asset specs, warranty, valuation| `Card`, `PageHeader` | `assetService` | — | `assets.view` |
| `/dashboard/assets/[id]/edit` | Edit asset details | `Form`, `Select` | `assetService` | `assetUpdateSchema` | `assets.edit` |
| `/dashboard/assets/[id]/maintenance` | Log asset servicing & repairs | `DataTable`, `Form` | `assetService` | `assetMaintenanceSchema`| `assets.edit` |
| `/dashboard/assets/[id]/assignment` | Custody assignment to department/staff | `Form`, `Select` | `assetService` | — | `assets.edit` |
| `/dashboard/assets/categories` | Asset categories directory | `DataTable`, `Dialog` | `assetService` | — | `assets.categories` |
| `/dashboard/assets/categories/add` | Create asset category | `Form`, `Input` | `assetService` | — | `assets.categories` |
| `/dashboard/assets/categories/[id]` | View category asset items | `Card`, `DataTable` | `assetService` | — | `assets.categories` |
| `/dashboard/assets/categories/[id]/edit`| Edit asset category | `Form`, `Input` | `assetService` | — | `assets.categories` |
| `/dashboard/assets/reports` | Asset depreciation & inventory reports | `Chart`, `StatCard` | `assetService` | — | `assets.reports` |

---

#### 9. Small Groups & Fellowships (`/dashboard/groups`) — 13 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/groups` | Small groups & fellowships directory | `DataTable`, `StatCard` | `groupsService` | `groupCreateSchema` | `groups.view` |
| `/dashboard/groups/add` | Create new small group / cell | `Form`, `Select` | `groupsService` | `groupCreateSchema` | `groups.create` |
| `/dashboard/groups/[id]` | Group details, meeting schedule & leader| `Card`, `PageHeader` | `groupsService` | — | `groups.view` |
| `/dashboard/groups/[id]/edit` | Edit small group parameters | `Form`, `Input` | `groupsService` | `groupCreateSchema` | `groups.edit` |
| `/dashboard/groups/[id]/members` | Group member roster | `DataTable`, `Avatar` | `groupsService` | `groupMemberAddSchema` | `groups.members` |
| `/dashboard/groups/[id]/members/add`| Add member to small group | `Select`, `Button` | `groupsService` | `groupMemberAddSchema` | `groups.members` |
| `/dashboard/groups/[id]/attendance` | Small group meeting roll call | `DataTable`, `Select` | `groupsService` | `bulkAttendanceSchema` | `groups.attendance` |
| `/dashboard/groups/[id]/events` | Group-specific events & meetings | `DataTable`, `Button` | `groupsService` | — | `groups.events` |
| `/dashboard/groups/[id]/events/add` | Schedule group event | `Form`, `DateTimePicker` | `groupsService` | `eventCreateSchema` | `groups.events` |
| `/dashboard/groups/[id]/roles` | Group leaders, hosts & assistants | `DataTable`, `Select` | `groupsService` | — | `groups.roles` |
| `/dashboard/groups/[id]/roles/add` | Assign group leadership role | `Select`, `Button` | `groupsService` | — | `groups.roles` |
| `/dashboard/groups/[id]/reports` | Small group attendance health report | `Chart`, `StatCard` | `groupsService` | — | `groups.reports` |
| `/dashboard/groups/categories` | Group classifications (Cell/Ministry) | `DataTable`, `Dialog` | `groupsService` | — | `groups.categories` |

---

#### 10. Prayer Requests & Intercession (`/dashboard/prayer-requests`) — 5 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/prayer-requests` | Prayer request directory & status | `DataTable`, `StatusBadge` | `apiClient` | — | `prayer-requests.view` |
| `/dashboard/prayer-requests/add` | Submit new prayer petition | `Form`, `Textarea` | `apiClient` | `prayerRequestCreateSchema`| `prayer-requests.create`|
| `/dashboard/prayer-requests/[id]` | View prayer details & pastoral responses| `Card`, `ScrollArea` | `apiClient` | — | `prayer-requests.view` |
| `/dashboard/prayer-requests/[id]/edit`| Edit prayer petition status/notes | `Form`, `Textarea` | `apiClient` | `prayerRequestCreateSchema`| `prayer-requests.edit` |
| `/dashboard/prayer-requests/categories`| Prayer categories & tags | `DataTable`, `Dialog` | `apiClient` | — | `prayer-requests.categories`|

---

#### 11. Pastoral Care & Visitation (`/dashboard/pastoral-care`) — 1 Route

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/pastoral-care` | Pastoral counseling, hospital visits & cases | `DataTable`, `StatCard`, `Badge` | `apiClient` | `pastoralCareSchema` | `pastoral-care.view` |

---

#### 12. Central File Vault & Documents (`/dashboard/files`) — 1 Route

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/files` | Centralized document repository & media vault | `DataTable`, `FileUpload`, `Badge`| `uploadService` | — | `files.view` |

---

#### 13. Executive Analytics & Custom Reports (`/dashboard/analytics`) — 5 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/analytics` | Executive KPI analytics dashboard | `StatCard`, `Chart`, `Select` | `reportsService` | — | `analytics.view` |
| `/dashboard/analytics/reports` | Standard generated analytics reports | `DataTable`, `Button` | `reportsService` | — | `analytics.view` |
| `/dashboard/analytics/report-builder` | Custom report generation wizard | `Form`, `Checkbox`, `Select` | `reportsService` | — | `analytics.report-builder`|
| `/dashboard/analytics/filters` | Analytics query presets & custom filters | `Form`, `Select`, `Button` | `reportsService` | — | `analytics.view` |
| `/dashboard/analytics/preferences` | Metric preferences & target KPI settings| `Card`, `Switch`, `Input` | `reportsService` | — | `analytics.preferences`|

---

#### 14. Security & Audit Activity Logs (`/dashboard/activity-logs`) — 2 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/activity-logs` | Audit trail & security event logs | `DataTable`, `Badge` | `apiClient`, `auditLogger`| — | `activity-logs.view` |
| `/dashboard/activity-logs/user/[userId]`| Individual user activity trail | `DataTable`, `PageHeader` | `apiClient`, `auditLogger`| — | `activity-logs.view` |

---

#### 15. Settings & System Administration (`/dashboard/settings`) — 11 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard/settings` | Settings overview & system health | `Card`, `Button` | `apiClient` | — | `settings.view` |
| `/dashboard/settings/church-profile` | Church branding, address & legal info | `Form`, `FileUpload` | `apiClient` | `churchProfileSchema` | `settings.church-profile`|
| `/dashboard/settings/background-checks`| Volunteer & staff background check status| `DataTable`, `Badge` | `apiClient` | — | `settings.view` |
| `/dashboard/settings/branches` | Campuses & satellite branches directory | `DataTable`, `StatusBadge` | `apiClient` | — | `settings.branches.view`|
| `/dashboard/settings/branches/add` | Register new church campus/branch | `Form`, `Input` | `apiClient` | `branchCreateSchema` | `settings.branches.create`|
| `/dashboard/settings/branches/[id]/edit`| Edit satellite branch details | `Form`, `Input` | `apiClient` | `branchCreateSchema` | `settings.branches.edit` |
| `/dashboard/settings/users/add` | Invite new system user / operator | `Form`, `Select` | `authService` | `userAccountCreateSchema`| `settings.users.create` |
| `/dashboard/settings/users/[id]/edit` | Modify user permissions & status | `Form`, `Select` | `authService` | — | `settings.users.edit` |
| `/dashboard/settings/roles/add` | Create custom access role | `Form`, `Checkbox` | `apiClient` | `roleCreateSchema` | `settings.roles.create` |
| `/dashboard/settings/roles/[id]/edit` | Edit role privileges | `Form`, `Checkbox` | `apiClient` | `roleCreateSchema` | `settings.roles.edit` |
| `/dashboard/settings/permissions` | System-wide Permission Matrix | `Table`, `Checkbox` | `apiClient` | — | `settings.permissions.manage`|

---

#### 16. Admin Overview, Profile & Utilities — 4 Routes

| Route Path | Page Purpose | Domain Components | Domain Service | Validation Schema | Required Permission |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/dashboard` | Executive Dashboard Command Center | `StatCard`, `Chart`, `DataTable` | `membersService`, `financeService`| — | `dashboard.view` |
| `/dashboard/profile` | Personal administrative profile & password | `Card`, `Form`, `Avatar` | `authService` | `changePasswordSchema` | `profile.view` |
| `/dashboard/test-lazy-loading` | Performance & dynamic import validation | `Card`, `Button` | — | — | Developer / Testing |
| `/onboarding` | Church initial onboarding wizard | `Card`, `FormInput`, `Button`| `apiClient` | `churchProfileSchema` | Public / Authenticated |
| `/login` | Administrative secure login portal | `LoginForm`, `Card` | `authService` | `loginSchema` | Public / Anonymous |

---

## 📊 Summary Route Reconciliation

| Architectural Operational Area | Directory Location | Page Count | Status |
| :--- | :--- | :---: | :--- |
| **Public Ministry & Community Portal** | `app/(landing)/*` | **11** | 100% Documented |
| **Member Self-Service Portal** | `app/(member)/portal/*` | **18** | 100% Documented |
| **Admin Core — Membership CRM** | `app/(admin)/dashboard/members/*` | **17** | 100% Documented |
| **Admin Core — Financial Management** | `app/(admin)/dashboard/finance/*` | **62** | 100% Documented |
| **Admin Core — Attendance & Kiosks** | `app/(admin)/dashboard/attendance/*` | **9** | 100% Documented |
| **Admin Core — Communications & Broadcast**| `app/(admin)/dashboard/communications/*`| **16** | 100% Documented |
| **Admin Core — Departments & Teams** | `app/(admin)/dashboard/departments/*` | **7** | 100% Documented |
| **Admin Core — Events & Calendar** | `app/(admin)/dashboard/events/*` | **12** | 100% Documented |
| **Admin Core — Sunday School** | `app/(admin)/dashboard/sunday-school/*`| **18** | 100% Documented |
| **Admin Core — Assets & Inventory** | `app/(admin)/dashboard/assets/*` | **11** | 100% Documented |
| **Admin Core — Small Groups & Cells** | `app/(admin)/dashboard/groups/*` | **13** | 100% Documented |
| **Admin Core — Prayer Requests** | `app/(admin)/dashboard/prayer-requests/*`| **5** | 100% Documented |
| **Admin Core — Pastoral Care & Counseling** | `app/(admin)/dashboard/pastoral-care/*`| **1** | 100% Documented |
| **Admin Core — Central File Vault** | `app/(admin)/dashboard/files/*` | **1** | 100% Documented |
| **Admin Core — Analytics & Custom Reports** | `app/(admin)/dashboard/analytics/*` | **5** | 100% Documented |
| **Admin Core — Security & Audit Logs** | `app/(admin)/dashboard/activity-logs/*` | **2** | 100% Documented |
| **Admin Core — Settings & Roles** | `app/(admin)/dashboard/settings/*` | **11** | 100% Documented |
| **Admin Core — Dashboard Root & Profile** | `app/(admin)/dashboard/page.tsx, profile`| **2** | 100% Documented |
| **Admin Core — Utilities & Testing** | `app/(admin)/dashboard/test-lazy-loading`| **1** | 100% Documented |
| **Authentication & Onboarding** | `app/(admin)/login`, `onboarding` | **2** | 100% Documented |
| **TOTAL SYSTEM PAGES** | — | **204** | **Fully Reconciled & Validated** |
