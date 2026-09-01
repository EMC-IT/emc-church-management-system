export type EventCategory = 'Conference' | 'Worship Night' | 'Outreach' | 'Seminar' | 'Retreat' | 'Youth' | 'General Service' | 'Worship' | 'Prayer';
export type EventRegistrationStatus = 'Registered' | 'Attended' | 'Waitlisted' | 'Cancelled' | 'Going' | 'Interested';


export interface MemberEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  isOnline: boolean;
  onlineLink?: string;
  requiresRegistration: boolean;
  registrationStatus?: EventRegistrationStatus;
  ticketReference?: string;
  capacity?: number;
  registeredCount: number;
  coverImageUrl?: string | null;
  organizer: string;
}
