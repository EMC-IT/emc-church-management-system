'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberSpiritualJourney } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface JourneyOverviewProps {
  journey: MemberSpiritualJourney;
  className?: string;
}

export function JourneyOverview({ journey, className }: JourneyOverviewProps) {
  const completedCount = journey.milestones.filter(
    (m) => m.status === 'completed' || m.status === 'Completed'
  ).length;

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {/* Current Stage Card */}
      <Card className="md:col-span-2">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground font-medium block">
              Current Membership Stage
            </span>
            <Badge variant="neutral" size="sm">
              Active Member
            </Badge>
          </div>

          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground">
              {journey.currentStage}
            </h3>
            {journey.currentStageDescription && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {journey.currentStageDescription}
              </p>
            )}
          </div>

          {/* Next Step if present */}
          {journey.nextStep && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 border border-border/40 text-xs">
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="font-semibold text-foreground block">
                  Next Step: {journey.nextStep.title}
                </span>
                <p className="text-muted-foreground line-clamp-1">
                  {journey.nextStep.description}
                </p>
              </div>

              {journey.nextStep.actionLabel && journey.nextStep.actionHref && (
                <Link href={journey.nextStep.actionHref} className="shrink-0">
                  <Button type="button" size="sm" variant="outline" className="h-8 text-xs font-medium">
                    {journey.nextStep.actionLabel}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats Card */}
      <Card className="flex flex-col justify-between">
        <CardContent className="p-5 sm:p-6 space-y-3">
          <span className="text-xs text-muted-foreground font-medium block">
            Journey Summary
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-semibold text-foreground">
                {journey.summary?.memberSinceYear || '2018'}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Completed Milestones</span>
              <span className="font-semibold text-foreground">{completedCount}</span>
            </div>

            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <span className="text-muted-foreground">Active Groups</span>
              <span className="font-semibold text-foreground">
                {journey.summary?.activeGroupsCount ?? 1}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Ministries</span>
              <span className="font-semibold text-foreground">
                {journey.summary?.activeMinistriesCount ?? 1}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
