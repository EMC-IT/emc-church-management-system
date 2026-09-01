import { Suspense } from 'react';
import { Metadata } from 'next';
import { MemberPageHeader } from '@/components/member/shared';
import { AttendanceView, AttendanceSkeleton } from '@/components/member/attendance';
import { memberAttendanceService } from '@/services/member';

export const metadata: Metadata = {
  title: 'My Attendance | EMC Member Portal',
  description: 'View your personal church attendance consistency, service history, and participation insights.',
};

export default async function MemberAttendancePage() {
  const [summary, trend, insights, records] = await Promise.all([
    memberAttendanceService.getAttendanceSummary(),
    memberAttendanceService.getAttendanceTrend(),
    memberAttendanceService.getAttendanceInsights(),
    memberAttendanceService.getAttendanceRecords(),
  ]);

  return (
    <div className="space-y-6">
      <MemberPageHeader
        title="My Attendance"
      />

      <Suspense fallback={<AttendanceSkeleton />}>
        <AttendanceView
          initialSummary={summary}
          initialTrend={trend}
          initialInsights={insights}
          initialRecords={records}
        />
      </Suspense>
    </div>
  );
}
