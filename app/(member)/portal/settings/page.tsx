import { MemberPageHeader, MemberEmptyState } from '@/components/member/shared';
import { Settings } from 'lucide-react';

export default function MemberSettingsPage() {
  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="Account Settings"
        description="Manage notification preferences, email & SMS alerts, password security, and directory privacy."
        breadcrumbs={[{ label: 'Settings' }]}
      />

      <MemberEmptyState
        icon={Settings}
        title="Settings & Preferences"
        description="This section is being prepared for upcoming phases. Account password updates, notification toggles, and privacy controls will be available soon."
      />
    </div>
  );
}
