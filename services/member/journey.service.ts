import { MemberSpiritualJourney, MemberJourneyMilestone } from '@/lib/types/member';
import { mockMemberJourney } from '@/lib/mock/member';

export interface MemberJourneyService {
  getMyJourney(): Promise<MemberSpiritualJourney>;
  getMilestoneById(id: string): Promise<MemberJourneyMilestone | null>;
}

export class MockMemberJourneyService implements MemberJourneyService {
  async getMyJourney(): Promise<MemberSpiritualJourney> {
    return Promise.resolve({ ...mockMemberJourney });
  }

  async getMilestoneById(id: string): Promise<MemberJourneyMilestone | null> {
    const milestone = mockMemberJourney.milestones.find((m) => m.id === id);
    return Promise.resolve(milestone ? { ...milestone } : null);
  }
}

export const memberJourneyService = new MockMemberJourneyService();
