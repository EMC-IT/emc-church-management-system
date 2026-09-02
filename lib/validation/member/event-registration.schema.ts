import { z } from 'zod';

export const eventRegistrationSchema = z
  .object({
    eventId: z.string().min(1, 'Event ID is required'),
    fullName: z.string().min(2, 'Please enter your full name').optional(),
    attendeeName: z.string().min(2, 'Please enter attendee name').optional(),
    email: z.string().email('Please enter a valid email address').optional(),
    attendeeEmail: z.string().email('Please enter a valid email address').optional(),
    phone: z.string().min(9, 'Please enter a valid phone number').optional(),
    attendeePhone: z.string().min(9, 'Please enter a valid phone number').optional(),
    attendanceType: z.enum(['In-Person', 'Online']).optional(),
    numberOfTickets: z.number().min(1).optional(),
    agreeToTerms: z
      .boolean()
      .optional()
      .refine((val) => val === undefined || val === true, {
        message: 'You must agree to terms and conditions',
      }),
    answers: z.record(z.union([z.string(), z.array(z.string())])).optional(),
    specialRequirements: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  })
  .refine(
    (data) => !!(data.fullName || data.attendeeName),
    {
      message: 'Attendee full name is required',
      path: ['fullName'],
    }
  )
  .refine(
    (data) => !!(data.email || data.attendeeEmail),
    {
      message: 'Email is required',
      path: ['email'],
    }
  )
  .refine(
    (data) => !!(data.phone || data.attendeePhone),
    {
      message: 'Phone number is required',
      path: ['phone'],
    }
  );

export type EventRegistrationFormData = z.infer<typeof eventRegistrationSchema>;
