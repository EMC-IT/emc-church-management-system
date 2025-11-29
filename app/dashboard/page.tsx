'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { 
  Users, 
  UserCheck, 
  BadgeCent, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Plus,
  Mail,
  Phone,
  MapPin,
  ActivitySquare,
  ArrowRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Label, ComposedChart } from 'recharts';

const attendanceData = [
  { month: 'Jan', attendance: 245 },
  { month: 'Feb', attendance: 280 },
  { month: 'Mar', attendance: 320 },
  { month: 'Apr', attendance: 298 },
  { month: 'May', attendance: 335 },
  { month: 'Jun', attendance: 365 },
];

const givingData = [
  { month: 'Jan', amount: 12500 },
  { month: 'Feb', amount: 15800 },
  { month: 'Mar', amount: 18200 },
  { month: 'Apr', amount: 16900 },
  { month: 'May', amount: 22100 },
  { month: 'Jun', amount: 24500 },
];

const recentMembers = [
  { id: '1', name: 'John Smith', email: 'john@example.com', joinDate: '2024-01-15', status: 'New' },
  { id: '2', name: 'Mary Johnson', email: 'mary@example.com', joinDate: '2024-01-10', status: 'Active' },
  { id: '3', name: 'David Brown', email: 'david@example.com', joinDate: '2024-01-05', status: 'New' },
];

const upcomingEvents = [
  { id: '1', title: 'Sunday Service', date: '2024-01-21', time: '10:00 AM', location: 'Main Sanctuary' },
  { id: '2', title: 'Bible Study', date: '2024-01-22', time: '7:00 PM', location: 'Fellowship Hall' },
  { id: '3', title: 'Youth Meeting', date: '2024-01-23', time: '6:00 PM', location: 'Youth Room' },
];

// Chart Configurations
const attendanceChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const givingChartConfig = {
  amount: {
    label: 'Amount',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

// Additional data for new charts
const eventsData = [
  { month: 'Jan', events: 8, attendees: 520 },
  { month: 'Feb', events: 12, attendees: 680 },
  { month: 'Mar', events: 10, attendees: 590 },
  { month: 'Apr', events: 15, attendees: 820 },
  { month: 'May', events: 14, attendees: 750 },
  { month: 'Jun', events: 18, attendees: 980 },
];

const eventsChartConfig = {
  events: {
    label: 'Events',
    color: 'hsl(var(--chart-3))',
  },
  attendees: {
    label: 'Attendees',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const groupsData = [
  { name: 'Youth', members: 85, active: 78 },
  { name: "Women's", members: 65, active: 60 },
  { name: "Men's", members: 48, active: 42 },
  { name: "Children's", members: 92, active: 88 },
  { name: 'Worship', members: 35, active: 32 },
  { name: 'Prayer', members: 28, active: 27 },
];

const groupsChartConfig = {
  members: {
    label: 'Total Members',
    color: 'hsl(var(--chart-1))',
  },
  active: {
    label: 'Active Members',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const departmentsData = [
  { name: 'Worship', value: 25, color: 'hsl(var(--chart-1))' },
  { name: 'Youth', value: 85, color: 'hsl(var(--chart-2))' },
  { name: "Women's", value: 45, color: 'hsl(var(--chart-3))' },
  { name: "Men's", value: 32, color: 'hsl(var(--chart-4))' },
  { name: "Children's", value: 65, color: 'hsl(var(--chart-5))'},
];

const departmentsChartConfig = {
  value: {
    label: 'Members',
  },
} satisfies ChartConfig;

const prayerRequestsData = [
  { category: 'Health', count: 45 },
  { category: 'Family', count: 32 },
  { category: 'Finance', count: 28 },
  { category: 'Guidance', count: 38 },
  { category: 'Salvation', count: 22 },
  { category: 'Other', count: 15 },
];

const prayerChartConfig = {
  count: {
    label: 'Requests',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening in your church.</p>
        </div>
        <Button className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-brand-primary"/>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success flex items-center font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
            <div className="p-2 bg-brand-secondary/10 rounded-lg">
              <UserCheck className="h-4 w-4 text-brand-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">365</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success flex items-center font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8% from last week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month's Giving</CardTitle>
            <div className="p-2 bg-brand-success/10 rounded-lg">
              <BadgeCent className="h-4 w-4 text-brand-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={24500} />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success flex items-center font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +15% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <div className="p-2 bg-brand-accent/10 rounded-lg">
              <Calendar className="h-4 w-4 text-brand-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-accent font-medium">This week</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance Trend</CardTitle>
                <CardDescription>Monthly attendance over the past 6 months</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-brand-secondary/10 text-brand-secondary">
                +8.2%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
              <LineChart data={attendanceData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip 
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="line" />} 
                />
                <Line
                  dataKey="attendance"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2.5}
                  dot={{
                    fill: "hsl(var(--chart-2))",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    fill: "hsl(var(--chart-2))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Giving Trend</CardTitle>
                <CardDescription>Monthly giving over the past 6 months</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-brand-success/10 text-brand-success">
                +15.3%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={givingChartConfig} className="h-[300px] w-full">
              <BarChart data={givingData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value / 1000}k`}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--chart-1))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts - 4 Column Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Events Trend */}
        <Card className="hover:shadow-md transition-shadow lg:col-span-2">
          <CardHeader>
            <CardTitle>Events Overview</CardTitle>
            <CardDescription>Monthly events and attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eventsChartConfig} className="h-[250px] w-full">
              <ComposedChart data={eventsData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  yAxisId="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip 
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />} 
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  yAxisId="left"
                  dataKey="events"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  dataKey="attendees"
                  type="monotone"
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-4))", r: 3 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Departments Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Member distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={departmentsChartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={departmentsData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  strokeWidth={5}
                >
                  {departmentsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const total = departmentsData.reduce((a, b) => a + b.value, 0);
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-2xl font-bold"
                            >
                              {total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Prayer Requests */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Prayer Requests</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={prayerChartConfig} className="h-[250px] w-full">
              <BarChart data={prayerRequestsData} layout="horizontal" margin={{ left: 12, right: 12 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  tickLine={false} 
                  axisLine={false}
                  width={60}
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--chart-5))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Groups Activity Chart */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Groups Activity</CardTitle>
              <CardDescription>Total vs Active members across groups</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
              86% Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={groupsChartConfig} className="h-[300px] w-full">
            <BarChart data={groupsData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="members" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Members</CardTitle>
            <CardDescription>Latest members who joined the church</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <Badge variant={member.status === 'New' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events scheduled for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{event.date}</span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="border-l-4 border-l-brand-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <ActivitySquare className="h-5 w-5 text-brand-primary" />
            </div>
            <div>
              <CardTitle>Today's Activity Summary</CardTitle>
              <CardDescription>Quick overview of today's church activities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border border-brand-primary/20">
              <div>
                <p className="text-sm text-muted-foreground">New Members</p>
                <p className="text-2xl font-bold text-brand-primary">3</p>
              </div>
              <Users className="h-8 w-8 text-brand-primary/40" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-brand-secondary/10 to-brand-secondary/5 border border-brand-secondary/20">
              <div>
                <p className="text-sm text-muted-foreground">Services Today</p>
                <p className="text-2xl font-bold text-brand-secondary">2</p>
              </div>
              <Calendar className="h-8 w-8 text-brand-secondary/40" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-brand-success/10 to-brand-success/5 border border-brand-success/20">
              <div>
                <p className="text-sm text-muted-foreground">Donations</p>
                <p className="text-2xl font-bold text-brand-success">12</p>
              </div>
              <BadgeCent className="h-8 w-8 text-brand-success/40" />
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20">
              <div>
                <p className="text-sm text-muted-foreground">Prayer Requests</p>
                <p className="text-2xl font-bold text-brand-accent">8</p>
              </div>
              <Mail className="h-8 w-8 text-brand-accent/40" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Frequently used actions for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-brand-primary/5 hover:border-brand-primary transition-colors group"
            >
              <div className="p-2 bg-brand-primary/10 rounded-lg group-hover:bg-brand-primary/20 transition-colors">
                <Users className="h-5 w-5 text-brand-primary" />
              </div>
              <span className="font-medium">Add Member</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-brand-secondary/5 hover:border-brand-secondary transition-colors group"
            >
              <div className="p-2 bg-brand-secondary/10 rounded-lg group-hover:bg-brand-secondary/20 transition-colors">
                <UserCheck className="h-5 w-5 text-brand-secondary" />
              </div>
              <span className="font-medium">Take Attendance</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-brand-success/5 hover:border-brand-success transition-colors group"
            >
              <div className="p-2 bg-brand-success/10 rounded-lg group-hover:bg-brand-success/20 transition-colors">
                <BadgeCent className="h-5 w-5 text-brand-success" />
              </div>
              <span className="font-medium">Record Donation</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-brand-accent/5 hover:border-brand-accent transition-colors group"
            >
              <div className="p-2 bg-brand-accent/10 rounded-lg group-hover:bg-brand-accent/20 transition-colors">
                <Calendar className="h-5 w-5 text-brand-accent" />
              </div>
              <span className="font-medium">Create Event</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}