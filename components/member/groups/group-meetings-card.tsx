'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberGroup } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface GroupMeetingsCardProps {
  groups: MemberGroup[];
  className?: string;
}

export function GroupMeetingsCard({ groups, className }: GroupMeetingsCardProps) {
  const allUpcoming = groups.flatMap((group) =>
    (group.upcomingMeetings || []).map((meeting) => ({
      ...meeting,
      groupName: group.name,
      groupType: group.type,
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (allUpcoming.length === 0) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Upcoming Group Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 divide-y divide-border/40">
        {allUpcoming.map((meeting) => {
          const dateObj = new Date(meeting.date);
          const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const day = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
          const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div
              key={meeting.id}
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

              {/* Meeting Details */}
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground">{meeting.title}</h4>
                  <span className="text-xs text-muted-foreground font-medium">
                    {weekday} • {meeting.time}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground font-medium">{meeting.groupName}</strong> — {meeting.venue}
                </p>

                {meeting.topic && (
                  <p className="text-xs text-muted-foreground italic pt-0.5">
                    Topic: &ldquo;{meeting.topic}&rdquo;
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
