import { Suspense } from 'react';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { MinistriesView, MinistriesSkeleton } from '@/components/member/ministries';
import { memberMinistriesService } from '@/services/member';

export const metadata: Metadata = {
  title: 'My Ministries | EMC Member Portal',
  description: 'View your ministry teams, assigned service roles, volunteer rosters, and service schedules.',
};

export default async function MemberMinistriesPage() {
  const [myMinistries, availableMinistries] = await Promise.all([
    memberMinistriesService.getMyMinistries(),
    memberMinistriesService.getAvailableMinistries(),
  ]);

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Ministries"
        description="View your active ministry roles, service schedules, and explore new volunteer opportunities."
        breadcrumbs={[{ label: 'My Ministries' }]}
      />

      <Suspense fallback={<MinistriesSkeleton />}>
        <MinistriesView
          initialMyMinistries={myMinistries}
          initialAvailableMinistries={availableMinistries}
        />
      </Suspense>
    </div>
  );
}
