import { MemberPrayerRequest } from '@/lib/types/member';

export const mockMemberPrayerRequestsList: MemberPrayerRequest[] = [
  {
    id: 'pr-001',
    title: 'Healing and Quick Recovery for Mum',
    category: 'Health & Healing',
    description:
      'Kindly uphold my mother in prayers as she undergoes post-surgery rehabilitation this week. Praying for total restoration of strength and relief from pain.',
    privacy: 'Pastoral Team Only',
    status: 'Praying',
    isUrgent: false,
    createdAt: '2026-08-25T10:00:00Z',
    updatedAt: '2026-08-27T14:30:00Z',
    pastoralNotesCount: 2,
  },
  {
    id: 'pr-002',
    title: 'Divine Guidance in Career Transition',
    category: 'Work & Career',
    description:
      'I am currently interviewing for a leadership role in tech consulting. Praying for divine wisdom, clarity of mind, and favor with the interviewing panel.',
    privacy: 'Church Prayer Team',
    status: 'Praying',
    isUrgent: false,
    createdAt: '2026-08-28T08:30:00Z',
    updatedAt: '2026-08-28T08:30:00Z',
  },
  {
    id: 'pr-003',
    title: 'Praise & Thanksgiving for Safe Delivery',
    category: 'Thanksgiving',
    description:
      'Praising God for the safe delivery of our baby daughter and for continuous protection and health over mother and child.',
    privacy: 'Church Prayer Team',
    status: 'Answered',
    isUrgent: false,
    createdAt: '2026-07-14T09:15:00Z',
    updatedAt: '2026-08-01T11:00:00Z',
    answeredDate: '2026-07-30T10:00:00Z',
    testimony:
      'God proved Himself faithful! The delivery went smoothly with zero complications. Thank you church for praying with us!',
  },
  {
    id: 'pr-004',
    title: 'Financial Breakthrough & Tuition Support',
    category: 'Finances',
    description:
      'Trusting the Lord for provision towards my younger brother’s final-year university tuition fees before the semester deadline.',
    privacy: 'Pastoral Team Only',
    status: 'Submitted',
    isUrgent: true,
    createdAt: '2026-08-31T16:45:00Z',
    updatedAt: '2026-08-31T16:45:00Z',
  },
];
