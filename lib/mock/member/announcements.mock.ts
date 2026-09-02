import { MemberAnnouncement } from '@/lib/types/member';

export const mockMemberAnnouncementsList: MemberAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'Special Thanksgiving & Harvest Celebration Sunday',
    summary:
      'Join the entire EMC church family this coming Sunday for our annual Thanksgiving & Harvest Praise Service across all morning services. Come with joyful hearts as we celebrate God’s faithfulness.',
    publishedAt: '2026-09-01T07:00:00Z',
    category: 'Celebration Service',
    isUrgent: true,
    action: {
      label: 'View Service Details',
      href: '/portal/events',
    },
  },
  {
    id: 'ann-002',
    title: 'Church-Wide 21-Day Fasting & Prayer Encounter',
    summary:
      'Our church-wide quarterly 21-day prayer and fasting season begins on October 1st. Daily prayer guides and evening communion services will be conducted at 6:00 PM.',
    publishedAt: '2026-08-28T09:00:00Z',
    category: 'Spiritual Season',
    isUrgent: false,
    action: {
      label: 'Download Prayer Guide',
      href: '/portal/resources',
    },
  },
  {
    id: 'ann-003',
    title: 'Annual Ministry Workers & Servant Leadership Seminar',
    summary:
      'All department leaders, choir members, ushers, technicians, and cell leaders are invited to attend our Leadership Alignment Seminar on Saturday, September 26 at 9:00 AM.',
    publishedAt: '2026-08-20T12:00:00Z',
    category: 'Leadership',
    isUrgent: false,
    action: {
      label: 'View Ministry Schedule',
      href: '/portal/ministries',
    },
  },
];
