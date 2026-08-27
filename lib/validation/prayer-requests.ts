import { z } from 'zod';

export const prayerRequestCreateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  category: z.string().min(1, 'Please select a category'),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent'], {
    required_error: 'Please select a priority level',
  }).default('Medium'),
  isConfidential: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  requesterName: z.string().optional(),
  requesterEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  requesterPhone: z.string().optional(),
  assignTo: z.string().optional(),
  notifyPrayerTeam: z.boolean().default(true),
  allowPublicPrayers: z.boolean().default(true),
});

export const prayerRequestUpdateSchema = prayerRequestCreateSchema.partial().extend({
  status: z.enum(['Submitted', 'In Review', 'Praying', 'Answered', 'Archived']).optional(),
  pastoralNotes: z.string().optional(),
});

export const prayerRequestResponseSchema = z.object({
  prayerRequestId: z.string().min(1, 'Prayer request ID is required'),
  responderId: z.string().min(1, 'Responder ID is required'),
  response: z.string().min(5, 'Response text must be at least 5 characters'),
  isPublic: z.boolean().default(false),
});

export type PrayerRequestCreateInput = z.infer<typeof prayerRequestCreateSchema>;
export type PrayerRequestUpdateInput = z.infer<typeof prayerRequestUpdateSchema>;
