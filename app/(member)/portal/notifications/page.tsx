import { Suspense } from 'react';
import { Metadata } from 'next';
import {
  NotificationsView,
  NotificationSkeleton,
} from '@/components/member/notifications';
import {
  memberNotificationsService,
  memberAnnouncementsService,
} from '@/services/member';

export const metadata: Metadata = {
  title: 'Notifications & Communications | EMC Member Portal',
  description:
    'Stay up to date with personal notifications, event confirmations, giving receipts, care appointments, and church announcements.',
};

export default async function MemberNotificationsPage() {
  const [notifications, announcements] = await Promise.all([
    memberNotificationsService.getNotifications(),
    memberAnnouncementsService.getAnnouncements(),
  ]);

  return (
    <Suspense fallback={<NotificationSkeleton />}>
      <NotificationsView
        initialNotifications={notifications}
        initialAnnouncements={announcements}
      />
    </Suspense>
  );
}
