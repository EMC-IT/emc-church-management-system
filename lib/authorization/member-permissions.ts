export const MEMBER_PERMISSIONS = {
  // Profile
  PROFILE_READ_SELF: 'profile:read:self',
  PROFILE_UPDATE_SELF: 'profile:update:self',

  // Family
  FAMILY_READ_SELF: 'family:read:self',
  FAMILY_UPDATE_SELF: 'family:update:self',

  // Attendance
  ATTENDANCE_READ_SELF: 'attendance:read:self',
  ATTENDANCE_CHECKIN_SELF: 'attendance:checkin:self',

  // Giving & Finance
  GIVING_READ_SELF: 'giving:read:self',
  GIVING_STATEMENT_DOWNLOAD: 'giving:statement:download',

  // Groups & Ministries
  GROUPS_READ_SELF: 'groups:read:self',
  MINISTRIES_READ_SELF: 'ministries:read:self',

  // Events
  EVENTS_READ: 'events:read',
  EVENTS_REGISTER: 'events:register',

  // Spiritual Journey
  JOURNEY_READ_SELF: 'journey:read:self',

  // Prayer Requests
  PRAYER_CREATE: 'prayer:create',
  PRAYER_READ_SELF: 'prayer:read:self',

  // Pastoral Care
  PASTORAL_CARE_CREATE: 'pastoral-care:create',
  PASTORAL_CARE_READ_SELF: 'pastoral-care:read:self',

  // Resources
  RESOURCES_READ: 'resources:read',

  // Notifications
  NOTIFICATIONS_READ_SELF: 'notifications:read:self',
  NOTIFICATIONS_UPDATE_SELF: 'notifications:update:self',

  // Settings
  SETTINGS_UPDATE_SELF: 'settings:update:self',
} as const;

export type MemberPermission = typeof MEMBER_PERMISSIONS[keyof typeof MEMBER_PERMISSIONS];

export const DEFAULT_MEMBER_PERMISSIONS: MemberPermission[] = Object.values(MEMBER_PERMISSIONS);
