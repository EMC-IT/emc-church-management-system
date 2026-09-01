import { Metadata } from 'next';
import { memberProfileService } from '@/services/member';
import { ProfileView } from '@/components/member/profile';
import { MemberPageHeader } from '@/components/member/shared';

export const metadata: Metadata = {
  title: 'My Profile | Member Portal',
  description: 'View and manage personal details, contact information, and church affiliations.',
};

export default async function MemberProfilePage() {
  const member = await memberProfileService.getCurrentProfile();

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Profile"
        breadcrumbs={[{ label: 'My Profile' }]}
      />

      <ProfileView initialMember={member} />
    </div>
  );
}
