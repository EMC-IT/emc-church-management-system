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
  UserCheck,
  BadgeCent,
  MessageSquare,
  Calendar,
  BookOpen,
  UsersRound,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Church,
  Heart,
  Wallet,
  FileText,
  Shield,
  GraduationCap,
  Building2,
  HandCoins,
  Package,
  Activity,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: null,
  },
  {
    name: "Members",
    href: "/dashboard/members",
    icon: Users,
    permission: PERMISSIONS.VIEW_MEMBERS,
    children: [
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
        name: "Sunday School",
        href: "/dashboard/sunday-school",
        icon: GraduationCap,
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
    name: "Assets",
    href: "/dashboard/assets",
    icon: Package,
    permission: PERMISSIONS.VIEW_FINANCE,
  },

  {
    name: "Finance",
    href: "/dashboard/finance",
    icon: Wallet,
    permission: PERMISSIONS.VIEW_FINANCE,
    children: [
      {
        name: "Giving",
        href: "/dashboard/finance/giving",
        icon: HandCoins,
      },
      {
        name: "Income",
        href: "/dashboard/finance/income",
        icon: BadgeCent,
      },
      {
        name: "Expenses",
        href: "/dashboard/finance/expenses",
        icon: FileText,
      },
      {
        name: "Tithes & Offerings",
        href: "/dashboard/finance/tithes-offerings",
        icon: Heart,
      },
      {
        name: "Budgets",
        href: "/dashboard/finance/budgets",
        icon: FileText,
      },
      {
        name: "Reports",
        href: "/dashboard/finance/reports",
        icon: BarChart3,
      },
    ],
  },
  
  {
    name: "Communications",
    href: "/dashboard/communications",
    icon: MessageSquare,
    permission: PERMISSIONS.SEND_SMS,
  },
  {
    name: "Events",
    href: "/dashboard/events",
    icon: Calendar,
    permission: PERMISSIONS.MANAGE_EVENTS,
  },
  {
    name: "Prayer Requests",
    href: "/dashboard/prayer-requests",
    icon: Heart,
    permission: PERMISSIONS.VIEW_MEMBERS,
  },
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
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    permission: PERMISSIONS.MANAGE_ROLES,
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300 h-screen",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Church className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold text-brand-primary">
              ChurchMS
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator className="flex-shrink-0" />

      <ScrollArea className="flex-1 px-3 py-4 h-full">
        <nav className="space-y-2">
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-brand-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>

              {item.children && !isCollapsed && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        pathname === child.href
                          ? "bg-brand-primary/10 text-brand-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
