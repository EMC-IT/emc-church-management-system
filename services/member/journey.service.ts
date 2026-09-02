import {
  MemberSpiritualJourney,
  MemberJourneyMilestone,
  JourneyMilestoneType,
} from '@/lib/types/member';
import { mockMemberChurchJourney } from '@/lib/mock/member';

export interface JourneyMilestonesFilter {
  type?: JourneyMilestoneType | 'all';
  status?: 'completed' | 'current' | 'upcoming' | 'all';
}

export interface MemberJourneyService {
  getMyJourney(): Promise<MemberSpiritualJourney>;
  getMilestones(filter?: JourneyMilestonesFilter): Promise<MemberJourneyMilestone[]>;
  getMilestoneById(id: string): Promise<MemberJourneyMilestone | null>;
}

export class MockMemberJourneyService implements MemberJourneyService {
  private journey: MemberSpiritualJourney = { ...mockMemberChurchJourney };

  async getMyJourney(): Promise<MemberSpiritualJourney> {
    return Promise.resolve({ ...this.journey });
  }

  async getMilestones(filter?: JourneyMilestonesFilter): Promise<MemberJourneyMilestone[]> {
    let list = [...this.journey.milestones];

    if (!filter) return Promise.resolve(list);

    if (filter.type && filter.type !== 'all') {
      list = list.filter((m) => m.type === filter.type);
    }

    if (filter.status && filter.status !== 'all') {
      list = list.filter((m) => {
        const normalized = m.status.toLowerCase();
        return normalized === filter.status;
      });
    }

    return Promise.resolve(list);
  }

  async getMilestoneById(id: string): Promise<MemberJourneyMilestone | null> {
    const milestone = this.journey.milestones.find((m) => m.id === id);
    return Promise.resolve(milestone ? { ...milestone } : null);
  }
}

export const memberJourneyService = new MockMemberJourneyService();
