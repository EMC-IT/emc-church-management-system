'use client';

import { LogIn, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import { ErrorView, ErrorAction } from './error-view';

export interface AccessDeniedViewProps {
  title?: string;
  description?: string;
  loginUrl?: string;
  returnUrl?: string;
  className?: string;
}

export function AccessDeniedView({
  title = 'Access Restricted',
  description = "You don't have permission to access this area. If you believe this is a mistake, please sign in with an authorized account or contact an administrator.",
  loginUrl = '/login',
  returnUrl = '/portal',
  className,
}: AccessDeniedViewProps) {
  const primaryAction: ErrorAction = {
    label: 'Sign In to Continue',
    href: loginUrl,
    icon: LogIn,
  };

  const secondaryActions: ErrorAction[] = [
    {
      label: 'Return to Dashboard',
      href: returnUrl,
      icon: LayoutDashboard,
      variant: 'outline',
    },
  ];

  return (
    <ErrorView
      variant="403"
      title={title}
      description={description}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      className={className}
    />
  );
}
