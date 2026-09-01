import Link from 'next/link';
import { MapPin, Clock, User, ArrowRight } from 'lucide-react';
import { MemberGroup } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MemberStatus } from '@/components/member/shared/member-status';
import { cn } from '@/lib/utils';

export interface MyGroupProps {
  group?: MemberGroup | null;
  className?: string;
}

export function MyGroup({ group, className }: MyGroupProps) {
  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">My Cell Group</CardTitle>
          <Link
            href="/portal/groups"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>{group ? 'View Group' : 'Explore'}</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {!group ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
            <p>You&apos;re not currently part of a cell fellowship.</p>
            <Link
              href="/portal/groups"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              <span>Find a cell group near you</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-foreground truncate">
                {group.name}
              </h3>
              <MemberStatus status={group.role} />
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Leader: <strong className="text-foreground font-medium">{group.leaderName}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Schedule: <strong className="text-foreground font-medium">{group.meetingSchedule}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Venue: <strong className="text-foreground font-medium">{group.meetingLocation}</strong></span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/groups"
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-between w-full"
        >
          <span>Cell directories & fellowships</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
