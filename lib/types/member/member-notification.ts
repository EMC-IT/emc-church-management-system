export type MemberNotificationCategory = 'announcement' | 'event' | 'giving' | 'prayer' | 'care' | 'system';

export interface MemberNotification {
  id: string;
  title: string;
  message: string;
  category: MemberNotificationCategory;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
