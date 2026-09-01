import Link from 'next/link';
import { Plus, Heart } from 'lucide-react';
import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Button } from '@/components/ui/button';

export default function MemberPrayerPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Prayer Requests"
        description="Submit confidential prayer requests to the pastoral intercessory team and share testimonies of answered prayers."
        breadcrumbs={[{ label: 'Prayer Requests' }]}
        actions={
          <Button asChild size="sm">
            <Link href="/portal/prayer/new" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>New Prayer Request</span>
            </Link>
          </Button>
        }
      />

      <MemberEmptyState
        icon={Heart}
        title="Prayer Requests"
        description="This section is being prepared for upcoming phases. Prayer request submission, status tracking, and praise testimonies will be available soon."
      />
    </div>
  );
}
