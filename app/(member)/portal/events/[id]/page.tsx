import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { EventDetails } from '@/components/member/events';
import { memberEventsService } from '@/services/member';

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await memberEventsService.getEventById(id);

  if (!event) {
    return {
      title: 'Event Not Found | EMC Member Portal',
    };
  }

  return {
    title: `${event.title} | EMC Member Portal`,
    description: event.description,
  };
}

export default async function MemberEventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const [event, registration] = await Promise.all([
    memberEventsService.getEventById(id),
    memberEventsService.getMyRegistrationForEvent(id),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title={event.title}
        breadcrumbs={[
          { label: 'Events', href: '/portal/events' },
          { label: event.title },
        ]}
      />

      <EventDetails
        event={event}
        registration={registration}
      />
    </div>
  );
}
