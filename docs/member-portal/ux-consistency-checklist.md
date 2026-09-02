# EMC Member Portal — UX/UI Consistency & Design Contract

> **One Member Portal, One Design Language, One Navigation Model, One Interaction Model, One Responsive Experience.**

This checklist defines the architectural standard and design contract for all current and future Member Portal pages within the EMC Church Management System.

---

## 1. Global Shell & Layout Structure

* [x] **Universal Shell Wrapper**: Every member page resides inside `MemberShell` (`app/(member)/portal/layout.tsx`).
* [x] **Consistent Desktop Layout**: Persistent 256px sidebar (collapsible to 64px), sticky 64px header, max-width `max-w-6xl` content container with `p-4 sm:p-6 lg:p-8` padding.
* [x] **Tablet Strategy (768px - 1023px)**: Collapsible sidebar / drawer navigation preventing horizontal overflow and compressed grid collapse.
* [x] **Mobile Strategy (< 768px)**: Fixed bottom navigation bar with 4 primary targets (`Home`, `Church`, `Care`, `Me`) + `Menu` drawer trigger; safe-area padding (`pb-24 lg:pb-8`).
* [x] **Accessibility Skip Link**: `#member-main-content` skip link provided for keyboard and screen-reader navigation.

---

## 2. Navigation & Active States

* [x] **Standard Section Hierarchy**:
  - `Dashboard` (`/portal`, exact)
  - `MY PROFILE`: My Profile (`/portal/profile`), My Family (`/portal/family`)
  - `MY CHURCH`: Attendance (`/portal/attendance`), Giving (`/portal/giving`), Groups (`/portal/groups`), Ministries (`/portal/ministries`), Events (`/portal/events`)
  - `MY JOURNEY`: My Journey (`/portal/journey`)
  - `CARE`: Prayer Requests (`/portal/prayer`), Pastoral Care (`/portal/pastoral-care`)
  - `RESOURCES`: Resources (`/portal/resources`)
  - `COMMUNICATION`: Notifications (`/portal/notifications`)
  - `SETTINGS`: Settings (`/portal/settings`)
* [x] **Nested Route Active States**: Active states use `isRouteActive(pathname, href, exact)` so child routes (e.g. `/portal/events/evt-001`, `/portal/prayer/new`, `/portal/pastoral-care/request`) correctly highlight their parent navigation item without false root highlights.
* [x] **Consistent Terminology**:
  - Standardized terms: "Member", "Prayer Requests", "Pastoral Care", "Resources", "Events".
  - Prohibited: Random mixing of "Congregant", "User", "Account Holder".

---

## 3. Breadcrumbs & Page Headers

* [x] **Centralized Breadcrumb System**: `MemberBreadcrumbs` (`components/member/layout/member-breadcrumbs.tsx`) handles route resolution, portal home routing (`/portal`), and custom crumb arrays.
* [x] **Standard Page Header Structure**:
  ```text
  [Eyebrow / Breadcrumbs]
  Page Title (h1)
  Short Contextual Description (optional)
  [Primary Action Button(s)] (desktop right-aligned, mobile stacked)
  ```
* [x] **Single H1 Rule**: Only one `<h1>` per page. Inner component cards and section wrappers must use semantic `<h2>`, `<h3>`, or `<h4>`.

---

## 4. Cards & Content Grouping

* [x] **Existing Design System Card**: Reuse existing `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` primitives from `@/components/ui/card`.
* [x] **No Card Nesting**: Avoid `Card > Card > Card`. Use flat sections with subtle dividers (`border-b border-border/40`) and semantic spacing.
* [x] **Consistent Padding Scale**:
  - Main cards: `p-5 sm:p-6`
  - Compact cards / summaries: `p-3.5 sm:p-4`
  - Modal content: `p-5 sm:p-6`

---

## 5. Forms & Validation

* [x] **Standard Vertical Field Stack**:
  ```text
  Label (text-xs font-medium text-foreground)
  Input / Select / Textarea (h-9 text-xs, focus-visible:ring-primary)
  Helper text (text-xs text-muted-foreground)
  Validation Error (text-xs text-destructive, user-friendly copy)
  ```
* [x] **Human-Friendly Validation**: Clear actionable error messages (e.g., *"Please enter your prayer request"* instead of *"Invalid input"*).
* [x] **Accessible Form Controls**: Standardized HTML `id` and `htmlFor` association, `aria-invalid`, and disabled submit state with spinner.

---

## 6. Shared Data States (Loading, Empty, Error, Success)

* [x] **Loading States**:
  - Use skeleton components matching the layout of the replaced UI (`MemberLoadingState`, domain skeletons: `AttendanceSkeleton`, `GivingSkeleton`, `EventsSkeleton`, `ResourceSkeleton`, `NotificationSkeleton`, `SettingsSkeleton`).
* [x] **3-Part Empty States**:
  1. What is empty (e.g., *"No upcoming events"*)
  2. Why it is empty (e.g., *"You haven't registered for any events yet."*)
  3. Actionable next step (e.g., `[Explore Events]`)
  - Implemented via `MemberEmptyState` (`components/member/shared/member-empty-state.tsx`).
* [x] **Error States & Boundaries**:
  - Portal-wide `error.tsx` boundary with interactive retry (`reset()`).
  - Reusable `MemberErrorState` (`components/member/shared/member-error-state.tsx`) with `onRetry` handler.
  - No technical leakage (no raw stack traces, SQL errors, or status codes).
* [x] **Not-Found Boundaries**:
  - Global portal `not-found.tsx` for missing paths.
  - Route-specific `not-found.tsx` for dynamic entities (`/portal/events/[id]/not-found.tsx`).
* [x] **Success Feedback**: Standardized toasts via `useToast()` (`title`, `description`, optional action).

---

## 7. Status Badges & Semantic Colors

* [x] **Centralized Status Variants**: All badges mapped via `getStatusBadgeVariant()` (`lib/status-badge.ts`) into semantic design token colors:
  - `success` (green): Active, Approved, Completed, Answered, Confirmed, Registered
  - `warning` (amber): Pending, Awaiting Review, Requested, Waitlisted
  - `danger` (red): Absent, Cancelled, Overdue, Rejected, Urgent
  - `info` (blue): Scheduled, In Progress, Submitted, Praying, Volunteer, Draft
  - `neutral` (slate): Normal, General, Archived, Inactive, Member

---

## 8. Formatting Utilities

* [x] **Currency**: Centralized `formatCurrency(amount, 'GHS')` with proper symbol prefix (`₵`, `$`, `€`, `£`, `₦`).
* [x] **Dates & Times**: Standardized via `lib/date-utils.ts`:
  - Standard display: `format(date, 'MMM d, yyyy')` (e.g. `Sep 6, 2026`)
  - Relative time: `formatRelativeDateTime(date)` (e.g. `Today, 09:00 AM`)
  - Time ranges: `formatDateRange(from, to)`

---

## 9. Buttons & Interactive Controls

* [x] **Standard Button Hierarchy**:
  - `default` / `primary`: Main positive action (e.g. "Give Now", "Register for Event", "Submit Request")
  - `secondary` / `outline`: Filter toggles, view details, cancel modals
  - `ghost`: Utility actions, icon buttons with accessible tooltips/aria-labels
  - `destructive`: Confirm removal, cancel registration
* [x] **Confirmation Dialogs**: `MemberConfirmationDialog` (`components/member/shared/member-confirmation-dialog.tsx`) used for destructive and critical confirmations.

---

## 10. Accessibility & Quality Checklist

* [x] **Keyboard Navigation**: Full keyboard tab order across Sidebar, Header, Modals, Forms, and Tab lists.
* [x] **Focus Management**: Focus trap and return handling in Dialogs, Sheets, and Dropdowns.
* [x] **High Contrast & Dark Mode**: Full theme token compliance (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border/50`).
* [x] **Motion**: Respects `prefers-reduced-motion` with subtle, standard micro-animations.
* [x] **TypeScript Compliance**: Strictly typed with zero `any` or `@ts-ignore` overrides (`npx tsc --noEmit` passes cleanly).
* [x] **Build Verification**: Production compilation passes (`npm run build`).
