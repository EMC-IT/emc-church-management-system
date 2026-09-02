import {
  LayoutDashboard,
  User,
  Users,
  UserCheck,
  HandCoins,
  UsersRound,
  Building2,
  Calendar,
  Compass,
  Heart,
  HeartHandshake,
  BookOpen,
  Bell,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface MemberNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: string | number;
}

export interface MemberNavGroup {
  title?: string;
  items: MemberNavItem[];
}

export const memberNavigation: MemberNavGroup[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/portal',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'MY PROFILE',
    items: [
      {
        label: 'My Profile',
        href: '/portal/profile',
        icon: User,
      },
      {
        label: 'My Family',
        href: '/portal/family',
        icon: Users,
      },
    ],
  },
  {
    title: 'MY CHURCH',
    items: [
      {
        label: 'Attendance',
        href: '/portal/attendance',
        icon: UserCheck,
      },
      {
        label: 'Giving',
        href: '/portal/giving',
        icon: HandCoins,
      },
      {
        label: 'Groups',
        href: '/portal/groups',
        icon: UsersRound,
      },
      {
        label: 'Ministries',
        href: '/portal/ministries',
        icon: Building2,
      },
      {
        label: 'Events',
        href: '/portal/events',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'MY JOURNEY',
    items: [
      {
        label: 'My Journey',
        href: '/portal/journey',
        icon: Compass,
      },
    ],
  },
  {
    title: 'CARE',
    items: [
      {
        label: 'Prayer Requests',
        href: '/portal/prayer',
        icon: Heart,
      },
      {
        label: 'Pastoral Care',
        href: '/portal/pastoral-care',
        icon: HeartHandshake,
      },
    ],
  },
  {
    title: 'RESOURCES',
    items: [
      {
        label: 'Resources',
        href: '/portal/resources',
        icon: BookOpen,
      },
    ],
  },
  {
    title: 'COMMUNICATION',
    items: [
      {
        label: 'Notifications',
        href: '/portal/notifications',
        icon: Bell,
      },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      {
        label: 'Settings',
        href: '/portal/settings',
        icon: Settings,
      },
    ],
  },
];

export interface MobileBottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const mobileBottomNavItems: MobileBottomNavItem[] = [
  {
    label: 'Home',
    href: '/portal',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Church',
    href: '/portal/events',
    icon: Calendar,
  },
  {
    label: 'Care',
    href: '/portal/prayer',
    icon: Heart,
  },
  {
    label: 'Me',
    href: '/portal/profile',
    icon: User,
  },
];

/**
 * Robust active state checker supporting exact root and nested routes.
 */
export function isRouteActive(pathname: string | null | undefined, href: string, exact = false): boolean {
  if (!pathname) return false;
  if (exact || href === '/portal') {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

