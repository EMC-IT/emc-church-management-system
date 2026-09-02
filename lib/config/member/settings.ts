export const SUPPORTED_LANGUAGES = [
  { value: 'en', label: 'English (UK / US)' },
];

export const COMMUNICATION_CHANNELS = [
  {
    id: 'email',
    key: 'email' as const,
    title: 'Email Notifications',
    description: 'Receive announcements, weekly bulletins, and transaction receipts via email.',
  },
  {
    id: 'sms',
    key: 'sms' as const,
    title: 'SMS Alerts',
    description: 'Receive urgent service notices, meeting reminders, and security alerts via text message.',
  },
  {
    id: 'inApp',
    key: 'inApp' as const,
    title: 'In-Portal Alerts',
    description: 'Show updates and notifications in your Member Portal navigation bar.',
  },
  {
    id: 'push',
    key: 'push' as const,
    title: 'Push Notifications',
    description: 'Browser notifications when you are logged into the portal.',
  },
];

export const NOTIFICATION_CATEGORIES_CONFIG = [
  {
    key: 'events' as const,
    title: 'Events & Calendar',
    description: 'Reminders for conferences, special services, and registrations you have booked.',
  },
  {
    key: 'groups' as const,
    title: 'Cell Group & Fellowships',
    description: 'Meeting schedules, location updates, and community prayer announcements.',
  },
  {
    key: 'ministries' as const,
    title: 'Ministries & Volunteering',
    description: 'Rosters, duty schedules, and ministry leader announcements.',
  },
  {
    key: 'prayer' as const,
    title: 'Prayer Requests',
    description: 'Updates when your prayer requests are received and being prayed over.',
  },
  {
    key: 'pastoralCare' as const,
    title: 'Pastoral Care & Support',
    description: 'Appointment confirmations, counseling updates, and pastoral visitation schedules.',
  },
  {
    key: 'resources' as const,
    title: 'Resource Library',
    description: 'Notifications when new study materials, sermon audio, or church forms are uploaded.',
  },
  {
    key: 'announcements' as const,
    title: 'Church-Wide Announcements',
    description: 'General church news, upcoming harvest services, and leadership messages.',
  },
];
