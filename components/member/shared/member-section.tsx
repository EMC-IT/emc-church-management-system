import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface MemberSectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function MemberSection({
  title,
  description,
  action,
  children,
  className,
}: MemberSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
            )}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
