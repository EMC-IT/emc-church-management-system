import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(2, 'Contact name is required'),
  phone: z.string().min(5, 'Valid contact phone is required'),
  relationship: z.string().min(2, 'Relationship is required'),
});

export const memberCreateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(5, 'Phone number is required'),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female']),
  membershipStatus: z.enum(['Active', 'Inactive', 'Pending', 'Suspended', 'Deceased']).default('Active'),
  joinDate: z.string().optional(),
  branch: z.string().optional(),
  branchId: z.string().optional(),
  familyId: z.string().optional(),
  emergencyContact: emergencyContactSchema.optional(),
  customFields: z.record(z.any()).optional(),
});

export const memberUpdateSchema = memberCreateSchema.partial();

export const familyLinkSchema = z.object({
  memberId: z.string().min(1, 'Primary member ID is required'),
  familyMemberId: z.string().min(1, 'Family member ID is required'),
  relationship: z.string().min(2, 'Relationship type is required'),
});

export const memberSearchSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  ageGroup: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;
export type FamilyLinkInput = z.infer<typeof familyLinkSchema>;
export type MemberSearchInput = z.infer<typeof memberSearchSchema>;
