import { z } from 'zod';
import { AgeGroup, ClassStatus, MaterialType } from '../types/sunday-school';

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

export const sundaySchoolClassUpdateSchema = sundaySchoolClassSchema.partial();

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

export const studentEnrollUpdateSchema = studentEnrollSchema.partial();

export const teacherCreateSchema = z.object({
  memberId: z.string().optional(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  assignedClassIds: z.array(z.string()).optional().default([]),
  qualification: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const teacherUpdateSchema = teacherCreateSchema.partial();

export const teachingMaterialSchema = z.object({
  title: z.string().min(2, 'Material title is required'),
  type: z.nativeEnum(MaterialType).default(MaterialType.LESSON_PLAN),
  ageGroup: z.nativeEnum(AgeGroup),
  classId: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
});

export type SundaySchoolClassInput = z.infer<typeof sundaySchoolClassSchema>;
export type SundaySchoolClassUpdateInput = z.infer<typeof sundaySchoolClassUpdateSchema>;
export type StudentEnrollInput = z.infer<typeof studentEnrollSchema>;
export type TeacherCreateInput = z.infer<typeof teacherCreateSchema>;
export type TeachingMaterialInput = z.infer<typeof teachingMaterialSchema>;
