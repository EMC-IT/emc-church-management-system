import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MemberPageHeader } from '@/components/member/shared';
import { Button } from '@/components/ui/button';
import { PrayerView, PrayerSkeleton } from '@/components/member/prayer';
import { memberPrayerService } from '@/services/member';

export const metadata: Metadata = {
  title: 'Prayer Requests | EMC Member Portal',
  description:
    'Share what is on your heart and receive prayer support from the pastoral team and prayer intercessors.',
};

export default async function MemberPrayerPage() {
  const requests = await memberPrayerService.getMyPrayerRequests();

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Prayer"
        description="Share what is on your heart. We're here to pray with you."
        breadcrumbs={[{ label: 'Prayer' }]}
        actions={
          <Link href="/portal/prayer/new">
            <Button size="sm" className="gap-1.5 font-medium">
              <Plus className="h-4 w-4" />
              <span>Submit Request</span>
            </Button>
          </Link>
        }
      />

      <Suspense fallback={<PrayerSkeleton />}>
        <PrayerView initialRequests={requests} />
      </Suspense>
    </div>
  );
}
