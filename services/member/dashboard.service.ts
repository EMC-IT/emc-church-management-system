import { MemberDashboardData } from '@/lib/types/member';
import { mockMemberDashboardData } from '@/lib/mock/member';

export interface MemberDashboardService {
  getDashboardData(): Promise<MemberDashboardData>;
}

export class MockMemberDashboardService implements MemberDashboardService {
  async getDashboardData(): Promise<MemberDashboardData> {
    // Return a clone of the mock dashboard data to prevent in-memory mutation side-effects
    return Promise.resolve({
      ...mockMemberDashboardData,
      profile: { ...mockMemberDashboardData.profile },
      attentionItems: [...mockMemberDashboardData.attentionItems],
      quickActions: [...mockMemberDashboardData.quickActions],
      upcomingEvents: [...mockMemberDashboardData.upcomingEvents],
      recentNotifications: [...mockMemberDashboardData.recentNotifications],
      recentActivity: [...mockMemberDashboardData.recentActivity],
      journey: {
        ...mockMemberDashboardData.journey,
        milestones: [...mockMemberDashboardData.journey.milestones],
      },
    });
  }
}

export const memberDashboardService = new MockMemberDashboardService();
