import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { PrayerRequestForm } from '@/components/member/prayer';

export const metadata: Metadata = {
  title: 'New Prayer Request | EMC Member Portal',
  description: 'Submit a new confidential prayer request to the church pastoral intercessors.',
};

export default function NewPrayerRequestPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="New Prayer Request"
        breadcrumbs={[
          { label: 'Prayer', href: '/portal/prayer' },
          { label: 'New Request' },
        ]}
      />

      <PrayerRequestForm />
    </div>
  );
}
