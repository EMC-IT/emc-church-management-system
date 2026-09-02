import { Suspense } from 'react';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { JourneyView, JourneySkeleton } from '@/components/member/journey';
import { memberJourneyService } from '@/services/member';

export const metadata: Metadata = {
  title: 'My Church Journey | EMC Member Portal',
  description:
    'Reflect on your spiritual pathway, discipleship milestones, church involvement, and growth at EMC.',
};

export default async function MemberJourneyPage() {
  const journey = await memberJourneyService.getMyJourney();

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Church Journey"
        description="Reflect on your journey, milestones and growth at EMC."
        breadcrumbs={[{ label: 'My Journey' }]}
      />

      <Suspense fallback={<JourneySkeleton />}>
        <JourneyView initialJourney={journey} />
      </Suspense>
    </div>
  );
}
