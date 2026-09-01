import Link from 'next/link';
import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft } from 'lucide-react';

export default async function MemberEventDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Event Details"
        description={`Viewing details for event: ${id}`}
        breadcrumbs={[
          { label: 'Events', href: '/portal/events' },
          { label: id },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/portal/events" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Events</span>
            </Link>
          </Button>
        }
      />

      <MemberEmptyState
        icon={Calendar}
        title="Event Information"
        description="This event details section is being prepared for upcoming phases. Detailed schedules, speaker profiles, and registration info will be available soon."
      />
    </div>
  );
}
