export const PERMISSIONS = {
  // Member Management
  VIEW_MEMBERS: 'canViewMembers',
  EDIT_MEMBERS: 'canEditMembers',
  DELETE_MEMBERS: 'canDeleteMembers',
  
  // Financial Management
  VIEW_FINANCE: 'canViewFinance',
  MANAGE_GIVING: 'canManageGiving',
  MANAGE_BUDGETS: 'canManageBudgets',
  
  // Communication
  SEND_SMS: 'canSendSMS',
  SEND_EMAIL: 'canSendEmail',
  
  // Content Management
  UPLOAD_SERMONS: 'canUploadSermons',
  MANAGE_EVENTS: 'canManageEvents',
  
  // Reports & Analytics
  VIEW_REPORTS: 'canViewReports',
  EXPORT_DATA: 'canExportData',
  
  // System Administration
  MANAGE_ROLES: 'canManageRoles',
  MANAGE_USERS: 'canManageUsers',
  VIEW_AUDIT_LOGS: 'canViewAuditLogs',
} as const;

export const ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  PASTOR: 'Pastor',
  ACCOUNTANT: 'Accountant',
  SECRETARY: 'Secretary',
  TEACHER: 'Teacher',
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.EDIT_MEMBERS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.SEND_SMS,
    PERMISSIONS.SEND_EMAIL,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
  ],
  [ROLES.PASTOR]: [
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.UPLOAD_SERMONS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.SEND_SMS,
    PERMISSIONS.SEND_EMAIL,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.MANAGE_GIVING,
    PERMISSIONS.MANAGE_BUDGETS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EXPORT_DATA,
  ],
  [ROLES.SECRETARY]: [
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.EDIT_MEMBERS,
    PERMISSIONS.SEND_SMS,
    PERMISSIONS.SEND_EMAIL,
  ],
  [ROLES.TEACHER]: [
    PERMISSIONS.VIEW_MEMBERS,
    PERMISSIONS.MANAGE_EVENTS,
  ],
};