'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  MoreHorizontal, 
  Users, 
  Target, 
  UserCheck, 
  Clock, 
  UserX, 
  Zap,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  Label
} from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig
} from '@/components/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock member data
const MOCK_MEMBER = {
  id: 'mem_001',
  name: 'John Doe',
  phone: '+233 24 123 4567',
  email: 'john.doe@church.com',
  department: 'Media Ministry',
  group: 'Youth Group',
  role: 'Sound Engineer',
  joinDate: '2020-01-15',
  status: 'active',
  gender: 'Male',
};

// Mock attendance history
const MOCK_ATTENDANCE_HISTORY = [
  {
    id: 'att_001',
    date: '2024-01-21',
    serviceType: 'Sunday Service',
    status: 'present',
    checkInTime: '08:45',
    notes: 'Arrived early for sound check'
  },
  {
    id: 'att_002',
    date: '2024-01-18',
    serviceType: 'Bible Study',
    status: 'present',
    checkInTime: '18:30',
    notes: ''
  },
  {
    id: 'att_003',
    date: '2024-01-14',
    serviceType: 'Sunday Service',
    status: 'present',
    checkInTime: '09:00',
    notes: ''
  },
  {
    id: 'att_004',
    date: '2024-01-11',
    serviceType: 'Prayer Meeting',
    status: 'late',
    checkInTime: '19:15',
    notes: 'Traffic delay'
  },
  {
    id: 'att_005',
    date: '2024-01-07',
    serviceType: 'Sunday Service',
    status: 'present',
    checkInTime: '08:50',
    notes: ''
  },
  {
    id: 'att_006',
    date: '2024-01-04',
    serviceType: 'Bible Study',
    status: 'absent',
    checkInTime: null,
    notes: 'Sick leave'
  }
];

const monthlyAttendance = [
  { month: 'Aug', present: 4, late: 1, absent: 0 },
  { month: 'Sep', present: 6, late: 0, absent: 1 },
  { month: 'Oct', present: 5, late: 2, absent: 0 },
  { month: 'Nov', present: 7, late: 0, absent: 1 },
  { month: 'Dec', present: 6, late: 1, absent: 0 },
  { month: 'Jan', present: 5, late: 1, absent: 1 }
];

const serviceTypeDistribution = [
  { name: 'Sunday Service', value: 18, color: 'hsl(var(--primary))' },
  { name: 'Bible Study', value: 12, color: 'hsl(var(--muted-foreground))' },
  { name: 'Prayer Meeting', value: 8, color: 'hsl(var(--border))' },
  { name: 'Special Events', value: 5, color: 'hsl(var(--card-foreground))' }
];

// Chart configurations
const monthlyChartConfig = {
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
} satisfies ChartConfig;

const serviceChartConfig = {
  value: {
    label: 'Attendance',
  },
} satisfies ChartConfig;

const attendanceColumns = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }: any) => {
      const date = new Date(row.getValue('date'));
      return (
        <div>
          <div className="font-medium text-foreground">{format(date, 'MMM dd, yyyy')}</div>
          <div className="text-xs text-muted-foreground">{format(date, 'EEEE')}</div>
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as string;
      return <StatusBadge status={status} size="sm" />;
    }
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check-in Time',
    cell: ({ row }: any) => {
      const time = row.getValue('checkInTime');
      return (
        <span className="text-sm text-muted-foreground">
          {time || '—'}
        </span>
      );
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }: any) => {
      const notes = row.getValue('notes') as string;
      return (
        <span className="text-xs text-muted-foreground truncate max-w-xs inline-block">
          {notes || '—'}
        </span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function MemberAttendanceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData] = useState(MOCK_ATTENDANCE_HISTORY);
  const [memberData] = useState(MOCK_MEMBER);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredAttendance = attendanceData.filter(record => 
    record.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalSessions: attendanceData.length,
    presentSessions: attendanceData.filter(r => r.status === 'present').length,
    absentSessions: attendanceData.filter(r => r.status === 'absent').length,
    lateSessions: attendanceData.filter(r => r.status === 'late').length,
    attendanceRate: Math.round((attendanceData.filter(r => r.status === 'present').length / attendanceData.length) * 100),
    currentStreak: 8,
    longestStreak: 15,
  };

  const handleExportData = () => {
    const csvContent = 'Date,Service Type,Status,Check-in Time,Notes\n' +
      filteredAttendance.map(record => 
        `${record.date},${record.serviceType},${record.status},${record.checkInTime || ''},"${record.notes}"`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${memberData.name.replace(/\s+/g, '-')}-attendance.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
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
            <Link href="/dashboard/attendance/member" aria-label="Back to Member Attendance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {memberData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-heading text-xl font-bold tracking-tight">{memberData.name}</h1>
              <p className="text-xs text-muted-foreground">{memberData.department} • {memberData.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Data
          </Button>
          <Button size="sm" onClick={() => window.open(`/dashboard/members/${memberId}`, '_blank')}>
            <Users className="h-4 w-4 mr-1.5" />
            Member Profile
          </Button>
        </div>
      </div>

      {/* Member Details Summary */}
      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Mail className="h-3.5 w-3.5" />
              Email
            </div>
            <div className="font-medium text-foreground">{memberData.email}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </div>
            <div className="font-medium text-foreground">{memberData.phone}</div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Users className="h-3.5 w-3.5" />
              Group
            </div>
            <Badge variant="neutral" size="sm">{memberData.group}</Badge>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Calendar className="h-3.5 w-3.5" />
              Member Since
            </div>
            <div className="font-medium text-foreground">{format(new Date(memberData.joinDate), 'MMM dd, yyyy')}</div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={Target}
        />
        <StatCard
          title="Present"
          value={stats.presentSessions}
          icon={UserCheck}
        />
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} wks`}
          icon={Zap}
        />
        <StatCard
          title="Late"
          value={stats.lateSessions}
          icon={Clock}
        />
        <StatCard
          title="Absent"
          value={stats.absentSessions}
          icon={UserX}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Monthly Attendance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Monthly Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[260px] w-full">
                  <BarChart data={monthlyAttendance} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                      content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="present" stackId="a" fill="hsl(var(--primary))" />
                    <Bar dataKey="late" stackId="a" fill="hsl(var(--muted-foreground))" />
                    <Bar dataKey="absent" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Service Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Service Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={serviceChartConfig} className="h-[260px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />} 
                    />
                    <Pie
                      data={serviceTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                    >
                      {serviceTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            const total = serviceTypeDistribution.reduce((acc, curr) => acc + curr.value, 0);
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
                                  Services
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
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Attendance Log ({filteredAttendance.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={attendanceColumns}
                data={filteredAttendance}
                recordLabel="record"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="serviceType"
                searchPlaceholder="Search service..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
