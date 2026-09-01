import type { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MemberEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function MemberEmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: MemberEmptyStateProps) {
  return (
    <Card className={cn('text-center', className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-4">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
}
