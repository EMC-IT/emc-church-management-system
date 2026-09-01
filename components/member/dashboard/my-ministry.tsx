import Link from 'next/link';
import { Clock, User, ArrowRight, Shield } from 'lucide-react';
import { MemberMinistry } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { MemberStatus } from '@/components/member/shared/member-status';
import { cn } from '@/lib/utils';

export interface MyMinistryProps {
  ministry?: MemberMinistry | null;
  className?: string;
}

export function MyMinistry({ ministry, className }: MyMinistryProps) {
  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">My Ministry</CardTitle>
          <Link
            href="/portal/ministries"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>{ministry ? 'View Ministry' : 'Explore'}</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {!ministry ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
            <p>You&apos;re not currently serving in a church ministry.</p>
            <Link
              href="/portal/ministries"
              className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
            >
              <span>Explore ministry opportunities</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-foreground truncate">
                {ministry.name}
              </h3>
              <MemberStatus status={ministry.myRole} />
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Category: <strong className="text-foreground font-medium">{ministry.category}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="truncate">Ministry Lead: <strong className="text-foreground font-medium">{ministry.leadPastorOrLeader}</strong></span>
              </div>

              {ministry.meetingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span className="truncate">Schedule: <strong className="text-foreground font-medium">{ministry.meetingTime}</strong></span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/ministries"
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-between w-full"
        >
          <span>Volunteer teams & schedules</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
