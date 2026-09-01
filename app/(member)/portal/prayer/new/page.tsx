import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Button } from '@/components/ui/button';

export default function NewPrayerRequestPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Submit Prayer Request"
        description="Share your prayer need with church intercessors and the pastoral council."
        breadcrumbs={[
          { label: 'Prayer Requests', href: '/portal/prayer' },
          { label: 'New Request' },
        ]}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/portal/prayer" className="gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Requests</span>
            </Link>
          </Button>
        }
      />

      <MemberEmptyState
        icon={Heart}
        title="New Prayer Request Form"
        description="This form is being prepared for upcoming phases. You will soon be able to submit prayer requests with customizable privacy levels."
      />
    </div>
  );
}
