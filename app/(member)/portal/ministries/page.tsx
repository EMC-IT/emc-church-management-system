import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Building2 } from 'lucide-react';

export default function MemberMinistriesPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Ministries & Volunteer Teams"
        description="Explore departmental teams, view active assignments, and join ministry service opportunities."
        breadcrumbs={[{ label: 'Ministries' }]}
      />

      <MemberEmptyState
        icon={Building2}
        title="Church Ministries"
        description="This section is being prepared for upcoming phases. Ministry schedules, volunteer assignments, and team directories will be available soon."
      />
    </div>
  );
}
