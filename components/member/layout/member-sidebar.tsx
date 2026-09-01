'use client';

import Link from 'next/link';
import { Church, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemberNavItem } from './member-nav-item';
import { memberNavigation } from '@/lib/navigation/member-navigation';
import { cn } from '@/lib/utils';

export interface MemberSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function MemberSidebar({
  isCollapsed,
  onToggleCollapse,
  className,
}: MemberSidebarProps) {
  return (
    <aside
      aria-label="Member Navigation Sidebar"
      className={cn(
        'relative hidden lg:flex flex-col border-r border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 ease-in-out shrink-0 h-screen select-none',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/40 shrink-0">
        <Link
          href="/portal"
          className={cn(
            'flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md',
            isCollapsed && 'justify-center w-full'
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm shrink-0">
            <Church className="h-5 w-5" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-foreground truncate">
                EMC Church
              </span>
              <span className="text-[11px] font-medium text-primary tracking-wide uppercase truncate">
                Member Portal
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Scroll Area */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6" aria-label="Member Portal Menu">
          {memberNavigation.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && group.title && (
                <h3 className="px-3 text-[11px] font-semibold text-muted-foreground/70 tracking-wider uppercase">
                  {group.title}
                </h3>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <MemberNavItem
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    exact={item.exact}
                    badge={item.badge}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Scripture Card matching layout */}
        {!isCollapsed && (
          <div className="mt-6 p-3.5 rounded-lg border border-border/50 bg-muted/40 relative">
            <p className="text-xs text-foreground/80 leading-snug italic">
              &ldquo;I was glad when they said to me, &lsquo;Let us go to the house of the LORD.&rsquo;&rdquo;
            </p>
            <span className="text-[10px] font-semibold text-primary block mt-1.5 not-italic">
              Psalm 122:1
            </span>
          </div>
        )}
      </ScrollArea>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-border/40 shrink-0 flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            'h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5 focus-visible:ring-2 focus-visible:ring-primary',
            isCollapsed && 'w-full justify-center px-0'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
