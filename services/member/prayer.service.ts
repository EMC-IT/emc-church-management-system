import {
  MemberPrayerRequest,
  CreatePrayerRequestInput,
  PrayerFilterOptions,
} from '@/lib/types/member';
import { mockMemberPrayerRequestsList } from '@/lib/mock/member';

export interface MemberPrayerService {
  getMyPrayerRequests(filter?: PrayerFilterOptions): Promise<MemberPrayerRequest[]>;
  getPrayerRequestById(id: string): Promise<MemberPrayerRequest | null>;
  createPrayerRequest(input: CreatePrayerRequestInput): Promise<MemberPrayerRequest>;
  markPrayerAnswered(
    id: string,
    testimony?: string
  ): Promise<{ success: boolean; message: string; request: MemberPrayerRequest }>;
  deletePrayerRequest(id: string): Promise<{ success: boolean; message: string }>;
}

export class MockMemberPrayerService implements MemberPrayerService {
  private requests: MemberPrayerRequest[] = [...mockMemberPrayerRequestsList];

  async getMyPrayerRequests(filter?: PrayerFilterOptions): Promise<MemberPrayerRequest[]> {
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
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(list);
  }

  async getPrayerRequestById(id: string): Promise<MemberPrayerRequest | null> {
    const req = this.requests.find((r) => r.id === id);
    return Promise.resolve(req ? { ...req } : null);
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

  async markPrayerAnswered(
    id: string,
    testimony?: string
  ): Promise<{ success: boolean; message: string; request: MemberPrayerRequest }> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Prayer request not found');
    }

    const updated: MemberPrayerRequest = {
      ...this.requests[index],
      status: 'Answered',
      answeredDate: new Date().toISOString(),
      testimony: testimony || this.requests[index].testimony,
      updatedAt: new Date().toISOString(),
    };

    this.requests[index] = updated;

    return Promise.resolve({
      success: true,
      message: 'Prayer request marked as answered. Praise God!',
      request: updated,
    });
  }

  async deletePrayerRequest(id: string): Promise<{ success: boolean; message: string }> {
    const index = this.requests.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new Error('Prayer request not found');
    }

    this.requests = this.requests.filter((r) => r.id !== id);

    return Promise.resolve({
      success: true,
      message: 'Prayer request removed successfully.',
    });
  }
}

export const memberPrayerService = new MockMemberPrayerService();
