# EMC Church Management System — Domain Map

This document establishes the official domain taxonomy, entity boundaries, and ownership mapping for the EMC Church Management System across its 204 user interface routes.

---

## 1. Domain Taxonomy & Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE DOMAIN BOUNDARIES                             │
└─────────────────────────────────────────────────────────────────────────────┘

 1. IDENTITY & ACCESS (IAM)          2. MEMBERSHIP (CRM)
    ├── Authentication                  ├── Members Directory
    ├── Roles & Permissions             ├── Families & Linkages
    ├── Users & Profiles                ├── Converts Management
    └── Multi-Branch Management         └── Member History & Documents

 3. FINANCE & STEWARDSHIP            4. ATTENDANCE & CHECK-IN
    ├── Tithes & Offerings              ├── Service Attendance
    ├── Pledges & Donations             ├── QR Check-in & Kiosk
    ├── Income Records                  ├── Group / Department Attendance
    ├── Expenses & Disbursements        └── Attendance History & Trends
    └── Budgets & Allocations

 5. GROUPS & MINISTRIES              6. DEPARTMENTS & TEAMS
    ├── Small Groups / Cells            ├── Church Departments
    ├── Group Roles & Leaders           ├── Leadership & Volunteers
    └── Group Meetings & Events         └── Department Meetings

 7. SUNDAY SCHOOL & CHILDREN         8. EVENTS & MASTER CALENDAR
    ├── Classes & Ages                  ├── Event Scheduling
    ├── Teachers & Assignments          ├── Registrations & Tickets
    ├── Students & Enrollment           └── Categories & Templates
    └── Materials & Curriculum

 9. COMMUNICATIONS & BROADCAST      10. ASSET & INVENTORY
    ├── Bulk SMS Campaigns              ├── Physical Assets & Equipment
    ├── Email & Newsletters             ├── Categories & Maintenance
    └── Internal Announcements          └── Asset Custody & Valuation

11. PRAYER & INTERCESSION           12. PASTORAL CARE & VISITATION
    ├── Public & Confidential Petitions ├── Counseling Appointments & Cases
    ├── Category Tagging & Tracking     ├── Hospital & Home Visitations
    └── Intercessory Updates            └── Pastoral Session Notes

13. CENTRAL FILE VAULT & MEDIA      14. REPORTING & ANALYTICS
    ├── Document Vault & Storage        ├── Executive KPIs & Metrics
    ├── Media Library & Certificates    ├── Custom Report Builder
    └── Multi-Part File Uploads         └── Multi-Period Comparisons

15. MEMBER SELF-SERVICE PORTAL      16. PUBLIC MINISTRY & OUTREACH
    ├── Personal Profile & Household    ├── Public Landing & Service Times
    ├── My Giving & Tax Statements      ├── Sermons Archive & Media Player
    ├── My Attendance & QR Code         ├── Faith Statements & Leadership
    ├── Small Groups & Serving Teams    └── Public Online Giving Gateway
    └── Pastoral & Prayer Requests
```

---

## 2. Detailed Domain Matrix

| Domain | Core Entities | Current Service(s) | Primary Types / Schemas | Target Service Package |
| :--- | :--- | :--- | :--- | :--- |
| **IAM** | `User`, `Role`, `Permission`, `Branch` | `authService` | `lib/types/auth.ts`, `lib/validation/auth.ts` | `services/auth/` |
| **Members** | `Member`, `Family`, `Convert`, `Document` | `membersService`, `documentsService` | `lib/types/members.ts`, `lib/validation/members.ts` | `services/members/` |
| **Finance** | `Giving`, `Income`, `Expense`, `Budget`, `Allocation` | `financeService`, `givingService`, `incomeService`, `expenseService`, `budgetService` | `lib/types/finance.ts`, `lib/validation/finance.ts` | `services/finance/` |
| **Attendance** | `AttendanceSession`, `AttendanceRecord`, `CheckIn` | `attendanceService` | `lib/types/attendance.ts`, `lib/validation/attendance.ts` | `services/attendance/` |
| **Groups** | `Group`, `GroupMember`, `GroupMeeting`, `GroupRole` | `groupsService` | `lib/types/groups.ts`, `lib/validation/groups.ts` | `services/groups/` |
| **Departments**| `Department`, `DepartmentMember`, `DepartmentMeeting` | `departmentsService` | `lib/types/departments.ts`, `lib/validation/departments.ts` | `services/departments/` |
| **Sunday School**| `Class`, `Teacher`, `Student`, `Material` | `sundaySchoolService` | `lib/types/sunday-school.ts`, `lib/validation/sunday-school.ts` | `services/sunday-school/` |
| **Events** | `Event`, `EventRegistration`, `EventCategory` | `eventsService` | `lib/types/events.ts`, `lib/validation/events.ts` | `services/events/` |
| **Communications**| `SMSMessage`, `EmailCampaign`, `Announcement`, `Newsletter` | `communicationsService` | `lib/types/communications.ts`, `lib/validation/communications.ts` | `services/communications/` |
| **Assets** | `Asset`, `AssetCategory`, `AssetMaintenance`, `Assignment` | `assetService` | `lib/types/assets.ts`, `lib/validation/assets.ts` | `services/assets/` |
| **Prayer** | `PrayerRequest`, `PrayerCategory`, `PrayerResponse` | `apiClient` | `lib/types/prayer.ts`, `lib/validation/prayer.ts` | `services/prayer-requests/` |
| **Pastoral Care**| `PastoralCase`, `Visitation`, `CounselingSession` | `apiClient`, `memberPastoralCareService` | `lib/types/pastoral-care.ts`, `lib/validation/pastoral-care.ts` | `services/pastoral-care/` |
| **File Vault** | `FileItem`, `DocumentUpload`, `MediaAsset` | `uploadService` | `lib/types/upload.ts`, `lib/validation/upload.ts` | `services/upload/` |
| **Analytics** | `ReportMetric`, `AnalyticsOverview`, `ReportPreset` | `reportsService` | `lib/types/reports.ts`, `lib/validation/reports.ts` | `services/reports/` |
| **Member Portal**| `MemberDashboard`, `MemberProfile`, `MemberJourney`, `MemberNotification` | `services/member/*` (16 dedicated services) | `lib/types/member-portal.ts`, `lib/authorization/member-permissions.ts` | `services/member/` |
| **Public Portal**| `Sermon`, `EventPreview`, `Testimonial`, `StaffProfile` | `eventsService`, `departmentsService` | `lib/types/landing.ts`, `lib/validation/landing.ts` | `services/landing/` |

---

## 3. Invariants & Segregation Rules

1. **No Direct Inter-Service Mutation**: A domain service may not directly mutate the internal database tables of another domain. It must consume the target domain's public service contract.
2. **Context Ownership**:
   - `services/members/` owns member identity and family graph.
   - `services/member/` provides member self-service operations scoped strictly to the authenticated member session.
   - `services/finance/` references `memberId` purely as a foreign identifier and does not modify member profile data.
   - `services/attendance/` references `memberId` purely for attendance logging.
3. **Tenant & Branch Scope**:
   - Every domain entity must be partitioned by `tenantId` and optionally `branchId`.
   - Member self-service operations further enforce `userId === principal.userId` or explicit household linkages.
