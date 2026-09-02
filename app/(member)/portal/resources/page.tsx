import { Suspense } from 'react';
import { Metadata } from 'next';
import { ResourcesView, ResourceSkeleton } from '@/components/member/resources';
import { memberResourcesService } from '@/services/member';

export const metadata: Metadata = {
  title: 'Resources & Library | EMC Member Portal',
  description:
    'Explore sermon notes, spiritual growth study guides, devotionals, teaching materials, and official church forms.',
};

export default async function MemberResourcesPage() {
  const [initialData, featuredResources] = await Promise.all([
    memberResourcesService.getResources({ page: 1, pageSize: 6 }),
    memberResourcesService.getFeaturedResources(),
  ]);

  return (
    <Suspense fallback={<ResourceSkeleton />}>
      <ResourcesView
        initialData={initialData}
        featuredResources={featuredResources}
      />
    </Suspense>
  );
}
