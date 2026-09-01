import { MemberGroup } from '@/lib/types/member';
import { mockMemberGroups } from '@/lib/mock/member';

export interface MemberGroupsService {
  getMyGroups(): Promise<MemberGroup[]>;
  getGroupById(id: string): Promise<MemberGroup | null>;
}

export class MockMemberGroupsService implements MemberGroupsService {
  async getMyGroups(): Promise<MemberGroup[]> {
    return Promise.resolve([...mockMemberGroups]);
  }

  async getGroupById(id: string): Promise<MemberGroup | null> {
    const group = mockMemberGroups.find((g) => g.id === id);
    return Promise.resolve(group ? { ...group } : null);
  }
}

export const memberGroupsService = new MockMemberGroupsService();
