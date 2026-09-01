export type PrayerPrivacyLevel = 'Public' | 'Pastoral Team Only' | 'Anonymous';
export type PrayerRequestStatus = 'Submitted' | 'Praying' | 'Answered' | 'Archived';

export interface MemberPrayerRequest {
  id: string;
  title: string;
  category: string;
  description: string;
  privacy: PrayerPrivacyLevel;
  status: PrayerRequestStatus;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
  answeredDate?: string;
  testimony?: string;
  pastoralNotesCount?: number;
}

export interface CreatePrayerRequestInput {
  title: string;
  category: string;
  description: string;
  privacy: PrayerPrivacyLevel;
  isUrgent: boolean;
}
