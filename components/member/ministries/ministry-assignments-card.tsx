'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberMinistry } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MinistryAssignmentsCardProps {
  ministries: MemberMinistry[];
  className?: string;
}

export function MinistryAssignmentsCard({ ministries, className }: MinistryAssignmentsCardProps) {
  const allAssignments = ministries.flatMap((m) =>
    (m.upcomingAssignments || []).map((asg) => ({
      ...asg,
      ministryName: m.name,
      ministryCategory: m.category,
    }))
  ).sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());

  if (allAssignments.length === 0) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Upcoming Service Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border/40">
        {allAssignments.map((asg) => {
          const dateObj = new Date(asg.serviceDate);
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div
              key={asg.id}
              className="flex items-start gap-4 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
            >
              {/* Functional Date Badge */}
              <div className="w-12 py-1.5 rounded-md bg-muted/70 border border-border/50 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block leading-tight">
                  {month}
                </span>
                <span className="text-base font-bold text-foreground block leading-none pt-0.5">
                  {day}
                </span>
              </div>

              {/* Assignment Details */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">{asg.serviceName}</h4>
                  <span className="text-xs text-muted-foreground font-medium">
                    {weekday} • Call Time: <strong className="text-foreground">{asg.callTime}</strong>
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground font-medium">{asg.role}</strong> ({asg.ministryName}) — {asg.venue}
                </p>

                {asg.notes && (
                  <p className="text-xs text-muted-foreground italic pt-0.5">
                    Note: {asg.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
