'use client';

import { useState, useTransition } from 'react';
import { AttendanceStats } from './attendance-stats';
import { AttendanceTrend } from './attendance-trend';
import { AttendanceInsights } from './attendance-insights';
import { AttendanceHistory } from './attendance-history';
import { AttendanceEmptyState } from './attendance-empty-state';
import {
  MemberAttendanceSummary,
  MemberAttendanceRecord,
  MemberAttendanceTrendPoint,
  MemberAttendanceInsight,
  MemberAttendanceFilter,
} from '@/lib/types/member';
import { memberAttendanceService } from '@/services/member';

export interface AttendanceViewProps {
  initialSummary: MemberAttendanceSummary;
  initialTrend: MemberAttendanceTrendPoint[];
  initialInsights: MemberAttendanceInsight[];
  initialRecords: MemberAttendanceRecord[];
}

export function AttendanceView({
  initialSummary,
  initialTrend,
  initialInsights,
  initialRecords,
}: AttendanceViewProps) {
  const [summary] = useState<MemberAttendanceSummary>(initialSummary);
  const [trend] = useState<MemberAttendanceTrendPoint[]>(initialTrend);
  const [insights] = useState<MemberAttendanceInsight[]>(initialInsights);
  const [records, setRecords] = useState<MemberAttendanceRecord[]>(initialRecords);
  const [filter, setFilter] = useState<MemberAttendanceFilter>({
    dateRange: 'all',
    serviceType: 'all',
    status: 'all',
    search: '',
  });

  const [, startTransition] = useTransition();

  const handleFilterChange = (newFilter: MemberAttendanceFilter) => {
    setFilter(newFilter);
    startTransition(async () => {
      const filtered = await memberAttendanceService.getAttendanceRecords(newFilter);
      setRecords(filtered);
    });
  };

  const hasAnyAttendance =
    summary.totalServicesAttendedThisYear > 0 || initialRecords.length > 0;

  if (!hasAnyAttendance) {
    return <AttendanceEmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Summary KPI Stat Cards */}
      <AttendanceStats summary={summary} />

      {/* 2. Main Analytics Row: Trend & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8">
          <AttendanceTrend trend={trend} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <AttendanceInsights insights={insights} />
        </div>
      </div>

      {/* 3. Comprehensive Filterable Attendance History */}
      <AttendanceHistory
        records={records}
        filter={filter}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
