'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Church, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemberNavItem } from './member-nav-item';
import {
  memberNavigation,
  mobileBottomNavItems,
  isRouteActive,
} from '@/lib/navigation/member-navigation';
import { MemberProfile } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MemberMobileNavProps {
  member: MemberProfile;
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
}

export function MemberMobileNav({
  member,
  drawerOpen,
  onDrawerOpenChange,
}: MemberMobileNavProps) {
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);

  const isOpen = drawerOpen !== undefined ? drawerOpen : internalOpen;
  const setOpen = onDrawerOpenChange || setInternalOpen;

  return (
    <>
      {/* Mobile Drawer (Sheet) for Full Menu */}
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b border-border/40 text-left">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm shrink-0">
                <Church className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <SheetTitle className="text-sm font-bold tracking-tight text-foreground truncate">
                  EMC Church
                </SheetTitle>
                <span className="text-[11px] font-medium text-primary uppercase truncate">
                  Member Portal
                </span>
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-6" aria-label="Mobile Navigation Menu">
              {memberNavigation.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-1">
                  {group.title && (
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
                        onClick={() => setOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Fixed Bottom Navigation Bar (Visible on mobile/tablet screens < lg) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/50 bg-background/95 backdrop-blur-md px-2 flex items-center justify-around select-none safe-bottom"
      >
        {mobileBottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isRouteActive(pathname, item.href, item.exact);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium transition-colors outline-none focus-visible:text-primary',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} aria-hidden="true" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu drawer trigger */}
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center flex-1 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:text-primary',
            isOpen && 'text-primary font-semibold'
          )}
          aria-label="Open full menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </>
  );
}
