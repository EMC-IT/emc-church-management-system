import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { HandCoins } from 'lucide-react';

export default function MemberGivingPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Giving"
        description="View tithes, offerings, special building pledges, and download annual giving tax statements."
        breadcrumbs={[{ label: 'My Giving' }]}
      />

      <MemberEmptyState
        icon={HandCoins}
        title="Giving & Stewardship"
        description="This section is being prepared for upcoming phases. Contribution history, giving statements, and receipts will be available soon."
      />
    </div>
  );
}
