'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  Church,
  FileText,
  GraduationCap,
  HandCoins,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Package,
  Search,
  Settings,
  User,
  UserCheck,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

type SearchItem = {
  label: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  keywords?: string[];
};

type SearchGroup = {
  label: string;
  items: SearchItem[];
};

const searchGroups: SearchGroup[] = [
  {
    label: 'Navigation',
    items: [
      { label: 'Dashboard', description: 'Overview and activity', href: '/dashboard', icon: LayoutDashboard, keywords: ['home'] },
      { label: 'Profile', description: 'Your account details', href: '/dashboard/profile', icon: User, keywords: ['account'] },
      { label: 'Settings', description: 'Church and account settings', href: '/dashboard/settings', icon: Settings },
      { label: 'Activity logs', description: 'Review system activity', href: '/dashboard/activity-logs', icon: Activity, keywords: ['audit'] },
    ],
  },
  {
    label: 'People & ministry',
    items: [
      { label: 'Members', description: 'Find and manage people', href: '/dashboard/members', icon: Users, keywords: ['people', 'families'] },
      { label: 'Attendance', description: 'Services and attendance', href: '/dashboard/attendance', icon: UserCheck },
      { label: 'Groups', description: 'Small groups and ministries', href: '/dashboard/groups', icon: UsersRound },
      { label: 'Departments', description: 'Teams and departments', href: '/dashboard/departments', icon: Building2 },
      { label: 'Sunday school', description: 'Classes, teachers and students', href: '/dashboard/sunday-school', icon: GraduationCap, keywords: ['classes'] },
      { label: 'Prayer requests', description: 'Prayer care and follow-up', href: '/dashboard/prayer-requests', icon: Heart, keywords: ['pastoral care'] },
    ],
  },
  {
    label: 'Operations',
    items: [
      { label: 'Events', description: 'Calendar and registrations', href: '/dashboard/events', icon: Calendar },
      { label: 'Communications', description: 'Announcements and messages', href: '/dashboard/communications', icon: MessageSquare, keywords: ['email', 'sms'] },
      { label: 'Assets', description: 'Church property and inventory', href: '/dashboard/assets', icon: Package },
      { label: 'Analytics', description: 'Insights and reporting', href: '/dashboard/analytics', icon: BarChart3, keywords: ['reports'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { label: 'Finance overview', description: 'Financial activity', href: '/dashboard/finance', icon: Wallet },
      { label: 'Giving', description: 'Gifts and contributions', href: '/dashboard/finance/giving', icon: HandCoins, keywords: ['donations'] },
      { label: 'Income', description: 'Income records', href: '/dashboard/finance/income', icon: Church },
      { label: 'Expenses', description: 'Expense records', href: '/dashboard/finance/expenses', icon: FileText },
      { label: 'Tithes & offerings', description: 'Tithe and offering records', href: '/dashboard/finance/tithes-offerings', icon: Heart, keywords: ['batches'] },
      { label: 'Budgets', description: 'Planning and allocations', href: '/dashboard/finance/budgets', icon: BookOpen },
      { label: 'Financial reports', description: 'Statements and trends', href: '/dashboard/finance/reports', icon: BarChart3 },
    ],
  },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center gap-3 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-72 lg:w-80"
        aria-label="Open global search"
        aria-haspopup="dialog"
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="hidden flex-1 truncate text-left sm:block">
          Search people, events, finance...
        </span>
        <kbd className="hidden h-6 items-center rounded-md border bg-muted px-2 font-body text-xs text-muted-foreground lg:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        contentClassName="top-[38%] max-w-2xl gap-0 rounded-xl"
      >
        <CommandInput
          placeholder="Search or run a command..."
          aria-label="Search destinations"
          className="h-14 text-base"
        />
        <CommandList className="max-h-96 p-2">
          <CommandEmpty>No matching destination found.</CommandEmpty>
          {searchGroups.map((group, index) => (
            <div key={group.label}>
              {index > 0 ? <CommandSeparator className="my-2" /> : null}
              <CommandGroup heading={group.label}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const value = [item.label, item.description, ...(item.keywords ?? [])].join(' ');

                  return (
                    <CommandItem
                      key={item.href}
                      value={value}
                      onSelect={() => navigate(item.href)}
                      className="group gap-3 px-3 py-3 data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
                    >
                      <Icon className="h-5 w-5 shrink-0 text-muted-foreground group-data-[selected=true]:text-primary-foreground" />
                      <div className="min-w-0">
                        <p className="font-medium leading-none">{item.label}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground group-data-[selected=true]:text-primary-foreground/80">
                          {item.description}
                        </p>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
        <div className="flex items-center gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
          <span><kbd className="mr-1 rounded border bg-muted px-1.5 py-0.5">↑↓</kbd> Navigate</span>
          <span><kbd className="mr-1 rounded border bg-muted px-1.5 py-0.5">↵</kbd> Open</span>
          <span className="ml-auto"><kbd className="mr-1 rounded border bg-muted px-1.5 py-0.5">Esc</kbd> Close</span>
        </div>
      </CommandDialog>
    </>
  );
}
