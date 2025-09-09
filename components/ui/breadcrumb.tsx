'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
  loading?: boolean;
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
  announcements: 'Announcements'
};

// API endpoint mapping for dynamic ID resolution
const API_ENDPOINTS: Record<string, string> = {
  members: '/api/members',
  assets: '/api/assets',
  events: '/api/events',
  'prayer-requests': '/api/prayer-requests',
  donations: '/api/donations',
  expenses: '/api/expenses',
  groups: '/api/groups',
  ministries: '/api/ministries',
  sermons: '/api/sermons',
  announcements: '/api/announcements'
};

// Helper function to check if a segment is a numeric ID
const isNumericId = (segment: string): boolean => {
  return /^\d+$/.test(segment);
};

// Helper function to format slug into human-readable title
const formatSlug = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Async function to fetch title from API
const fetchTitleFromAPI = async (endpoint: string, id: string): Promise<string | null> => {
  try {
    const response = await fetch(`${endpoint}/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    const data = await response.json();
    
    // Try different possible title fields
    return data.title || data.name || data.subject || data.firstName && data.lastName 
      ? `${data.firstName} ${data.lastName}` 
      : data.description || null;
  } catch (error) {
    console.warn(`Failed to fetch title for ${endpoint}/${id}:`, error);
    return null;
  }
};

export default function Breadcrumb({ items, separator = '›', className }: BreadcrumbProps) {
  const pathname = usePathname();
  const [resolvedBreadcrumbs, setResolvedBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Resolver function for generating breadcrumb items
  const resolveBreadcrumbs = async (segments: string[]): Promise<BreadcrumbItem[]> => {
    const breadcrumbs: BreadcrumbItem[] = [];
    
    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      const href = '/' + segments.slice(0, index + 1).join('/');
      const isCurrentPage = index === segments.length - 1;
      
      let label = segment;
      let itemLoading = false;
      
      // Check if segment is in static route config
      if (ROUTE_CONFIG[segment]) {
        label = ROUTE_CONFIG[segment];
      }
      // Check if segment is a numeric ID
      else if (isNumericId(segment) && index > 0) {
        const parentSegment = segments[index - 1];
        const apiEndpoint = API_ENDPOINTS[parentSegment];
        
        if (apiEndpoint) {
          itemLoading = true;
          // Try to fetch the title from API
          const fetchedTitle = await fetchTitleFromAPI(apiEndpoint, segment);
          label = fetchedTitle || `Item ${segment}`;
          itemLoading = false;
        } else {
          label = `Item ${segment}`;
        }
      }
      // Format as slug (replace hyphens with spaces and capitalize)
      else {
        label = formatSlug(segment);
      }
      
      breadcrumbs.push({
        label,
        href: isCurrentPage ? undefined : href,
        isCurrentPage,
        loading: itemLoading
      });
    }
    
    return breadcrumbs;
  };

  useEffect(() => {
    if (items) {
      setResolvedBreadcrumbs(items);
      return;
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) {
      setResolvedBreadcrumbs([]);
      return;
    }

    setLoading(true);
    resolveBreadcrumbs(segments)
      .then(setResolvedBreadcrumbs)
      .finally(() => setLoading(false));
  }, [pathname, items]);

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {resolvedBreadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href || index} className="flex items-center">
            <span className="text-muted-foreground mx-2">{separator}</span>
            {breadcrumb.href && !breadcrumb.isCurrentPage ? (
              <Link 
                href={breadcrumb.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {breadcrumb.loading ? (
                  <span className="animate-pulse bg-muted rounded h-4 w-16 inline-block" />
                ) : (
                  breadcrumb.label
                )}
              </Link>
            ) : (
              <span className={breadcrumb.isCurrentPage ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {breadcrumb.loading ? (
                  <span className="animate-pulse bg-muted rounded h-4 w-20 inline-block" />
                ) : (
                  breadcrumb.label
                )}
              </span>
            )}
          </li>
        ))}
        {loading && resolvedBreadcrumbs.length === 0 && (
          <li className="flex items-center">
            <span className="text-muted-foreground mx-2">{separator}</span>
            <span className="animate-pulse bg-muted rounded h-4 w-24 inline-block" />
          </li>
        )}
      </ol>
    </nav>
  );
}