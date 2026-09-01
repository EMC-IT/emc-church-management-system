import { MemberNotification } from '@/lib/types/member';
import { mockMemberNotifications } from '@/lib/mock/member';

export interface MemberNotificationsService {
  getNotifications(): Promise<MemberNotification[]>;
  getUnreadCount(): Promise<number>;
  markAsRead(id: string): Promise<MemberNotification>;
  markAllAsRead(): Promise<void>;
}

export class MockMemberNotificationsService implements MemberNotificationsService {
  private notifications: MemberNotification[] = [...mockMemberNotifications];

  async getNotifications(): Promise<MemberNotification[]> {
    return Promise.resolve([...this.notifications]);
  }

  async getUnreadCount(): Promise<number> {
    return Promise.resolve(this.notifications.filter((n) => !n.isRead).length);
  }

  async markAsRead(id: string): Promise<MemberNotification> {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index === -1) {
      throw new Error('Notification not found');
    }
    const updated = { ...this.notifications[index], isRead: true };
    this.notifications[index] = updated;
    return Promise.resolve(updated);
  }

  async markAllAsRead(): Promise<void> {
    this.notifications = this.notifications.map((n) => ({ ...n, isRead: true }));
    return Promise.resolve();
  }
}

export const memberNotificationsService = new MockMemberNotificationsService();
