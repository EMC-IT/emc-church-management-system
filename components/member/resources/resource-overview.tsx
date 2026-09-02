'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ResourceOverviewProps {
  totalResources: number;
  featuredCount: number;
  className?: string;
}

export function ResourceOverview({
  totalResources,
  featuredCount,
  className,
}: ResourceOverviewProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4', className)}>
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Total Resources
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {totalResources}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block">
            Featured Studies
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-primary">
            {featuredCount}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
