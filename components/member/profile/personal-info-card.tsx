import { Card } from '@/components/ui/card';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface PersonalInfoCardProps {
  member: MemberProfile;
  className?: string;
}

export function PersonalInfoCard({ member, className }: PersonalInfoCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return '—';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? '—' : `${age} years old`;
  };

  const fullAddress = [
    member.address.street,
    member.address.city,
    member.address.region,
    member.address.country,
  ]
    .filter(Boolean)
    .join(', ') || '—';

  return (
    <Card className={cn('p-5', className)}>
      <h3 className="font-heading text-base font-semibold mb-4 text-foreground">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div className="space-y-2.5">
          <div className="flex">
            <span className="w-28 text-muted-foreground shrink-0">Full Name:</span>
            <span className="font-medium text-foreground">{member.firstName} {member.lastName}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-muted-foreground shrink-0">Gender:</span>
            <span className="font-medium text-foreground">{member.gender || '—'}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-muted-foreground shrink-0">Date of Birth:</span>
            <span className="font-medium text-foreground">{formatDate(member.dateOfBirth)}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-muted-foreground shrink-0">Age:</span>
            <span className="font-medium text-foreground">{calculateAge(member.dateOfBirth)}</span>
          </div>
          <div className="flex">
            <span className="w-28 text-muted-foreground shrink-0">Marital Status:</span>
            <span className="font-medium text-foreground">{member.maritalStatus || '—'}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Contact 1:</span>
            <span className="font-medium text-foreground">{member.phone || '—'}</span>
          </div>
          {member.alternatePhone && (
            <div className="flex">
              <span className="w-24 text-muted-foreground shrink-0">Contact 2:</span>
              <span className="font-medium text-foreground">{member.alternatePhone}</span>
            </div>
          )}
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Email:</span>
            <span className="font-medium text-foreground truncate">{member.email || '—'}</span>
          </div>
          <div className="flex">
            <span className="w-24 text-muted-foreground shrink-0">Address:</span>
            <span className="font-medium text-foreground">{fullAddress}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
