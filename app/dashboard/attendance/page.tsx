'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Download, 
  Filter,
  CalendarIcon,
  Search,
  BarChart3,
  PieChart,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  Label
} from 'recharts';
import { attendanceService, MOCK_ATTENDANCE_RECORDS, MOCK_ATTENDANCE_SESSIONS } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType } from '@/lib/types';

// Mock data for charts and statistics
const attendanceOverviewStats = {
  totalMembers: 450,
  presentToday: 387,
  absentToday: 63,
  lateToday: 12,
  attendanceRate: 86,
  weeklyTrend: 2.5,
  monthlyAverage: 84.2
};

const weeklyAttendanceData = [
  { day: 'Mon', attendance: 45, rate: 85 },
  { day: 'Tue', attendance: 32, rate: 78 },
  { day: 'Wed', attendance: 98, rate: 82 },
  { day: 'Thu', attendance: 28, rate: 75 },
  { day: 'Fri', attendance: 38, rate: 84 },
  { day: 'Sat', attendance: 65, rate: 88 },
  { day: 'Sun', attendance: 387, rate: 86 }
];

const serviceTypeData = [
  { name: 'Sunday Service', value: 387, color: '#2E8DB0' },
  { name: 'Bible Study', value: 98, color: '#28ACD1' },
  { name: 'Prayer Meeting', value: 38, color: '#C49831' },
  { name: 'Youth Service', value: 72, color: '#A5CF5D' }
];

const monthlyTrendData = [
  { month: 'Jan', attendance: 380, rate: 84 },
  { month: 'Feb', attendance: 395, rate: 88 },
  { month: 'Mar', attendance: 375, rate: 83 },
  { month: 'Apr', attendance: 387, rate: 86 }
];

// Chart Configurations
const weeklyChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const serviceTypeChartConfig = {
  value: {
    label: 'Members',
  },
} satisfies ChartConfig;

const monthlyChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const attendanceColumns = [
  {
    accessorKey: 'member.name',
    header: 'Member',
    cell: ({ row }: any) => {
      const member = row.original.member;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-brand-primary">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'serviceType',
    header: 'Service Type',
    cell: ({ row }: any) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {row.getValue('serviceType')}
      </Badge>
    )
  },
  {
    accessorKey: 'serviceDate',
    header: 'Date',
    cell: ({ row }: any) => format(new Date(row.getValue('serviceDate')), 'MMM dd, yyyy')
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check In',
    cell: ({ row }: any) => row.getValue('checkInTime') || 'N/A'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as AttendanceStatus;
      const statusConfig = {
        [AttendanceStatus.PRESENT]: { label: 'Present', className: 'bg-green-100 text-green-800 border-green-200' },
        [AttendanceStatus.LATE]: { label: 'Late', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
        [AttendanceStatus.ABSENT]: { label: 'Absent', className: 'bg-red-100 text-red-800 border-red-200' },
        [AttendanceStatus.EXCUSED]: { label: 'Excused', className: 'bg-blue-100 text-blue-800 border-blue-200' },
        [AttendanceStatus.PARTIAL]: { label: 'Partial', className: 'bg-orange-100 text-orange-800 border-orange-200' }
      };
      
      const config = statusConfig[status] || statusConfig[AttendanceStatus.ABSENT];
      return (
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
      );
    }
  }
];

export default function AttendancePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState(MOCK_ATTENDANCE_RECORDS);
  const [sessionsData, setSessionsData] = useState(MOCK_ATTENDANCE_SESSIONS);

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = record.member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || record.serviceType === selectedService;
    const matchesDate = format(new Date(record.serviceDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    return matchesSearch && matchesService && matchesDate;
  });

  const handleTakeAttendance = () => {
    router.push('/dashboard/attendance/take');
  };

  const handleViewReports = () => {
    router.push('/dashboard/attendance/reports');
  };

  const handleQRCheckin = () => {
    router.push('/dashboard/attendance/qr-checkin');
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const response = await attendanceService.exportAttendanceData();
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Overview</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage church attendance across all services
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={handleTakeAttendance} className="bg-brand-primary hover:bg-brand-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Take Attendance
          </Button>
          <Button variant="outline" onClick={handleQRCheckin} className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white">
            <QrCode className="h-4 w-4 mr-2" />
            QR Check-in
          </Button>
          <Button variant="outline" onClick={handleViewReports}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Reports
          </Button>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-brand-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceOverviewStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active church members
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <div className="p-2 bg-brand-success/10 rounded-lg">
              <UserCheck className="h-4 w-4 text-brand-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{attendanceOverviewStats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success flex items-center font-medium">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{attendanceOverviewStats.weeklyTrend}%
              </span>
              from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <div className="p-2 bg-brand-accent/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-brand-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">{attendanceOverviewStats.attendanceRate}%</div>
            <Progress value={attendanceOverviewStats.attendanceRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Monthly average: {attendanceOverviewStats.monthlyAverage}%
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-brand-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <div className="p-2 bg-brand-secondary/10 rounded-lg">
              <Clock className="h-4 w-4 text-brand-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-secondary">{attendanceOverviewStats.lateToday}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((attendanceOverviewStats.lateToday / attendanceOverviewStats.presentToday) * 100)}% of attendees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Attendance Trend */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-primary" />
                  Weekly Attendance Trend
                </CardTitle>
                <CardDescription>
                  Attendance patterns across the week
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary">
                This Week
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyChartConfig} className="h-[300px] w-full">
              <BarChart data={weeklyAttendanceData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
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
                <Bar 
                  dataKey="attendance" 
                  fill="hsl(var(--chart-1))" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Service Type Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-brand-primary" />
              Service Type Distribution
            </CardTitle>
            <CardDescription>
              Attendance by service type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={serviceTypeChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <RechartsPieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={serviceTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={5}
                >
                  {serviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const total = serviceTypeData.reduce((a, b) => a + b.value, 0);
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {serviceTypeData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand-primary" />
                Monthly Attendance Trend
              </CardTitle>
              <CardDescription>
                Attendance trends over the past months
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-brand-success/10 text-brand-success">
              +3.2% Growth
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
            <AreaChart data={monthlyTrendData} margin={{ left: 12, right: 12 }}>
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
              <defs>
                <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                dataKey="attendance"
                type="natural"
                fill="url(#fillAttendance)"
                fillOpacity={0.4}
                stroke="hsl(var(--chart-1))"
                strokeWidth={2.5}
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Recent Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
          <CardDescription>
            Latest attendance entries across all services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Service type" />
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
                <Button variant="outline" className="w-full sm:w-48">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <DataTable
            columns={attendanceColumns}
            data={filteredAttendance}
            searchKey="member.name"
            searchPlaceholder="Search members..."
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/attendance/take')}>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-brand-primary" />
            </div>
            <CardTitle className="text-lg">Take Attendance</CardTitle>
            <CardDescription>
              Record attendance for today's service
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/attendance/history')}>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-secondary/10 flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-brand-secondary" />
            </div>
            <CardTitle className="text-lg">View History</CardTitle>
            <CardDescription>
              Browse past attendance records
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/dashboard/attendance/reports')}>
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center mb-2">
              <BarChart3 className="h-6 w-6 text-brand-accent" />
            </div>
            <CardTitle className="text-lg">Generate Reports</CardTitle>
            <CardDescription>
              Create detailed attendance reports
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}