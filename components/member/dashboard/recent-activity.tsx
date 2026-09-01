import Link from 'next/link';
import {
  Activity,
  UserCheck,
  HandCoins,
  Heart,
  Calendar,
  Compass,
  HeartHandshake,
  UsersRound,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { MemberActivityItem } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RecentActivityProps {
  activities?: MemberActivityItem[];
  className?: string;
}

const activityIconMap: Record<string, LucideIcon> = {
  attendance: UserCheck,
  giving: HandCoins,
  prayer: Heart,
  event: Calendar,
  journey: Compass,
  care: HeartHandshake,
  group: UsersRound,
};

export function RecentActivity({
  activities = [],
  className,
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Recent Church Activity</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {displayActivities.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No recent activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-border/30">
          {displayActivities.map((activity) => {
            const Icon = activityIconMap[activity.category] || Activity;

            return (
              <div
                key={activity.id}
                className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground shrink-0 mt-0.5 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <h3 className="text-xs font-semibold text-foreground truncate">
                      {activity.title}
                    </h3>
                    {activity.details && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {activity.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {activity.relativeTime}
                  </span>
                  {activity.actionHref && (
                    <Link
                      href={activity.actionHref}
                      className="text-muted-foreground/60 hover:text-primary transition-colors p-1"
                      aria-label={`View details for ${activity.title}`}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      </CardContent>
    </Card>
  );
}

