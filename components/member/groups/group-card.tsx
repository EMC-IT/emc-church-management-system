'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberGroup } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface GroupCardProps {
  group: MemberGroup;
  onViewDetails: (group: MemberGroup) => void;
  className?: string;
}

export function GroupCard({ group, onViewDetails, className }: GroupCardProps) {
  const initials = group.leader.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn('flex flex-col justify-between hover:border-primary/40 transition-colors', className)}>
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="neutral" size="sm">
              {group.type}
            </Badge>
            <h3 className="font-heading font-semibold text-base text-foreground leading-snug">
              {group.name}
            </h3>
          </div>
          <StatusBadge status={group.membershipStatus} size="sm" />
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {group.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3 flex-1">
        {/* Leader Info */}
        <div className="flex items-center gap-2.5 pt-1">
          <Avatar className="h-7 w-7">
            {group.leader.avatarUrl && <AvatarImage src={group.leader.avatarUrl} alt={group.leader.name} />}
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <span className="text-[11px] text-muted-foreground block leading-none">
              {group.leader.role}
            </span>
            <span className="text-xs font-medium text-foreground truncate block mt-0.5">
              {group.leader.name}
            </span>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="space-y-1 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground shrink-0">Meeting:</span>
            <span className="font-medium text-foreground text-right truncate">
              {group.schedule.dayOfWeek} • {group.schedule.time}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground shrink-0">Venue:</span>
            <span className="text-right truncate">{group.schedule.venue}</span>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-muted-foreground shrink-0">Members:</span>
            <span className="text-right">{group.membersCount} active</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          My Role: <strong className="text-foreground font-medium">{group.myRole}</strong>
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(group)}
          className="h-8 text-xs font-medium"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
