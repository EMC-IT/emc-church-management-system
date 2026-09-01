import Link from 'next/link';
import {
  AlertCircle,
  Calendar,
  HeartHandshake,
  UsersRound,
  Bell,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { DashboardAttentionItem } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AttentionItemsProps {
  items?: DashboardAttentionItem[];
  className?: string;
}

const typeIconMap: Record<string, LucideIcon> = {
  event: Calendar,
  care: HeartHandshake,
  group: UsersRound,
  announcement: Bell,
  giving: AlertCircle,
};

export function AttentionItems({ items = [], className }: AttentionItemsProps) {
  // Never show empty card when no attention items exist
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Important Notices" className={cn('space-y-2.5', className)}>
      <h2 className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider">
        Important & Upcoming
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = typeIconMap[item.type] || AlertCircle;

          return (
            <div
              key={item.id}
              className={cn(
                'flex flex-col justify-between p-3.5 rounded-lg border bg-card text-card-foreground shadow-sm transition-all',
                item.urgency === 'high' && 'border-rose-500/40 bg-rose-500/[0.03]',
                item.urgency === 'medium' && 'border-primary/40 bg-primary/[0.02]',
                item.urgency === 'low' && 'border-border'
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <h3 className="text-xs font-semibold text-foreground truncate flex-1">
                    {item.title}
                  </h3>
                  {item.date && (
                    <span className="text-[10px] font-medium text-muted-foreground shrink-0 bg-muted/60 px-1.5 py-0.5 rounded">
                      {item.date}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.actionHref && item.actionLabel && (
                <div className="pt-2 mt-2 border-t border-border/30 flex items-center justify-end">
                  <Link
                    href={item.actionHref}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
