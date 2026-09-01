import { describe, it, expect } from 'vitest';
import { memberAttendanceService } from '@/services/member';

describe('Member Attendance Service', () => {
  it('returns valid attendance summary with rate and streak calculations', async () => {
    const summary = await memberAttendanceService.getAttendanceSummary();

    expect(summary).toBeDefined();
    expect(summary.totalServicesAttendedThisYear).toBeGreaterThan(0);
    expect(summary.attendanceRatePercentage).toBeGreaterThanOrEqual(0);
    expect(summary.attendanceRatePercentage).toBeLessThanOrEqual(100);
    expect(summary.currentStreakWeeks).toBeGreaterThanOrEqual(0);
    expect(summary.lastAttended).toBeDefined();
    expect(summary.lastAttended?.serviceType).toBe('Sunday Service');
  });

  it('filters attendance records by service type and status correctly', async () => {
    const allRecords = await memberAttendanceService.getAttendanceRecords();
    expect(allRecords.length).toBeGreaterThan(0);

    const sundayRecords = await memberAttendanceService.getAttendanceRecords({
      serviceType: 'Sunday Service',
    });
    expect(sundayRecords.every((r) => r.serviceType === 'Sunday Service')).toBe(true);

    const onlineRecords = await memberAttendanceService.getAttendanceRecords({
      status: 'online',
    });
    expect(onlineRecords.every((r) => r.status === 'online')).toBe(true);

    const searchResults = await memberAttendanceService.getAttendanceRecords({
      search: 'Bible Study',
    });
    expect(searchResults.every((r) => r.eventName.includes('Bible Study'))).toBe(true);
  });

  it('returns valid attendance trend points and insights', async () => {
    const trend = await memberAttendanceService.getAttendanceTrend();
    expect(Array.isArray(trend)).toBe(true);
    expect(trend.length).toBeGreaterThan(0);
    expect(trend[0]).toHaveProperty('month');
    expect(trend[0]).toHaveProperty('rate');

    const insights = await memberAttendanceService.getAttendanceInsights();
    expect(Array.isArray(insights)).toBe(true);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toHaveProperty('title');
    expect(insights[0]).toHaveProperty('description');
  });
});
