'use client';

import { Clock, Phone, Home } from 'lucide-react';
import { ErrorView, ErrorAction } from './error-view';

export interface MaintenanceViewProps {
  title?: string;
  description?: string;
  estimatedUptime?: string;
  supportPhone?: string;
  className?: string;
}

export function MaintenanceView({
  title = 'System Maintenance in Progress',
  description = 'EMC Church Management System is undergoing scheduled system upgrades and maintenance. We will be back online shortly.',
  estimatedUptime = 'Expected completion: 30–45 minutes',
  supportPhone = '+233 (0) 30 123 4567',
  className,
}: MaintenanceViewProps) {
  const primaryAction: ErrorAction = {
    label: 'Back to Church Home',
    href: '/',
    icon: Home,
  };

  return (
    <ErrorView
      variant="503"
      title={title}
      description={
        <div className="space-y-3">
          <p>{description}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 text-xs font-medium text-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{estimatedUptime}</span>
          </div>
        </div>
      }
      primaryAction={primaryAction}
      className={className}
    />
  );
}
