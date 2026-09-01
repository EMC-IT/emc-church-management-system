import { MemberProfile, UpdateMemberProfileInput } from '@/lib/types/member';
import { mockCurrentMember } from '@/lib/mock/member';

export interface MemberProfileService {
  getCurrentProfile(): Promise<MemberProfile>;
  updateProfile(input: UpdateMemberProfileInput): Promise<MemberProfile>;
}

export class MockMemberProfileService implements MemberProfileService {
  private profile: MemberProfile = { ...mockCurrentMember };

  async getCurrentProfile(): Promise<MemberProfile> {
    return Promise.resolve({ ...this.profile });
  }

  async updateProfile(input: UpdateMemberProfileInput): Promise<MemberProfile> {
    this.profile = {
      ...this.profile,
      ...input,
      address: {
        ...this.profile.address,
        ...(input.address || {}),
      },
      preferences: {
        ...this.profile.preferences,
        ...(input.preferences || {}),
      },
    };
    return Promise.resolve({ ...this.profile });
  }
}

export const memberProfileService = new MockMemberProfileService();
