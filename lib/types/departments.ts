import { AttendanceStatus } from '../types';

// ============================================================================
// DEPARTMENTS MODULE TYPES
// ============================================================================

// Department Category Types
export interface DepartmentCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department Role Types
export enum DepartmentRoleType {
  HEAD = 'head',
  ASSISTANT_HEAD = 'assistant_head',
  SECRETARY = 'secretary',
  TREASURER = 'treasurer',
  COORDINATOR = 'coordinator',
  MEMBER = 'member'
}

export interface DepartmentRole {
  id: string;
  departmentId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  roleType: DepartmentRoleType;
  title: string;
  description?: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Department Meeting Types
export enum MeetingType {
  REGULAR = 'regular',
  PLANNING = 'planning',
  TRAINING = 'training',
  EMERGENCY = 'emergency',
  RETREAT = 'retreat'
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

export interface DepartmentMeeting {
  id: string;
  departmentId: string;
  title: string;
  description?: string;
  type: MeetingType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: string[];
  attendees: string[]; // member IDs
  expectedAttendees: number;
  actualAttendees: number;
  status: MeetingStatus;
  minutes?: string;
  decisions: string[];
  actionItems: {
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Department Event Types
export enum EventType {
  WORKSHOP = 'workshop',
  SEMINAR = 'seminar',
  OUTREACH = 'outreach',
  FUNDRAISING = 'fundraising',
  SOCIAL = 'social',
  TRAINING = 'training',
  CONFERENCE = 'conference'
}

export enum EventStatus {
  PLANNING = 'planning',
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface DepartmentEvent {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  budget: number;
  actualCost?: number;
  expectedAttendees: number;
  actualAttendees?: number;
  status: EventStatus;
  organizers: string[]; // member IDs
  volunteers: string[]; // member IDs
  requirements: string[];
  outcomes?: string[];
  feedback?: {
    rating: number;
    comments: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Department Attendance Types
export interface DepartmentAttendance {
  id: string;
  departmentId: string;
  meetingId?: string;
  eventId?: string;
  memberId: string;
  memberName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

// Department Member Types
export interface DepartmentMember {
  id: string;
  departmentId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  memberAvatar?: string;
  joinDate: string;
  leaveDate?: string;
  isActive: boolean;
  roles: DepartmentRole[];
  skills: string[];
  availability: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Department Statistics Types
export interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalMembers: number;
  activeMembers: number;
  totalMeetings: number;
  averageAttendance: number;
  attendanceRate: number;
  totalEvents: number;
  completedEvents: number;
  totalBudget: number;
  spentBudget: number;
  monthlyStats: {
    month: string;
    meetings: number;
    events: number;
    attendance: number;
    budget: number;
  }[];
  topPerformers: {
    memberId: string;
    memberName: string;
    attendanceRate: number;
    eventsOrganized: number;
  }[];
}

// Department Report Types
export interface DepartmentReport {
  departmentId: string;
  departmentName: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalMembers: number;
    totalMeetings: number;
    totalEvents: number;
    averageAttendance: number;
    budgetUtilization: number;
  };
  activities: {
    meetings: DepartmentMeeting[];
    events: DepartmentEvent[];
  };
  attendance: {
    byMember: {
      memberId: string;
      memberName: string;
      attendanceRate: number;
      meetingsAttended: number;
      eventsAttended: number;
    }[];
    byMonth: {
      month: string;
      meetingAttendance: number;
      eventAttendance: number;
    }[];
  };
  financial: {
    totalBudget: number;
    totalSpent: number;
    byCategory: {
      category: string;
      budgeted: number;
      spent: number;
    }[];
  };
  achievements: string[];
  challenges: string[];
  recommendations: string[];
}

// Form Data Types
export interface DepartmentFormData {
  name: string;
  description: string;
  leader: string;
  departmentType?: string;
  categoryId?: string;
  status?: 'Active' | 'Inactive';
  budget?: number;
  location?: string;
  meetingSchedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
}

export interface DepartmentRoleFormData {
  memberId: string;
  roleType: DepartmentRoleType;
  title: string;
  description?: string;
  responsibilities: string[];
  startDate: string;
  endDate?: string;
}

export interface DepartmentMeetingFormData {
  title: string;
  description?: string;
  type: MeetingType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  agenda: string[];
  attendees: string[];
}

export interface DepartmentEventFormData {
  title: string;
  description: string;
  type: EventType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  budget: number;
  expectedAttendees: number;
  organizers: string[];
  requirements: string[];
}

export interface DepartmentCategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

// Query Parameters
export interface DepartmentQueryParams {
  search?: string;
  categoryId?: string;
  status?: 'Active' | 'Inactive';
  departmentType?: string;
  page?: number;
  limit?: number;
}

export interface DepartmentMeetingQueryParams {
  departmentId?: string;
  type?: MeetingType;
  status?: MeetingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DepartmentEventQueryParams {
  departmentId?: string;
  type?: EventType;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// API Response Types
export interface DepartmentResponse {
  success: boolean;
  data?: Department;
  message: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data?: Department[];
  message: string;
}

export interface DepartmentStatsResponse {
  success: boolean;
  data?: DepartmentStats;
  message: string;
}

export interface DepartmentReportResponse {
  success: boolean;
  data?: DepartmentReport;
  message: string;
}

// Extended Department Interface
export interface Department {
  id: string;
  name: string;
  description: string;
  leader: string;
  members: string[];
  departmentType?: string;
  categoryId?: string;
  category?: DepartmentCategory;
  status?: 'Active' | 'Inactive';
  budget?: number;
  location?: string;
  meetingSchedule?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  stats?: {
    totalMembers: number;
    activeMembers: number;
    averageAttendance: number;
    upcomingMeetings: number;
    upcomingEvents: number;
  };
  createdAt: string;
  updatedAt: string;
}