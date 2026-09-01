import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

export interface MemberPageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: BreadcrumbCrumb[];
  actions?: ReactNode;
  className?: string;
}

export function MemberPageHeader({
  title,
  description,
  actions,
  className,
}: MemberPageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-2 pb-4 sm:pb-5 border-b border-border/40', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground mt-1">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
