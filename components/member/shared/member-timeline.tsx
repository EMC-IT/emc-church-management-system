import type { ReactNode } from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  status: 'Completed' | 'In Progress' | 'Upcoming' | 'Not Started';
  tag?: ReactNode;
}

export interface MemberTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function MemberTimeline({ items, className }: MemberTimelineProps) {
  return (
    <div className={cn('relative space-y-6 pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60', className)}>
      {items.map((item) => {
        const isCompleted = item.status === 'Completed';
        const isInProgress = item.status === 'In Progress';

        return (
          <div key={item.id} className="relative group">
            {/* Dot indicator */}
            <div
              className={cn(
                'absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background ring-4 ring-background',
                isCompleted && 'text-emerald-600 dark:text-emerald-400',
                isInProgress && 'text-primary',
                !isCompleted && !isInProgress && 'text-muted-foreground/60'
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4 fill-emerald-500/10" />
              ) : isInProgress ? (
                <Clock className="h-4 w-4 animate-pulse" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                {item.date && (
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              )}
              {item.tag && <div className="pt-1">{item.tag}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
