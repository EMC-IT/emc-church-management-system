import Link from 'next/link';
import {
  HandCoins,
  Calendar,
  Heart,
  HeartHandshake,
  UsersRound,
  User,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { DashboardQuickAction } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface QuickActionsProps {
  actions?: DashboardQuickAction[];
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  giving: HandCoins,
  events: Calendar,
  prayer: Heart,
  care: HeartHandshake,
  group: UsersRound,
  profile: User,
  resources: BookOpen,
};

export function QuickActions({ actions = [], className }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section aria-label="Quick Actions" className={cn('space-y-2', className)}>
      <h2 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((action) => {
          const Icon = iconMap[action.iconName] || Calendar;

          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col items-center justify-center p-3 text-center rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 hover:border-primary/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
              {action.description && (
                <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
                  {action.description}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
