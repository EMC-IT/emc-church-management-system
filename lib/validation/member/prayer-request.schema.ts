import { z } from 'zod';

export const prayerRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  category: z.string().min(1, 'Please select a prayer category'),
  description: z.string().min(10, 'Please provide details for your prayer request').max(1000),
  privacy: z.enum(['Public', 'Pastoral Team Only', 'Anonymous']),
  isUrgent: z.boolean().default(false),
});

export type PrayerRequestFormData = z.infer<typeof prayerRequestSchema>;
