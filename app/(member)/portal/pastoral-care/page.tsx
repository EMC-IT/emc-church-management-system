import Link from 'next/link';
import { Plus, HeartHandshake } from 'lucide-react';
import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Button } from '@/components/ui/button';

export default function MemberPastoralCarePage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Pastoral Care & Counseling"
        description="Schedule confidential counseling, spiritual guidance, hospital visitations, or home prayer sessions."
        breadcrumbs={[{ label: 'Pastoral Care' }]}
        actions={
          <Button asChild size="sm">
            <Link href="/portal/pastoral-care/request" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Request Care Session</span>
            </Link>
          </Button>
        }
      />

      <MemberEmptyState
        icon={HeartHandshake}
        title="Pastoral Care Services"
        description="This section is being prepared for upcoming phases. Appointment booking, session history, and pastoral follow-ups will be available soon."
      />
    </div>
  );
}
