import { PERMISSION_CATEGORIES } from './permissions';

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  ACCOUNTANT: 'Accountant',
  SECRETARY: 'Secretary',
  TEACHER: 'Teacher',
} as const;

export type SystemRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.SUPER_ADMIN]: PERMISSION_CATEGORIES.flatMap(cat => cat.permissions.map(p => p.id)),
  [ROLES.ADMIN]: [
    'dashboard.view', 'analytics.view', 'analytics.attendance', 'analytics.finance', 'analytics.demographics', 'analytics.report-builder', 'analytics.preferences', 'analytics.export',
    'activity-logs.view', 'activity-logs.user', 'activity-logs.filter', 'activity-logs.export',
    'members.view', 'members.create', 'members.edit', 'members.import', 'members.export', 'members.contact', 'members.converts', 'members.family', 'members.documents', 'members.giving', 'members.history',
    'attendance.view', 'attendance.take', 'attendance.qr', 'attendance.history', 'attendance.reports', 'attendance.groups', 'attendance.department', 'attendance.member', 'attendance.edit',
    'groups.view', 'groups.create', 'groups.edit', 'groups.delete', 'groups.categories', 'groups.members', 'groups.events', 'groups.roles', 'groups.attendance', 'groups.reports',
    'departments.view', 'departments.create', 'departments.edit', 'departments.delete', 'departments.categories', 'departments.members', 'departments.roles', 'departments.meetings',
    'sunday-school.view', 'sunday-school.classes.view', 'sunday-school.classes.create', 'sunday-school.classes.edit', 'sunday-school.students.view', 'sunday-school.students.manage', 'sunday-school.teachers.view', 'sunday-school.teachers.manage', 'sunday-school.materials.view', 'sunday-school.materials.manage', 'sunday-school.attendance', 'sunday-school.reports',
    'prayer-requests.view', 'prayer-requests.view-confidential', 'prayer-requests.create', 'prayer-requests.edit', 'prayer-requests.delete', 'prayer-requests.respond', 'prayer-requests.assign', 'prayer-requests.categories', 'prayer-requests.status',
    'events.view', 'events.create', 'events.edit', 'events.delete', 'events.calendar', 'events.categories', 'events.templates', 'events.registrations', 'events.attendance', 'events.groups', 'events.bulk', 'events.export',
    'assets.view', 'assets.create', 'assets.edit', 'assets.delete', 'assets.categories', 'assets.assignment', 'assets.maintenance', 'assets.reports', 'assets.export',
    'communications.view', 'communications.messages', 'communications.campaigns', 'communications.announcements', 'communications.newsletters', 'communications.templates', 'communications.send',
    'settings.view', 'settings.church-profile', 'settings.branches.view', 'settings.branches.create', 'settings.branches.edit', 'settings.users.view', 'settings.users.create', 'settings.users.edit', 'settings.roles.view', 'settings.roles.create', 'settings.roles.edit', 'settings.notifications', 'settings.integrations', 'settings.backup', 'settings.system',
    'profile.view', 'profile.edit', 'profile.security',
  ],
  [ROLES.PASTOR]: [
    'dashboard.view', 'analytics.view', 'analytics.attendance', 'analytics.demographics', 'analytics.export',
    'members.view', 'members.create', 'members.edit', 'members.contact', 'members.converts', 'members.family', 'members.documents', 'members.history',
    'attendance.view', 'attendance.take', 'attendance.history', 'attendance.reports', 'attendance.groups', 'attendance.department', 'attendance.member',
    'groups.view', 'groups.create', 'groups.edit', 'groups.members', 'groups.events', 'groups.roles', 'groups.reports',
    'departments.view', 'departments.members', 'departments.roles', 'departments.meetings',
    'sunday-school.view', 'sunday-school.classes.view', 'sunday-school.reports',
    'prayer-requests.view', 'prayer-requests.view-confidential', 'prayer-requests.create', 'prayer-requests.edit', 'prayer-requests.respond', 'prayer-requests.assign', 'prayer-requests.categories', 'prayer-requests.status',
    'events.view', 'events.create', 'events.edit', 'events.calendar', 'events.registrations', 'events.attendance', 'events.groups',
    'communications.view', 'communications.messages', 'communications.campaigns', 'communications.announcements', 'communications.newsletters', 'communications.send',
    'settings.view', 'settings.branches.view',
    'profile.view', 'profile.edit', 'profile.security',
  ],
  [ROLES.ACCOUNTANT]: [
    'dashboard.view', 'analytics.view', 'analytics.finance', 'analytics.report-builder', 'analytics.export',
    'finance.view', 'finance.giving.view', 'finance.giving.manage', 'finance.giving.categories', 'finance.giving.donations', 'finance.giving.pledges', 'finance.giving.fundraising', 'finance.giving.reports',
    'finance.income.view', 'finance.income.create', 'finance.income.edit', 'finance.income.delete', 'finance.income.categories', 'finance.income.reports',
    'finance.expenses.view', 'finance.expenses.create', 'finance.expenses.edit', 'finance.expenses.delete', 'finance.expenses.categories', 'finance.expenses.reports',
    'finance.tithes.view', 'finance.tithes.create', 'finance.tithes.edit', 'finance.tithes.delete', 'finance.tithes.categories', 'finance.tithes.reports',
    'finance.budgets.view', 'finance.budgets.create', 'finance.budgets.edit', 'finance.budgets.delete', 'finance.budgets.categories', 'finance.budgets.allocations', 'finance.budgets.reports',
    'finance.reports.view', 'finance.reports.assets', 'finance.reports.comparisons', 'finance.export',
    'assets.view', 'assets.create', 'assets.edit', 'assets.reports', 'assets.export',
    'profile.view', 'profile.edit', 'profile.security',
  ],
  [ROLES.SECRETARY]: [
    'dashboard.view',
    'members.view', 'members.create', 'members.edit', 'members.import', 'members.export', 'members.contact', 'members.converts', 'members.family', 'members.documents', 'members.history',
    'attendance.view', 'attendance.take', 'attendance.qr', 'attendance.history', 'attendance.reports', 'attendance.groups', 'attendance.department', 'attendance.member',
    'groups.view', 'groups.members', 'groups.events',
    'departments.view', 'departments.members', 'departments.meetings',
    'events.view', 'events.create', 'events.edit', 'events.calendar', 'events.registrations', 'events.attendance', 'events.export',
    'communications.view', 'communications.messages', 'communications.announcements', 'communications.newsletters', 'communications.templates', 'communications.send',
    'prayer-requests.view', 'prayer-requests.create', 'prayer-requests.status',
    'profile.view', 'profile.edit', 'profile.security',
  ],
  [ROLES.TEACHER]: [
    'dashboard.view',
    'sunday-school.view', 'sunday-school.classes.view', 'sunday-school.students.view', 'sunday-school.students.manage', 'sunday-school.teachers.view', 'sunday-school.materials.view', 'sunday-school.materials.manage', 'sunday-school.attendance', 'sunday-school.reports',
    'members.view',
    'events.view', 'events.calendar',
    'profile.view', 'profile.edit', 'profile.security',
  ],
};
