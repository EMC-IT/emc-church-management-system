import { UserPen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberAvatar } from '@/components/member/shared';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface ProfileHeaderProps {
  member: MemberProfile;
  onEditClick: () => void;
  className?: string;
}

export function ProfileHeader({ member, onEditClick, className }: ProfileHeaderProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MemberAvatar
            name={member.displayName || `${member.firstName} ${member.lastName}`}
            avatarUrl={member.avatarUrl}
            size="lg"
            className="h-16 w-16 sm:h-18 sm:w-18 border border-border/60"
          />

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
                {member.firstName} {member.lastName}
              </h2>
              <StatusBadge status={member.membershipStatus} size="sm" />
            </div>

            <p className="text-xs text-muted-foreground font-medium">
              {member.branch || member.campus}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditClick}
          className="gap-2 font-medium shrink-0 w-full sm:w-auto"
        >
          <UserPen className="h-4 w-4" aria-hidden="true" />
          <span>Edit Profile</span>
        </Button>
      </CardContent>
    </Card>
  );
}
