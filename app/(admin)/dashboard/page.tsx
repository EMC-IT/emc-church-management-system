'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CurrencyDisplay } from '@/components/ui/currency-display';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Users,
  UserCheck,
  HandCoins,
  Calendar,
  Plus,
  MapPin,
  Clock,
  ArrowRight,
  UserPlus,
  Receipt,
  CalendarPlus,
  CheckSquare,
  Send,
  Building2,
  GraduationCap,
  Heart,
  FileText,
  BadgeCent,
  Wallet,
  Package,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';

// Attendance trend data
const attendanceData = [
  { month: 'Jan', attendance: 245 },
  { month: 'Feb', attendance: 280 },
  { month: 'Mar', attendance: 320 },
  { month: 'Apr', attendance: 298 },
  { month: 'May', attendance: 335 },
  { month: 'Jun', attendance: 365 },
];

// Giving trend data
const givingData = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 15800 },
  { month: 'Mar', amount: 18200 },
  { month: 'Apr', amount: 16900 },
  { month: 'May', amount: 22100 },
  { month: 'Jun', amount: 24500 },
];

// Recent members list
const recentMembers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', joinDate: '2024-01-15', status: 'new' },
  { id: '2', name: 'Mary Johnson', email: 'mary@example.com', joinDate: '2024-01-10', status: 'active' },
  { id: '3', name: 'David Brown', email: 'david@example.com', joinDate: '2024-01-05', status: 'new' },
  { id: '4', name: 'Grace Asante', email: 'grace.asante@example.com', joinDate: '2024-01-02', status: 'active' },
];

// Upcoming events list
const upcomingEvents = [
  { id: '1', title: 'Sunday Worship Service', date: 'Jan 21, 2024', time: '10:00 AM', location: 'Main Sanctuary' },
  { id: '2', title: 'Midweek Bible Study', date: 'Jan 24, 2024', time: '07:00 PM', location: 'Fellowship Hall' },
  { id: '3', title: 'Youth Ministry Meeting', date: 'Jan 27, 2024', time: '04:00 PM', location: 'Youth Chapel' },
  { id: '4', title: 'Leadership Council Session', date: 'Jan 28, 2024', time: '06:00 PM', location: 'Conference Room' },
];

// Chart Configurations
const attendanceChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const givingChartConfig = {
  amount: {
    label: 'Giving',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5 shadow-sm font-medium">
                <Plus className="h-4 w-4" />
                <span>Quick Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1.5">
              {/* 1. Frequent Everyday Actions */}
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Frequent Actions
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/members/add" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <UserPlus className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Add Member</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/giving/donations/add" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <Receipt className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Record Giving</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/tithes-offerings/add" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <HandCoins className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Record Tithe & Offering</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/events/add" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <CalendarPlus className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Create Event</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/attendance/take" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <CheckSquare className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Take Attendance</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/communications/messages/new" className="cursor-pointer py-2 px-2.5 rounded-md flex items-center">
                  <Send className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">Send Message</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5" />

              {/* 2. People & Ministry */}
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                People & Ministry
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/departments/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <Building2 className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Department</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/groups/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <Users className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Group</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/sunday-school/classes/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <GraduationCap className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Sunday School Class</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/prayer-requests/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <Heart className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Prayer Request</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1.5" />

              {/* 3. Finance & Operations */}
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Finance & Operations
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/expenses/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <FileText className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Record Expense</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/income/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <BadgeCent className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Income</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/budgets/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <Wallet className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Create Budget</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/assets/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <Package className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Asset</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/branches/add" className="cursor-pointer py-1.5 px-2.5 rounded-md text-sm flex items-center">
                  <MapPin className="mr-2.5 h-4 w-4 text-muted-foreground" />
                  <span>Add Branch</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics / Top 4 Core KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value="1,234"
          icon={Users}
          trend={{ value: "+12% from last month", direction: "up" }}
        />
        <StatCard
          title="Sunday Attendance"
          value="365"
          icon={UserCheck}
          trend={{ value: "+8% from last week", direction: "up" }}
        />
        <StatCard
          title="Month's Giving"
          value={<CurrencyDisplay amount={24500} />}
          icon={HandCoins}
          trend={{ value: "+15% from last month", direction: "up" }}
        />
        <StatCard
          title="Open Pastoral Requests"
          value="7"
          icon={Heart}
          description={<span className="text-xs text-amber-600 dark:text-amber-400 font-medium">3 marked urgent</span>}
          trend={{ value: "Action needed", direction: "neutral" }}
        />
      </div>

      {/* Contextual Action Widgets: Pastoral Action Required & Financial Stewardship Snapshot */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Widget 1: Pastoral Action Required */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Action Required: Pastoral Care</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">7 items require attention (2 Urgent • 3 High Priority • 2 Follow-ups)</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-primary font-medium hover:bg-primary/10">
              <Link href="/dashboard/pastoral-care" className="inline-flex items-center gap-1">
                <span>View all pastoral needs</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Convert Follow-up items */}
            <div className="p-3 rounded-lg border border-border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Convert Follow-up</span>
                </div>
                <span className="text-xs text-muted-foreground">Sunday Service</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Samuel Kwaku Osei</p>
                  <p className="text-xs text-muted-foreground">+233 24 555 0192 • Needs baptism orientation</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/pastoral-care">Follow up</Link>
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Urgent Visitation Request</span>
                </div>
                <span className="text-xs text-primary font-medium">Urgent</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Hospital Visitation: Elder Boateng</p>
                  <p className="text-xs text-muted-foreground">Submitted by Grace Boateng • 2 hours ago</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs" asChild>
                  <Link href="/dashboard/pastoral-care">View & Call</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto">
                <Link href="/dashboard/pastoral-care" className="inline-flex items-center gap-1">
                  <span>Open Pastoral Care Hub</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto">
                <Link href="/dashboard/prayer-requests" className="inline-flex items-center gap-1">
                  <span>View Prayer Requests</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Financial Income vs Expense Snapshot */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Financial Stewardship Snapshot</CardTitle>

            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/finance/reports">
                Statement
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-card/60 text-center">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Total Income</p>
                <p className="text-base font-bold text-foreground mt-0.5">GH₵ 32,800</p>
              </div>
              <div className="border-x border-border/80 px-2">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Expenses</p>
                <p className="text-base font-bold text-foreground mt-0.5">GH₵ 14,200</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Net Surplus</p>
                <p className="text-base font-bold text-primary mt-0.5">+GH₵ 18,600</p>
              </div>
            </div>

            {/* Income Allocation Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Budget Consumed (43.2%)</span>
                <span>Operating Reserve (56.8%)</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
                <div className="bg-primary/30 h-full" style={{ width: '43.2%' }} title="Expenses: 43.2%" />
                <div className="bg-primary h-full" style={{ width: '56.8%' }} title="Surplus: 56.8%" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" asChild>
                <Link href="/dashboard/finance/expenses/add">
                  <FileText className="h-3 w-3" />
                  <span>Record Expense</span>
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" asChild>
                <Link href="/dashboard/finance/giving/donations/add">
                  <HandCoins className="h-3 w-3" />
                  <span>Record Giving</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Attendance Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Attendance Trend</CardTitle>
            <Badge variant="primary" size="sm">+8.2%</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[280px] w-full">
              <LineChart data={attendanceData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs text-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="attendance"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  dot={{
                    fill: "hsl(var(--primary))",
                    strokeWidth: 2,
                    r: 3.5,
                  }}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--primary))",
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Giving Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Giving Trend</CardTitle>
            <Badge variant="primary" size="sm">+15.3%</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer config={givingChartConfig} className="h-[280px] w-full">
              <BarChart data={givingData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs text-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value / 1000}k`}
                  className="text-xs text-muted-foreground"
                />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operational Highlights: Recent Members & Upcoming Events */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Recent Members</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/members">
                View All
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                      {member.joinDate}
                    </span>
                    <StatusBadge status={member.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
            <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/events">
                View Calendar
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}