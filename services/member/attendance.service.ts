import {
  MemberAttendanceSummary,
  MemberAttendanceRecord,
  MemberAttendanceTrendPoint,
  MemberAttendanceInsight,
  MemberAttendanceFilter,
} from '@/lib/types/member';
import {
  mockMemberAttendanceSummary,
  mockMemberAttendanceRecords,
  mockMemberAttendanceTrend,
  mockMemberAttendanceInsights,
} from '@/lib/mock/member';

export interface MemberAttendanceService {
  getAttendanceSummary(): Promise<MemberAttendanceSummary>;
  getAttendanceRecords(filter?: MemberAttendanceFilter): Promise<MemberAttendanceRecord[]>;
  getAttendanceTrend(): Promise<MemberAttendanceTrendPoint[]>;
  getAttendanceInsights(): Promise<MemberAttendanceInsight[]>;
}

export class MockMemberAttendanceService implements MemberAttendanceService {
  private summary: MemberAttendanceSummary = { ...mockMemberAttendanceSummary };
  private records: MemberAttendanceRecord[] = [...mockMemberAttendanceRecords];
  private trend: MemberAttendanceTrendPoint[] = [...mockMemberAttendanceTrend];
  private insights: MemberAttendanceInsight[] = [...mockMemberAttendanceInsights];

  async getAttendanceSummary(): Promise<MemberAttendanceSummary> {
    return Promise.resolve({ ...this.summary });
  }

  async getAttendanceRecords(filter?: MemberAttendanceFilter): Promise<MemberAttendanceRecord[]> {
    let filtered = [...this.records];

    if (!filter) {
      return Promise.resolve(filtered);
    }

    if (filter.serviceType && filter.serviceType !== 'all') {
      filtered = filtered.filter((r) => r.serviceType === filter.serviceType);
    }

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filter.status);
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.eventName.toLowerCase().includes(q) ||
          r.campus.toLowerCase().includes(q) ||
          r.serviceType.toLowerCase().includes(q)
      );
    }

    if (filter.dateRange && filter.dateRange !== 'all') {
      const now = new Date('2025-05-30'); // Anchor date matching realistic mock
      const daysMap: Record<string, number> = {
        '30d': 30,
        '90d': 90,
        '180d': 180,
        year: 365,
      };

      const days = daysMap[filter.dateRange];
      if (days) {
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filtered = filtered.filter((r) => new Date(r.date) >= cutoff);
      }
    }

    return Promise.resolve(filtered);
  }

  async getAttendanceTrend(): Promise<MemberAttendanceTrendPoint[]> {
    return Promise.resolve([...this.trend]);
  }

  async getAttendanceInsights(): Promise<MemberAttendanceInsight[]> {
    return Promise.resolve([...this.insights]);
  }
}

export const memberAttendanceService = new MockMemberAttendanceService();
