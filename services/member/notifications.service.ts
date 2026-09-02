import {
  MemberNotification,
  NotificationFilterOptions,
} from '@/lib/types/member';
import { mockMemberNotificationsList } from '@/lib/mock/member';

export interface MemberNotificationsService {
  getNotifications(filter?: NotificationFilterOptions): Promise<MemberNotification[]>;
  getUnreadNotifications(): Promise<MemberNotification[]>;
  getUnreadCount(): Promise<number>;
  getNotification(id: string): Promise<MemberNotification | null>;
  markAsRead(id: string): Promise<MemberNotification>;
  markAllAsRead(): Promise<void>;
}

export class MockMemberNotificationsService implements MemberNotificationsService {
  private notifications: MemberNotification[] = [...mockMemberNotificationsList];

  async getNotifications(
    filter?: NotificationFilterOptions
  ): Promise<MemberNotification[]> {
    let list = [...this.notifications];

    if (filter?.unreadOnly) {
      list = list.filter((n) => !n.isRead);
    }

    if (filter?.type && filter.type !== 'all') {
      list = list.filter((n) => n.type === filter.type);
    }

    // Sort newest first
    list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return Promise.resolve(list);
  }

  async getUnreadNotifications(): Promise<MemberNotification[]> {
    const unread = this.notifications.filter((n) => !n.isRead);
    return Promise.resolve([...unread]);
  }

  async getUnreadCount(): Promise<number> {
    return Promise.resolve(this.notifications.filter((n) => !n.isRead).length);
  }

  async getNotification(id: string): Promise<MemberNotification | null> {
    const item = this.notifications.find((n) => n.id === id);
    return Promise.resolve(item ? { ...item } : null);
  }

  async markAsRead(id: string): Promise<MemberNotification> {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    const updated: MemberNotification = {
      ...this.notifications[index],
      isRead: true,
      readAt: new Date().toISOString(),
    };
    this.notifications[index] = updated;
    return Promise.resolve(updated);
  }

  async markAllAsRead(): Promise<void> {
    const now = new Date().toISOString();
    this.notifications = this.notifications.map((n) => ({
      ...n,
      isRead: true,
      readAt: n.readAt || now,
    }));
    return Promise.resolve();
  }
}

export const memberNotificationsService = new MockMemberNotificationsService();
