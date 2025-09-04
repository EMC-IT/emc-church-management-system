// Export all services for easy importing
export { default as apiClient } from './api-client';
export { default as authService } from './auth-service';
export { default as membersService } from './members-service';
export { financeService } from './finance-service';
export { default as eventsService } from './events-service';
export { default as communicationsService } from './communications-service';
export { default as reportsService } from './reports-service';
export { default as uploadService } from './upload-service';
export { default as documentsService } from './documents-service';
export { default as givingService } from './giving-service';
export { default as attendanceService } from './attendance-service';
export { default as groupsService } from './groups-service';
export { default as sundaySchoolService } from './sunday-school-service';
export { default as departmentsService } from './departments-service';

// Export types from services
export type {
  AuthResponse,
  LoginResponse,
} from './auth-service';

export type {
  MembersResponse,
  MemberResponse,
  SearchParams as MembersSearchParams,
} from './members-service';

// Finance service types are exported from lib/types.ts

export type {
  EventsResponse,
  EventFormData,
  EventAttendee,
  EventRegistration,
  EventAttendance,
  SearchParams as EventsSearchParams,
} from './events-service';

export type {
  CommunicationsResponse,
  SMSMessage,
  EmailMessage,
  Announcement,
  CommunicationTemplate,
  ContactGroup,
  SMSFormData,
  EmailFormData,
  AnnouncementFormData,
  SearchParams as CommunicationsSearchParams,
} from './communications-service';

export type {
  ReportsResponse,
  AnalyticsOverview,
  AttendanceReport,
  GivingReport,
  MemberReport,
  EventReport,
  FinancialReport as ReportsFinancialReport,
  ReportParams,
} from './reports-service';

export type {
  UploadResponse,
  UploadProgress,
  UploadedFile,
  UploadConfig,
  FileValidationResult,
} from './upload-service';

export type {
  DocumentsResponse,
  DocumentResponse,
} from './documents-service';

export type {
  GivingResponse,
  GivingListResponse,
} from './giving-service';

export type {
  GroupsResponse,
  GroupSearchParams,
} from './groups-service';

export type {
  DepartmentResponse,
  DepartmentsResponse,
  DepartmentStatsResponse,
  DepartmentReportResponse,
} from '../lib/types/departments';