import { Suspense } from 'react';
import { Metadata } from 'next';
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
    <Suspense fallback={<PrayerSkeleton />}>
      <PrayerView initialRequests={requests} />
    </Suspense>
  );
}
