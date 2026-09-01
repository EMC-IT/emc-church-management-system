import { z } from 'zod';

export const pastoralCareRequestSchema = z.object({
  category: z.enum([
    'Counseling',
    'Hospital Visit',
    'Bereavement',
    'Home Visit',
    'Spiritual Guidance',
    'Dedication / Blessing',
    'Other',
  ]),
  preferredMode: z.enum(['In-Person', 'Phone Call', 'Video Call']),
  preferredDate: z.string().optional().or(z.literal('')),
  preferredTimeSlot: z.string().optional().or(z.literal('')),
  reason: z.string().min(10, 'Please briefly explain the purpose of your request').max(1000),
  isUrgent: z.boolean().default(false),
});

export type PastoralCareRequestFormData = z.infer<typeof pastoralCareRequestSchema>;
