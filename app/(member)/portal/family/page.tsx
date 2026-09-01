import { Metadata } from 'next';
import { memberFamilyService } from '@/services/member';
import { FamilyView } from '@/components/member/family';
import { MemberPageHeader } from '@/components/member/shared';

export const metadata: Metadata = {
  title: 'My Family | Member Portal',
  description: 'View household unit members, spouses, children, and manage household records.',
};

export default async function MemberFamilyPage() {
  const family = await memberFamilyService.getFamily();

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Family"
        breadcrumbs={[{ label: 'My Family' }]}
      />

      <FamilyView initialFamily={family} />
    </div>
  );
}
