import apiClient from './api-client';

export interface ReportsResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface AnalyticsOverview {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  totalDonations: number;
  totalEvents: number;
  upcomingEvents: number;
  averageAttendance: number;
  growthRate: number;
}

export interface AttendanceReport {
  totalSessions: number;
  totalAttendance: number;
  averageAttendance: number;
  attendanceRate: number;
  monthlyTrends: Array<{
    month: string;
    sessions: number;
    attendance: number;
    rate: number;
  }>;
  topAttendees: Array<{
    memberId: string;
    memberName: string;
    attendanceCount: number;
    attendanceRate: number;
  }>;
  serviceBreakdown: Array<{
    serviceType: string;
    sessions: number;
    attendance: number;
    rate: number;
  }>;
}

export interface GivingReport {
  totalDonations: number;
  totalTithes: number;
  totalOfferings: number;
  totalSpecial: number;
  averageDonation: number;
  monthlyTrends: Array<{
    month: string;
    amount: number;
    count: number;
    average: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  topDonors: Array<{
    memberId: string;
    memberName: string;
    totalAmount: number;
    donationCount: number;
    averageAmount: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

export interface MemberReport {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  newMembersThisMonth: number;
  genderDistribution: {
    male: number;
    female: number;
  };
  ageDistribution: Array<{
    ageGroup: string;
    count: number;
    percentage: number;
  }>;
  maritalStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  membershipDuration: Array<{
    duration: string;
    count: number;
    percentage: number;
  }>;
  familyBreakdown: Array<{
    familySize: string;
    count: number;
    percentage: number;
  }>;
}

export interface EventReport {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  totalAttendees: number;
  averageAttendance: number;
  categoryBreakdown: Array<{
    category: string;
    events: number;
    attendees: number;
    averageAttendance: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    events: number;
    attendees: number;
  }>;
  topEvents: Array<{
    eventId: string;
    eventTitle: string;
    attendees: number;
    date: string;
  }>;
}

export interface FinancialReport {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  budgetUtilization: number;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    expenses: number;
    netIncome: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    revenue: number;
    expenses: number;
    netIncome: number;
  }>;
  budgetVsActual: Array<{
    department: string;
    budgeted: number;
    actual: number;
    variance: number;
    variancePercentage: number;
  }>;
}

export interface ReportParams {
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  category?: string;
  memberId?: string;
  eventId?: string;
  format?: 'json' | 'csv' | 'pdf' | 'excel';
}

class ReportsService {
  // ===== ANALYTICS OVERVIEW =====

  // Get analytics overview
  async getAnalyticsOverview(): Promise<ReportsResponse<AnalyticsOverview>> {
    try {
      const response = await apiClient.get('/reports/analytics/overview');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch analytics overview',
      };
    }
  }

  // ===== ATTENDANCE REPORTS =====

  // Get attendance report
  async getAttendanceReport(params: ReportParams = {}): Promise<ReportsResponse<AttendanceReport>> {
    try {
      const response = await apiClient.get('/reports/attendance', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch attendance report',
      };
    }
  }

  // Get member attendance history
  async getMemberAttendanceHistory(memberId: string, params: ReportParams = {}): Promise<ReportsResponse<{
    memberId: string;
    memberName: string;
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    attendanceHistory: Array<{
      date: string;
      serviceType: string;
      status: 'present' | 'absent' | 'late';
      notes?: string;
    }>;
  }>> {
    try {
      const response = await apiClient.get(`/reports/attendance/member/${memberId}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member attendance history',
      };
    }
  }

  // ===== GIVING REPORTS =====

  // Get giving report
  async getGivingReport(params: ReportParams = {}): Promise<ReportsResponse<GivingReport>> {
    try {
      const response = await apiClient.get('/reports/giving', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch giving report',
      };
    }
  }

  // Get member giving history
  async getMemberGivingHistory(memberId: string, params: ReportParams = {}): Promise<ReportsResponse<{
    memberId: string;
    memberName: string;
    totalDonations: number;
    donationCount: number;
    averageDonation: number;
    givingHistory: Array<{
      date: string;
      amount: number;
      category: string;
      paymentMethod: string;
      notes?: string;
    }>;
  }>> {
    try {
      const response = await apiClient.get(`/reports/giving/member/${memberId}`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member giving history',
      };
    }
  }

  // ===== MEMBER REPORTS =====

  // Get member report
  async getMemberReport(params: ReportParams = {}): Promise<ReportsResponse<MemberReport>> {
    try {
      const response = await apiClient.get('/reports/members', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member report',
      };
    }
  }

  // Get member demographics
  async getMemberDemographics(): Promise<ReportsResponse<{
    genderDistribution: {
      male: number;
      female: number;
    };
    ageDistribution: Array<{
      ageGroup: string;
      count: number;
      percentage: number;
    }>;
    maritalStatusDistribution: Array<{
      status: string;
      count: number;
      percentage: number;
    }>;
    locationDistribution: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/reports/members/demographics');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch member demographics',
      };
    }
  }

  // ===== EVENT REPORTS =====

  // Get event report
  async getEventReport(params: ReportParams = {}): Promise<ReportsResponse<EventReport>> {
    try {
      const response = await apiClient.get('/reports/events', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event report',
      };
    }
  }

  // Get event attendance report
  async getEventAttendanceReport(eventId: string): Promise<ReportsResponse<{
    eventId: string;
    eventTitle: string;
    totalRegistered: number;
    totalAttended: number;
    attendanceRate: number;
    attendeeList: Array<{
      memberId: string;
      memberName: string;
      registrationStatus: string;
      attendanceStatus: string;
      checkInTime?: string;
    }>;
  }>> {
    try {
      const response = await apiClient.get(`/reports/events/${eventId}/attendance`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch event attendance report',
      };
    }
  }

  // ===== FINANCIAL REPORTS =====

  // Get financial report
  async getFinancialReport(params: ReportParams = {}): Promise<ReportsResponse<FinancialReport>> {
    try {
      const response = await apiClient.get('/reports/financial', { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch financial report',
      };
    }
  }

  // Get budget vs actual report
  async getBudgetVsActualReport(): Promise<ReportsResponse<{
    totalBudgeted: number;
    totalActual: number;
    totalVariance: number;
    departments: Array<{
      department: string;
      budgeted: number;
      actual: number;
      variance: number;
      variancePercentage: number;
    }>;
  }>> {
    try {
      const response = await apiClient.get('/reports/financial/budget-vs-actual');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch budget vs actual report',
      };
    }
  }

  // ===== EXPORT REPORTS =====

  // Export attendance report
  async exportAttendanceReport(params: ReportParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/reports/attendance/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export attendance report');
    }
  }

  // Export giving report
  async exportGivingReport(params: ReportParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/reports/giving/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export giving report');
    }
  }

  // Export member report
  async exportMemberReport(params: ReportParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/reports/members/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export member report');
    }
  }

  // Export event report
  async exportEventReport(params: ReportParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/reports/events/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export event report');
    }
  }

  // Export financial report
  async exportFinancialReport(params: ReportParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get('/reports/financial/export', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export financial report');
    }
  }

  // ===== CUSTOM REPORTS =====

  // Generate custom report
  async generateCustomReport(reportConfig: {
    type: string;
    parameters: Record<string, any>;
    format?: 'json' | 'csv' | 'pdf' | 'excel';
  }): Promise<ReportsResponse<any> | Blob> {
    try {
      const response = await apiClient.post('/reports/custom', reportConfig, {
        responseType: reportConfig.format === 'json' ? 'json' : 'blob',
      });
      
      if (reportConfig.format === 'json') {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return response.data;
      }
    } catch (error: any) {
      if (reportConfig.format === 'json') {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to generate custom report',
        };
      } else {
        throw new Error(error.response?.data?.message || 'Failed to generate custom report');
      }
    }
  }

  // Get available report types
  async getAvailableReportTypes(): Promise<ReportsResponse<Array<{
    type: string;
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
  }>>> {
    try {
      const response = await apiClient.get('/reports/types');
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch available report types',
      };
    }
  }
}

export default new ReportsService(); 