'use client';

import { usePathname } from 'next/navigation';
import { RotateCcw, Home, LayoutDashboard } from 'lucide-react';
import { ErrorView, ErrorAction } from './error-view';

export interface SystemErrorViewProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
  scope?: 'member' | 'admin' | 'public' | 'auto';
  className?: string;
}

export function SystemErrorView({
  error,
  reset,
  title = 'Something Went Wrong',
  description = 'An unexpected system error occurred while processing your request. Our technical team has been notified.',
  scope = 'auto',
  className,
}: SystemErrorViewProps) {
  const pathname = usePathname() || '';

  const detectedScope =
    scope === 'auto'
      ? pathname.startsWith('/portal')
        ? 'member'
        : pathname.startsWith('/dashboard')
        ? 'admin'
        : 'public'
      : scope;

  const primaryAction: ErrorAction = reset
    ? {
        label: 'Try Again',
        onClick: reset,
        icon: RotateCcw,
      }
    : {
        label: detectedScope === 'member' ? 'Member Dashboard' : detectedScope === 'admin' ? 'Admin Dashboard' : 'Home',
        href: detectedScope === 'member' ? '/portal' : detectedScope === 'admin' ? '/dashboard' : '/',
        icon: detectedScope === 'public' ? Home : LayoutDashboard,
      };

  const secondaryActions: ErrorAction[] = [];

  if (reset) {
    if (detectedScope === 'member') {
      secondaryActions.push({
        label: 'Return to Dashboard',
        href: '/portal',
        icon: LayoutDashboard,
        variant: 'outline',
      });
    } else if (detectedScope === 'admin') {
      secondaryActions.push({
        label: 'Admin Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        variant: 'outline',
      });
    } else {
      secondaryActions.push({
        label: 'Return to Home',
        href: '/',
        icon: Home,
        variant: 'outline',
      });
    }
  }

  return (
    <ErrorView
      variant="500"
      title={title}
      description={description}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      error={error}
      showTechnicalDetails={process.env.NODE_ENV !== 'production' || !!error?.digest}
      className={className}
    />
  );
}
