'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Download, 
  CalendarIcon,
  Users,
  UserCheck,
  TrendingUp,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Line,
  Area,
  Label,
  ComposedChart
} from 'recharts';
import { attendanceService } from '@/services/attendance-service';

// Mock data for reports
const monthlyAttendanceData = [
  { month: 'Jan', attendance: 380, target: 400 },
  { month: 'Feb', attendance: 395, target: 400 },
  { month: 'Mar', attendance: 375, target: 400 },
  { month: 'Apr', attendance: 387, target: 400 },
  { month: 'May', attendance: 412, target: 400 },
  { month: 'Jun', attendance: 398, target: 400 }
];

const serviceTypeAnalytics = [
  { name: 'Sunday Service', attendance: 387, rate: 86, growth: 2.5 },
  { name: 'Bible Study', attendance: 98, rate: 82, growth: -1.2 },
  { name: 'Prayer Meeting', attendance: 38, rate: 84, growth: 5.8 },
  { name: 'Youth Service', attendance: 72, rate: 85, growth: 3.1 },
  { name: 'Special Service', attendance: 156, rate: 89, growth: 8.4 }
];

const departmentAttendanceData = [
  { department: 'Media Ministry', members: 25, attendance: 23, rate: 92 },
  { department: 'Music Ministry', members: 35, attendance: 31, rate: 89 },
  { department: 'Children Ministry', members: 28, attendance: 24, rate: 86 },
  { department: 'Ushering', members: 20, attendance: 17, rate: 85 },
  { department: 'Security', members: 15, attendance: 12, rate: 80 },
  { department: 'Youth Ministry', members: 45, attendance: 38, rate: 84 }
];

const weeklyTrendData = [
  { week: 'Week 1', present: 380, late: 15, absent: 55, excused: 8 },
  { week: 'Week 2', present: 395, late: 12, absent: 48, excused: 5 },
  { week: 'Week 3', present: 387, late: 18, absent: 52, excused: 7 },
  { week: 'Week 4', present: 402, late: 14, absent: 45, excused: 6 }
];

const topAttendersData = [
  { name: 'John Doe', department: 'Media Ministry', rate: 98, streak: 24 },
  { name: 'Jane Smith', department: 'Children Ministry', rate: 96, streak: 22 },
  { name: 'Michael Johnson', department: 'Ushering', rate: 94, streak: 20 },
  { name: 'Sarah Wilson', department: 'Music Ministry', rate: 92, streak: 18 },
  { name: 'David Brown', department: 'Security', rate: 90, streak: 16 }
];

const attendanceDistribution = [
  { name: 'Present', value: 387, color: 'hsl(var(--primary))' },
  { name: 'Late', value: 18, color: 'hsl(var(--muted-foreground))' },
  { name: 'Absent', value: 52, color: 'hsl(var(--destructive))' },
  { name: 'Excused', value: 7, color: 'hsl(var(--border))' }
];

// Chart Configurations
const monthlyChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
  target: {
    label: 'Target',
    color: 'hsl(var(--muted-foreground))',
  },
} satisfies ChartConfig;

const distributionChartConfig = {
  value: {
    label: 'Count',
  },
} satisfies ChartConfig;

const weeklyChartConfig = {
  present: {
    label: 'Present',
    color: 'hsl(var(--primary))',
  },
  late: {
    label: 'Late',
    color: 'hsl(var(--muted-foreground))',
  },
  absent: {
    label: 'Absent',
    color: 'hsl(var(--destructive))',
  },
  excused: {
    label: 'Excused',
    color: 'hsl(var(--border))',
  },
} satisfies ChartConfig;

export default function AttendanceReportsPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const overallStats = {
    totalSessions: 48,
    averageAttendance: 391,
    attendanceRate: 86.8,
    growth: 4.2,
    bestMonth: 'May',
    bestRate: 91
  };

  const handleExportReport = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceService.exportAttendanceData();
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/attendance" aria-label="Back to Attendance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Attendance Reports
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportReport} disabled={isLoading}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="Sunday Service">Sunday Service</SelectItem>
              <SelectItem value="Bible Study">Bible Study</SelectItem>
              <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
              <SelectItem value="Youth Service">Youth Service</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-64">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setDateRange({ from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={2}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={overallStats.totalSessions}
          icon={BarChart3}
        />
        <StatCard
          title="Avg Attendance"
          value={overallStats.averageAttendance}
          icon={Users}
          trend={{ value: `+${overallStats.growth}% from last period`, direction: 'up' }}
        />
        <StatCard
          title="Attendance Rate"
          value={`${overallStats.attendanceRate}%`}
          icon={UserCheck}
        />
        <StatCard
          title="Best Performance"
          value={`${overallStats.bestRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="members">Top Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Attendance Trend */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Monthly Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
                  <ComposedChart data={monthlyAttendanceData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      dataKey="attendance"
                      type="monotone"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Attendance Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Attendance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={distributionChartConfig} className="h-[280px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />} 
                    />
                    <Pie
                      data={attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                    >
                      {attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const total = attendanceDistribution.reduce((acc, curr) => acc + curr.value, 0);
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
                                  y={(viewBox.cy || 0) + 18}
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
                    <ChartLegend content={<ChartLegendContent />} />
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service Type Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Service Type Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {serviceTypeAnalytics.map((service, index) => (
                  <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-medium text-sm text-foreground">{service.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {service.attendance} attendees
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-sm">{service.rate}%</div>
                        <div className="text-xs text-muted-foreground">
                          {service.growth >= 0 ? `+${service.growth}%` : `${service.growth}%`}
                        </div>
                      </div>
                      <Progress value={service.rate} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Attendance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={weeklyChartConfig} className="h-[340px] w-full">
                <BarChart data={weeklyTrendData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="week"
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
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                    content={<ChartTooltipContent indicator="dot" />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar 
                    dataKey="present" 
                    stackId="a" 
                    fill="hsl(var(--primary))" 
                  />
                  <Bar 
                    dataKey="late" 
                    stackId="a" 
                    fill="hsl(var(--muted-foreground))" 
                  />
                  <Bar 
                    dataKey="absent" 
                    stackId="a" 
                    fill="hsl(var(--destructive))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Department Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {departmentAttendanceData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="font-medium text-sm text-foreground">{dept.department}</div>
                      <div className="text-xs text-muted-foreground">
                        {dept.members} enrolled
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-sm">{dept.attendance}/{dept.members}</div>
                        <div className="text-xs text-muted-foreground">
                          {dept.rate}% rate
                        </div>
                      </div>
                      <Progress value={dept.rate} className="w-20" />
                      <Badge variant={dept.rate >= 90 ? 'primary' : 'neutral'} size="sm">
                        {dept.rate >= 90 ? 'High' : dept.rate >= 80 ? 'Standard' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Members Tab */}
        <TabsContent value="members" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Consistent Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {topAttendersData.map((member, index) => (
                  <div key={index} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium text-sm">{member.rate}%</div>
                        <div className="text-xs text-muted-foreground">
                          {member.streak} week streak
                        </div>
                      </div>
                      <Progress value={member.rate} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}