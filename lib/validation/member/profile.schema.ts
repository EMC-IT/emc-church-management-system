import { z } from 'zod';

export const memberProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').max(20),
  alternatePhone: z.string().max(20).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']).optional(),
  anniversaryDate: z.string().optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    region: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    relationship: z.string().min(2, 'Relationship is required'),
    phone: z.string().min(7, 'Emergency contact phone is required'),
  }).optional(),
});

export type MemberProfileFormData = z.infer<typeof memberProfileSchema>;
