# Components Architecture & Domain Forms Documentation

This directory contains the UI component library and domain forms for the EMC Church Management System. All components strictly adhere to the UI/UX design contract in `PROJECT_RULES.md` and `AGENTS.md`.

---

## 📁 Component Organization

```
components/
├── ui/                        # 40+ shadcn/ui Design Primitives (Zero Domain Logic)
│   ├── button.tsx, input.tsx, form.tsx, card.tsx, dialog.tsx
│   ├── data-table.tsx         # Sortable, filterable TanStack table
│   ├── status-badge.tsx       # Standardized entity status badges
│   ├── stat-card.tsx          # Key metrics and performance indicators
│   ├── page-header.tsx        # Standardized page title and action bar
│   ├── currency-display.tsx   # Multi-currency formatted amount display
│   └── skeleton-loaders.tsx   # Loading state placeholders
│
├── members/                   # Domain Member Forms
│   ├── member-form.tsx        # Simple member entry form
│   ├── member-full-form.tsx   # Comprehensive multi-tab registration form
│   └── index.ts
│
├── departments/               # Domain Department Forms
│   ├── department-form.tsx    # Ministry and department creation/edit form
│   └── index.ts
│
├── forms/                     # Backwards-Compatible Adapters
│   ├── member-form.tsx        # Adapter re-exporting from components/members
│   ├── member-full-form.tsx   # Adapter re-exporting from components/members
│   ├── department-form.tsx    # Adapter re-exporting from components/departments
│   └── index.ts
│
├── layout/                    # Shell Layouts
│   ├── header.tsx             # Global navigation bar & notifications
│   ├── sidebar.tsx            # Module navigation hierarchy
│   └── user-nav.tsx           # User account dropdown
│
└── theme/                     # Theme & Context Providers
    ├── theme-provider.tsx     # Next-themes provider
    └── theme-toggle.tsx       # Light / Dark mode toggle
```

---

## 📋 Comprehensive Form Validation Schema Matrix

All form inputs and payload mutations across pages are bound to centralized Zod validation schemas in `lib/validation/*`:

| Domain Area | UI Page Route | Primary Form Component | Centralized Validation Schema | Key Validated Fields |
| :--- | :--- | :--- | :--- | :--- |
| **Members** | `/dashboard/members/add` | `MemberFullForm` | `memberCreateSchema` | `firstName`, `lastName`, `email`, `phone`, `gender`, `membershipStatus`, `emergencyContact` |
| **Members** | `/dashboard/members/[id]/edit` | `MemberFullForm` | `memberUpdateSchema` | Partial of `memberCreateSchema` |
| **Family** | `/dashboard/members/[id]/family/add` | `MemberForm` | `familyMemberAddSchema` | `relationshipToHead`, `isFamilyHead`, member info |
| **Family** | `/dashboard/members/[id]/family/link` | Link Family Dialog | `familyLinkSchema` | `memberId`, `familyMemberId`, `relationship` |
| **Converts** | `/dashboard/members/[id]/convert/edit` | Convert Follow-up Form | `convertFollowUpSchema` | `stage`, `mentorId`, `notes`, `nextFollowUpDate` |
| **Tithes** | `/dashboard/finance/tithes-offerings/add` | Tithe Entry Form | `titheOfferingCreateSchema` | `amount`, `currency`, `titheType`, `serviceDate`, `paymentMethod` |
| **Expenses** | `/dashboard/finance/expenses/add` | Expense Voucher Form | `expenseCreateSchema` | `title`, `amount`, `currency`, `category`, `vendor`, `date`, `paymentMethod` |
| **Donations** | `/dashboard/finance/giving/donations/add` | Donation Entry Form | `donationCreateSchema` | `donorName`, `amount`, `currency`, `category`, `method`, `date` |
| **Pledges** | `/dashboard/finance/giving/pledges/add` | Pledge Entry Form | `pledgeCreateSchema` | `memberName`, `campaignId`, `totalAmount`, `frequency`, `startDate`, `endDate` |
| **Campaigns** | `/dashboard/finance/giving/fundraising/add` | Campaign Form | `fundraisingCampaignCreateSchema`| `title`, `goalAmount`, `startDate`, `endDate`, `category` |
| **Income** | `/dashboard/finance/income/add` | Income Entry Form | `incomeCreateSchema` | `source`, `category`, `amount`, `currency`, `date`, `paymentMethod` |
| **Budgets** | `/dashboard/finance/budgets/add` | Budget Creation Form | `budgetCreateSchema` | `name`, `period`, `department`, `amount`, `startDate`, `endDate` |
| **Attendance** | `/dashboard/attendance/take` | Roll Call Form | `bulkAttendanceSchema` | `serviceType`, `serviceDate`, `records` array (`memberId`, `status`) |
| **Departments**| `/dashboard/departments/add` | `DepartmentForm` | `departmentCreateSchema` | `name`, `leader`, `departmentType`, `budget`, `meetingSchedule` |
| **Events** | `/dashboard/events/add` | Event Schedule Form | `eventCreateSchema` | `title`, `date`, `time`, `location`, `category`, `organizer` |
| **Groups** | `/dashboard/groups/add` | Group Creation Form | `groupCreateSchema` | `name`, `category`, `leader`, `maxMembers`, `meetingSchedule` |
| **Sunday School** | `/dashboard/sunday-school/classes/add` | Class Form | `sundaySchoolClassSchema` | `name`, `ageGroup`, `minAge`, `maxAge`, `room`, `capacity` |
| **Students** | `/dashboard/sunday-school/students/add` | Student Enrollment Form | `studentEnrollSchema` | `firstName`, `lastName`, `dateOfBirth`, `gender`, `parentName`, `parentPhone` |
| **Teachers** | `/dashboard/sunday-school/teachers/add` | Teacher Form | `teacherCreateSchema` | `firstName`, `lastName`, `email`, `phone`, `assignedClassIds` |
| **Assets** | `/dashboard/assets/add` | Asset Registration Form | `assetCreateSchema` | `name`, `category`, `purchasePrice`, `currentValue`, `location`, `purchaseDate` |
| **Maintenance** | `/dashboard/assets/[id]/maintenance` | Maintenance Form | `assetMaintenanceSchema` | `assetId`, `maintenanceType`, `serviceProvider`, `scheduledDate` |
| **Messages** | `/dashboard/communications/messages/new` | Compose Message Form | `smsSendSchema` / `emailSendSchema` | `recipients`, `message` / `subject`, `scheduledDate` |
| **Announcements**| `/dashboard/communications/announcements/add` | Announcement Form | `announcementCreateSchema` | `title`, `content`, `type`, `targetAudience`, `priority` |
| **Newsletters** | `/dashboard/communications/newsletters/add` | Newsletter Form | `newsletterCreateSchema` | `title`, `subject`, `content`, `scheduledDate` |
| **Prayers** | `/dashboard/prayer-requests/add` | Prayer Petition Form | `prayerRequestCreateSchema` | `title`, `description`, `category`, `priority`, `isConfidential` |
| **Branches** | `/dashboard/settings/branches/add` | Branch Form | `branchCreateSchema` | `name`, `type`, `established`, `email`, `phone`, `street`, `pastor`, `capacity` |
| **Church Profile** | `/dashboard/settings/church-profile` | Church Profile Form | `churchProfileSchema` | `name`, `vision`, `mission`, `coreValues`, `email`, `phone`, `street`, `seniorPastor` |
| **Users** | `/dashboard/settings/users/add` | User Account Form | `userAccountCreateSchema` | `firstName`, `lastName`, `email`, `username`, `password`, `confirmPassword`, `role` |
| **Roles** | `/dashboard/settings/roles/add` | Role Permissions Form | `roleCreateSchema` | `name`, `description`, `permissions` (min 1 required) |
| **Login** | `/` | Login Form | `loginSchema` | `email`, `password` (min 6 chars) |

---

## 🔒 Form Validation Integration Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { memberCreateSchema, MemberCreateInput } from '@/lib/validation';

export function MemberCreationComponent() {
  const form = useForm<MemberCreateInput>({
    resolver: zodResolver(memberCreateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'Male',
      membershipStatus: 'Active',
    },
  });

  const onSubmit = async (data: MemberCreateInput) => {
    // Validated payload ready for service layer execution
  };
}
```