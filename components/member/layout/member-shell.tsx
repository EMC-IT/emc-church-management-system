'use client';

import { useState } from 'react';
import { MemberSidebar } from './member-sidebar';
import { MemberHeader } from './member-header';
import { MemberMobileNav } from './member-mobile-nav';
import { mockCurrentMember, mockMemberNotifications } from '@/lib/mock/member';
import { cn } from '@/lib/utils';

export interface MemberShellProps {
  children: React.ReactNode;
}

export function MemberShell({ children }: MemberShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // In Phase 1, using typed mock data. Later this will connect to `useMemberAuth()` or `memberService.getCurrentProfile()`.
  const currentMember = mockCurrentMember;
  const notifications = mockMemberNotifications;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Accessibility Skip Link */}
      <a
        href="#member-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-md outline-none"
      >
        Skip to main content
      </a>

      {/* Desktop & Tablet Sidebar */}
      <MemberSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MemberMobileNav
        member={currentMember}
        drawerOpen={mobileDrawerOpen}
        onDrawerOpenChange={setMobileDrawerOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full overflow-hidden">
        {/* Top Member Header */}
        <MemberHeader
          member={currentMember}
          notifications={notifications}
          onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        />

        {/* Scrollable Page Container */}
        <main
          id="member-main-content"
          tabIndex={-1}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 min-w-0 pb-24 lg:pb-8 outline-none focus-visible:ring-1 focus-visible:ring-primary/40'
          )}
        >
          <div className="max-w-6xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
