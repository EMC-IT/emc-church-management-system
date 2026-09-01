export type PastoralCareCategory = 'Counseling' | 'Hospital Visit' | 'Bereavement' | 'Home Visit' | 'Spiritual Guidance' | 'Dedication / Blessing' | 'Other';
export type PastoralCareStatus = 'Requested' | 'Scheduled' | 'Completed' | 'Follow-up Needed' | 'Cancelled';
export type PastoralCareMode = 'In-Person' | 'Phone Call' | 'Video Call';

export interface MemberPastoralCareRequest {
  id: string;
  category: PastoralCareCategory;
  preferredMode: PastoralCareMode;
  preferredDate?: string;
  preferredTimeSlot?: string;
  assignedPastor?: string;
  status: PastoralCareStatus;
  urgency: 'Standard' | 'Urgent';
  summaryNotes?: string;
  scheduledDateTime?: string;
  locationOrLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePastoralCareInput {
  category: PastoralCareCategory;
  preferredMode: PastoralCareMode;
  preferredDate?: string;
  preferredTimeSlot?: string;
  reason: string;
  isUrgent?: boolean;
}
