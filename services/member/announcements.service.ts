import { MemberAnnouncement } from '@/lib/types/member';
import { mockMemberAnnouncementsList } from '@/lib/mock/member';

export interface MemberAnnouncementsService {
  getAnnouncements(): Promise<MemberAnnouncement[]>;
  getAnnouncementById(id: string): Promise<MemberAnnouncement | null>;
}

export class MockMemberAnnouncementsService implements MemberAnnouncementsService {
  private announcements: MemberAnnouncement[] = [...mockMemberAnnouncementsList];

  async getAnnouncements(): Promise<MemberAnnouncement[]> {
    const list = [...this.announcements].sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    return Promise.resolve(list);
  }

  async getAnnouncementById(id: string): Promise<MemberAnnouncement | null> {
    const item = this.announcements.find((a) => a.id === id);
    return Promise.resolve(item ? { ...item } : null);
  }
}

export const memberAnnouncementsService = new MockMemberAnnouncementsService();
