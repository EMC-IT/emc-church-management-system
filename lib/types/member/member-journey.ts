export type MilestoneStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Not Started';

export interface MemberJourneyMilestone {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  status: MilestoneStatus;
  completedDate?: string;
  targetDate?: string;
  notes?: string;
  nextSteps?: string;
  certificateUrl?: string;
}

export interface MemberSpiritualJourney {
  memberId: string;
  currentStage: string;
  overallProgressPercentage: number;
  milestones: MemberJourneyMilestone[];
}
