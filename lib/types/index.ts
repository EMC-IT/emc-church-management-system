// ============================================================================
// TYPES INDEX - CENTRALIZED TYPE EXPORTS
// ============================================================================

// Authentication Types
export * from './auth';

// Member Types (explicit export to avoid Department conflict)
export type {
  Member,
  MemberFormData,
  Family,
  Gender,
  MaritalStatus,
  Department as MemberDepartment
} from './members';


// Department Types (explicit export to avoid EventStatus conflict)
export type {
  DepartmentCategory,
  DepartmentRoleType,
  DepartmentRole,
  MeetingType,
  MeetingStatus,
  DepartmentMeeting,
  EventType,
  EventStatus as DepartmentEventStatus,
  DepartmentEvent,
  DepartmentAttendance,
  DepartmentMember,
  DepartmentStats,
  DepartmentReport,
  DepartmentFormData,
  DepartmentRoleFormData,
  DepartmentMeetingFormData,
  DepartmentEventFormData,
  DepartmentCategoryFormData,
  DepartmentQueryParams,
  DepartmentMeetingQueryParams,
  DepartmentEventQueryParams,
  DepartmentResponse,
  DepartmentsResponse,
  DepartmentStatsResponse,
  DepartmentReportResponse,
  Department
} from './departments';

// Group Types
export * from './groups';

// Finance Types
export * from './finance';

// Assets Types (explicit export to avoid Amount conflict)
export type {
  Currency,
  Amount as AssetAmount,
  AssetCategory,
  AssetStatus,
  AssetCondition,
  AssetPriority,
  MaintenanceType,
  MaintenanceStatus,
  AssignmentType,
  AssignmentStatus,
  Asset,
  AssetMaintenance,
  AssetAssignment,
  AssetCategoryData,
  AssetFormData,
  AssetMaintenanceFormData,
  AssetAssignmentFormData,
  AssetSearchParams,
  AssetMaintenanceSearchParams,
  AssetAnalytics,
  AssetReport,
  AssetListResponse,
  AssetMaintenanceListResponse,
  AssetAssignmentListResponse,

  AssetCategoryType,
  AssetStatusType,
  AssetConditionType,
  AssetPriorityType,
  MaintenanceTypeType,
  MaintenanceStatusType,
  AssignmentTypeType,
  AssignmentStatusType
} from './assets';

// Attendance Types
export * from './attendance';

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