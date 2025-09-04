// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface Role {
  name: string;
  permissions: string[];
}

// ===== PERMISSION TYPES =====

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  permissions: Permission[];
}

// ===== ENUM TYPES =====

export enum UserRole {
  ADMIN = 'admin',
  PASTOR = 'pastor',
  LEADER = 'leader',
  MEMBER = 'member',
  GUEST = 'guest',
}

export enum ModulePermission {
  MEMBERS = 'members',
  FINANCE = 'finance',
  EVENTS = 'events',
  ATTENDANCE = 'attendance',
  COMMUNICATIONS = 'communications',
  GROUPS = 'groups',
  SUNDAY_SCHOOL = 'sunday_school',
  PRAYER_REQUESTS = 'prayer_requests',
  REPORTS = 'reports',
  SETTINGS = 'settings',
}

export enum ActionPermission {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
}

// ===== SETTINGS TYPES =====

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface UserSettings {
  userId: string;
  settings: AppSettings;
  updatedAt: string;
}