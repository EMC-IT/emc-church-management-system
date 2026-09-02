import {
  MemberMinistry,
  DiscoverableMinistry,
  MemberMinistryFilter,
} from '@/lib/types/member';
import { mockMemberMinistries, mockDiscoverableMinistries } from '@/lib/mock/member';
import { ServeInterestFormData } from '@/lib/validation/member';

export interface MemberMinistriesService {
  getMyMinistries(): Promise<MemberMinistry[]>;
  getMinistryById(id: string): Promise<MemberMinistry | null>;
  getAvailableMinistries(filter?: MemberMinistryFilter): Promise<DiscoverableMinistry[]>;
  submitMinistryInterest(
    data: ServeInterestFormData
  ): Promise<{ success: boolean; message: string }>;
}

export class MockMemberMinistriesService implements MemberMinistriesService {
  private myMinistries: MemberMinistry[] = [...mockMemberMinistries];
  private availableMinistries: DiscoverableMinistry[] = [...mockDiscoverableMinistries];

  async getMyMinistries(): Promise<MemberMinistry[]> {
    return Promise.resolve([...this.myMinistries]);
  }

  async getMinistryById(id: string): Promise<MemberMinistry | null> {
    const ministry = this.myMinistries.find((m) => m.id === id);
    return Promise.resolve(ministry ? { ...ministry } : null);
  }

  async getAvailableMinistries(
    filter?: MemberMinistryFilter
  ): Promise<DiscoverableMinistry[]> {
    let filtered = [...this.availableMinistries];

    if (!filter) {
      return Promise.resolve(filtered);
    }

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter((m) => m.category === filter.category);
    }

    const branchFilter = filter.branch || filter.campus;
    if (branchFilter && branchFilter !== 'all') {
      filtered = filtered.filter((m) => (m.branch || m.campus) === branchFilter);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.leaderName.toLowerCase().includes(q) ||
          m.openRoles.some((r) => r.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(filtered);
  }

  async submitMinistryInterest(
    data: ServeInterestFormData
  ): Promise<{ success: boolean; message: string }> {
    const targetMinistry = this.availableMinistries.find((m) => m.id === data.ministryId);
    const ministryName = targetMinistry ? targetMinistry.name : 'the ministry';

    return Promise.resolve({
      success: true,
      message: `Your interest to serve in ${ministryName} (${data.areaOfInterest}) has been submitted to ministry leadership.`,
    });
  }
}

export const memberMinistriesService = new MockMemberMinistriesService();
