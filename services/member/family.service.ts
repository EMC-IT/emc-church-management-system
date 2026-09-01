import { MemberFamilyUnit, MemberFamilyMember } from '@/lib/types/member';
import { mockMemberFamily } from '@/lib/mock/member';

export interface MemberFamilyService {
  getFamily(): Promise<MemberFamilyUnit>;
  addFamilyMember(member: Omit<MemberFamilyMember, 'id'>): Promise<MemberFamilyMember>;
  updateFamilyMember(id: string, member: Partial<MemberFamilyMember>): Promise<MemberFamilyMember>;
}

export class MockMemberFamilyService implements MemberFamilyService {
  private family: MemberFamilyUnit = { ...mockMemberFamily };

  async getFamily(): Promise<MemberFamilyUnit> {
    return Promise.resolve({ ...this.family });
  }

  async addFamilyMember(member: Omit<MemberFamilyMember, 'id'>): Promise<MemberFamilyMember> {
    const newMember: MemberFamilyMember = {
      ...member,
      id: `fm-${Date.now()}`,
    };
    this.family = {
      ...this.family,
      members: [...this.family.members, newMember],
    };
    return Promise.resolve(newMember);
  }

  async updateFamilyMember(id: string, updates: Partial<MemberFamilyMember>): Promise<MemberFamilyMember> {
    const index = this.family.members.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new Error('Family member not found');
    }
    const updated = { ...this.family.members[index], ...updates };
    const members = [...this.family.members];
    members[index] = updated;
    this.family = { ...this.family, members };
    return Promise.resolve(updated);
  }
}

export const memberFamilyService = new MockMemberFamilyService();
