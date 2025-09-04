// ============================================================================
// TYPES INDEX - CENTRALIZED TYPE EXPORTS
// ============================================================================

// Authentication Types
export * from './auth';

// Member Types
export * from './members';

// Attendance Types (primary)
export * from './attendance';

// Finance Types
export * from './finance';

// Groups Types
export * from './groups';

// Sunday School Types (with aliases for conflicts)
export type {
  // Rename conflicting types to avoid ambiguity
  AttendanceStatus as SundaySchoolAttendanceStatus,
  AttendanceFormData as SundaySchoolAttendanceFormData,
  AttendanceReport as SundaySchoolAttendanceReport,
  // Export all other types normally
  Teacher,
  Student,
  SundaySchoolClass,
  ClassAttendance,
  TeachingMaterial,
  SundaySchoolStats,
  ClassStats,
  ClassFormData,
  TeacherFormData,
  StudentFormData,
  MaterialFormData,
  ClassStatus,
  AgeGroup,
  MaterialType,
  TeacherStatus,
  // API Response Types
  SundaySchoolClassResponse,
  SundaySchoolClassesResponse,
  TeacherResponse,
  TeachersResponse,
  StudentResponse,
  StudentsResponse,
  MaterialResponse,
  MaterialsResponse,
  AttendanceResponse,
  SundaySchoolStatsResponse,
  AttendanceReportResponse,
  // Query Parameter Types
  ClassQueryParams,
  StudentQueryParams,
  TeacherQueryParams,
  MaterialQueryParams,
  AttendanceQueryParams
} from './sunday-school';

// Common/Shared Types
export * from './common';

// Note: Explicit exports used for sunday-school to resolve naming conflicts
// Main attendance types take precedence for system-wide usage