export type EventCategory =
  | 'Conference'
  | 'Worship Night'
  | 'Worship'
  | 'Service'
  | 'General Service'
  | 'Youth'
  | 'Children'
  | 'Fellowship'
  | 'Outreach'
  | 'Training'
  | 'Seminar'
  | 'Prayer'
  | 'Retreat'
  | 'Other';

export type EventRegistrationStatus =
  | 'open'
  | 'closed'
  | 'full'
  | 'registered'
  | 'waitlisted'
  | 'not_required'
  | 'Registered'
  | 'Attended'
  | 'Waitlisted'
  | 'Cancelled'
  | 'Going'
  | 'Interested';

export interface EventHost {
  name: string;
  title: string;
  avatarUrl?: string | null;
}

export interface EventSessionScheduleItem {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  venue?: string;
  description?: string;
}

export interface EventCustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface EventFee {
  isFree: boolean;
  amount?: number;
  currency?: string;
  paymentNotice?: string;
}

export interface MemberEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  branch?: string;
  venue?: string;
  address?: string;
  isOnline: boolean;
  onlineLink?: string;
  requiresRegistration: boolean;
  registrationStatus?: EventRegistrationStatus;
  capacity?: number;
  registeredCount: number;
  isFeatured?: boolean;
  coverImageUrl?: string | null;
  organizer: string;
  host?: EventHost;
  schedule?: EventSessionScheduleItem[];
  customQuestions?: EventCustomQuestion[];
  fee?: EventFee;

  // Backwards compatibility aliases
  campus?: string;
  location?: string;
  ticketReference?: string;
}

export interface MemberEventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  eventStartDate: string;
  eventEndDate: string;
  venue: string;
  branch: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'waitlisted' | 'cancelled';
  ticketReference: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  attendanceType: 'In-Person' | 'Online';
  answers?: Record<string, string | string[]>;
  notes?: string;
}

export interface MemberEventFilter {
  category?: EventCategory | 'all';
  branch?: string;
  dateRange?: 'upcoming' | 'this-month' | 'next-month' | 'past' | 'all';
  registrationStatus?: 'all' | 'open' | 'registered';
  search?: string;
}
