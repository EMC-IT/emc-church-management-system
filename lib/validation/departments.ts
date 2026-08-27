import { z } from 'zod';

export const departmentCreateSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().optional(),
  leader: z.string().optional(),
  departmentType: z.enum(['General', 'Youth', 'Music', 'Media', 'Ushering', 'Children', 'Outreach', 'Protocol', 'Technical']).optional(),
  status: z.enum(['Active', 'Inactive', 'Archived']).default('Active'),
  meetingSchedule: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  branchId: z.string().optional(),
});

export const departmentMeetingSchema = z.object({
  departmentId: z.string().min(1, 'Department ID is required'),
  title: z.string().min(2, 'Meeting title is required'),
  meetingType: z.enum(['REGULAR', 'PLANNING', 'TRAINING', 'EMERGENCY', 'ANNUAL']).default('REGULAR'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  agenda: z.string().optional(),
});

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;
export type DepartmentMeetingInput = z.infer<typeof departmentMeetingSchema>;
