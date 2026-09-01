import { Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberAvatar } from '@/components/member/shared';
import { MemberFamilyMember } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface FamilyMemberCardProps {
  member: MemberFamilyMember;
  isCurrentUser?: boolean;
  className?: string;
}

export function FamilyMemberCard({
  member,
  isCurrentUser = false,
  className,
}: FamilyMemberCardProps) {
  const fullName = `${member.firstName} ${member.lastName}`;

  const formattedDob = member.dateOfBirth
    ? new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(member.dateOfBirth))
    : null;

  return (
    <Card className={cn('hover:border-primary/40 transition-colors', className)}>
      <CardContent className="p-5 space-y-4">
        {/* Top identity row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <MemberAvatar
              name={fullName}
              avatarUrl={member.avatarUrl}
              size="md"
              className="border border-border/60"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-foreground truncate font-heading">
                  {fullName}
                </h3>
                {isCurrentUser && (
                  <Badge variant="primary" size="sm" className="text-[10px] py-0 px-1.5 font-bold">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {member.relationship}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {member.isRegisteredMember ? (
              <StatusBadge status="Active" size="sm" />
            ) : (
              <Badge variant="neutral" size="sm">
                Non-Member
              </Badge>
            )}
          </div>
        </div>

        {/* Contact and demographic details */}
        <div className="space-y-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
          {member.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <span className="text-foreground/90 font-medium">{member.phone}</span>
            </div>
          )}

          {member.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <span className="text-foreground/90 font-medium truncate">{member.email}</span>
            </div>
          )}

          {formattedDob && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" aria-hidden="true" />
              <span>Born {formattedDob}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
