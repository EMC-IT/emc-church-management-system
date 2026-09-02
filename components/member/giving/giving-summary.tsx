import { HandCoins, Gift, Clock, CalendarDays } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { MemberGivingSummary } from '@/lib/types/member';
import { formatCurrency, cn } from '@/lib/utils';

export interface GivingSummaryProps {
  summary: MemberGivingSummary;
  className?: string;
}

export function GivingSummary({ summary, className }: GivingSummaryProps) {
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

  const lastGiftText = summary.lastGift
    ? `${summary.lastGift.category} • ${formatDate(summary.lastGift.date)}`
    : 'No contributions yet';

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <StatCard
        title="Total Given"
        value={formatCurrency(summary.totalGivenYearToDate, 'GHS')}
        icon={HandCoins}
        description="Recorded contributions this year"
      />

      <StatCard
        title="Number of Gifts"
        value={summary.totalGiftsCountThisYear}
        icon={Gift}
        description="Contributions recorded"
      />

      <StatCard
        title="Last Giving"
        value={summary.lastGift ? formatCurrency(summary.lastGift.amount, 'GHS') : '—'}
        icon={Clock}
        description={lastGiftText}
      />

      <StatCard
        title="This Year"
        value={formatCurrency(summary.givingThisYearTotal, 'GHS')}
        icon={CalendarDays}
        description="January – Present (YTD)"
      />
    </div>
  );
}
