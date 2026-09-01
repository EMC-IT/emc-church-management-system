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
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed', 'Other']).optional(),
  membershipStatus: z.enum(['Active', 'Inactive', 'Pending', 'Suspended', 'Deceased']).default('Active'),
  occupation: z.string().optional(),
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

export const familyMemberAddSchema = memberCreateSchema.extend({
  relationshipToHead: z.string().min(2, 'Relationship to family head is required'),
  isFamilyHead: z.boolean().default(false),
});

export const convertFollowUpSchema = z.object({
  convertId: z.string().min(1, 'Convert ID is required'),
  stage: z.enum(['New', 'Contacted', 'Assigned Mentor', 'Foundation School', 'Baptized', 'Integrated']),
  notes: z.string().optional(),
  mentorId: z.string().optional(),
  contactDate: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
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
export type FamilyMemberAddInput = z.infer<typeof familyMemberAddSchema>;
export type ConvertFollowUpInput = z.infer<typeof convertFollowUpSchema>;
export type MemberSearchInput = z.infer<typeof memberSearchSchema>;

export const newConvertSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
  contact1: z.string().trim().min(1, 'Primary contact is required').min(9, 'Primary contact must be at least 9 digits'),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required', invalid_type_error: 'Gender is required' }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  branch: z.enum(['Adenta (HQ)', 'Adusa', 'Liberia', 'Somanya', 'Mampong'], { required_error: 'Branch is required', invalid_type_error: 'Branch is required' }),
  serviceType: z.enum(['Empowered Kids', 'Empowerment', 'Jesus Generation', 'Precious Pearls'], { required_error: 'Service type is required', invalid_type_error: 'Service type is required' }),
  status: z.enum(['Member', 'Attender', 'Special Guest', 'Stop Coming'], { required_error: 'Status is required', invalid_type_error: 'Status is required' }),
  location: z.string().trim().min(1, 'Location / Residence is required').min(2, 'Location must be at least 2 characters'),
});

export const memberFullFormSchema = z.object({
  title: z.enum(['Rev.', 'Ps.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.', 'Mgt.'], { required_error: 'Title is required', invalid_type_error: 'Title is required' }),
  fullName: z.string().trim().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
  branch: z.enum(['Adenta (HQ)', 'Adusa', 'Liberia', 'Somanya', 'Mampong'], { required_error: 'Branch is required', invalid_type_error: 'Branch is required' }),
  serviceType: z.enum(['Empowered Kids', 'Empowerment', 'Jesus Generation', 'Precious Pearls'], { required_error: 'Service type is required', invalid_type_error: 'Service type is required' }),
  status: z.enum(['Member', 'Attender', 'Special Guest', 'Stop Coming'], { required_error: 'Status is required', invalid_type_error: 'Status is required' }),
  contact1: z.string().trim().min(1, 'Primary contact is required').min(9, 'Primary contact must be at least 9 digits'),
  contact2: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
  gender: z.enum(['Male', 'Female'], { required_error: 'Gender is required', invalid_type_error: 'Gender is required' }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  ageGroup: z.enum(['Youth', 'Adult', 'Children', 'Baby'], { required_error: 'Age group is required', invalid_type_error: 'Age group is required' }),
  lifeDevelopment: z.enum(['Membership', 'Maturity', 'Ministry', 'Accountability', 'None']).optional().default('Membership'),
  departments: z.array(z.string()).optional().default([]),
  groups: z.array(z.string()).optional().default([]),
  waterBaptism: z.enum(['Yes', 'No'], { required_error: 'Water baptism status is required', invalid_type_error: 'Water baptism status is required' }),
  holyGhostBaptism: z.enum(['Yes', 'No'], { required_error: 'Holy Ghost baptism status is required', invalid_type_error: 'Holy Ghost baptism status is required' }),
  leadershipRole: z.string().trim().optional().or(z.literal('')),
  specialGuestInvitedBy: z.string().optional().or(z.literal('')),
  specialGuestInvitedByCustom: z.string().trim().optional().or(z.literal('')),
  avatar: z.any().optional(),
  location: z.string().trim().min(1, 'Location / Residence is required').min(2, 'Location must be at least 2 characters'),
});

export type NewConvertInput = z.infer<typeof newConvertSchema>;
export type MemberFullFormInput = z.infer<typeof memberFullFormSchema>;
