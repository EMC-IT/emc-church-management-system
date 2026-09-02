export type NotificationType =
  | 'event'
  | 'giving'
  | 'attendance'
  | 'prayer'
  | 'care'
  | 'group'
  | 'ministry'
  | 'journey'
  | 'resource'
  | 'announcement'
  | 'system';

export type MemberNotificationCategory = NotificationType;

export interface NotificationAction {
  label: string;
  href: string;
}

export interface MemberNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  category?: MemberNotificationCategory;
  action?: NotificationAction;
  actionUrl?: string; // backwards compatibility
}

export interface NotificationFilterOptions {
  unreadOnly?: boolean;
  type?: NotificationType | 'all';
  page?: number;
  pageSize?: number;
}
