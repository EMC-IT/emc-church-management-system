import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface MemberDataRowProps {
  label: ReactNode;
  value: ReactNode;
  subtext?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function MemberDataRow({
  label,
  value,
  subtext,
  action,
  className,
}: MemberDataRowProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-3 border-b border-border/40 last:border-0',
        className
      )}
    >
      <div className="text-xs font-medium text-muted-foreground sm:w-1/3 shrink-0">
        {label}
      </div>
      <div className="flex-1 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{value}</div>
          {subtext && <div className="text-xs text-muted-foreground mt-0.5">{subtext}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
