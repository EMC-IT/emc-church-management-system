import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Calendar } from 'lucide-react';

export default function MemberEventsPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Church Events & Conferences"
        description="Browse upcoming services, special conventions, seminars, and manage your tickets and registrations."
        breadcrumbs={[{ label: 'Events' }]}
      />

      <MemberEmptyState
        icon={Calendar}
        title="Events & Registrations"
        description="This section is being prepared for upcoming phases. Event calendars, ticket booking, and registration tracking will be available soon."
      />
    </div>
  );
}
