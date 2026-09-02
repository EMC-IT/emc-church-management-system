import { Suspense } from 'react';
import { Metadata } from 'next';
import { PastoralCareView, PastoralCareSkeleton } from '@/components/member/pastoral-care';
import { memberPastoralCareService } from '@/services/member';

export const metadata: Metadata = {
  title: 'Pastoral Care | EMC Member Portal',
  description:
    'Request confidential pastoral support, counseling, spiritual guidance, or visitation from the pastoral team.',
};

export default async function MemberPastoralCarePage() {
  const requests = await memberPastoralCareService.getMyPastoralCareRequests();

  return (
    <Suspense fallback={<PastoralCareSkeleton />}>
      <PastoralCareView initialRequests={requests} />
    </Suspense>
  );
}
