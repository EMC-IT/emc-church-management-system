import Link from 'next/link';
import { Megaphone, Users, Building2, Bell, type LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DashboardAnnouncement } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AnnouncementsCardProps {
  announcements: DashboardAnnouncement[];
  className?: string;
}

const categoryIcons: Record<string, LucideIcon> = {
  class: Megaphone,
  fellowship: Users,
  project: Building2,
  general: Bell,
};

export function AnnouncementsCard({ announcements, className }: AnnouncementsCardProps) {
  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Announcements</CardTitle>
          <Link
            href="/portal/notifications"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {announcements.map((ann) => {
          const Icon = categoryIcons[ann.category] || Bell;

          return (
            <div key={ann.id} className="flex items-start gap-3 group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>

              <div className="space-y-0.5 min-w-0 flex-1">
                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {ann.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {ann.description}
                </p>
                <span className="text-[10px] font-medium text-muted-foreground/70 block pt-0.5">
                  {ann.date}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
