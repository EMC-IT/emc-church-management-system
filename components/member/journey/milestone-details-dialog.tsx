'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Calendar, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberJourneyMilestone } from '@/lib/types/member';

export interface MilestoneDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  milestone: MemberJourneyMilestone | null;
}

export function MilestoneDetailsDialog({
  open,
  onOpenChange,
  milestone,
}: MilestoneDetailsDialogProps) {
  if (!milestone) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 mb-1">
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
          <DialogTitle className="text-lg font-bold">{milestone.title}</DialogTitle>
          <DialogDescription className="text-xs">
            Recorded date: {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Milestone Description */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              About Milestone
            </span>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
              {milestone.description}
            </p>
          </div>

          {/* Notes if recorded */}
          {milestone.notes && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
              <span className="font-semibold text-foreground text-[11px] block">
                Milestone Notes
              </span>
              <p className="text-muted-foreground text-xs">{milestone.notes}</p>
            </div>
          )}

          {/* Next Steps if present */}
          {milestone.nextSteps && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
              <span className="font-semibold text-primary text-[11px] block">
                Next Steps
              </span>
              <p className="text-muted-foreground text-xs">{milestone.nextSteps}</p>
            </div>
          )}

          {/* Connected Group / Ministry */}
          {milestone.relatedEntityType && (
            <div className="p-3 rounded-lg border border-border/40 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Connected Entity</span>
                <span className="font-medium text-foreground">
                  {milestone.relatedEntityName || milestone.relatedEntityType}
                </span>
              </div>
              <Link
                href={
                  milestone.relatedEntityType === 'group'
                    ? '/portal/groups'
                    : milestone.relatedEntityType === 'ministry'
                      ? '/portal/ministries'
                      : '/portal/events'
                }
                onClick={() => onOpenChange(false)}
              >
                <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-medium">
                  <span>Open {milestone.relatedEntityType === 'group' ? 'Group' : 'Ministry'}</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border/40">
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
