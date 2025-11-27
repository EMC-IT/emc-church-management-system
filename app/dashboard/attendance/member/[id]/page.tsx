'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Filter,
  Download,
  CalendarIcon,
  Eye,
  MoreHorizontal,
  BarChart3,
  PieChart,
  RefreshCw,
  Award,
  Target,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Calendar as CalendarLucide,
  Activity,
  Star,
  MessageSquare,
  Edit,
  FileText,
  History
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, parseISO, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart,
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
import { attendanceService } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType } from '@/lib/types';
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
  avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
  phone: '+233 24 123 4567',
  email: 'john.doe@church.com',
  address: '123 Accra Street, East Legon, Accra',
  department: 'Media Ministry',
  group: 'Youth Group',
  role: 'Sound Engineer',
  joinDate: '2020-01-15',
  membershipStatus: 'Active',
  age: 28,
  gender: 'Male',
  maritalStatus: 'Single',
  emergencyContact: {
    name: 'Mary Doe',
    phone: '+233 24 987 6543',
    relationship: 'Mother'
  }
};

// Mock attendance history
const MOCK_ATTENDANCE_HISTORY = [
  {
    id: 'att_001',
    date: '2024-01-21',
    serviceType: 'Sunday Service',
    status: 'Present',
    checkInTime: '08:45',
    notes: 'Arrived early for sound check',
    sessionId: 'ses_001'
  },
  {
    id: 'att_002',
    date: '2024-01-18',
    serviceType: 'Bible Study',
    status: 'Present',
    checkInTime: '18:30',
    notes: '',
    sessionId: 'ses_002'
  },
  {
    id: 'att_003',
    date: '2024-01-14',
    serviceType: 'Sunday Service',
    status: 'Present',
    checkInTime: '09:00',
    notes: '',
    sessionId: 'ses_003'
  },
  {
    id: 'att_004',
    date: '2024-01-11',
    serviceType: 'Prayer Meeting',
    status: 'Late',
    checkInTime: '19:15',
    notes: 'Traffic delay',
    sessionId: 'ses_004'
  },
  {
    id: 'att_005',
    date: '2024-01-07',
    serviceType: 'Sunday Service',
    status: 'Present',
    checkInTime: '08:50',
    notes: '',
    sessionId: 'ses_005'
  },
  {
    id: 'att_006',
    date: '2024-01-04',
    serviceType: 'Bible Study',
    status: 'Absent',
    checkInTime: null,
    notes: 'Sick leave',
    sessionId: 'ses_006'
  },
  {
    id: 'att_007',
    date: '2023-12-31',
    serviceType: 'Watch Night',
    status: 'Present',
    checkInTime: '22:00',
    notes: 'New Year service',
    sessionId: 'ses_007'
  },
  {
    id: 'att_008',
    date: '2023-12-24',
    serviceType: 'Christmas Service',
    status: 'Present',
    checkInTime: '09:30',
    notes: 'Christmas celebration',
    sessionId: 'ses_008'
  }
];

// Mock monthly attendance data
const monthlyAttendance = [
  { month: 'Aug', present: 4, absent: 0, late: 1, total: 5 },
  { month: 'Sep', present: 6, absent: 1, late: 0, total: 7 },
  { month: 'Oct', present: 5, absent: 0, late: 2, total: 7 },
  { month: 'Nov', present: 7, absent: 1, late: 0, total: 8 },
  { month: 'Dec', present: 6, absent: 0, late: 1, total: 7 },
  { month: 'Jan', present: 5, absent: 1, late: 1, total: 7 }
];

// Mock service type distribution
const serviceTypeDistribution = [
  { name: 'Sunday Service', value: 18, color: '#2E8DB0' },
  { name: 'Bible Study', value: 12, color: '#28ACD1' },
  { name: 'Prayer Meeting', value: 8, color: '#C49831' },
  { name: 'Special Events', value: 5, color: '#A5CF5D' }
];

// Mock attendance streaks
const attendanceStreaks = [
  { period: 'Current Streak', days: 8, type: 'current' },
  { period: 'Longest Streak', days: 15, type: 'longest' },
  { period: 'This Month', days: 6, type: 'month' },
  { period: 'This Year', days: 43, type: 'year' }
];

const attendanceColumns = [
  {
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }: any) => {
      const date = new Date(row.getValue('date'));
      return (
        <div>
          <div className="font-medium">{format(date, 'MMM dd, yyyy')}</div>
          <div className="text-xs text-muted-foreground">{format(date, 'EEEE')}</div>
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
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as string;
      const statusConfig = {
        'Present': { className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
        'Absent': { className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
        'Late': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        'Excused': { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck }
      };
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Present'];
      const Icon = config.icon;
      
      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check-in Time',
    cell: ({ row }: any) => {
      const time = row.getValue('checkInTime');
      return time ? (
        <div className="font-mono text-sm">{time}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }: any) => {
      const notes = row.getValue('notes') as string;
      return notes ? (
        <div className="max-w-xs truncate" title={notes}>
          {notes}
        </div>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const record = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Session
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Record
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              Add Note
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 90),
    to: new Date()
  });
  const [attendanceData, setAttendanceData] = useState(MOCK_ATTENDANCE_HISTORY);
  const [memberData, setMemberData] = useState(MOCK_MEMBER);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredAttendance = attendanceData.filter(record => {
    const matchesSearch = record.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesServiceType = selectedServiceType === 'all' || record.serviceType === selectedServiceType;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const recordDate = new Date(record.date);
    const matchesDateRange = recordDate >= dateRange.from && recordDate <= dateRange.to;
    
    return matchesSearch && matchesServiceType && matchesStatus && matchesDateRange;
  });

  // Calculate member statistics
  const stats = {
    totalSessions: attendanceData.length,
    presentSessions: attendanceData.filter(r => r.status === 'Present').length,
    absentSessions: attendanceData.filter(r => r.status === 'Absent').length,
    lateSessions: attendanceData.filter(r => r.status === 'Late').length,
    attendanceRate: Math.round((attendanceData.filter(r => r.status === 'Present').length / attendanceData.length) * 100),
    currentStreak: 8,
    longestStreak: 15,
    averageCheckInTime: '08:52',
    lastAttended: attendanceData.find(r => r.status === 'Present')?.date || null
  };



  const handleExportData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = 'Date,Service Type,Status,Check-in Time,Notes\n' +
        filteredAttendance.map(record => 
          `${record.date},${record.serviceType},${record.status},${record.checkInTime || ''},"${record.notes}"`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${memberData.name.replace(' ', '-')}-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch fresh data from API
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedServiceType('all');
    setSelectedStatus('all');
  };

  // Mock chart data
  const monthlyAttendance = [
    { month: 'Jan', present: 4, late: 0, absent: 0 },
    { month: 'Feb', present: 3, late: 1, absent: 0 },
    { month: 'Mar', present: 4, late: 0, absent: 1 },
    { month: 'Apr', present: 5, late: 0, absent: 0 },
    { month: 'May', present: 3, late: 1, absent: 0 },
    { month: 'Jun', present: 4, late: 0, absent: 0 }
  ];

  const serviceTypeDistribution = [
    { name: 'Sunday Service', value: 18, color: '#2E8DB0' },
    { name: 'Midweek Service', value: 12, color: '#28ACD1' },
    { name: 'Special Events', value: 6, color: '#C49831' }
  ];

  const weeklyEngagement = [
    { week: 'W1', services: 2, duration: 180 },
    { week: 'W2', services: 2, duration: 190 },
    { week: 'W3', services: 1, duration: 90 },
    { week: 'W4', services: 2, duration: 185 }
  ];

  // Chart configurations
  const monthlyChartConfig = {
    present: {
      label: 'Present',
      color: 'hsl(var(--chart-1))',
    },
    late: {
      label: 'Late',
      color: 'hsl(var(--chart-3))',
    },
    absent: {
      label: 'Absent',
      color: 'hsl(var(--chart-4))',
    },
  } satisfies ChartConfig;

  const serviceChartConfig = {
    value: {
      label: 'Attendance',
    },
  } satisfies ChartConfig;

  const engagementChartConfig = {
    services: {
      label: 'Services',
      color: 'hsl(var(--chart-1))',
    },
    duration: {
      label: 'Duration (min)',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={memberData.avatar} alt={memberData.name} />
              <AvatarFallback>
                {memberData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{memberData.name}</h1>
              <p className="text-muted-foreground">
                {memberData.department} • {memberData.role}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => window.open(`/dashboard/members/${memberId}`, '_blank')}>
            <Users className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>

      {/* Member Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <div className="font-medium">{memberData.email}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                Phone
              </div>
              <div className="font-medium">{memberData.phone}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Group
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {memberData.group}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarLucide className="h-4 w-4" />
                Member Since
              </div>
              <div className="font-medium">{format(new Date(memberData.joinDate), 'MMM dd, yyyy')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.attendanceRate}%</p>
              </div>
              <Target className="h-8 w-8 text-brand-primary" />
            </div>
            <Progress value={stats.attendanceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">{stats.presentSessions}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalSessions} sessions</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-brand-accent">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">weeks</p>
              </div>
              <Zap className="h-8 w-8 text-brand-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{stats.absentSessions}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.lateSessions}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Attendance Trend */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-primary" />
                  Monthly Attendance
                </CardTitle>
                <CardDescription>
                  Attendance pattern over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
                  <BarChart data={monthlyAttendance} margin={{ left: 12, right: 12 }}>
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
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                      content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar 
                      dataKey="present" 
                      stackId="a" 
                      fill="hsl(var(--chart-1))" 
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="late" 
                      stackId="a" 
                      fill="hsl(var(--chart-3))" 
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar 
                      dataKey="absent" 
                      stackId="a" 
                      fill="hsl(var(--chart-4))" 
                      radius={[4, 4, 0, 0]}
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
                  Service Attendance
                </CardTitle>
                <CardDescription>
                  Attendance by service type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={serviceChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />} 
                    />
                    <Pie
                      data={serviceTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={2}
                    >
                      {serviceTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
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
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {total}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground"
                                >
                                  Services
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {serviceTypeDistribution.map((item, index) => (
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

          {/* Attendance Streaks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-accent" />
                Attendance Streaks
              </CardTitle>
              <CardDescription>
                Consecutive attendance records and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {attendanceStreaks.map((streak, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className={cn(
                      "text-2xl font-bold",
                      streak.type === 'current' && "text-brand-primary",
                      streak.type === 'longest' && "text-brand-accent",
                      streak.type === 'month' && "text-green-600",
                      streak.type === 'year' && "text-blue-600"
                    )}>
                      {streak.days}
                    </div>
                    <div className="text-sm text-muted-foreground">{streak.period}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                    <SelectItem value="Bible Study">Bible Study</SelectItem>
                    <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                    <SelectItem value="Special Events">Special Events</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Present">Present</SelectItem>
                    <SelectItem value="Absent">Absent</SelectItem>
                    <SelectItem value="Late">Late</SelectItem>
                    <SelectItem value="Excused">Excused</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredAttendance.length} records
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance History Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Attendance History
              </CardTitle>
              <CardDescription>
                Complete attendance record for {memberData.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={attendanceColumns}
                data={filteredAttendance}
                searchKey="serviceType"
                searchPlaceholder="Search attendance records..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Rate Trend */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Attendance Rate Trend</CardTitle>
                <CardDescription>
                  Monthly attendance rate percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
                  <LineChart data={monthlyAttendance} margin={{ left: 12, right: 12 }}>
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
                      type="monotone" 
                      dataKey="present" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: 'hsl(var(--chart-1))' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Key attendance performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Consistency Score</div>
                        <div className="text-sm text-muted-foreground">Based on regular attendance</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">92%</div>
                      <div className="text-sm text-muted-foreground">Excellent</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Punctuality Score</div>
                        <div className="text-sm text-muted-foreground">Average check-in time</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">88%</div>
                      <div className="text-sm text-muted-foreground">Good</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">Engagement Level</div>
                        <div className="text-sm text-muted-foreground">Service participation</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">95%</div>
                      <div className="text-sm text-muted-foreground">Excellent</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">Overall Rating</div>
                        <div className="text-sm text-muted-foreground">Combined performance</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">A+</div>
                      <div className="text-sm text-muted-foreground">Outstanding</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Patterns */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Patterns</CardTitle>
                <CardDescription>
                  Insights based on attendance behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Consistent Attendee</span>
                    </div>
                    <p className="text-sm text-green-700">
                      {memberData.name} maintains excellent attendance with a 95% rate over the past 6 months.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Strong Commitment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Currently on an 8-week attendance streak, showing strong dedication to church activities.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Punctuality Note</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Occasionally arrives late (2 instances this month). Consider sending service reminders.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">Service Preference</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      Shows highest attendance for Sunday Services (100%) and Bible Study sessions (92%).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>
                  Suggested actions to improve engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-brand-accent" />
                      <span className="font-medium">Recognition</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Acknowledge {memberData.name}'s excellent attendance during next service announcement.
                    </p>
                    <Button size="sm" variant="outline">
                      <Star className="h-4 w-4 mr-2" />
                      Add to Recognition List
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-brand-primary" />
                      <span className="font-medium">Leadership Opportunity</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Consider {memberData.name} for leadership roles in {memberData.department} due to consistent attendance.
                    </p>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Suggest for Leadership
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Engagement</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Send personalized message appreciating their dedication and involvement.
                    </p>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Documentation</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add attendance excellence note to member's permanent record.
                    </p>
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Update Record
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}