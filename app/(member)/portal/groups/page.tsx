import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { UsersRound } from 'lucide-react';

export default function MemberGroupsPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Cell Groups & Fellowships"
        description="Connect with neighborhood cell groups, view meeting schedules, and connect with cell leaders."
        breadcrumbs={[{ label: 'Groups' }]}
      />

      <MemberEmptyState
        icon={UsersRound}
        title="Cell Groups"
        description="This section is being prepared for upcoming phases. Group directories, meeting announcements, and cell fellowship management will be available soon."
      />
    </div>
  );
}
