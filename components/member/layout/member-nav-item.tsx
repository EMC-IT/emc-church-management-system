'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface MemberNavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string | number;
  isCollapsed?: boolean;
  onClick?: () => void;
}

export function MemberNavItem({
  label,
  href,
  icon: Icon,
  exact = false,
  badge,
  isCollapsed = false,
  onClick,
}: MemberNavItemProps) {
  const pathname = usePathname();

  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={cn(
        'group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        isCollapsed && 'justify-center px-2'
      )}
    >
      {/* Active left indicator bar when active */}
      {isActive && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-primary rounded-r-full"
          aria-hidden="true"
        />
      )}

      <Icon
        className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
        )}
        aria-hidden="true"
      />

      {!isCollapsed && (
        <span className="truncate flex-1">{label}</span>
      )}

      {!isCollapsed && badge !== undefined && (
        <Badge
          variant={isActive ? 'primary' : 'neutral'}
          size="sm"
          className="ml-auto"
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
}
