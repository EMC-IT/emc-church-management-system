import Link from 'next/link';
import {
  User,
  Heart,
  Calendar,
  Users,
  HeartHandshake,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface QuickActionsCardProps {
  className?: string;
}

const actions: {
  label: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: 'Update Profile',
    href: '/portal/profile',
    icon: User,
  },
  {
    label: 'My Giving',
    href: '/portal/giving',
    icon: Heart,
  },
  {
    label: 'Register for Event',
    href: '/portal/events',
    icon: Calendar,
  },
  {
    label: 'Join a Ministry',
    href: '/portal/ministries',
    icon: Users,
  },
  {
    label: 'Pastoral Care Request',
    href: '/portal/pastoral-care/request',
    icon: HeartHandshake,
  },
  {
    label: 'View Resources',
    href: '/portal/resources',
    icon: BookOpen,
  },
];

export function QuickActionsCard({ className }: QuickActionsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="py-4">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {actions.map((act) => {
            const Icon = act.icon;

            return (
              <Link
                key={act.label}
                href={act.href}
                className="group flex flex-col items-center justify-center p-3 text-center rounded-xl border border-border/40 bg-card hover:bg-muted/50 hover:border-primary/40 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-2xs min-h-[90px]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all mb-1.5">
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <span className="text-[11px] font-semibold text-foreground leading-tight group-hover:text-primary transition-colors text-center">
                  {act.label}
                </span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
