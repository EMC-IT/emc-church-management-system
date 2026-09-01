'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/data-table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Plus, 
  Download, 
  CalendarIcon,
  QrCode,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { attendanceService, MOCK_ATTENDANCE_RECORDS } from '@/services/attendance-service';
import { AttendanceStatus } from '@/lib/types';

// Mock data for statistics
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
  { day: 'Mon', attendance: 45 },
  { day: 'Tue', attendance: 32 },
  { day: 'Wed', attendance: 98 },
  { day: 'Thu', attendance: 28 },
  { day: 'Fri', attendance: 38 },
  { day: 'Sat', attendance: 65 },
  { day: 'Sun', attendance: 387 }
];

const monthlyTrendData = [
  { month: 'Jan', attendance: 380 },
  { month: 'Feb', attendance: 395 },
  { month: 'Mar', attendance: 375 },
  { month: 'Apr', attendance: 387 }
];

// Chart Configurations
const weeklyChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const monthlyChartConfig = {
  attendance: {
    label: 'Attendance',
    color: 'hsl(var(--primary))',
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'serviceType',
    header: 'Service Type',
    cell: ({ row }: any) => (
      <Badge variant="neutral" size="sm">
        {row.getValue('serviceType')}
      </Badge>
    )
  },
  {
    accessorKey: 'serviceDate',
    header: 'Date',
    cell: ({ row }: any) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue('serviceDate')), 'MMM dd, yyyy')}
      </span>
    )
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check In',
    cell: ({ row }: any) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue('checkInTime') || '—'}
      </span>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as AttendanceStatus;
      return <StatusBadge status={status} size="sm" />;
    }
  }
];

export default function AttendancePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedService, setSelectedService] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData] = useState(MOCK_ATTENDANCE_RECORDS);

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = record.member.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = selectedService === 'all' || record.serviceType === selectedService;
    const matchesDate = format(new Date(record.serviceDate), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    return matchesSearch && matchesService && matchesDate;
  });

  const handleTakeAttendance = () => {
    router.push('/dashboard/attendance/take');
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Attendance</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                More
                <Download className="ml-1.5 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleQRCheckin}>
                <QrCode className="mr-2 h-4 w-4" />
                QR Check-in
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportData} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleTakeAttendance} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={attendanceOverviewStats.totalMembers}
          icon={Users}
          accent="primary"
        />
        <StatCard
          title="Present Today"
          value={attendanceOverviewStats.presentToday}
          icon={UserCheck}
          accent="success"
          trend={{ value: `+${attendanceOverviewStats.weeklyTrend}% from last week`, direction: 'up' }}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceOverviewStats.attendanceRate}%`}
          icon={UserCheck}
          accent="secondary"
        />
        <StatCard
          title="Late Arrivals"
          value={attendanceOverviewStats.lateToday}
          icon={Clock}
          accent="accent"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Attendance Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Weekly Attendance</CardTitle>
            <Badge variant="primary" size="sm">This Week</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer config={weeklyChartConfig} className="h-[260px] w-full">
              <BarChart data={weeklyAttendanceData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
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
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar 
                  dataKey="attendance" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Attendance Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">Monthly Attendance Trend</CardTitle>
            <Badge variant="success" size="sm">+3.2%</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyChartConfig} className="h-[260px] w-full">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                <defs>
                  <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="attendance"
                  type="monotone"
                  fill="url(#fillAttendance)"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                <Button variant="outline" className="w-full sm:w-48 font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
            recordLabel="attendance record"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchKey="member.name"
            searchPlaceholder="Search members..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
