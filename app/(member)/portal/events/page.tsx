import { Suspense } from 'react';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { EventsView, EventsSkeleton } from '@/components/member/events';
import { memberEventsService } from '@/services/member';

export const metadata: Metadata = {
  title: 'Events & Church Calendar | EMC Member Portal',
  description:
    'Discover upcoming conferences, services, seminars, and manage your event tickets and registrations.',
};

export default async function MemberEventsPage() {
  const [events, featuredEvents, registrations] = await Promise.all([
    memberEventsService.getEvents(),
    memberEventsService.getFeaturedEvents(),
    memberEventsService.getMyRegistrations(),
  ]);

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Events"
        description="Discover conferences, services, fellowships and other upcoming events at EMC."
        breadcrumbs={[{ label: 'Events' }]}
      />

      <Suspense fallback={<EventsSkeleton />}>
        <EventsView
          initialEvents={events}
          initialFeaturedEvents={featuredEvents}
          initialRegistrations={registrations}
        />
      </Suspense>
    </div>
  );
}
