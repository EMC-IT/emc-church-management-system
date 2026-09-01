import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Bell } from 'lucide-react';

export default function MemberNotificationsPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Notifications & Updates"
        description="Stay updated with personal announcements, event registrations, giving receipts, and care updates."
        breadcrumbs={[{ label: 'Notifications' }]}
      />

      <MemberEmptyState
        icon={Bell}
        title="Notification Center"
        description="This section is being prepared for upcoming phases. Complete notification history and filter options will be available soon."
      />
    </div>
  );
}
