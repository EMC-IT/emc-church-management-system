'use client';

import { useState } from 'react';
import { MemberSpiritualJourney, MemberJourneyMilestone } from '@/lib/types/member';
import { JourneyOverview } from './journey-overview';
import { JourneyProgress } from './journey-progress';
import { JourneyTimeline } from './journey-timeline';
import { MilestoneDetailsDialog } from './milestone-details-dialog';
import { JourneyEmptyState } from './journey-empty-state';
import { cn } from '@/lib/utils';

export interface JourneyViewProps {
  initialJourney: MemberSpiritualJourney;
  className?: string;
}

export function JourneyView({ initialJourney, className }: JourneyViewProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<MemberJourneyMilestone | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleViewMilestoneDetails = (milestone: MemberJourneyMilestone) => {
    setSelectedMilestone(milestone);
    setIsDetailOpen(true);
  };

  const hasMilestones = initialJourney.milestones && initialJourney.milestones.length > 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Context Cards */}
      <JourneyOverview journey={initialJourney} />

      {/* Membership & Discipleship Progression Stepper */}
      {initialJourney.progressionStages && (
        <JourneyProgress stages={initialJourney.progressionStages} />
      )}

      {/* Main Milestones Timeline Section */}
      <section aria-label="Journey Timeline" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground font-heading">
            Spiritual Milestones & Church History
          </h2>
        </div>

        {hasMilestones ? (
          <JourneyTimeline
            milestones={initialJourney.milestones}
            onViewMilestoneDetails={handleViewMilestoneDetails}
          />
        ) : (
          <JourneyEmptyState />
        )}
      </section>

      {/* Milestone Details Dialog */}
      <MilestoneDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        milestone={selectedMilestone}
      />
    </div>
  );
}
