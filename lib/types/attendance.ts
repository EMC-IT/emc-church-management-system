// ============================================================================
// ATTENDANCE MODULE TYPES
// ============================================================================

export interface Attendance {
  id: string;
  memberId: string;
  memberName: string;
  serviceType: ServiceType;
  serviceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  branch: string;
  departmentId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  PARTIAL = 'partial'
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  member: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
    department?: string;
    group?: string;
  };
  serviceType: ServiceType;
  serviceDate: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  recordedBy: string;
  branch: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  serviceType: ServiceType;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  expectedAttendees: number;
  actualAttendees: number;
  attendanceRate: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  branch: string;
  departmentId?: string;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalSessions: number;
  totalAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  trends: {
    period: string;
    attendance: number;
    rate: number;
  }[];
}

export interface MemberAttendanceProfile {
  memberId: string;
  memberName: string;
  totalSessions: number;
  attendedSessions: number;
  attendanceRate: number;
  streak: number;
  lastAttended: string;
  attendanceHistory: AttendanceRecord[];
  monthlyStats: {
    month: string;
    attended: number;
    total: number;
    rate: number;
  }[];
}

export interface AttendanceReport {
  period: {
    start: string;
    end: string;
  };
  totalSessions: number;
  totalAttendees: number;
  averageAttendance: number;
  attendanceRate: number;
  byServiceType: Record<ServiceType, AttendanceStats>;
  byDepartment: Record<string, AttendanceStats>;
  byGroup: Record<string, AttendanceStats>;
  topAttenders: {
    memberId: string;
    memberName: string;
    attendanceRate: number;
    sessionsAttended: number;
  }[];
  trends: {
    date: string;
    attendance: number;
    rate: number;
  }[];
}

export interface AttendanceFormData {
  serviceType: ServiceType;
  serviceDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  expectedAttendees?: number;
  departmentId?: string;
  groupId?: string;
  notes?: string;
}

export interface BulkAttendanceData {
  sessionId: string;
  attendances: {
    memberId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    notes?: string;
  }[];
}

export interface AttendanceSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  serviceType?: ServiceType;
  attendanceStatus?: AttendanceStatus;
  departmentId?: string;
  groupId?: string;
  branch?: string;
  memberId?: string;
}

// Service Type definition
export type ServiceType = 'Sunday Service' | 'Bible Study' | 'Prayer Meeting' | 'Youth Service' | 'Midweek Service' | 'Special Service' | 'Other';