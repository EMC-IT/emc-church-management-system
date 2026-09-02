import { MemberResource } from '@/lib/types/member';

export const mockMemberResourcesList: MemberResource[] = [
  {
    id: 'res-001',
    title: 'Foundations of Christian Faith (EMC 101 Study Notes)',
    description:
      'Comprehensive doctrinal teaching notes covering church history, core biblical doctrines, salvation, water baptism, and spiritual disciplines.',
    category: 'Teaching',
    type: 'PDF',
    accessType: 'Member',
    publishedAt: '2026-08-15T09:00:00Z',
    fileSize: 3984588, // ~3.8 MB
    fileFormat: 'PDF',
    author: 'EMC Discipleship Directorate',
    speaker: 'Pastor Emmanuel Mensah',
    ministry: 'Discipleship & Training',
    tags: ['Foundations', 'Doctrine', 'EMC 101', 'Faith'],
    isFeatured: true,
    downloadUrl: '/mock-downloads/emc-101-notes.pdf',
  },
  {
    id: 'res-002',
    title: 'Walking in Spiritual Authority & Victorious Faith',
    description:
      'An inspiring 4-part bible study syllabus on understanding believer authority, prayer warfare, and standing firm in Christ.',
    category: 'Bible Studies',
    type: 'PDF',
    accessType: 'Public',
    publishedAt: '2026-08-20T10:30:00Z',
    fileSize: 2516582, // ~2.4 MB
    fileFormat: 'PDF',
    speaker: 'Pastor Emmanuel Mensah',
    tags: ['Faith', 'Authority', 'Victory', 'Bible Study'],
    isFeatured: true,
    downloadUrl: '/mock-downloads/spiritual-authority.pdf',
  },
  {
    id: 'res-003',
    title: 'Building a Consistent Prayer Life & Secret Place',
    description:
      'Powerful audio sermon exploring the dynamics of morning devotion, intimacy with the Holy Spirit, and sustaining spiritual fire.',
    category: 'Sermons',
    type: 'Audio',
    accessType: 'Public',
    publishedAt: '2026-08-24T14:00:00Z',
    duration: 2520, // 42 min
    speaker: 'Rev. Dr. Michael Osei',
    ministry: 'Prayer & Intercession',
    tags: ['Prayer', 'Secret Place', 'Spiritual Discipline', 'Audio'],
    isFeatured: true,
    downloadUrl: '/mock-downloads/consistent-prayer-life.mp3',
  },
  {
    id: 'res-004',
    title: 'Overcoming Anxiety & Fear in Uncertain Times',
    description:
      'Sunday encounter service video teaching on divine peace, guarding your heart with scripture, and trusting God through life transitions.',
    category: 'Sermons',
    type: 'Video',
    accessType: 'Public',
    publishedAt: '2026-08-18T11:00:00Z',
    duration: 3240, // 54 min
    speaker: 'Pastor Emmanuel Mensah',
    tags: ['Peace', 'Mental Wellness', 'Sunday Service', 'Video'],
    isFeatured: false,
    externalUrl: 'https://youtube.com/watch?v=mock-emc-sermon',
  },
  {
    id: 'res-005',
    title: 'Cell Fellowship Leader Servant Handbook 2026',
    description:
      'Official leadership guide for cell leaders and hosts detailing meeting formats, pastoral care protocols, and evangelism outreach.',
    category: 'Guides',
    type: 'PDF',
    accessType: 'Ministry',
    publishedAt: '2026-07-30T08:00:00Z',
    fileSize: 1992294, // ~1.9 MB
    fileFormat: 'PDF',
    author: 'Pastoral Council',
    ministry: 'Cell Ministry',
    tags: ['Leadership', 'Cell Group', 'Pastoral Care', 'Handbook'],
    isFeatured: false,
    downloadUrl: '/mock-downloads/cell-leader-handbook-2026.pdf',
  },
  {
    id: 'res-006',
    title: 'Daily Walk Devotional: Abiding in the True Vine',
    description:
      'A 30-day devotional guide focused on John 15, bearing lasting fruit, and nurturing daily communion with Christ.',
    category: 'Devotionals',
    type: 'PDF',
    accessType: 'Public',
    publishedAt: '2026-08-01T06:00:00Z',
    fileSize: 870400, // ~850 KB
    fileFormat: 'PDF',
    author: 'EMC Editorial Team',
    tags: ['Devotional', 'Abiding', 'Daily Walk', 'John 15'],
    isFeatured: false,
    downloadUrl: '/mock-downloads/abiding-devotional.pdf',
  },
  {
    id: 'res-007',
    title: 'Child Dedication & Family Blessing Application Form',
    description:
      'Official printable registration form for parents desiring to dedicate their infant or child during Sunday dedication services.',
    category: 'Forms',
    type: 'Form',
    accessType: 'Member',
    publishedAt: '2026-06-10T12:00:00Z',
    fileSize: 450000,
    author: 'Pastoral Office',
    tags: ['Dedication', 'Family', 'Application', 'Form'],
    isFeatured: false,
    downloadUrl: '/mock-downloads/child-dedication-form.pdf',
  },
  {
    id: 'res-008',
    title: 'Worship & Creative Arts Ministry Guidelines & Choir Protocol',
    description:
      'Service guidelines for musicians, vocalists, audio technicians, and creative media servants.',
    category: 'Ministry',
    type: 'PDF',
    accessType: 'Ministry',
    publishedAt: '2026-07-15T15:00:00Z',
    fileSize: 4404019, // ~4.2 MB
    fileFormat: 'PDF',
    author: 'Music Director',
    ministry: 'Worship & Creative Arts',
    tags: ['Worship', 'Choir', 'Ministry Protocol', 'Guidelines'],
    isFeatured: false,
    downloadUrl: '/mock-downloads/worship-guidelines.pdf',
  },
  {
    id: 'res-009',
    title: 'Water Baptism Candidate Registration & Readiness Form',
    description:
      'Preparation checklist and consent registration for members preparing for the upcoming quarterly water baptism service.',
    category: 'Forms',
    type: 'Form',
    accessType: 'Member',
    publishedAt: '2026-08-05T09:30:00Z',
    fileSize: 320000,
    author: 'Pastoral Office',
    tags: ['Baptism', 'Registration', 'Form'],
    isFeatured: false,
    downloadUrl: '/mock-downloads/baptism-registration-form.pdf',
  },
];
