import { z } from 'zod';

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  attendeeName: z.string().min(2, 'Attendee name is required'),
  attendeeEmail: z.string().email('Invalid email address'),
  attendeePhone: z.string().min(7, 'Phone number is required'),
  numberOfTickets: z.number().int().min(1).max(10).default(1),
  specialRequirements: z.string().max(500).optional().or(z.literal('')),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to event attendance terms',
  }),
});

export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;
