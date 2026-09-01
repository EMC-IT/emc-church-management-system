import { MemberMinistry } from '@/lib/types/member';
import { mockMemberMinistries } from '@/lib/mock/member';

export interface MemberMinistriesService {
  getMyMinistries(): Promise<MemberMinistry[]>;
}

export class MockMemberMinistriesService implements MemberMinistriesService {
  async getMyMinistries(): Promise<MemberMinistry[]> {
    return Promise.resolve([...mockMemberMinistries]);
  }
}

export const memberMinistriesService = new MockMemberMinistriesService();
