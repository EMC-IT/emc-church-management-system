import { MemberPastoralCareRequest, CreatePastoralCareInput } from '@/lib/types/member';
import { mockMemberPastoralCare } from '@/lib/mock/member';

export interface MemberPastoralCareService {
  getMyPastoralCareRequests(): Promise<MemberPastoralCareRequest[]>;
  requestPastoralCare(input: CreatePastoralCareInput): Promise<MemberPastoralCareRequest>;
}

export class MockMemberPastoralCareService implements MemberPastoralCareService {
  private requests: MemberPastoralCareRequest[] = [...mockMemberPastoralCare];

  async getMyPastoralCareRequests(): Promise<MemberPastoralCareRequest[]> {
    return Promise.resolve([...this.requests]);
  }

  async requestPastoralCare(input: CreatePastoralCareInput): Promise<MemberPastoralCareRequest> {
    const newRequest: MemberPastoralCareRequest = {
      id: `pc-${Date.now()}`,
      category: input.category,
      preferredMode: input.preferredMode,
      preferredDate: input.preferredDate,
      preferredTimeSlot: input.preferredTimeSlot,
      status: 'Requested',
      urgency: input.isUrgent ? 'Urgent' : 'Standard',
      summaryNotes: input.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requests = [newRequest, ...this.requests];
    return Promise.resolve(newRequest);
  }
}

export const memberPastoralCareService = new MockMemberPastoralCareService();
