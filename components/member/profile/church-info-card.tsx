import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface ChurchInfoCardProps {
  member: MemberProfile;
  className?: string;
}

export function ChurchInfoCard({ member, className }: ChurchInfoCardProps) {
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

  const hasWaterBaptism = member.waterBaptism === 'Yes' || member.waterBaptism === true || !!member.baptismDate;
  const hasHolyGhostBaptism = member.holyGhostBaptism === 'Yes' || member.holyGhostBaptism === true;

  return (
    <Card className={cn('p-5', className)}>
      <h3 className="font-heading text-base font-semibold mb-4 text-foreground">
        Church Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
        <div className="space-y-2.5">
          <div className="flex">
            <span className="w-32 text-muted-foreground shrink-0">Branch:</span>
            <span className="font-medium text-foreground">{member.campus || '—'}</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground shrink-0">Cell Group:</span>
            <span className="font-medium text-foreground">{member.cellGroup || '—'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-32 text-muted-foreground shrink-0">Status:</span>
            <Badge variant="success" size="sm">
              {member.membershipStatus || 'Active Member'}
            </Badge>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground shrink-0">Member Since:</span>
            <span className="font-medium text-foreground">{formatDate(member.joinDate)}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex">
            <span className="w-36 text-muted-foreground shrink-0">Department / Ministry:</span>
            <span className="font-medium text-foreground">{member.primaryDepartment || 'None'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-36 text-muted-foreground shrink-0">Water Baptism:</span>
            <Badge variant={hasWaterBaptism ? 'success' : 'neutral'} size="sm">
              {hasWaterBaptism ? 'Yes' : 'No'}
            </Badge>
          </div>
          {member.baptismDate && (
            <div className="flex">
              <span className="w-36 text-muted-foreground shrink-0">Baptism Date:</span>
              <span className="font-medium text-foreground">{formatDate(member.baptismDate)}</span>
            </div>
          )}
          <div className="flex items-center">
            <span className="w-36 text-muted-foreground shrink-0">Holy Ghost Baptism:</span>
            <Badge variant={hasHolyGhostBaptism ? 'success' : 'neutral'} size="sm">
              {hasHolyGhostBaptism ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
