import { z } from 'zod';

export const memberSettingsSchema = z.object({
  profile: z.object({
    displayName: z
      .string()
      .min(2, 'Display name must be at least 2 characters')
      .max(50, 'Display name must not exceed 50 characters'),
    language: z.string().min(1, 'Please select a language'),
    preferredBranch: z.string().optional(),
  }),
  communication: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  }),
  notifications: z.object({
    events: z.boolean(),
    groups: z.boolean(),
    ministries: z.boolean(),
    prayer: z.boolean(),
    pastoralCare: z.boolean(),
    resources: z.boolean(),
    announcements: z.boolean(),
  }),
  privacy: z.object({
    directoryVisibility: z.boolean(),
    profilePhotoVisibility: z.boolean(),
  }),
  appearance: z.object({
    theme: z.enum(['system', 'light', 'dark']),
  }),
});

export type MemberSettingsFormData = z.infer<typeof memberSettingsSchema>;
