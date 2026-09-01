import { z } from 'zod';

export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
  prayerAlerts: z.boolean().default(true),
  eventReminders: z.boolean().default(true),
  directoryVisibility: z.enum(['public', 'members_only', 'private']).default('members_only'),
});

export type NotificationPreferencesFormData = z.infer<typeof notificationPreferencesSchema>;
