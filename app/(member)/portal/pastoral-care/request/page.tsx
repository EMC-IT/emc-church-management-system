import Link from 'next/link';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Button } from '@/components/ui/button';

export default function RequestPastoralCarePage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Request Pastoral Care"
        description="Submit a request for counseling, hospital visitation, bereavement support, or spiritual direction."
        breadcrumbs={[
          { label: 'Pastoral Care', href: '/portal/pastoral-care' },
          { label: 'Request Session' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/portal/pastoral-care" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Pastoral Care</span>
            </Link>
          </Button>
        }
      />

      <MemberEmptyState
        icon={HeartHandshake}
        title="Care Request Booking"
        description="This booking form is being prepared for upcoming phases. You will soon be able to select counseling categories, preferred meeting modes, and timeslots."
      />
    </div>
  );
}
