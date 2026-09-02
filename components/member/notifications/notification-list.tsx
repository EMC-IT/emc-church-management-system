'use client';

import { MemberNotification, MemberAnnouncement } from '@/lib/types/member';
import { NotificationItem } from './notification-item';
import { AnnouncementItem } from './announcement-item';
import { cn } from '@/lib/utils';

export interface NotificationListProps {
  notifications?: MemberNotification[];
  announcements?: MemberAnnouncement[];
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

export function NotificationList({
  notifications = [],
  announcements = [],
  onMarkAsRead,
  className,
}: NotificationListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Announcements */}
      {announcements.map((announcement) => (
        <AnnouncementItem
          key={announcement.id}
          announcement={announcement}
        />
      ))}

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
