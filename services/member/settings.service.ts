import { MemberSettings } from '@/lib/types/member';
import { mockMemberSettings } from '@/lib/mock/member';

export interface MemberSettingsService {
  getSettings(): Promise<MemberSettings>;
  updateSettings(settings: Partial<MemberSettings>): Promise<MemberSettings>;
}

export class MockMemberSettingsService implements MemberSettingsService {
  private settings: MemberSettings = JSON.parse(JSON.stringify(mockMemberSettings));

  async getSettings(): Promise<MemberSettings> {
    return Promise.resolve(JSON.parse(JSON.stringify(this.settings)));
  }

  async updateSettings(
    newSettings: Partial<MemberSettings>
  ): Promise<MemberSettings> {
    this.settings = {
      ...this.settings,
      ...newSettings,
      profile: {
        ...this.settings.profile,
        ...(newSettings.profile || {}),
      },
      communication: {
        ...this.settings.communication,
        ...(newSettings.communication || {}),
      },
      notifications: {
        ...this.settings.notifications,
        ...(newSettings.notifications || {}),
      },
      privacy: {
        ...this.settings.privacy,
        ...(newSettings.privacy || {}),
      },
      appearance: {
        ...this.settings.appearance,
        ...(newSettings.appearance || {}),
      },
    };

    return Promise.resolve(JSON.parse(JSON.stringify(this.settings)));
  }
}

export const memberSettingsService = new MockMemberSettingsService();
