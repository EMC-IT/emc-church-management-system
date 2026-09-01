import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { BookOpen } from 'lucide-react';

export default function MemberResourcesPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Member Resources & Library"
        description="Access sermon notes, spiritual growth study guides, weekly bulletins, devotionals, and church forms."
        breadcrumbs={[{ label: 'Resources' }]}
      />

      <MemberEmptyState
        icon={BookOpen}
        title="Resource Library"
        description="This section is being prepared for upcoming phases. Document downloads, weekly bulletins, and discipleship materials will be available soon."
      />
    </div>
  );
}
