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
  AlertTriangle
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { attendanceService } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock members data with attendance information
const MOCK_MEMBERS_ATTENDANCE = [
  {
    id: 'mem_001',
    name: 'John Doe',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 123 4567',
    email: 'john.doe@church.com',
    department: 'Media Ministry',
    group: 'Youth Group',
    joinDate: '2020-01-15',
    attendanceRate: 95,
    totalSessions: 24,
    attendedSessions: 23,
    lastAttended: '2024-01-21',
    streak: 8,
    status: 'Active',
    membershipStatus: 'Active',
    age: 28,
    gender: 'Male'
  },
  {
    id: 'mem_002',
    name: 'Jane Smith',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 234 5678',
    email: 'jane.smith@church.com',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    joinDate: '2019-06-20',
    attendanceRate: 88,
    totalSessions: 24,
    attendedSessions: 21,
    lastAttended: '2024-01-21',
    streak: 5,
    status: 'Active',
    membershipStatus: 'Active',
    age: 32,
    gender: 'Female'
  },
  {
    id: 'mem_003',
    name: 'Michael Johnson',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 345 6789',
    email: 'michael.johnson@church.com',
    department: 'Ushering',
    group: 'Men Fellowship',
    joinDate: '2021-03-10',
    attendanceRate: 92,
    totalSessions: 24,
    attendedSessions: 22,
    lastAttended: '2024-01-21',
    streak: 12,
    status: 'Active',
    membershipStatus: 'Active',
    age: 45,
    gender: 'Male'
  },
  {
    id: 'mem_004',
    name: 'Sarah Wilson',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 456 7890',
    email: 'sarah.wilson@church.com',
    department: 'Music Ministry',
    group: 'Choir',
    joinDate: '2018-09-05',
    attendanceRate: 85,
    totalSessions: 24,
    attendedSessions: 20,
    lastAttended: '2024-01-14',
    streak: 3,
    status: 'Active',
    membershipStatus: 'Active',
    age: 29,
    gender: 'Female'
  },
  {
    id: 'mem_005',
    name: 'David Brown',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 567 8901',
    email: 'david.brown@church.com',
    department: 'Security',
    group: 'Men Fellowship',
    joinDate: '2022-01-12',
    attendanceRate: 78,
    totalSessions: 24,
    attendedSessions: 19,
    lastAttended: '2024-01-07',
    streak: 1,
    status: 'Needs Attention',
    membershipStatus: 'Active',
    age: 38,
    gender: 'Male'
  },
  {
    id: 'mem_006',
    name: 'Grace Asante',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 678 9012',
    email: 'grace.asante@church.com',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    joinDate: '2020-11-18',
    attendanceRate: 90,
    totalSessions: 24,
    attendedSessions: 22,
    lastAttended: '2024-01-21',
    streak: 6,
    status: 'Active',
    membershipStatus: 'Active',
    age: 26,
    gender: 'Female'
  },
  {
    id: 'mem_007',
    name: 'Emmanuel Osei',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 789 0123',
    email: 'emmanuel.osei@church.com',
    department: 'Media Ministry',
    group: 'Youth Group',
    joinDate: '2018-03-15',
    attendanceRate: 98,
    totalSessions: 24,
    attendedSessions: 24,
    lastAttended: '2024-01-21',
    streak: 15,
    status: 'Excellent',
    membershipStatus: 'Active',
    age: 31,
    gender: 'Male'
  },
  {
    id: 'mem_008',
    name: 'Abena Mensah',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 890 1234',
    email: 'abena.mensah@church.com',
    department: 'Music Ministry',
    group: 'Choir',
    joinDate: '2019-07-22',
    attendanceRate: 83,
    totalSessions: 24,
    attendedSessions: 20,
    lastAttended: '2024-01-21',
    streak: 4,
    status: 'Active',
    membershipStatus: 'Active',
    age: 42,
    gender: 'Female'
  }
];

// Mock attendance distribution data
const attendanceDistribution = [
  { name: 'Excellent (90%+)', value: 3, color: '#A5CF5D' },
  { name: 'Good (80-89%)', value: 3, color: '#28ACD1' },
  { name: 'Fair (70-79%)', value: 1, color: '#C49831' },
  { name: 'Poor (<70%)', value: 1, color: '#EF4444' }
];

// Mock attendance trends
const attendanceTrends = [
  { month: 'Jan', excellent: 3, good: 3, fair: 1, poor: 1 },
  { month: 'Feb', excellent: 4, good: 2, fair: 1, poor: 1 },
  { month: 'Mar', excellent: 3, good: 4, fair: 1, poor: 0 },
  { month: 'Apr', excellent: 5, good: 2, fair: 1, poor: 0 }
];



const memberColumns = [
  {
    accessorKey: 'name',
    header: 'Member',
    cell: ({ row }: any) => {
      const member = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'group',
    header: 'Group',
    cell: ({ row }: any) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {row.getValue('group')}
      </Badge>
    )
  },
  {
    accessorKey: 'attendanceRate',
    header: 'Attendance Rate',
    cell: ({ row }: any) => {
      const rate = row.getValue('attendanceRate') as number;
      return (
        <div className="flex items-center space-x-2">
          <Progress value={rate} className="w-16" />
          <span className="text-sm font-medium">{rate}%</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'totalSessions',
    header: 'Sessions',
    cell: ({ row }: any) => {
      const member = row.original;
      return (
        <div className="text-center">
          <div className="font-medium">{member.attendedSessions}/{member.totalSessions}</div>
          <div className="text-xs text-muted-foreground">Attended/Total</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'streak',
    header: 'Streak',
    cell: ({ row }: any) => {
      const streak = row.getValue('streak') as number;
      return (
        <Badge 
          variant="outline" 
          className={cn(
            streak >= 10 ? "bg-green-100 text-green-800 border-green-200" :
            streak >= 5 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            "bg-gray-100 text-gray-800 border-gray-200"
          )}
        >
          {streak} weeks
        </Badge>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as string;
      const statusConfig = {
        'Excellent': { className: 'bg-green-100 text-green-800 border-green-200', icon: Award },
        'Active': { className: 'bg-blue-100 text-blue-800 border-blue-200', icon: UserCheck },
        'Needs Attention': { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle }
      };
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Active'];
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
    accessorKey: 'lastAttended',
    header: 'Last Attended',
    cell: ({ row }: any) => {
      const date = new Date(row.getValue('lastAttended'));
      return (
        <div>
          <div className="font-medium">{format(date, 'MMM dd')}</div>
          <div className="text-xs text-muted-foreground">{format(date, 'yyyy')}</div>
        </div>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const member = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/attendance/member/${member.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/dashboard/members/${member.id}`, '_blank')}>
              <Users className="mr-2 h-4 w-4" />
              Member Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function MemberAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [membersData, setMembersData] = useState(MOCK_MEMBERS_ATTENDANCE);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredMembers = membersData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesGroup = selectedGroup === 'all' || member.group === selectedGroup;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    const matchesGender = selectedGender === 'all' || member.gender === selectedGender;
    
    return matchesSearch && matchesDepartment && matchesGroup && matchesStatus && matchesGender;
  });

  // Calculate statistics
  const stats = {
    totalMembers: membersData.length,
    excellentAttendance: membersData.filter(m => m.attendanceRate >= 90).length,
    goodAttendance: membersData.filter(m => m.attendanceRate >= 80 && m.attendanceRate < 90).length,
    needsAttention: membersData.filter(m => m.attendanceRate < 80).length,
    averageRate: Math.round(membersData.reduce((sum, m) => sum + m.attendanceRate, 0) / membersData.length),
    averageStreak: Math.round(membersData.reduce((sum, m) => sum + m.streak, 0) / membersData.length),
    perfectAttendance: membersData.filter(m => m.attendanceRate === 100).length
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = 'Name,Email,Department,Group,Attendance Rate,Sessions Attended,Total Sessions,Streak,Status,Last Attended\n' +
        filteredMembers.map(member => 
          `${member.name},${member.email},${member.department},${member.group},${member.attendanceRate}%,${member.attendedSessions},${member.totalSessions},${member.streak},${member.status},${member.lastAttended}`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `member-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
      // Simulate API call to refresh data
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
    setSelectedDepartment('all');
    setSelectedGroup('all');
    setSelectedStatus('all');
    setSelectedGender('all');
  };

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Member Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track individual member attendance patterns and performance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Excellent</p>
                <p className="text-2xl font-bold text-green-600">{stats.excellentAttendance}</p>
                <p className="text-xs text-muted-foreground">90%+ rate</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Good</p>
                <p className="text-2xl font-bold text-blue-600">{stats.goodAttendance}</p>
                <p className="text-xs text-muted-foreground">80-89% rate</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Needs Attention</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.needsAttention}</p>
                <p className="text-xs text-muted-foreground">&lt;80% rate</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold text-brand-primary">{stats.averageRate}%</p>
                <p className="text-xs text-muted-foreground">Overall average</p>
              </div>
              <Target className="h-8 w-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Perfect</p>
                <p className="text-2xl font-bold text-brand-accent">{stats.perfectAttendance}</p>
                <p className="text-xs text-muted-foreground">100% rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-brand-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Media Ministry">Media Ministry</SelectItem>
                    <SelectItem value="Music Ministry">Music Ministry</SelectItem>
                    <SelectItem value="Children Ministry">Children Ministry</SelectItem>
                    <SelectItem value="Ushering">Ushering</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="Youth Group">Youth Group</SelectItem>
                    <SelectItem value="Women Fellowship">Women Fellowship</SelectItem>
                    <SelectItem value="Men Fellowship">Men Fellowship</SelectItem>
                    <SelectItem value="Choir">Choir</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
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
              </div>
            </CardContent>
          </Card>

          {/* Members Table */}
          <Card>
            <CardHeader>
              <CardTitle>Members ({filteredMembers.length})</CardTitle>
              <CardDescription>
                Individual member attendance records and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={memberColumns}
                data={filteredMembers}
                searchKey="name"
                searchPlaceholder="Search members..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-brand-primary" />
                  Attendance Distribution
                </CardTitle>
                <CardDescription>
                  Members grouped by attendance performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {attendanceDistribution.map((item, index) => (
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

            {/* Attendance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-brand-primary" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Monthly trends in attendance categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="excellent" stackId="a" fill="#A5CF5D" name="Excellent" />
                    <Bar dataKey="good" stackId="a" fill="#28ACD1" name="Good" />
                    <Bar dataKey="fair" stackId="a" fill="#C49831" name="Fair" />
                    <Bar dataKey="poor" stackId="a" fill="#EF4444" name="Poor" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Members with highest attendance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {membersData
                    .sort((a, b) => b.attendanceRate - a.attendanceRate)
                    .slice(0, 5)
                    .map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-primary">#{index + 1}</span>
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{member.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">{member.streak} week streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attention Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Needs Attention
                </CardTitle>
                <CardDescription>
                  Members with attendance below 80%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {membersData
                    .filter(member => member.attendanceRate < 80)
                    .map((member, index) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.department}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-yellow-700">{member.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">Last: {format(new Date(member.lastAttended), 'MMM dd')}</div>
                      </div>
                    </div>
                  ))}
                  {membersData.filter(member => member.attendanceRate < 80).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <UserCheck className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p>All members have good attendance!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights</CardTitle>
              <CardDescription>
                Key attendance metrics and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-brand-primary">{stats.averageStreak}</div>
                  <div className="text-sm text-muted-foreground">Average Streak</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {membersData.filter(m => m.streak >= 10).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Long Streaks (10+)</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round((stats.excellentAttendance / stats.totalMembers) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Excellent Rate</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-brand-accent">
                    {membersData.filter(m => new Date(m.lastAttended) >= subDays(new Date(), 7)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Recent Attendees</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}