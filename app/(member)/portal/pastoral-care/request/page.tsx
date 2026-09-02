import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { PastoralCareRequestForm } from '@/components/member/pastoral-care';

export const metadata: Metadata = {
  title: 'Request Pastoral Care | EMC Member Portal',
  description: 'Submit a confidential request for pastoral counseling, hospital visitation, or spiritual guidance.',
};

export default function RequestPastoralCarePage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Request Pastoral Care"
        breadcrumbs={[
          { label: 'Pastoral Care', href: '/portal/pastoral-care' },
          { label: 'Request Care' },
        ]}
      />

      <PastoralCareRequestForm />
    </div>
  );
}
