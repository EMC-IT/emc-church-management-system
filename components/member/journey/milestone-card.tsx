'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberJourneyMilestone } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MilestoneCardProps {
  milestone: MemberJourneyMilestone;
  onViewDetails: (milestone: MemberJourneyMilestone) => void;
  className?: string;
}

export function MilestoneCard({
  milestone,
  onViewDetails,
  className,
}: MilestoneCardProps) {
  const milestoneDate = milestone.date || milestone.completedDate;
  let formattedDate = 'Not recorded';
  if (milestoneDate) {
    try {
      formattedDate = format(parseISO(milestoneDate), 'MMMM d, yyyy');
    } catch {
      formattedDate = milestoneDate;
    }
  }

  const isCompleted =
    milestone.status === 'completed' || milestone.status === 'Completed';
  const isCurrent =
    milestone.status === 'current' || milestone.status === 'In Progress';

  return (
    <Card
      className={cn(
        'hover:border-primary/40 transition-colors',
        isCurrent && 'border-primary/30 bg-primary/5',
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">
              {milestone.type}
            </Badge>
            {isCompleted ? (
              <StatusBadge status="Completed" size="sm" />
            ) : isCurrent ? (
              <StatusBadge status="In Progress" size="sm" />
            ) : (
              <StatusBadge status="Upcoming" size="sm" />
            )}
          </div>

          <span className="text-xs text-muted-foreground font-medium">
            {formattedDate}
          </span>
        </div>

        <div className="space-y-1">
          <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground leading-snug">
            {milestone.title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {milestone.description}
          </p>
        </div>

        {/* Cross links if related to a group or ministry */}
        {milestone.relatedEntityType && (
          <div className="pt-1 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40">
            <span>
              Connected:{' '}
              <strong className="text-foreground font-medium">
                {milestone.relatedEntityName || milestone.relatedEntityType}
              </strong>
            </span>
            <Link
              href={
                milestone.relatedEntityType === 'group'
                  ? '/portal/groups'
                  : milestone.relatedEntityType === 'ministry'
                    ? '/portal/ministries'
                    : '/portal/events'
              }
              className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
            >
              <span>View {milestone.relatedEntityType === 'group' ? 'Group' : 'Ministry'}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1 flex items-center justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(milestone)}
            className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
