'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export default function Breadcrumb({ items, separator = '›', className }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // If no custom items provided, generate from pathname
  const breadcrumbs = items || pathname.split('/').filter(Boolean).map((segment, index, segments) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return { href, label, isCurrentPage: index === segments.length - 1 };
  });

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href || index} className="flex items-center">
            <span className="text-muted-foreground mx-2">{separator}</span>
            {breadcrumb.href && !breadcrumb.isCurrentPage ? (
              <Link 
                href={breadcrumb.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span className={breadcrumb.isCurrentPage ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                {breadcrumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}