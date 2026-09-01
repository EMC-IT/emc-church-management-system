import { z } from 'zod';

export const familyMemberSchema = z.object({
  firstName: z.string().min(2, 'First name is required').max(50),
  lastName: z.string().min(2, 'Last name is required').max(50),
  relationship: z.enum(['Head', 'Spouse', 'Child', 'Dependent', 'Other']),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  isRegisteredMember: z.boolean().default(false),
  canManagePermissions: z.boolean().default(false),
});

export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;
