import { CalendarCheck, TrendingUp, Flame, Clock } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { MemberAttendanceSummary } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AttendanceStatsProps {
  summary: MemberAttendanceSummary;
  className?: string;
}

export function AttendanceStats({ summary, className }: AttendanceStatsProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const lastAttendedText = summary.lastAttended
    ? `${formatDate(summary.lastAttended.date)} • ${summary.lastAttended.campus}`
    : 'No recent records';

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        title="Services Attended"
        value={summary.totalServicesAttendedThisYear}
        icon={CalendarCheck}
        description="Recorded services this year"
      />

      <StatCard
        title="Attendance Rate"
        value={`${summary.attendanceRatePercentage}%`}
        icon={TrendingUp}
        description={`${summary.totalServicesAttendedThisYear} of ${summary.totalEligibleServicesThisYear} services attended`}
      />

      <StatCard
        title="Current Streak"
        value={`${summary.currentStreakWeeks} wks`}
        icon={Flame}
        description={`Longest: ${summary.longestStreakWeeks} consecutive weeks`}
      />

      <StatCard
        title="Last Attended"
        value={summary.lastAttended ? summary.lastAttended.serviceType : '—'}
        icon={Clock}
        description={lastAttendedText}
      />
    </div>
  );
}
