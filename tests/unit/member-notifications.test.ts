import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockMemberNotificationsService,
  MockMemberAnnouncementsService,
} from '@/services/member';
import { formatNotificationTime } from '@/lib/config/member/notifications';

describe('Member Portal — Phase 11: Notifications & Communication Center', () => {
  let notificationsService: MockMemberNotificationsService;
  let announcementsService: MockMemberAnnouncementsService;

  beforeEach(() => {
    notificationsService = new MockMemberNotificationsService();
    announcementsService = new MockMemberAnnouncementsService();
  });

  it('retrieves all member notifications sorted by newest first', async () => {
    const list = await notificationsService.getNotifications();

    expect(list).toBeDefined();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0]).toHaveProperty('title');
    expect(list[0]).toHaveProperty('type');
    expect(list[0]).toHaveProperty('isRead');

    // Verify sort order
    for (let i = 0; i < list.length - 1; i++) {
      const curr = new Date(list[i].createdAt).getTime();
      const next = new Date(list[i + 1].createdAt).getTime();
      expect(curr).toBeGreaterThanOrEqual(next);
    }
  });

  it('retrieves unread notifications and unread count', async () => {
    const unread = await notificationsService.getUnreadNotifications();
    const count = await notificationsService.getUnreadCount();

    expect(count).toBe(unread.length);
    expect(unread.every((n) => !n.isRead)).toBe(true);
  });

  it('marks a single notification as read', async () => {
    const unreadBefore = await notificationsService.getUnreadNotifications();
    expect(unreadBefore.length).toBeGreaterThan(0);

    const targetId = unreadBefore[0].id;
    const updated = await notificationsService.markAsRead(targetId);

    expect(updated.id).toBe(targetId);
    expect(updated.isRead).toBe(true);
    expect(updated.readAt).toBeDefined();

    const countAfter = await notificationsService.getUnreadCount();
    expect(countAfter).toBe(unreadBefore.length - 1);
  });

  it('marks all notifications as read', async () => {
    await notificationsService.markAllAsRead();
    const unreadCount = await notificationsService.getUnreadCount();
    const list = await notificationsService.getNotifications();

    expect(unreadCount).toBe(0);
    expect(list.every((n) => n.isRead)).toBe(true);
  });

  it('retrieves church-wide announcements', async () => {
    const announcements = await announcementsService.getAnnouncements();

    expect(announcements).toBeDefined();
    expect(announcements.length).toBeGreaterThan(0);
    expect(announcements[0]).toHaveProperty('title');
    expect(announcements[0]).toHaveProperty('summary');
    expect(announcements[0]).toHaveProperty('publishedAt');
  });

  it('formats notification time strings gracefully', () => {
    const nowIso = new Date().toISOString();
    const formattedNow = formatNotificationTime(nowIso);
    expect(formattedNow).toContain('ago');

    const pastIso = '2026-08-15T10:00:00Z';
    const formattedPast = formatNotificationTime(pastIso);
    expect(formattedPast).toBe('Aug 15, 2026');
  });
});
