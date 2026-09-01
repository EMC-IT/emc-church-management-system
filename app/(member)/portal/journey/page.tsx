import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Compass } from 'lucide-react';

export default function MemberJourneyPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Spiritual Journey"
        description="Track your discipleship pathway, foundational classes, water baptism, and ministry leadership progress."
        breadcrumbs={[{ label: 'My Journey' }]}
      />

      <MemberEmptyState
        icon={Compass}
        title="Spiritual Growth Pathway"
        description="This section is being prepared for upcoming phases. Discipleship tracking, class completions, and certificate views will be available soon."
      />
    </div>
  );
}
