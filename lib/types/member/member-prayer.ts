export type PrayerPrivacyLevel =
  | 'Pastoral Team Only'
  | 'Church Prayer Team'
  | 'Public'
  | 'Anonymous';

export type PrayerRequestStatus =
  | 'Submitted'
  | 'Praying'
  | 'Answered'
  | 'Closed'
  | 'Archived';

export type PrayerCategory =
  | 'General'
  | 'Family'
  | 'Health & Healing'
  | 'Work & Career'
  | 'Finances'
  | 'Relationships'
  | 'Spiritual Growth'
  | 'Thanksgiving'
  | 'Guidance'
  | 'Other';

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

export interface PrayerFilterOptions {
  status?: PrayerRequestStatus | 'all';
  category?: string;
  search?: string;
}
