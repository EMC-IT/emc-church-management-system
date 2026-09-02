export type ThemePreference = 'system' | 'light' | 'dark';

export interface CommunicationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationPreferences {
  events: boolean;
  groups: boolean;
  ministries: boolean;
  prayer: boolean;
  pastoralCare: boolean;
  resources: boolean;
  announcements: boolean;
}

export interface PrivacyPreferences {
  directoryVisibility: boolean;
  profilePhotoVisibility: boolean;
}

export interface ProfilePreferences {
  displayName: string;
  language: string;
  preferredBranch?: string;
}

export interface AppearancePreferences {
  theme: ThemePreference;
}

export interface MemberSettings {
  profile: ProfilePreferences;
  communication: CommunicationPreferences;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  appearance: AppearancePreferences;
}
