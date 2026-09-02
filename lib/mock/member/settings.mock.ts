import { MemberSettings } from '@/lib/types/member';

export const mockMemberSettings: MemberSettings = {
  profile: {
    displayName: 'Redeem',
    language: 'en',
    preferredBranch: 'Main Branch',
  },
  communication: {
    email: true,
    sms: true,
    push: false,
    inApp: true,
  },
  notifications: {
    events: true,
    groups: true,
    ministries: true,
    prayer: true,
    pastoralCare: true,
    resources: false,
    announcements: true,
  },
  privacy: {
    directoryVisibility: true,
    profilePhotoVisibility: true,
  },
  appearance: {
    theme: 'system',
  },
};
