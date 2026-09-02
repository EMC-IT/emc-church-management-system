import { Suspense } from 'react';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { GroupsView, GroupsSkeleton } from '@/components/member/groups';
import { memberGroupsService } from '@/services/member';

export const metadata: Metadata = {
  title: 'My Groups | EMC Member Portal',
  description: 'View your connected cell groups, small groups, fellowship schedules, and leaders.',
};

export default async function MemberGroupsPage() {
  const [myGroups, availableGroups] = await Promise.all([
    memberGroupsService.getMyGroups(),
    memberGroupsService.getAvailableGroups(),
  ]);

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Groups"
        description="Stay connected with your neighborhood cell groups, fellowships, and small group communities."
        breadcrumbs={[{ label: 'My Groups' }]}
      />

      <Suspense fallback={<GroupsSkeleton />}>
        <GroupsView
          initialMyGroups={myGroups}
          initialAvailableGroups={availableGroups}
        />
      </Suspense>
    </div>
  );
}
