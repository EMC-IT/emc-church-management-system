import { z } from 'zod';

export const memberPasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(8, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type MemberPasswordChangeFormData = z.infer<typeof memberPasswordChangeSchema>;

export const memberSecuritySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  sessionTimeoutMinutes: z.number().int().min(15).max(1440).default(60),
});

export type MemberSecuritySettingsFormData = z.infer<typeof memberSecuritySettingsSchema>;
