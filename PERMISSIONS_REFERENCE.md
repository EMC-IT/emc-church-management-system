# EMC Church Management System - Comprehensive Permissions Reference

## Overview
This document provides a complete reference of all permissions available in the EMC Church Management System. The system implements a comprehensive role-based access control (RBAC) with **127 granular permissions** across **12 major feature categories**.

## Permission Categories

### 1. Dashboard & Analytics (4 permissions)
View and interact with the main dashboard and analytics features.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `dashboard.view` | View Dashboard | Access main dashboard |
| `analytics.view` | View Analytics | Access analytics and reports dashboard |
| `analytics.export` | Export Analytics | Export analytics data and reports |
| `analytics.attendance` | View Attendance Analytics | Access attendance analytics |

### 2. Members Management (7 permissions)
Complete member lifecycle management and data access.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `members.view` | View Members | View member list and profiles |
| `members.create` | Add Members | Create new member records |
| `members.edit` | Edit Members | Update member information |
| `members.delete` | Delete Members | Remove member records |
| `members.import` | Import Members | Bulk import members from file |
| `members.export` | Export Members | Export member data |
| `members.contact` | View Contact Info | Access member contact details |

### 3. Attendance Management (10 permissions)
Comprehensive attendance tracking across services, departments, and groups.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `attendance.view` | View Attendance | View attendance records |
| `attendance.take` | Take Attendance | Mark attendance for services |
| `attendance.edit` | Edit Attendance | Modify attendance records |
| `attendance.delete` | Delete Attendance | Remove attendance records |
| `attendance.qr` | QR Check-in | Use QR code check-in system |
| `attendance.history` | View History | Access attendance history |
| `attendance.reports` | View Reports | Access attendance reports |
| `attendance.groups` | Group Attendance | Manage group attendance |
| `attendance.department` | Department Attendance | Manage department attendance |
| `attendance.member` | Member Attendance | View individual member attendance |

### 4. Groups Management (6 permissions)
Small groups, ministries, and cell groups management.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `groups.view` | View Groups | View groups list |
| `groups.create` | Create Groups | Add new groups |
| `groups.edit` | Edit Groups | Modify group information |
| `groups.delete` | Delete Groups | Remove groups |
| `groups.categories` | Manage Categories | Manage group categories |
| `groups.members` | Manage Members | Add/remove group members |

### 5. Events Management (11 permissions)
Complete event lifecycle from creation to execution and reporting.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `events.view` | View Events | View events list |
| `events.create` | Create Events | Add new events |
| `events.edit` | Edit Events | Modify event details |
| `events.delete` | Delete Events | Remove events |
| `events.calendar` | View Calendar | Access events calendar |
| `events.categories` | Manage Categories | Manage event categories |
| `events.templates` | Manage Templates | Create and edit event templates |
| `events.registrations` | Manage Registrations | Handle event registrations |
| `events.attendance` | Event Attendance | Track event attendance |
| `events.export` | Export Events | Export event data |
| `events.bulk` | Bulk Actions | Perform bulk operations on events |

### 6. Communications (9 permissions)
SMS, email campaigns, announcements, and newsletters.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `communications.view` | View Communications | View messages and campaigns |
| `communications.send` | Send Messages | Send SMS and email messages |
| `communications.campaigns` | Manage Campaigns | Create and manage campaigns |
| `communications.campaigns.create` | Create Campaigns | Create new campaigns |
| `communications.campaigns.edit` | Edit Campaigns | Modify campaigns |
| `communications.campaigns.delete` | Delete Campaigns | Remove campaigns |
| `communications.announcements` | Manage Announcements | Create and edit announcements |
| `communications.newsletters` | Manage Newsletters | Create and send newsletters |
| `communications.templates` | Message Templates | Manage message templates |

### 7. Finance Management (21 permissions)
Comprehensive financial management including income, expenses, giving, budgets, and reports.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `finance.view` | View Finance | View financial dashboard |
| `finance.income.view` | View Income | View income records |
| `finance.income.create` | Record Income | Add income entries |
| `finance.income.edit` | Edit Income | Modify income records |
| `finance.income.delete` | Delete Income | Remove income records |
| `finance.expenses.view` | View Expenses | View expense records |
| `finance.expenses.create` | Record Expenses | Add expense entries |
| `finance.expenses.edit` | Edit Expenses | Modify expense records |
| `finance.expenses.delete` | Delete Expenses | Remove expense records |
| `finance.giving.view` | View Giving | View giving records |
| `finance.giving.manage` | Manage Giving | Manage giving records |
| `finance.tithes.view` | View Tithes & Offerings | View tithes and offerings |
| `finance.tithes.manage` | Manage Tithes & Offerings | Manage tithes and offerings |
| `finance.budgets.view` | View Budgets | View budget information |
| `finance.budgets.create` | Create Budgets | Create new budgets |
| `finance.budgets.edit` | Edit Budgets | Modify budgets |
| `finance.budgets.delete` | Delete Budgets | Remove budgets |
| `finance.budgets.categories` | Manage Budget Categories | Manage budget categories |
| `finance.budgets.allocations` | Manage Allocations | Allocate budget funds |
| `finance.reports` | View Financial Reports | Access financial reports |
| `finance.export` | Export Financial Data | Export financial records |

### 8. Assets Management (7 permissions)
Church assets, inventory, and equipment management.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `assets.view` | View Assets | View asset list |
| `assets.create` | Add Assets | Create new asset records |
| `assets.edit` | Edit Assets | Modify asset information |
| `assets.delete` | Delete Assets | Remove asset records |
| `assets.categories` | Manage Categories | Manage asset categories |
| `assets.reports` | View Reports | Access asset reports |
| `assets.export` | Export Assets | Export asset data |

### 9. Departments (6 permissions)
Department structure and member assignments.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `departments.view` | View Departments | View department list |
| `departments.create` | Create Departments | Add new departments |
| `departments.edit` | Edit Departments | Modify department information |
| `departments.delete` | Delete Departments | Remove departments |
| `departments.categories` | Manage Categories | Manage department categories |
| `departments.members` | Manage Members | Assign members to departments |

### 10. Sunday School (13 permissions)
Complete Sunday School management system with classes, students, teachers, and materials.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `sunday-school.view` | View Sunday School | View Sunday school dashboard |
| `sunday-school.classes.view` | View Classes | View class list |
| `sunday-school.classes.create` | Create Classes | Add new classes |
| `sunday-school.classes.edit` | Edit Classes | Modify class information |
| `sunday-school.classes.delete` | Delete Classes | Remove classes |
| `sunday-school.students.view` | View Students | View student records |
| `sunday-school.students.manage` | Manage Students | Add/edit student records |
| `sunday-school.teachers.view` | View Teachers | View teacher list |
| `sunday-school.teachers.manage` | Manage Teachers | Assign and manage teachers |
| `sunday-school.materials.view` | View Materials | View teaching materials |
| `sunday-school.materials.manage` | Manage Materials | Upload and manage materials |
| `sunday-school.attendance` | Take Attendance | Mark class attendance |
| `sunday-school.reports` | View Reports | Access Sunday school reports |

### 11. Prayer Requests (9 permissions)
Prayer request management with confidentiality controls and team assignments.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `prayer-requests.view` | View Prayer Requests | View all prayer requests |
| `prayer-requests.view-confidential` | View Confidential Requests | Access confidential requests |
| `prayer-requests.create` | Create Requests | Submit new prayer requests |
| `prayer-requests.edit` | Edit Requests | Modify prayer requests |
| `prayer-requests.delete` | Delete Requests | Remove prayer requests |
| `prayer-requests.respond` | Respond to Requests | Add comments and updates |
| `prayer-requests.assign` | Assign to Prayer Team | Assign requests to team members |
| `prayer-requests.categories` | Manage Categories | Manage prayer request categories |
| `prayer-requests.status` | Update Status | Update request status |

### 12. Settings & Administration (17 permissions)
System configuration, user management, roles, church profile, and branches.

| Permission ID | Name | Description |
|--------------|------|-------------|
| `settings.view` | View Settings | Access settings dashboard |
| `settings.church-profile` | Manage Church Profile | Edit church information |
| `settings.branches.view` | View Branches | View branch list |
| `settings.branches.create` | Create Branches | Add new branches |
| `settings.branches.edit` | Edit Branches | Modify branch information |
| `settings.branches.delete` | Delete Branches | Remove branches |
| `settings.users.view` | View Users | View user list |
| `settings.users.create` | Create Users | Add new users |
| `settings.users.edit` | Edit Users | Modify user accounts |
| `settings.users.delete` | Delete Users | Remove user accounts |
| `settings.users.suspend` | Suspend Users | Suspend user accounts |
| `settings.roles.view` | View Roles | View role list |
| `settings.roles.create` | Create Roles | Add new roles |
| `settings.roles.edit` | Edit Roles | Modify role permissions |
| `settings.roles.delete` | Delete Roles | Remove roles |
| `settings.permissions.manage` | Manage Permissions | Configure system permissions |
| `settings.system` | System Configuration | Access system settings |

## Role Templates

The system includes 6 pre-configured role templates for quick setup:

### 1. Administrator
**Full access to all features** - All 127 permissions enabled.

**Use Case**: System administrators and IT staff who need complete control.

### 2. Pastor
**Leadership team access** - Access to all features except sensitive settings (115 permissions).

**Excluded Permissions**:
- User management (create, edit, delete, suspend)
- Role management (create, edit, delete)
- System configuration
- Permission management

**Use Case**: Senior pastors and church leadership who need operational access.

### 3. Secretary
**Administrative and records management** - Focus on members, events, communications (58 permissions).

**Included Categories**:
- Members (full access)
- Attendance (full access)
- Events (full access)
- Communications (full access)
- Departments (full access)
- Groups (full access)
- Dashboard (view only)
- Analytics (view only)

**Use Case**: Church secretaries and administrative staff.

### 4. Finance Officer
**Financial management and reports** - Finance module + dashboard access (25 permissions).

**Included Categories**:
- Finance (full access - 21 permissions)
- Dashboard (view only)
- Analytics (view only)
- Members (view only)

**Use Case**: Treasurers, accountants, and finance team members.

### 5. Department Head
**Department-specific management** - Department operations with member view access (28 permissions).

**Included Categories**:
- Departments (full access)
- Groups (full access)
- Events (full access)
- Attendance (full access)
- Members (view and contact only)

**Use Case**: Department heads and ministry leaders.

### 6. View Only
**Read-only access** - All view permissions across the system (47 permissions).

**Restrictions**: No create, edit, delete, or manage permissions.

**Use Case**: Board members, observers, or auditors who need visibility without modification rights.

## Permission Implementation

### Page-Level Access Control
Access to specific pages/routes:
```tsx
// Example: Members page requires members.view permission
if (!hasPermission('members.view')) {
  return <AccessDenied />;
}
```

### Feature-Level Controls
UI elements conditional on permissions:
```tsx
// Example: Hide Add Member button if no create permission
{hasPermission('members.create') && (
  <Button>Add Member</Button>
)}
```

### Action-Level Controls
API operations protected by permissions:
```tsx
// Example: Edit member API call
if (!hasPermission('members.edit')) {
  throw new UnauthorizedException();
}
```

## Best Practices

1. **Principle of Least Privilege**: Grant only the minimum permissions required for a role to perform its duties.

2. **Regular Audits**: Review and audit permissions quarterly to ensure appropriate access levels.

3. **Separation of Duties**: Separate sensitive operations (e.g., create vs. approve) across different roles.

4. **Documentation**: Document custom roles and their intended use cases.

5. **Testing**: Test role permissions thoroughly before assigning to users.

## Migration Notes

When adding new features:
1. Define permissions in the permission categories structure
2. Update role templates if necessary
3. Implement permission checks in UI and API
4. Document new permissions in this reference

## Related Files

- `/app/dashboard/settings/permissions/page.tsx` - Permissions management UI
- `/app/dashboard/settings/roles/add/page.tsx` - Role creation with 40 basic permissions
- `/lib/permissions.ts` - Permission checking utilities (to be implemented)
- `/lib/types.ts` - Permission type definitions

## Total Permission Count: 127 Permissions

Distributed across:
- Dashboard & Analytics: 4
- Members: 7
- Attendance: 10
- Groups: 6
- Events: 11
- Communications: 9
- Finance: 21
- Assets: 7
- Departments: 6
- Sunday School: 13
- Prayer Requests: 9
- Settings & Administration: 17
- **Role Templates**: 6 pre-configured templates

---

*Last Updated: January 2024*
*Version: 1.0*
