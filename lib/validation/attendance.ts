import { z } from 'zod';

export const attendanceStatusEnum = z.enum(['Present', 'Late', 'Excused', 'Absent']);

export const attendanceRecordSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  status: attendanceStatusEnum.default('Present'),
  checkInTime: z.string().optional(),
  notes: z.string().optional(),
  branch: z.string().optional(),
  branchId: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  records: z.array(z.object({
    memberId: z.string().min(1, 'Member ID is required'),
    status: attendanceStatusEnum,
    checkInTime: z.string().optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one record is required'),
  branch: z.string().optional(),
  branchId: z.string().optional(),
});

export const attendanceQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  search: z.string().optional(),
  serviceType: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
export type AttendanceQueryInput = z.infer<typeof attendanceQuerySchema>;
