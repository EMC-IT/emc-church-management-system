import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MemberPageHeader } from '@/components/member/shared';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-6">
      <MemberPageHeader
        title="Pastoral Care"
        description="If you're going through something and would like pastoral support, you can request confidential care from the church."
        breadcrumbs={[{ label: 'Pastoral Care' }]}
        actions={
          <Link href="/portal/pastoral-care/request">
            <Button size="sm" className="gap-1.5 font-medium">
              <Plus className="h-4 w-4" />
              <span>Request Care</span>
            </Button>
          </Link>
        }
      />

      <Suspense fallback={<PastoralCareSkeleton />}>
        <PastoralCareView initialRequests={requests} />
      </Suspense>
    </div>
  );
}
