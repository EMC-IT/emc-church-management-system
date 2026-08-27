import { z } from 'zod';

export const groupCreateSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  leader: z.object({
    id: z.string(),
    name: z.string().min(1, 'Leader name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
  }).optional(),
  maxMembers: z.number().int().positive().optional(),
  meetingSchedule: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['Active', 'Inactive', 'Archived']).default('Active'),
  branchId: z.string().optional(),
});

export const groupUpdateSchema = groupCreateSchema.partial();

export const groupMemberAddSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  role: z.string().default('Member'),
  joinedDate: z.string().optional(),
});

export const groupRoleAddSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  memberId: z.string().min(1, 'Member ID is required'),
  roleTitle: z.string().min(2, 'Role title is required'),
  permissions: z.array(z.string()).optional(),
});

export const groupEventAddSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required'),
  title: z.string().min(2, 'Event title is required'),
  date: z.string().min(1, 'Event date is required'),
  time: z.string().min(1, 'Event time is required'),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const groupCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
});

export type GroupCreateInput = z.infer<typeof groupCreateSchema>;
export type GroupUpdateInput = z.infer<typeof groupUpdateSchema>;
export type GroupMemberAddInput = z.infer<typeof groupMemberAddSchema>;
