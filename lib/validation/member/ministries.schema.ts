import { z } from 'zod';

export const serveInterestSchema = z.object({
  ministryId: z.string().min(1, 'Please select a ministry'),
  areaOfInterest: z.string().min(1, 'Please select or enter your area of interest'),
  experience: z.string().max(250, 'Experience summary cannot exceed 250 characters').optional(),
  availability: z.string().optional(),
  message: z.string().max(300, 'Message cannot exceed 300 characters').optional(),
});

export type ServeInterestFormData = z.infer<typeof serveInterestSchema>;
