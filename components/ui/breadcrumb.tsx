'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

// Static route configuration for fixed route names
const ROUTE_CONFIG: Record<string, string> = {
  dashboard: 'Dashboard',
  members: 'Members',
  assets: 'Assets',
  events: 'Events',
  'prayer-requests': 'Prayer Requests',
  donations: 'Donations',
  expenses: 'Expenses',
  reports: 'Reports',
  settings: 'Settings',
  profile: 'Profile',
  details: 'Details',
  edit: 'Edit',
  add: 'Add New',
  maintenance: 'Maintenance',
  assignment: 'Assignment',
  history: 'History',
  categories: 'Categories',
  family: 'Family',
  attendance: 'Attendance',
  groups: 'Groups',
  ministries: 'Ministries',
  sermons: 'Sermons',
  announcements: 'Announcements',
  communications: 'Communications',
  messages: 'Messages',
  campaigns: 'Campaigns',
  newsletters: 'Newsletters',
  analytics: 'Analytics',
  'activity-logs': 'Activity Logs',
  finance: 'Finance',
  'tithes-offerings': 'Tithes & Offerings',
  giving: 'Giving',
  income: 'Income',
  budgets: 'Budgets',
  'sunday-school': 'Sunday School',
  classes: 'Classes',
  teachers: 'Teachers',
  students: 'Students',
  materials: 'Materials',
  departments: 'Departments',
  roles: 'Roles',
  permissions: 'Permissions',
  users: 'Users',
  branches: 'Branches',
  'church-profile': 'Church Profile',
  link: 'Link Family',
  convert: 'New Converts',
  documents: 'Documents',
  upload: 'Upload',
  'report-builder': 'Report Builder',
  filters: 'Filters',
  preferences: 'Preferences',
  calendar: 'Calendar',
  templates: 'Templates',
  export: 'Export',
  'bulk-actions': 'Bulk Actions',
  'qr-checkin': 'QR Check-in',
  take: 'Take Attendance',
  member: 'Member Attendance',
  department: 'Department Attendance',
  allocations: 'Allocations',
  pledges: 'Pledges',
  fundraising: 'Fundraising',
  comparisons: 'Comparisons',
  congregational: 'Congregational Giving',
  meetings: 'Meetings',
  registrations: 'Registrations',
  new: 'New',
};

// Helper function to check if a segment is a numeric ID
const isNumericId = (segment: string): boolean => {
  return /^\d+$/.test(segment);
};

// Helper function to format slug into human-readable title
const formatSlug = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function Breadcrumb({ items, separator = '›', className }: BreadcrumbProps) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    if (items) {
      return items;
    }

    const segments = (pathname || '').split('/').filter(Boolean);
    if (segments.length === 0) {
      return [];
    }

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const isCurrentPage = index === segments.length - 1;

      let label = segment;

      if (ROUTE_CONFIG[segment]) {
        label = ROUTE_CONFIG[segment];
      } else if (isNumericId(segment)) {
        label = `#${segment}`;
      } else {
        label = formatSlug(segment);
      }

      return {
        label,
        href: isCurrentPage ? undefined : href,
        isCurrentPage,
      };
    });
  }, [pathname, items]);

  return (
    <nav className={cn('flex items-center', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            href="/dashboard"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href || index} className="flex items-center">
            <span className="text-muted-foreground mx-2 select-none">{separator}</span>
            {breadcrumb.href && !breadcrumb.isCurrentPage ? (
              <Link
                href={breadcrumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span
                className={
                  breadcrumb.isCurrentPage
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground'
                }
              >
                {breadcrumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}