// Sunday School Module Type Definitions

import { ApiResponse } from './common';

// Enums
export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LATE = 'Late',
  EXCUSED = 'Excused'
}

export enum ClassStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  SUSPENDED = 'Suspended'
}

export enum AgeGroup {
  NURSERY = 'Nursery (0-2)',
  TODDLERS = 'Toddlers (3-4)',
  KINDERGARTEN = 'Kindergarten (5-6)',
  PRIMARY = 'Primary (7-9)',
  JUNIOR = 'Junior (10-12)',
  YOUTH = 'Youth (13-17)',
  ADULT = 'Adult (18+)'
}

export enum MaterialType {
  LESSON_PLAN = 'Lesson Plan',
  WORKSHEET = 'Worksheet',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  PRESENTATION = 'Presentation',
  BOOK = 'Book',
  CRAFT = 'Craft',
  GAME = 'Game'
}

export enum TeacherStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive'
}

// Core Interfaces
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualifications: string[];
  assignedClasses: string[]; // Array of class IDs
  joinDate: string;
  status: TeacherStatus;
  bio?: string;
  experience?: string;
  specializations?: string[];
  avatar?: string;
}

export interface Student {
  id: string;
  name: string;
  age: number;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentContact: {
    parentName: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string;
  };
  currentClassId?: string;
  classHistory: {
    classId: string;
    className: string;
    startDate: string;
    endDate?: string;
  }[];
  enrollmentDate: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  medicalInfo?: string;
  notes?: string;
  avatar?: string;
}

export interface SundaySchoolClass {
  id: string;
  name: string;
  description: string;
  ageGroup: AgeGroup;
  teacher: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  assistantTeachers?: {
    id: string;
    name: string;
  }[];
  students: number; // Current student count
  maxStudents: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  location: string;
  status: ClassStatus;
  curriculum?: string;
  objectives?: string[];
  createdDate: string;
  lastUpdated: string;
}

export interface ClassAttendance {
  id: string;
  classId: string;
  studentId: string;
  studentName: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface TeachingMaterial {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  ageGroup?: AgeGroup;
  classId?: string; // If specific to a class
  uploadDate: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  tags?: string[];
  isPublic: boolean;
  downloadCount: number;
}

// Stats and Analytics
export interface SundaySchoolStats {
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  averageAttendance: number;
  activeClasses: number;
  inactiveClasses: number;
  studentsThisWeek: number;
  attendanceThisWeek: number;
  growthRate: number;
}

export interface ClassStats {
  classId: string;
  className: string;
  totalStudents: number;
  averageAttendance: number;
  attendanceRate: number;
  lastClassDate: string;
  nextClassDate: string;
  teacherName: string;
}

export interface AttendanceReport {
  period: string;
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  attendanceByClass: {
    classId: string;
    className: string;
    attendanceRate: number;
    totalSessions: number;
  }[];
  attendanceByMonth: {
    month: string;
    attendanceRate: number;
    totalStudents: number;
  }[];
}

// Form Data Interfaces
export interface ClassFormData {
  name: string;
  description: string;
  ageGroup: AgeGroup;
  teacherId: string;
  assistantTeacherIds?: string[];
  maxStudents: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  location: string;
  curriculum?: string;
  objectives?: string[];
}

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  qualifications: string[];
  bio?: string;
  experience?: string;
  specializations?: string[];
}

export interface StudentFormData {
  name: string;
  age: number;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  parentContact: {
    parentName: string;
    relationship: string;
    phone: string;
    email: string;
    address?: string;
  };
  classId?: string;
  medicalInfo?: string;
  notes?: string;
}

export interface MaterialFormData {
  title: string;
  description: string;
  type: MaterialType;
  ageGroup?: AgeGroup;
  classId?: string;
  tags?: string[];
  isPublic: boolean;
  file?: File;
}

export interface AttendanceFormData {
  classId: string;
  date: string;
  attendanceRecords: {
    studentId: string;
    status: AttendanceStatus;
    notes?: string;
  }[];
}

// API Response Types
export type SundaySchoolClassResponse = ApiResponse<SundaySchoolClass>;
export type SundaySchoolClassesResponse = ApiResponse<SundaySchoolClass[]>;
export type TeacherResponse = ApiResponse<Teacher>;
export type TeachersResponse = ApiResponse<Teacher[]>;
export type StudentResponse = ApiResponse<Student>;
export type StudentsResponse = ApiResponse<Student[]>;
export type MaterialResponse = ApiResponse<TeachingMaterial>;
export type MaterialsResponse = ApiResponse<TeachingMaterial[]>;
export type AttendanceResponse = ApiResponse<ClassAttendance[]>;
export type SundaySchoolStatsResponse = ApiResponse<SundaySchoolStats>;
export type AttendanceReportResponse = ApiResponse<AttendanceReport>;

// Query Parameters
export interface ClassQueryParams {
  search?: string;
  ageGroup?: AgeGroup;
  status?: ClassStatus;
  teacherId?: string;
  limit?: number;
  offset?: number;
}

export interface StudentQueryParams {
  search?: string;
  classId?: string;
  ageGroup?: AgeGroup;
  status?: 'Active' | 'Inactive' | 'Graduated';
  limit?: number;
  offset?: number;
}

export interface TeacherQueryParams {
  search?: string;
  status?: 'Active' | 'Inactive';
  hasClasses?: boolean;
  limit?: number;
  offset?: number;
}

export interface MaterialQueryParams {
  search?: string;
  type?: MaterialType;
  ageGroup?: AgeGroup;
  classId?: string;
  isPublic?: boolean;
  uploadedBy?: string;
  limit?: number;
  offset?: number;
}

export interface AttendanceQueryParams {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}