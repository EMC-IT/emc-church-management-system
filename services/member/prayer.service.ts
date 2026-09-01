import { MemberPrayerRequest, CreatePrayerRequestInput } from '@/lib/types/member';
import { mockMemberPrayerRequests } from '@/lib/mock/member';

export interface MemberPrayerService {
  getMyPrayerRequests(): Promise<MemberPrayerRequest[]>;
  createPrayerRequest(input: CreatePrayerRequestInput): Promise<MemberPrayerRequest>;
}

export class MockMemberPrayerService implements MemberPrayerService {
  private requests: MemberPrayerRequest[] = [...mockMemberPrayerRequests];

  async getMyPrayerRequests(): Promise<MemberPrayerRequest[]> {
    return Promise.resolve([...this.requests]);
  }

  async createPrayerRequest(input: CreatePrayerRequestInput): Promise<MemberPrayerRequest> {
    const newRequest: MemberPrayerRequest = {
      id: `pr-${Date.now()}`,
      title: input.title,
      category: input.category,
      description: input.description,
      privacy: input.privacy,
      isUrgent: input.isUrgent,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pastoralNotesCount: 0,
    };
    this.requests = [newRequest, ...this.requests];
    return Promise.resolve(newRequest);
  }
}

export const memberPrayerService = new MockMemberPrayerService();
