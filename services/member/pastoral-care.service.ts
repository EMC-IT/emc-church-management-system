import {
  MemberPastoralCareRequest,
  CreatePastoralCareInput,
  PastoralCareFilterOptions,
} from '@/lib/types/member';
import { mockMemberPastoralCareList } from '@/lib/mock/member';

export interface MemberPastoralCareService {
  getMyPastoralCareRequests(
    filter?: PastoralCareFilterOptions
  ): Promise<MemberPastoralCareRequest[]>;
  getPastoralCareRequestById(id: string): Promise<MemberPastoralCareRequest | null>;
  requestPastoralCare(input: CreatePastoralCareInput): Promise<MemberPastoralCareRequest>;
  cancelPastoralCareRequest(id: string): Promise<{ success: boolean; message: string }>;
}

export class MockMemberPastoralCareService implements MemberPastoralCareService {
  private requests: MemberPastoralCareRequest[] = [...mockMemberPastoralCareList];

  async getMyPastoralCareRequests(
    filter?: PastoralCareFilterOptions
  ): Promise<MemberPastoralCareRequest[]> {
    let list = [...this.requests];

    if (!filter) return Promise.resolve(list);

    if (filter.status && filter.status !== 'all') {
      list = list.filter((r) => r.status === filter.status);
    }

    if (filter.category && filter.category !== 'all') {
      list = list.filter((r) => r.category === filter.category);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.category.toLowerCase().includes(q) ||
          (r.reason && r.reason.toLowerCase().includes(q)) ||
          (r.summaryNotes && r.summaryNotes.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(list);
  }

  async getPastoralCareRequestById(
    id: string
  ): Promise<MemberPastoralCareRequest | null> {
    const req = this.requests.find((r) => r.id === id);
    return Promise.resolve(req ? { ...req } : null);
  }

  async requestPastoralCare(
    input: CreatePastoralCareInput
  ): Promise<MemberPastoralCareRequest> {
    const newRequest: MemberPastoralCareRequest = {
      id: `pc-${Date.now()}`,
      category: input.category,
      preferredMode: input.preferredMode,
      preferredDate: input.preferredDate,
      preferredTimeSlot: input.preferredTimeSlot,
      status: 'Requested',
      urgency: input.isUrgent ? 'Urgent' : 'Standard',
      reason: input.reason,
      summaryNotes: input.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.requests = [newRequest, ...this.requests];
    return Promise.resolve(newRequest);
  }

  async cancelPastoralCareRequest(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Pastoral care request not found');
    }

    this.requests[index] = {
      ...this.requests[index],
      status: 'Cancelled',
      updatedAt: new Date().toISOString(),
    };

    return Promise.resolve({
      success: true,
      message: 'Your pastoral care request has been cancelled.',
    });
  }
}

export const memberPastoralCareService = new MockMemberPastoralCareService();
