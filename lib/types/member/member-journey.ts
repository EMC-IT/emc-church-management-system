export type MilestoneStatus =
  | 'Completed'
  | 'In Progress'
  | 'Upcoming'
  | 'Not Started'
  | 'completed'
  | 'current'
  | 'upcoming'
  | 'not_recorded';

export type JourneyMilestoneType =
  | 'Salvation'
  | 'Baptism'
  | 'Holy Spirit Baptism'
  | 'Confirmation'
  | 'Foundation Class'
  | 'Membership'
  | 'Group'
  | 'Ministry'
  | 'Leadership'
  | 'Service'
  | 'Other';

export type JourneyStageId =
  | 'new_convert'
  | 'follow_up'
  | 'foundation_class'
  | 'baptism'
  | 'full_member'
  | 'leader';

export interface JourneyProgressionStage {
  id: JourneyStageId;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
}

export interface MemberJourneyMilestone {
  id: string;
  title: string;
  description: string;
  type?: JourneyMilestoneType;
  status: MilestoneStatus;
  date?: string;
  completedDate?: string;
  targetDate?: string;
  stepNumber?: number;
  notes?: string;
  nextSteps?: string;
  certificateUrl?: string;
  relatedEntityType?: 'group' | 'ministry' | 'event';
  relatedEntityId?: string;
  relatedEntityName?: string;
  recordedBy?: string;
}

export interface NextStepSuggestion {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export interface JourneyInvolvementSummary {
  memberSinceYear: string;
  currentStage: string;
  completedMilestonesCount: number;
  activeGroupsCount: number;
  activeMinistriesCount: number;
}

export interface MemberSpiritualJourney {
  memberId: string;
  memberSince?: string;
  currentStage: string;
  currentStageDescription?: string;
  progressionStages?: JourneyProgressionStage[];
  milestones: MemberJourneyMilestone[];
  nextStep?: NextStepSuggestion;
  summary?: JourneyInvolvementSummary;
  overallProgressPercentage?: number;
}
