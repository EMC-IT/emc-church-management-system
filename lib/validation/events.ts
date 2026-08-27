import { z } from 'zod';

export const eventCreateSchema = z.object({
  title: z.string().min(2, 'Event title must be at least 2 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  organizer: z.string().min(1, 'Organizer is required'),
  maxAttendees: z.number().int().positive().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrencePattern: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.string().optional(),
});

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  status: z.enum(['confirmed', 'pending', 'cancelled']).default('confirmed'),
  notes: z.string().optional(),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
