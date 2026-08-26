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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  CheckSquare
} from 'lucide-react';
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
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/members/add" className="cursor-pointer">
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Add Member</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/giving/add" className="cursor-pointer">
                  <Receipt className="mr-2 h-4 w-4" />
                  <span>Record Giving</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/events/add" className="cursor-pointer">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  <span>Create Event</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/attendance/take" className="cursor-pointer">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  <span>Take Attendance</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics / Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value="1,234"
          icon={Users}
          trend={{ value: "+12% from last month", direction: "up" }}
        />
        <StatCard
          title="Today's Attendance"
          value="365"
          icon={UserCheck}
          trend={{ value: "+8% from last week", direction: "up" }}
        />
        <StatCard
          title="This Month's Giving"
          value={<CurrencyDisplay amount={24500} />}
          icon={HandCoins}
          trend={{ value: "+15% from last month", direction: "up" }}
        />
        <StatCard
          title="Upcoming Events"
          value="8"
          icon={Calendar}
          description="Scheduled this month"
        />
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
            <Badge variant="success" size="sm">+15.3%</Badge>
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