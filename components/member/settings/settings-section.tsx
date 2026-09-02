import type { ReactNode } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  action,
  className,
}: SettingsSectionProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-5 pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold font-heading text-foreground">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">{children}</CardContent>
    </Card>
  );
}
