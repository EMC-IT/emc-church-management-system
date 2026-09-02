'use client';

import Link from 'next/link';
import { Menu, Church, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MemberBreadcrumbs } from './member-breadcrumbs';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { MemberUserMenu } from './member-user-menu';
import { MemberNotificationButton } from './member-notification-button';
import { MemberProfile, MemberNotification } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MemberHeaderProps {
  member: MemberProfile;
  notifications: MemberNotification[];
  onOpenMobileDrawer?: () => void;
  className?: string;
}

export function MemberHeader({
  member,
  notifications,
  onOpenMobileDrawer,
  className,
}: MemberHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-4 sm:px-6 backdrop-blur-md shrink-0 select-none',
        className
      )}
    >
      {/* Left: Mobile menu toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileDrawer && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileDrawer}
            className="lg:hidden h-9 w-9 rounded-md focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open sidebar navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Mobile Portal Logo */}
        <Link href="/portal" className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold shadow-sm">
            <Church className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            EMC Portal
          </span>
        </Link>

        {/* Desktop Header Breadcrumbs */}
        <div className="hidden md:flex min-w-0 items-center">
          <MemberBreadcrumbs />
        </div>
      </div>


      {/* Right controls: Search input (moved right) + Theme Switcher + Notifications + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Right-aligned Search Input */}
        <div className="hidden md:flex relative w-52 lg:w-64 xl:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search anything..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/40 border-border/60 text-xs focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/70"
          />
        </div>

        <ThemeToggle
          variant="ghost"
          className="h-9 w-9 rounded-full text-foreground/80 hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary border-0"
        />
        <MemberNotificationButton notifications={notifications} />
        <div className="h-5 w-px bg-border/60" aria-hidden="true" />
        <MemberUserMenu member={member} />
      </div>
    </header>
  );
}
