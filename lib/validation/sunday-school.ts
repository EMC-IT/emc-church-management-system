import { z } from 'zod';
import { AgeGroup, ClassStatus } from '../types/sunday-school';

export const sundaySchoolClassSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  description: z.string().optional(),
  ageGroup: z.nativeEnum(AgeGroup),
  minAge: z.number().int().nonnegative(),
  maxAge: z.number().int().positive(),
  room: z.string().min(1, 'Room location is required'),
  capacity: z.number().int().positive('Capacity must be greater than zero'),
  schedule: z.string().min(1, 'Meeting schedule is required'),
  status: z.nativeEnum(ClassStatus).default(ClassStatus.ACTIVE),
  teacherIds: z.array(z.string()).optional().default([]),
});

export const studentEnrollSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE']),
  classId: z.string().min(1, 'Class ID is required'),
  parentName: z.string().min(2, 'Parent name is required'),
  parentPhone: z.string().min(5, 'Parent phone is required'),
  parentEmail: z.string().email().optional().or(z.literal('')),
  emergencyContact: z.string().optional(),
  medicalNotes: z.string().optional(),
  allergies: z.array(z.string()).optional().default([]),
});

export type SundaySchoolClassInput = z.infer<typeof sundaySchoolClassSchema>;
export type StudentEnrollInput = z.infer<typeof studentEnrollSchema>;
