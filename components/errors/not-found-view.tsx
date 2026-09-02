'use client';

import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Search, ArrowLeft } from 'lucide-react';
import { ErrorView, ErrorAction } from './error-view';

export interface NotFoundViewProps {
  title?: string;
  description?: string;
  scope?: 'member' | 'admin' | 'public' | 'auto';
  className?: string;
}

export function NotFoundView({
  title = 'Page Not Found',
  description = "The page you're looking for doesn't exist, may have been moved, or is temporarily unavailable.",
  scope = 'auto',
  className,
}: NotFoundViewProps) {
  const pathname = usePathname() || '';

  const detectedScope =
    scope === 'auto'
      ? pathname.startsWith('/portal')
        ? 'member'
        : pathname.startsWith('/dashboard')
        ? 'admin'
        : 'public'
      : scope;

  let primaryAction: ErrorAction;
  let secondaryActions: ErrorAction[] = [];

  if (detectedScope === 'member') {
    primaryAction = {
      label: 'Member Dashboard',
      href: '/portal',
      icon: LayoutDashboard,
    };
    secondaryActions = [
      {
        label: 'Explore Events',
        href: '/portal/events',
        icon: Search,
        variant: 'outline',
      },
    ];
  } else if (detectedScope === 'admin') {
    primaryAction = {
      label: 'Admin Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    };
    secondaryActions = [
      {
        label: 'Members Directory',
        href: '/dashboard/members',
        icon: Search,
        variant: 'outline',
      },
    ];
  } else {
    primaryAction = {
      label: 'Back to Home',
      href: '/',
      icon: Home,
    };
    secondaryActions = [
      {
        label: 'Member Portal',
        href: '/portal',
        icon: LayoutDashboard,
        variant: 'outline',
      },
    ];
  }

  return (
    <ErrorView
      variant="404"
      title={title}
      description={description}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      className={className}
    />
  );
}
