import { Users, Heart, Calendar, HandCoins, type LucideIcon } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { DashboardStatCards } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface StatSummaryCardsProps {
  statCards: DashboardStatCards;
  className?: string;
}

interface StatItem {
  id: string;
  title: string;
  value: string;
  icon: LucideIcon;
}

export function StatSummaryCards({ statCards, className }: StatSummaryCardsProps) {
  const stats: StatItem[] = [
    {
      id: 'membership',
      title: 'Membership Status',
      value: statCards.membership.status,

      icon: Users,
    },
    {
      id: 'ministry',
      title: 'Ministry',
      value: statCards.ministry.name,
      icon: Heart,
    },
    {
      id: 'events',
      title: 'Upcoming Events',
      value: statCards.events.count.toString(),
      icon: Calendar,
    },
    {
      id: 'giving',
      title: 'Total Giving (This Year)',
      value: statCards.giving.amount,
      icon: HandCoins,
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5', className)}>
      {stats.map((stat) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}
