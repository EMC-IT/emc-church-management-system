import apiClient from './api-client';
import {
  Attendance,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStats,
  MemberAttendanceProfile,
  AttendanceReport,
  AttendanceFormData,
  BulkAttendanceData,
  AttendanceSearchParams,
  AttendanceStatus,
  ServiceType,
  PaginatedResponse,
  ApiResponse
} from '@/lib/types';

export interface AttendanceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// ===== MOCK DATA =====

// Mock attendance records
export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  {
    id: 'att_001',
    memberId: 'mem_001',
    member: {
      id: 'mem_001',
      name: 'John Doe',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
      phone: '+233 24 123 4567',
      department: 'Media Ministry',
      group: 'Youth Group'
    },
    serviceType: 'Sunday Service' as ServiceType,
    serviceDate: '2024-01-21',
    status: AttendanceStatus.PRESENT,
    checkInTime: '08:45',
    recordedBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-21T08:45:00Z'
  },
  {
    id: 'att_002',
    memberId: 'mem_002',
    member: {
      id: 'mem_002',
      name: 'Jane Smith',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
      phone: '+233 24 234 5678',
      department: 'Children Ministry',
      group: 'Women Fellowship'
    },
    serviceType: 'Sunday Service' as ServiceType,
    serviceDate: '2024-01-21',
    status: AttendanceStatus.LATE,
    checkInTime: '09:15',
    notes: 'Traffic delay',
    recordedBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-21T09:15:00Z'
  },
  {
    id: 'att_003',
    memberId: 'mem_003',
    member: {
      id: 'mem_003',
      name: 'Michael Johnson',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
      phone: '+233 24 345 6789',
      department: 'Ushering',
      group: 'Men Fellowship'
    },
    serviceType: 'Bible Study' as ServiceType,
    serviceDate: '2024-01-17',
    status: AttendanceStatus.PRESENT,
    checkInTime: '18:30',
    recordedBy: 'admin_002',
    branch: 'Main Campus',
    createdAt: '2024-01-17T18:30:00Z'
  },
  {
    id: 'att_004',
    memberId: 'mem_004',
    member: {
      id: 'mem_004',
      name: 'Sarah Wilson',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
      phone: '+233 24 456 7890',
      department: 'Music Ministry',
      group: 'Choir'
    },
    serviceType: 'Sunday Service' as ServiceType,
    serviceDate: '2024-01-21',
    status: AttendanceStatus.EXCUSED,
    notes: 'Sick leave',
    recordedBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-21T09:00:00Z'
  },
  {
    id: 'att_005',
    memberId: 'mem_005',
    member: {
      id: 'mem_005',
      name: 'David Brown',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
      phone: '+233 24 567 8901',
      department: 'Security',
      group: 'Men Fellowship'
    },
    serviceType: 'Prayer Meeting' as ServiceType,
    serviceDate: '2024-01-19',
    status: AttendanceStatus.PRESENT,
    checkInTime: '06:00',
    recordedBy: 'admin_003',
    branch: 'Main Campus',
    createdAt: '2024-01-19T06:00:00Z'
  }
];

// Mock attendance sessions
export const MOCK_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'session_001',
    title: 'Sunday Service - Week 3',
    serviceType: 'Sunday Service' as ServiceType,
    date: '2024-01-21',
    startTime: '09:00',
    endTime: '11:30',
    location: 'Main Auditorium',
    expectedAttendees: 450,
    actualAttendees: 387,
    attendanceRate: 86,
    status: 'completed',
    createdBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-21T09:00:00Z',
    updatedAt: '2024-01-21T11:30:00Z'
  },
  {
    id: 'session_002',
    title: 'Midweek Bible Study',
    serviceType: 'Bible Study' as ServiceType,
    date: '2024-01-17',
    startTime: '18:30',
    endTime: '20:00',
    location: 'Fellowship Hall',
    expectedAttendees: 120,
    actualAttendees: 98,
    attendanceRate: 82,
    status: 'completed',
    createdBy: 'admin_002',
    branch: 'Main Campus',
    createdAt: '2024-01-17T18:30:00Z',
    updatedAt: '2024-01-17T20:00:00Z'
  },
  {
    id: 'session_003',
    title: 'Friday Prayer Meeting',
    serviceType: 'Prayer Meeting' as ServiceType,
    date: '2024-01-19',
    startTime: '06:00',
    endTime: '07:00',
    location: 'Prayer Room',
    expectedAttendees: 45,
    actualAttendees: 38,
    attendanceRate: 84,
    status: 'completed',
    createdBy: 'admin_003',
    branch: 'Main Campus',
    createdAt: '2024-01-19T06:00:00Z',
    updatedAt: '2024-01-19T07:00:00Z'
  },
  {
    id: 'session_004',
    title: 'Youth Service',
    serviceType: 'Youth Service' as ServiceType,
    date: '2024-01-20',
    startTime: '16:00',
    endTime: '18:00',
    location: 'Youth Hall',
    expectedAttendees: 85,
    actualAttendees: 72,
    attendanceRate: 85,
    status: 'completed',
    createdBy: 'admin_004',
    branch: 'Main Campus',
    groupId: 'group_youth',
    createdAt: '2024-01-20T16:00:00Z',
    updatedAt: '2024-01-20T18:00:00Z'
  }
];

// Mock attendance statistics
export const MOCK_ATTENDANCE_STATS: AttendanceStats = {
  totalSessions: 24,
  totalAttendees: 1250,
  averageAttendance: 52,
  attendanceRate: 84,
  presentCount: 1050,
  absentCount: 120,
  lateCount: 65,
  excusedCount: 15,
  trends: [
    { period: '2024-01', attendance: 387, rate: 86 },
    { period: '2024-02', attendance: 412, rate: 89 },
    { period: '2024-03', attendance: 395, rate: 85 },
    { period: '2024-04', attendance: 428, rate: 91 }
  ]
};

class AttendanceService {
  // ===== ATTENDANCE SESSIONS =====

  // Get all attendance sessions
  async getAttendanceSessions(params: AttendanceSearchParams = {}): Promise<AttendanceResponse<PaginatedResponse<AttendanceSession>>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredSessions = [...MOCK_ATTENDANCE_SESSIONS];
      
      // Apply filters
      if (params.serviceType) {
        filteredSessions = filteredSessions.filter(session => session.serviceType === params.serviceType);
      }
      
      if (params.startDate && params.endDate) {
        filteredSessions = filteredSessions.filter(session => 
          session.date >= params.startDate! && session.date <= params.endDate!
        );
      }
      
      if (params.search) {
        filteredSessions = filteredSessions.filter(session => 
          session.title.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedSessions = filteredSessions.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          data: paginatedSessions,
          total: filteredSessions.length,
          page,
          limit,
          totalPages: Math.ceil(filteredSessions.length / limit)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch attendance sessions'
      };
    }
  }

  // Get attendance session by ID
  async getAttendanceSession(id: string): Promise<AttendanceResponse<AttendanceSession>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const session = MOCK_ATTENDANCE_SESSIONS.find(s => s.id === id);
      if (!session) {
        return {
          success: false,
          message: 'Attendance session not found'
        };
      }
      
      return {
        success: true,
        data: session
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch attendance session'
      };
    }
  }

  // Create attendance session
  async createAttendanceSession(sessionData: AttendanceFormData): Promise<AttendanceResponse<AttendanceSession>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newSession: AttendanceSession = {
        id: `session_${Date.now()}`,
        title: `${sessionData.serviceType} - ${sessionData.serviceDate}`,
        serviceType: sessionData.serviceType,
        date: sessionData.serviceDate,
        startTime: sessionData.startTime,
        endTime: sessionData.endTime || '',
        location: sessionData.location,
        expectedAttendees: sessionData.expectedAttendees || 0,
        actualAttendees: 0,
        attendanceRate: 0,
        status: 'scheduled',
        createdBy: 'current_user',
        branch: 'Main Campus',
        departmentId: sessionData.departmentId,
        groupId: sessionData.groupId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newSession,
        message: 'Attendance session created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to create attendance session'
      };
    }
  }

  // ===== ATTENDANCE RECORDS =====

  // Get attendance records
  async getAttendanceRecords(params: AttendanceSearchParams = {}): Promise<AttendanceResponse<PaginatedResponse<AttendanceRecord>>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredRecords = [...MOCK_ATTENDANCE_RECORDS];
      
      // Apply filters
      if (params.serviceType) {
        filteredRecords = filteredRecords.filter(record => record.serviceType === params.serviceType);
      }
      
      if (params.status) {
        filteredRecords = filteredRecords.filter(record => record.status === params.status);
      }
      
      if (params.memberId) {
        filteredRecords = filteredRecords.filter(record => record.memberId === params.memberId);
      }
      
      if (params.startDate && params.endDate) {
        filteredRecords = filteredRecords.filter(record => 
          record.serviceDate >= params.startDate! && record.serviceDate <= params.endDate!
        );
      }
      
      if (params.search) {
        filteredRecords = filteredRecords.filter(record => 
          record.member.name.toLowerCase().includes(params.search!.toLowerCase())
        );
      }
      
      // Pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRecords = filteredRecords.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          data: paginatedRecords,
          total: filteredRecords.length,
          page,
          limit,
          totalPages: Math.ceil(filteredRecords.length / limit)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch attendance records'
      };
    }
  }

  // Mark attendance (single)
  async markAttendance(attendance: Partial<Attendance>): Promise<AttendanceResponse<AttendanceRecord>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newRecord: AttendanceRecord = {
        id: `att_${Date.now()}`,
        memberId: attendance.memberId!,
        member: {
          id: attendance.memberId!,
          name: attendance.memberName || 'Unknown Member',
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20person%20in%20church%20attire&image_size=square'
        },
        serviceType: attendance.serviceType!,
        serviceDate: attendance.serviceDate!,
        status: attendance.status!,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime,
        notes: attendance.notes,
        recordedBy: attendance.recordedBy || 'current_user',
        branch: attendance.branch || 'Main Campus',
        createdAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: newRecord,
        message: 'Attendance marked successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to mark attendance'
      };
    }
  }

  // Bulk mark attendance
  async bulkMarkAttendance(bulkData: BulkAttendanceData): Promise<AttendanceResponse<AttendanceRecord[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const records: AttendanceRecord[] = bulkData.attendances.map((attendance, index) => ({
        id: `att_bulk_${Date.now()}_${index}`,
        memberId: attendance.memberId,
        member: {
          id: attendance.memberId,
          name: `Member ${attendance.memberId}`,
          avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20person%20in%20church%20attire&image_size=square'
        },
        serviceType: 'Sunday Service' as ServiceType,
        serviceDate: new Date().toISOString().split('T')[0],
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        notes: attendance.notes,
        recordedBy: 'current_user',
        branch: 'Main Campus',
        createdAt: new Date().toISOString()
      }));
      
      return {
        success: true,
        data: records,
        message: `Successfully marked attendance for ${records.length} members`
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to mark bulk attendance'
      };
    }
  }

  // ===== ATTENDANCE STATISTICS =====

  // Get attendance statistics
  async getAttendanceStats(params: AttendanceSearchParams = {}): Promise<AttendanceResponse<AttendanceStats>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      return {
        success: true,
        data: MOCK_ATTENDANCE_STATS
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch attendance statistics'
      };
    }
  }

  // Get member attendance profile
  async getMemberAttendanceProfile(memberId: string): Promise<AttendanceResponse<MemberAttendanceProfile>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const memberRecords = MOCK_ATTENDANCE_RECORDS.filter(record => record.memberId === memberId);
      const attendedSessions = memberRecords.filter(record => 
        record.status === AttendanceStatus.PRESENT || record.status === AttendanceStatus.LATE
      ).length;
      
      const profile: MemberAttendanceProfile = {
        memberId,
        memberName: memberRecords[0]?.member.name || 'Unknown Member',
        totalSessions: 20,
        attendedSessions,
        attendanceRate: Math.round((attendedSessions / 20) * 100),
        streak: 5,
        lastAttended: memberRecords[0]?.serviceDate || '2024-01-21',
        attendanceHistory: memberRecords,
        monthlyStats: [
          { month: '2024-01', attended: 3, total: 4, rate: 75 },
          { month: '2024-02', attended: 4, total: 4, rate: 100 },
          { month: '2024-03', attended: 3, total: 5, rate: 60 },
          { month: '2024-04', attended: 4, total: 4, rate: 100 }
        ]
      };
      
      return {
        success: true,
        data: profile
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch member attendance profile'
      };
    }
  }

  // Get attendance report
  async getAttendanceReport(params: AttendanceSearchParams = {}): Promise<AttendanceResponse<AttendanceReport>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const report: AttendanceReport = {
        period: {
          start: params.startDate || '2024-01-01',
          end: params.endDate || '2024-04-30'
        },
        totalSessions: 24,
        totalAttendees: 1250,
        averageAttendance: 52,
        attendanceRate: 84,
        byServiceType: {
          'Sunday Service': MOCK_ATTENDANCE_STATS,
          'Bible Study': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 78 },
          'Prayer Meeting': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 65 },
          'Youth Service': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 88 },
          'Midweek Service': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 72 },
          'Special Service': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 95 },
          'Other': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 60 }
        } as Record<ServiceType, AttendanceStats>,
        byDepartment: {
          'Media Ministry': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 92 },
          'Music Ministry': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 89 },
          'Children Ministry': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 85 },
          'Ushering': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 87 }
        },
        byGroup: {
          'Youth Group': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 88 },
          'Women Fellowship': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 82 },
          'Men Fellowship': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 79 },
          'Choir': { ...MOCK_ATTENDANCE_STATS, attendanceRate: 91 }
        },
        topAttenders: [
          { memberId: 'mem_001', memberName: 'John Doe', attendanceRate: 95, sessionsAttended: 19 },
          { memberId: 'mem_002', memberName: 'Jane Smith', attendanceRate: 90, sessionsAttended: 18 },
          { memberId: 'mem_003', memberName: 'Michael Johnson', attendanceRate: 85, sessionsAttended: 17 },
          { memberId: 'mem_004', memberName: 'Sarah Wilson', attendanceRate: 80, sessionsAttended: 16 },
          { memberId: 'mem_005', memberName: 'David Brown', attendanceRate: 75, sessionsAttended: 15 }
        ],
        trends: [
          { date: '2024-01-07', attendance: 380, rate: 84 },
          { date: '2024-01-14', attendance: 395, rate: 88 },
          { date: '2024-01-21', attendance: 387, rate: 86 },
          { date: '2024-01-28', attendance: 412, rate: 91 }
        ]
      };
      
      return {
        success: true,
        data: report
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch attendance report'
      };
    }
  }

  // Export attendance data
  async exportAttendanceData(params: AttendanceSearchParams = {}): Promise<AttendanceResponse<Blob>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate CSV export
      const csvContent = 'Member Name,Service Type,Date,Status,Check In Time\n' +
        MOCK_ATTENDANCE_RECORDS.map(record => 
          `${record.member.name},${record.serviceType},${record.serviceDate},${record.status},${record.checkInTime || 'N/A'}`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      return {
        success: true,
        data: blob,
        message: 'Attendance data exported successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to export attendance data'
      };
    }
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;