'use client';

import Link from 'next/link';
import { Megaphone, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberAnnouncement } from '@/lib/types/member';
import { formatNotificationTime } from '@/lib/config/member/notifications';
import { cn } from '@/lib/utils';

export interface AnnouncementItemProps {
  announcement: MemberAnnouncement;
  className?: string;
}

export function AnnouncementItem({
  announcement,
  className,
}: AnnouncementItemProps) {
  return (
    <Card className={cn('border-primary/20 bg-card/90 shadow-sm', className)}>
      <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary"
          aria-hidden="true"
        >
          <Megaphone className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                Church Announcement
              </span>
              {announcement.category && (
                <Badge variant="neutral" size="sm">
                  {announcement.category}
                </Badge>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground font-medium">
              {formatNotificationTime(announcement.publishedAt)}
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-heading font-semibold text-foreground leading-snug">
            {announcement.title}
          </h4>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {announcement.summary}
          </p>

          {announcement.action && (
            <div className="pt-2">
              <Link
                href={announcement.action.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{announcement.action.label}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
