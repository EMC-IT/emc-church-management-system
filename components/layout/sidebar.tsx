"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/contexts/auth-context";
import { PERMISSIONS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  User,
  UserCheck,
  BadgeCent,
  MessageSquare,
  Calendar,
  UsersRound,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Church,
  Heart,
  Wallet,
  FileText,
  GraduationCap,
  Building2,
  HandCoins,
  Package,
  Activity,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: string | null;
  exact?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: null,
        exact: true,
      },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      {
        name: "Members",
        href: "/dashboard/members",
        icon: Users,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
      {
        name: "Attendance",
        href: "/dashboard/attendance",
        icon: UserCheck,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
      {
        name: "Groups",
        href: "/dashboard/groups",
        icon: UsersRound,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
      {
        name: "Departments",
        href: "/dashboard/departments",
        icon: Building2,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
    ],
  },
  {
    title: "MINISTRY",
    items: [
      {
        name: "Sunday School",
        href: "/dashboard/sunday-school",
        icon: GraduationCap,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
      {
        name: "Prayer Requests",
        href: "/dashboard/prayer-requests",
        icon: Heart,
        permission: PERMISSIONS.VIEW_MEMBERS,
      },
      {
        name: "Events",
        href: "/dashboard/events",
        icon: Calendar,
        permission: PERMISSIONS.MANAGE_EVENTS,
      },
    ],
  },
  {
    title: "FINANCE",
    items: [
      {
        name: "Giving",
        href: "/dashboard/finance/giving",
        icon: HandCoins,
        permission: PERMISSIONS.VIEW_FINANCE,
      },
      {
        name: "Income",
        href: "/dashboard/finance/income",
        icon: BadgeCent,
        permission: PERMISSIONS.VIEW_FINANCE,
      },
      {
        name: "Expenses",
        href: "/dashboard/finance/expenses",
        icon: FileText,
        permission: PERMISSIONS.VIEW_FINANCE,
      },
      {
        name: "Budgets",
        href: "/dashboard/finance/budgets",
        icon: Wallet,
        permission: PERMISSIONS.VIEW_FINANCE,
      },
      {
        name: "Reports",
        href: "/dashboard/finance/reports",
        icon: BarChart3,
        permission: PERMISSIONS.VIEW_REPORTS,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        name: "Assets",
        href: "/dashboard/assets",
        icon: Package,
        permission: PERMISSIONS.VIEW_FINANCE,
      },
      {
        name: "Communications",
        href: "/dashboard/communications",
        icon: MessageSquare,
        permission: PERMISSIONS.SEND_SMS,
      },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        permission: PERMISSIONS.VIEW_REPORTS,
      },
      {
        name: "Activity Logs",
        href: "/dashboard/activity-logs",
        icon: Activity,
        permission: PERMISSIONS.MANAGE_ROLES,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        name: "Profile",
        href: "/dashboard/profile",
        icon: User,
        permission: null,
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        permission: PERMISSIONS.MANAGE_ROLES,
      },
    ],
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact || href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between flex-shrink-0 h-16 border-b border-border">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <Church className="h-7 w-7 text-primary" />
            <span className="font-heading text-xl font-bold tracking-tight text-primary">
              ChurchMS
            </span>
          </Link>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <Church className="h-6 w-6 text-primary" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", !isCollapsed && "ml-auto")}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Links with ScrollArea */}
      <ScrollArea className="flex-1 px-3 py-3 h-full">
        <nav className="space-y-4">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || hasPermission(item.permission)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title || `section-${idx}`} className="space-y-1">
                {section.title && !isCollapsed && (
                  <div className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase select-none">
                    {section.title}
                  </div>
                )}
                {section.title && isCollapsed && idx > 0 && (
                  <Separator className="my-2" />
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isItemActive(item.href, item.exact);
                    return (
                      <Link
                        key={item.href + item.name}
                        href={item.href}
                        title={isCollapsed ? item.name : undefined}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
