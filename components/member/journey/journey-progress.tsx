'use client';

import { Check, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JourneyProgressionStage } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface JourneyProgressProps {
  stages?: JourneyProgressionStage[];
  className?: string;
}

export function JourneyProgress({ stages = [], className }: JourneyProgressProps) {
  if (!stages || stages.length === 0) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Discipleship & Membership Pathway
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="relative">
          {/* Progress Path on Large Screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-2 relative">
            {stages.map((stage, idx) => {
              const isCompleted = stage.status === 'completed';
              const isCurrent = stage.status === 'current';

              return (
                <div
                  key={stage.id}
                  className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 relative"
                >
                  {/* Step Icon / Dot */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors z-10',
                      isCompleted
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isCurrent
                          ? 'bg-background border-primary text-primary ring-4 ring-primary/20 font-bold'
                          : 'bg-muted text-muted-foreground border-border/60'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Stage Label & Details */}
                  <div className="space-y-0.5 min-w-0">
                    <p
                      className={cn(
                        'text-xs font-semibold leading-tight',
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                      )}
                    >
                      {stage.label}
                    </p>

                    <span className="text-[10px] text-muted-foreground block">
                      {isCompleted
                        ? 'Completed'
                        : isCurrent
                          ? 'Current Stage'
                          : 'Upcoming Step'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
