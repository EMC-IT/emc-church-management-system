import { MemberPastoralCareRequest } from '@/lib/types/member';

export const mockMemberPastoralCareList: MemberPastoralCareRequest[] = [
  {
    id: 'pc-001',
    category: 'Spiritual Guidance',
    preferredMode: 'In-Person',
    preferredDate: '2026-09-08',
    preferredTimeSlot: 'Morning (9:00 AM – 12:00 PM)',
    assignedPastor: 'Pastor Emmanuel Mensah',
    status: 'Scheduled',
    urgency: 'Standard',
    reason:
      'Seeking pastoral guidance regarding personal spiritual disciplines and navigating family decisions in this new season.',
    summaryNotes:
      'Seeking pastoral guidance regarding personal spiritual disciplines and navigating family decisions in this new season.',
    scheduledDateTime: '2026-09-08T10:00:00Z',
    locationOrLink: 'Sanctuary Pastoral Counseling Room A',
    createdAt: '2026-08-28T11:20:00Z',
    updatedAt: '2026-08-30T14:00:00Z',
  },
  {
    id: 'pc-002',
    category: 'Hospital Visit',
    preferredMode: 'In-Person',
    preferredDate: '2026-08-20',
    preferredTimeSlot: 'Afternoon (2:00 PM – 5:00 PM)',
    assignedPastor: 'Pastoral Visitation Team',
    status: 'Completed',
    urgency: 'Standard',
    reason:
      'Hospital prayer visit for my mother following her scheduled orthopedic procedure.',
    summaryNotes:
      'Hospital prayer visit for my mother following her scheduled orthopedic procedure.',
    scheduledDateTime: '2026-08-20T15:00:00Z',
    locationOrLink: '37 Military Hospital, Ward 4',
    createdAt: '2026-08-18T09:00:00Z',
    updatedAt: '2026-08-21T10:00:00Z',
  },
  {
    id: 'pc-003',
    category: 'Dedication / Blessing',
    preferredMode: 'In-Person',
    preferredDate: '2026-09-15',
    preferredTimeSlot: 'Weekend / Sunday',
    status: 'Requested',
    urgency: 'Standard',
    reason:
      'Would love to schedule baby dedication and home blessing ceremony with the pastoral team.',
    summaryNotes:
      'Would love to schedule baby dedication and home blessing ceremony with the pastoral team.',
    createdAt: '2026-09-01T14:15:00Z',
    updatedAt: '2026-09-01T14:15:00Z',
  },
];
