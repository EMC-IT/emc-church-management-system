import {
  MemberGroup,
  DiscoverableGroup,
  MemberGroupFilter,
} from '@/lib/types/member';
import { mockMemberGroups, mockDiscoverableGroups } from '@/lib/mock/member';
import { JoinGroupFormData } from '@/lib/validation/member';

export interface MemberGroupsService {
  getMyGroups(): Promise<MemberGroup[]>;
  getGroupById(id: string): Promise<MemberGroup | null>;
  getAvailableGroups(filter?: MemberGroupFilter): Promise<DiscoverableGroup[]>;
  requestToJoinGroup(data: JoinGroupFormData): Promise<{ success: boolean; message: string }>;
}

export class MockMemberGroupsService implements MemberGroupsService {
  private myGroups: MemberGroup[] = [...mockMemberGroups];
  private availableGroups: DiscoverableGroup[] = [...mockDiscoverableGroups];

  async getMyGroups(): Promise<MemberGroup[]> {
    return Promise.resolve([...this.myGroups]);
  }

  async getGroupById(id: string): Promise<MemberGroup | null> {
    const group = this.myGroups.find((g) => g.id === id);
    return Promise.resolve(group ? { ...group } : null);
  }

  async getAvailableGroups(filter?: MemberGroupFilter): Promise<DiscoverableGroup[]> {
    let filtered = [...this.availableGroups];

    if (!filter) {
      return Promise.resolve(filtered);
    }

    if (filter.type && filter.type !== 'all') {
      filtered = filtered.filter((g) => g.type === filter.type);
    }

    const branchFilter = filter.branch || filter.campus;
    if (branchFilter && branchFilter !== 'all') {
      filtered = filtered.filter((g) => (g.branch || g.campus) === branchFilter);
    }

    if (filter.meetingDay && filter.meetingDay !== 'all') {
      filtered = filtered.filter((g) =>
        g.meetingDay.toLowerCase().includes(filter.meetingDay!.toLowerCase())
      );
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.leaderName.toLowerCase().includes(q) ||
          g.venue.toLowerCase().includes(q)
      );
    }

    return Promise.resolve(filtered);
  }

  async requestToJoinGroup(
    data: JoinGroupFormData
  ): Promise<{ success: boolean; message: string }> {
    const targetGroup = this.availableGroups.find((g) => g.id === data.groupId);
    const groupName = targetGroup ? targetGroup.name : 'the selected group';

    return Promise.resolve({
      success: true,
      message: `Your request to join ${groupName} has been submitted to the leader.`,
    });
  }
}

export const memberGroupsService = new MockMemberGroupsService();
