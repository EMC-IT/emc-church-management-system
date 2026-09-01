import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MemberSpiritualJourney } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export interface ChurchJourneyProps {
  journey?: MemberSpiritualJourney;
  className?: string;
}

export function ChurchJourney({ journey, className }: ChurchJourneyProps) {
  if (!journey || !journey.milestones || journey.milestones.length === 0) {
    return null;
  }

  const milestones = journey.milestones;

  return (
    <Card className={className}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">My Church Journey</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current Stage: <strong className="text-foreground font-medium">{journey.currentStage}</strong>
            </p>
          </div>

          <Link
            href="/portal/journey"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 self-start sm:self-center"
          >
            <span>View my journey</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {/* Discipleship Milestone Progression Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {milestones.map((ms) => {
            const isCompleted = ms.status === 'Completed';
            const isInProgress = ms.status === 'In Progress';

            return (
              <div
                key={ms.id}
                className={cn(
                  'p-3 rounded-lg border flex flex-col justify-between space-y-2 transition-all',
                  isCompleted && 'bg-card border-border/60',
                  isInProgress && 'bg-primary/[0.03] border-primary/40 ring-1 ring-primary/20',
                  !isCompleted && !isInProgress && 'bg-muted/10 border-border/30 opacity-70'
                )}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Step {ms.stepNumber}
                  </span>
                  <StatusBadge status={ms.status} size="sm" />
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-xs font-semibold text-foreground line-clamp-2">
                    {ms.title}
                  </h3>
                  {ms.completedDate && (
                    <p className="text-[10px] text-muted-foreground">
                      Completed: {ms.completedDate}
                    </p>
                  )}
                  {ms.targetDate && (
                    <p className="text-[10px] text-primary font-medium">
                      Target: {ms.targetDate}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
