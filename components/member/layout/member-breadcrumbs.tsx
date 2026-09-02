'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MemberBreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface MemberBreadcrumbsProps {
  items?: MemberBreadcrumbItem[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  className?: string;
}

// Portal route dictionary mapping segments to user-friendly titles
const PORTAL_ROUTE_CONFIG: Record<string, string> = {
  portal: 'Home',
  profile: 'My Profile',
  family: 'My Family',
  attendance: 'Attendance',
  giving: 'Giving',
  groups: 'Groups',
  ministries: 'Ministries',
  events: 'Events',
  journey: 'My Journey',
  prayer: 'Prayer Requests',
  'pastoral-care': 'Pastoral Care',
  resources: 'Resources',
  notifications: 'Notifications',
  settings: 'Settings',
  new: 'New Request',
  request: 'Request Care',
  edit: 'Edit',
  calendar: 'Calendar',
  history: 'History',
};

const formatSlug = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function MemberBreadcrumbs({
  items,
  separator = <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" aria-hidden="true" />,
  showHomeIcon = true,
  className,
}: MemberBreadcrumbsProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((item, idx) => ({
        ...item,
        isCurrentPage: item.isCurrentPage ?? idx === items.length - 1,
      }));
    }

    const segments = (pathname || '').split('/').filter(Boolean);
    if (segments.length <= 1) {
      // Top level /portal or empty: no deep breadcrumb needed
      return [];
    }

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const isCurrentPage = index === segments.length - 1;
      const isRoot = segment === 'portal';

      let label = segment;
      if (PORTAL_ROUTE_CONFIG[segment]) {
        label = PORTAL_ROUTE_CONFIG[segment];
      } else if (/^\d+$/.test(segment) || segment.startsWith('evt-') || segment.startsWith('req-')) {
        label = 'Details';
      } else {
        label = formatSlug(segment);
      }

      return {
        label,
        href: isCurrentPage ? undefined : href,
        isCurrentPage,
        isRoot,
      };
    });
  }, [pathname, items]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className={cn('flex items-center text-xs', className)} aria-label="Member Portal Breadcrumb">
      <ol className="flex items-center flex-wrap gap-1.5 text-muted-foreground">
        {showHomeIcon && (
          <li className="flex items-center">
            <Link
              href="/portal"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded focus-visible:ring-1 focus-visible:ring-primary outline-none"
              title="Portal Home"
              aria-label="Portal Home"
            >
              <Home className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </li>
        )}

        {breadcrumbs.map((crumb, index) => {
          // If home icon is shown and this is root 'portal' segment, skip duplicating
          if (showHomeIcon && (crumb.href === '/portal' || crumb.label === 'Home')) {
            return null;
          }

          return (
            <li key={crumb.href || `${crumb.label}-${index}`} className="flex items-center gap-1.5 min-w-0">
              <span className="text-muted-foreground/60 select-none flex items-center">{separator}</span>
              {crumb.href && !crumb.isCurrentPage ? (
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate max-w-[140px] sm:max-w-[200px] outline-none focus-visible:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'truncate max-w-[160px] sm:max-w-[240px]',
                    crumb.isCurrentPage ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                  aria-current={crumb.isCurrentPage ? 'page' : undefined}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
