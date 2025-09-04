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
  Building2,
  Award,
  Target
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
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { attendanceService } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock departments data
const MOCK_DEPARTMENTS = [
  {
    id: 'dept_001',
    name: 'Media Ministry',
    type: 'Technical',
    head: 'Brother Emmanuel',
    totalMembers: 25,
    activeMembers: 23,
    averageAttendance: 21,
    attendanceRate: 92,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 7:00 AM',
    location: 'Media Room',
    growth: 8.5,
    streak: 12,
    responsibilities: ['Sound System', 'Video Production', 'Live Streaming'],
    budget: 15000,
    equipment: 'Professional'
  },
  {
    id: 'dept_002',
    name: 'Music Ministry',
    type: 'Worship',
    head: 'Sister Sarah',
    totalMembers: 35,
    activeMembers: 31,
    averageAttendance: 28,
    attendanceRate: 89,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 7:30 AM',
    location: 'Music Room',
    growth: 6.2,
    streak: 8,
    responsibilities: ['Choir', 'Instruments', 'Worship Leading'],
    budget: 12000,
    equipment: 'Advanced'
  },
  {
    id: 'dept_003',
    name: 'Children Ministry',
    type: 'Education',
    head: 'Teacher Jane',
    totalMembers: 28,
    activeMembers: 26,
    averageAttendance: 24,
    attendanceRate: 86,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 9:00 AM',
    location: 'Children Hall',
    growth: 4.8,
    streak: 6,
    responsibilities: ['Sunday School', 'Kids Programs', 'VBS'],
    budget: 8000,
    equipment: 'Basic'
  },
  {
    id: 'dept_004',
    name: 'Ushering Department',
    type: 'Service',
    head: 'Brother Michael',
    totalMembers: 20,
    activeMembers: 18,
    averageAttendance: 16,
    attendanceRate: 85,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 8:00 AM',
    location: 'Main Entrance',
    growth: 2.1,
    streak: 4,
    responsibilities: ['Greeting', 'Seating', 'Offering Collection'],
    budget: 3000,
    equipment: 'Basic'
  },
  {
    id: 'dept_005',
    name: 'Security Department',
    type: 'Safety',
    head: 'Brother David',
    totalMembers: 15,
    activeMembers: 14,
    averageAttendance: 12,
    attendanceRate: 80,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 7:45 AM',
    location: 'Security Office',
    growth: -1.5,
    streak: 2,
    responsibilities: ['Perimeter Security', 'Crowd Control', 'Emergency Response'],
    budget: 5000,
    equipment: 'Professional'
  },
  {
    id: 'dept_006',
    name: 'Youth Ministry',
    type: 'Outreach',
    head: 'Pastor Mark',
    totalMembers: 45,
    activeMembers: 42,
    averageAttendance: 38,
    attendanceRate: 84,
    lastActivity: '2024-01-20',
    nextMeeting: '2024-01-27',
    meetingSchedule: 'Saturdays 4:00 PM',
    location: 'Youth Hall',
    growth: 7.3,
    streak: 9,
    responsibilities: ['Youth Programs', 'Mentorship', 'Outreach'],
    budget: 10000,
    equipment: 'Advanced'
  },
  {
    id: 'dept_007',
    name: 'Hospitality Department',
    type: 'Service',
    head: 'Sister Grace',
    totalMembers: 22,
    activeMembers: 20,
    averageAttendance: 18,
    attendanceRate: 82,
    lastActivity: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 8:30 AM',
    location: 'Kitchen',
    growth: 3.7,
    streak: 5,
    responsibilities: ['Refreshments', 'Event Catering', 'Guest Services'],
    budget: 6000,
    equipment: 'Basic'
  }
];

// Mock attendance trends for departments
const departmentTrends = [
  { month: 'Jan', 'Media Ministry': 21, 'Music Ministry': 28, 'Children Ministry': 24, 'Ushering': 16, 'Security': 12, 'Youth Ministry': 38 },
  { month: 'Feb', 'Media Ministry': 22, 'Music Ministry': 29, 'Children Ministry': 25, 'Ushering': 17, 'Security': 13, 'Youth Ministry': 40 },
  { month: 'Mar', 'Media Ministry': 20, 'Music Ministry': 27, 'Children Ministry': 23, 'Ushering': 15, 'Security': 11, 'Youth Ministry': 36 },
  { month: 'Apr', 'Media Ministry': 23, 'Music Ministry': 30, 'Children Ministry': 26, 'Ushering': 18, 'Security': 14, 'Youth Ministry': 42 }
];

const departmentTypeData = [
  { name: 'Technical', value: 25, color: '#2E8DB0' },
  { name: 'Worship', value: 35, color: '#28ACD1' },
  { name: 'Education', value: 28, color: '#C49831' },
  { name: 'Service', value: 42, color: '#A5CF5D' },
  { name: 'Safety', value: 15, color: '#EF4444' },
  { name: 'Outreach', value: 45, color: '#8B5CF6' }
];

const performanceRadarData = [
  { department: 'Attendance Rate', 'Media Ministry': 92, 'Music Ministry': 89, 'Children Ministry': 86, 'Youth Ministry': 84 },
  { department: 'Growth Rate', 'Media Ministry': 85, 'Music Ministry': 82, 'Children Ministry': 75, 'Youth Ministry': 87 },
  { department: 'Consistency', 'Media Ministry': 95, 'Music Ministry': 88, 'Children Ministry': 80, 'Youth Ministry': 85 },
  { department: 'Engagement', 'Media Ministry': 90, 'Music Ministry': 95, 'Children Ministry': 88, 'Youth Ministry': 92 }
];



const departmentColumns = [
  {
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <div className="font-medium">{dept.name}</div>
            <div className="text-sm text-muted-foreground">{dept.type}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'head',
    header: 'Department Head',
    cell: ({ row }: any) => row.getValue('head')
  },
  {
    accessorKey: 'totalMembers',
    header: 'Members',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <div className="text-center">
          <div className="font-medium">{dept.activeMembers}/{dept.totalMembers}</div>
          <div className="text-xs text-muted-foreground">Active/Total</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'averageAttendance',
    header: 'Avg Attendance',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <div className="text-center">
          <div className="font-medium">{dept.averageAttendance}</div>
          <div className="text-xs text-muted-foreground">per service</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'attendanceRate',
    header: 'Rate',
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
    accessorKey: 'growth',
    header: 'Growth',
    cell: ({ row }: any) => {
      const growth = row.getValue('growth') as number;
      return (
        <div className={cn(
          "flex items-center text-sm font-medium",
          growth >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {growth >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" />
          )}
          {Math.abs(growth)}%
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
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/attendance/department/${dept.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/dashboard/members/department/${dept.id}`, '_blank')}>
              <Users className="mr-2 h-4 w-4" />
              View Members
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function DepartmentAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [departmentsData, setDepartmentsData] = useState(MOCK_DEPARTMENTS);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredDepartments = departmentsData.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || dept.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Calculate overall statistics
  const overallStats = {
    totalDepartments: departmentsData.length,
    totalMembers: departmentsData.reduce((sum, dept) => sum + dept.totalMembers, 0),
    averageAttendance: Math.round(departmentsData.reduce((sum, dept) => sum + dept.averageAttendance, 0) / departmentsData.length),
    overallRate: Math.round(departmentsData.reduce((sum, dept) => sum + dept.attendanceRate, 0) / departmentsData.length),
    topPerformer: departmentsData.reduce((top, dept) => dept.attendanceRate > top.attendanceRate ? dept : top, departmentsData[0]),
    totalBudget: departmentsData.reduce((sum, dept) => sum + dept.budget, 0)
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = 'Department,Head,Type,Total Members,Active Members,Average Attendance,Attendance Rate,Growth,Budget\n' +
        filteredDepartments.map(dept => 
          `${dept.name},${dept.head},${dept.type},${dept.totalMembers},${dept.activeMembers},${dept.averageAttendance},${dept.attendanceRate}%,${dept.growth}%,${dept.budget}`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `departments-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <h1 className="text-3xl font-bold text-gray-900">Department Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track attendance across all church departments and ministries
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

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{overallStats.totalDepartments}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{overallStats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                <p className="text-2xl font-bold">{overallStats.averageAttendance}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Rate</p>
                <p className="text-2xl font-bold">{overallStats.overallRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-brand-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                <p className="text-lg font-bold">{overallStats.topPerformer?.name.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">{overallStats.topPerformer?.attendanceRate}%</p>
              </div>
              <Award className="h-8 w-8 text-brand-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">₵{(overallStats.totalBudget / 1000).toFixed(0)}K</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="types">Types</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search departments or heads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Outreach">Outreach</SelectItem>
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

          {/* Departments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Departments Overview ({filteredDepartments.length})</CardTitle>
              <CardDescription>
                Attendance performance across all church departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={departmentColumns}
                data={filteredDepartments}
                searchKey="name"
                searchPlaceholder="Search departments..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Attendance Trends</CardTitle>
              <CardDescription>
                Monthly attendance patterns for all departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={departmentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Media Ministry" stroke="#2E8DB0" strokeWidth={2} />
                  <Line type="monotone" dataKey="Music Ministry" stroke="#28ACD1" strokeWidth={2} />
                  <Line type="monotone" dataKey="Children Ministry" stroke="#C49831" strokeWidth={2} />
                  <Line type="monotone" dataKey="Youth Ministry" stroke="#A5CF5D" strokeWidth={2} />
                  <Line type="monotone" dataKey="Ushering" stroke="#EF4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Security" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Departments</CardTitle>
                <CardDescription>
                  Departments with highest attendance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentsData
                    .sort((a, b) => b.attendanceRate - a.attendanceRate)
                    .slice(0, 5)
                    .map((dept, index) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-muted-foreground">{dept.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{dept.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">{dept.averageAttendance} avg</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Leaders</CardTitle>
                <CardDescription>
                  Departments with highest growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentsData
                    .sort((a, b) => b.growth - a.growth)
                    .slice(0, 5)
                    .map((dept, index) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-muted-foreground">{dept.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">+{dept.growth}%</div>
                        <div className="text-sm text-muted-foreground">{dept.streak} week streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Radar</CardTitle>
              <CardDescription>
                Multi-dimensional performance analysis of top departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceRadarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Media Ministry" dataKey="Media Ministry" stroke="#2E8DB0" fill="#2E8DB0" fillOpacity={0.1} />
                  <Radar name="Music Ministry" dataKey="Music Ministry" stroke="#28ACD1" fill="#28ACD1" fillOpacity={0.1} />
                  <Radar name="Children Ministry" dataKey="Children Ministry" stroke="#C49831" fill="#C49831" fillOpacity={0.1} />
                  <Radar name="Youth Ministry" dataKey="Youth Ministry" stroke="#A5CF5D" fill="#A5CF5D" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-brand-primary" />
                  Members by Department Type
                </CardTitle>
                <CardDescription>
                  Distribution of members across department types
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={departmentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {departmentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {departmentTypeData.map((item, index) => (
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

            {/* Type Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Type Performance</CardTitle>
                <CardDescription>
                  Average attendance rates by department type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Technical', rate: 92, departments: 1, budget: 15000 },
                    { type: 'Worship', rate: 89, departments: 1, budget: 12000 },
                    { type: 'Education', rate: 86, departments: 1, budget: 8000 },
                    { type: 'Outreach', rate: 84, departments: 1, budget: 10000 },
                    { type: 'Service', rate: 83, departments: 2, budget: 9000 },
                    { type: 'Safety', rate: 80, departments: 1, budget: 5000 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.departments} dept(s) • ₵{(item.budget / 1000).toFixed(0)}K budget
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Progress value={item.rate} className="w-20" />
                        <span className="text-sm font-medium w-12">{item.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}