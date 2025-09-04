// ============================================================================
// GROUPS MODULE TYPES
// ============================================================================

import { AttendanceStatus } from './attendance';

// Group Types
export interface Group {
  id: string;
  name: string;
  description: string;
  category: string;
  leader: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  members: number;
  maxMembers: number;
  meetingSchedule: string;
  location: string;
  engagement: number;
  status: 'Active' | 'Inactive' | 'Archived';
  createdAt: string;
  updatedAt: string;
}

export interface GroupFormData {
  name: string;
  description: string;
  category: string;
  leader: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  maxMembers: number;
  meetingSchedule: string;
  location: string;
  status: 'Active' | 'Inactive' | 'Archived';
}

// Group Member Types
export interface GroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  firstName?: string;
  lastName?: string;
  role: string;
  joinedAt: string;
  status: 'Active' | 'Inactive';
}

export interface GroupMemberFormData {
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  role: string;
}

// Group Role Types
export interface GroupRole {
  id: string;
  groupId: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
  createdAt: string;
}

export interface GroupRoleFormData {
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

// Group Event Types
export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  registeredAttendees: number;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  type?: string;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  notes?: string;
}

export interface GroupEventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees: number;
  type?: string;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  status?: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  notes?: string;
}

// Group Category Types
export interface GroupCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  isActive?: boolean;
}

// Group Attendance Types
export interface GroupAttendance {
  id: string;
  groupId: string;
  eventId?: string;
  memberId: string;
  memberName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface GroupAttendanceFormData {
  groupId: string;
  eventId?: string;
  date: string;
  attendances: {
    memberId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    notes?: string;
  }[];
}

// Group Statistics Types
export interface GroupStats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  averageEngagement: number;
  categoryStats: {
    category: string;
    count: number;
    members: number;
  }[];
  engagementTrend: {
    month: string;
    engagement: number;
  }[];
}

// Group Search and Filter Types
export interface GroupSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  leader?: string;
  sortBy?: 'name' | 'members' | 'engagement' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Note: GroupExtended and GroupFormDataExtended are already exported above