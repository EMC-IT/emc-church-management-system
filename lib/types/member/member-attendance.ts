export type AttendanceServiceType =
  | 'Sunday Service'
  | 'Midweek Service'
  | 'Prayer Meeting'
  | 'Youth Service'
  | 'Special Event';

export type AttendanceCheckInMethod = 'QR Code' | 'Manual' | 'Self Check-in' | 'Kiosk';

export type MemberAttendanceStatus = 'present' | 'online' | 'excused' | 'absent';

export interface MemberAttendanceRecord {
  id: string;
  eventName: string;
  serviceType: AttendanceServiceType;
  date: string;
  checkInTime?: string;
  branch: string;
  campus?: string;
  status: MemberAttendanceStatus;
  checkInMethod?: AttendanceCheckInMethod;
}

export interface MemberAttendanceSummary {
  totalServicesAttendedThisYear: number;
  totalEligibleServicesThisYear: number;
  attendanceRatePercentage: number;
  currentStreakWeeks: number;
  longestStreakWeeks: number;
  lastAttended?: {
    serviceName: string;
    serviceType: AttendanceServiceType;
    date: string;
    branch: string;
    campus?: string;
  } | null;
  recentRecords: MemberAttendanceRecord[];
}

export interface MemberAttendanceTrendPoint {
  month: string;
  attended: number;
  total: number;
  rate: number;
}

export interface MemberAttendanceInsight {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'neutral' | 'info';
}

export interface MemberAttendanceFilter {
  dateRange?: '30d' | '90d' | '180d' | 'year' | 'all';
  serviceType?: AttendanceServiceType | 'all';
  status?: MemberAttendanceStatus | 'all';
  search?: string;
}
