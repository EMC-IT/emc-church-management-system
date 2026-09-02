'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MemberPrayerRequest } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface PrayerOverviewProps {
  requests: MemberPrayerRequest[];
  className?: string;
}

export function PrayerOverview({ requests, className }: PrayerOverviewProps) {
  const activeCount = requests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Praying'
  ).length;
  const answeredCount = requests.filter((r) => r.status === 'Answered').length;

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4', className)}>
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Total Requests
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {requests.length}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Active Intercession
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-primary">
            {activeCount}
          </span>
        </CardContent>
      </Card>

      <Card className="col-span-2 sm:col-span-1">
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Answered Praises
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {answeredCount}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
