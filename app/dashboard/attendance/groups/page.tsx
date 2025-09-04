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
  RefreshCw
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
  Legend,
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

// Mock groups data
const MOCK_GROUPS = [
  {
    id: 'group_001',
    name: 'Youth Group',
    category: 'Age Group',
    leader: 'Pastor Michael',
    totalMembers: 45,
    activeMembers: 42,
    averageAttendance: 38,
    attendanceRate: 84,
    lastMeeting: '2024-01-20',
    nextMeeting: '2024-01-27',
    meetingSchedule: 'Saturdays 4:00 PM',
    location: 'Youth Hall',
    growth: 5.2,
    streak: 8
  },
  {
    id: 'group_002',
    name: 'Women Fellowship',
    category: 'Gender Group',
    leader: 'Sister Grace',
    totalMembers: 68,
    activeMembers: 65,
    averageAttendance: 58,
    attendanceRate: 85,
    lastMeeting: '2024-01-18',
    nextMeeting: '2024-01-25',
    meetingSchedule: 'Thursdays 6:00 PM',
    location: 'Fellowship Hall',
    growth: 3.8,
    streak: 12
  },
  {
    id: 'group_003',
    name: 'Men Fellowship',
    category: 'Gender Group',
    leader: 'Brother David',
    totalMembers: 52,
    activeMembers: 48,
    averageAttendance: 41,
    attendanceRate: 79,
    lastMeeting: '2024-01-19',
    nextMeeting: '2024-01-26',
    meetingSchedule: 'Fridays 7:00 PM',
    location: 'Conference Room',
    growth: -1.2,
    streak: 3
  },
  {
    id: 'group_004',
    name: 'Choir',
    category: 'Ministry Group',
    leader: 'Sister Sarah',
    totalMembers: 35,
    activeMembers: 33,
    averageAttendance: 31,
    attendanceRate: 89,
    lastMeeting: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 7:30 AM',
    location: 'Music Room',
    growth: 8.1,
    streak: 15
  },
  {
    id: 'group_005',
    name: 'Children Ministry',
    category: 'Age Group',
    leader: 'Teacher Jane',
    totalMembers: 28,
    activeMembers: 26,
    averageAttendance: 24,
    attendanceRate: 86,
    lastMeeting: '2024-01-21',
    nextMeeting: '2024-01-28',
    meetingSchedule: 'Sundays 9:00 AM',
    location: 'Children Hall',
    growth: 6.5,
    streak: 6
  },
  {
    id: 'group_006',
    name: 'Bible Study Group A',
    category: 'Study Group',
    leader: 'Elder John',
    totalMembers: 22,
    activeMembers: 20,
    averageAttendance: 18,
    attendanceRate: 82,
    lastMeeting: '2024-01-17',
    nextMeeting: '2024-01-24',
    meetingSchedule: 'Wednesdays 6:30 PM',
    location: 'Classroom 1',
    growth: 2.3,
    streak: 4
  }
];

// Mock attendance data for groups
const groupAttendanceTrends = [
  { week: 'Week 1', 'Youth Group': 35, 'Women Fellowship': 55, 'Men Fellowship': 38, 'Choir': 29 },
  { week: 'Week 2', 'Youth Group': 38, 'Women Fellowship': 58, 'Men Fellowship': 41, 'Choir': 31 },
  { week: 'Week 3', 'Youth Group': 36, 'Women Fellowship': 60, 'Men Fellowship': 39, 'Choir': 30 },
  { week: 'Week 4', 'Youth Group': 40, 'Women Fellowship': 62, 'Men Fellowship': 43, 'Choir': 33 }
];

const groupCategoryData = [
  { name: 'Age Groups', value: 73, color: '#2E8DB0' },
  { name: 'Gender Groups', value: 120, color: '#28ACD1' },
  { name: 'Ministry Groups', value: 35, color: '#C49831' },
  { name: 'Study Groups', value: 22, color: '#A5CF5D' }
];



const groupColumns = [
  {
    accessorKey: 'name',
    header: 'Group Name',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-brand-primary" />
          </div>
          <div>
            <div className="font-medium">{group.name}</div>
            <div className="text-sm text-muted-foreground">{group.category}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'leader',
    header: 'Leader',
    cell: ({ row }: any) => row.getValue('leader')
  },
  {
    accessorKey: 'totalMembers',
    header: 'Members',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="text-center">
          <div className="font-medium">{group.activeMembers}/{group.totalMembers}</div>
          <div className="text-xs text-muted-foreground">Active/Total</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'averageAttendance',
    header: 'Avg Attendance',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="text-center">
          <div className="font-medium">{group.averageAttendance}</div>
          <div className="text-xs text-muted-foreground">per meeting</div>
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
    accessorKey: 'meetingSchedule',
    header: 'Schedule',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="text-sm">
          <div>{group.meetingSchedule}</div>
          <div className="text-muted-foreground">{group.location}</div>
        </div>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/groups/${group.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function GroupsAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [groupsData, setGroupsData] = useState(MOCK_GROUPS);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredGroups = groupsData.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate overall statistics
  const overallStats = {
    totalGroups: groupsData.length,
    totalMembers: groupsData.reduce((sum, group) => sum + group.totalMembers, 0),
    averageAttendance: Math.round(groupsData.reduce((sum, group) => sum + group.averageAttendance, 0) / groupsData.length),
    overallRate: Math.round(groupsData.reduce((sum, group) => sum + group.attendanceRate, 0) / groupsData.length),
    topPerformer: groupsData.reduce((top, group) => group.attendanceRate > top.attendanceRate ? group : top, groupsData[0])
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = 'Group Name,Leader,Total Members,Active Members,Average Attendance,Attendance Rate,Growth\n' +
        filteredGroups.map(group => 
          `${group.name},${group.leader},${group.totalMembers},${group.activeMembers},${group.averageAttendance},${group.attendanceRate}%,${group.growth}%`
        ).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `groups-attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
            <h1 className="text-3xl font-bold text-gray-900">Group Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Track attendance across all church groups and ministries
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Groups</p>
                <p className="text-2xl font-bold">{overallStats.totalGroups}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
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
              <UserCheck className="h-8 w-8 text-brand-primary" />
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
              <BarChart3 className="h-8 w-8 text-green-600" />
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
                <p className="text-lg font-bold">{overallStats.topPerformer?.name}</p>
                <p className="text-xs text-muted-foreground">{overallStats.topPerformer?.attendanceRate}%</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-brand-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
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
                    placeholder="Search groups or leaders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Age Group">Age Groups</SelectItem>
                    <SelectItem value="Gender Group">Gender Groups</SelectItem>
                    <SelectItem value="Ministry Group">Ministry Groups</SelectItem>
                    <SelectItem value="Study Group">Study Groups</SelectItem>
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

          {/* Groups Table */}
          <Card>
            <CardHeader>
              <CardTitle>Groups Overview ({filteredGroups.length})</CardTitle>
              <CardDescription>
                Attendance performance across all church groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={groupColumns}
                data={filteredGroups}
                searchKey="name"
                searchPlaceholder="Search groups..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Group Attendance Trends</CardTitle>
              <CardDescription>
                Weekly attendance patterns for major groups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={groupAttendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Youth Group" stroke="#2E8DB0" strokeWidth={2} />
                  <Line type="monotone" dataKey="Women Fellowship" stroke="#28ACD1" strokeWidth={2} />
                  <Line type="monotone" dataKey="Men Fellowship" stroke="#C49831" strokeWidth={2} />
                  <Line type="monotone" dataKey="Choir" stroke="#A5CF5D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Groups</CardTitle>
                <CardDescription>
                  Groups with highest attendance rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupsData
                    .sort((a, b) => b.attendanceRate - a.attendanceRate)
                    .slice(0, 5)
                    .map((group, index) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-brand-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">{group.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{group.attendanceRate}%</div>
                        <div className="text-sm text-muted-foreground">{group.averageAttendance} avg</div>
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
                  Groups with highest growth rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupsData
                    .sort((a, b) => b.growth - a.growth)
                    .slice(0, 5)
                    .map((group, index) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          <div className="text-sm text-muted-foreground">{group.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">+{group.growth}%</div>
                        <div className="text-sm text-muted-foreground">{group.streak} week streak</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-brand-primary" />
                  Members by Category
                </CardTitle>
                <CardDescription>
                  Distribution of members across group categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={groupCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {groupCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {groupCategoryData.map((item, index) => (
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

            {/* Category Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Average attendance rates by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Ministry Groups', rate: 89, groups: 1 },
                    { category: 'Age Groups', rate: 85, groups: 2 },
                    { category: 'Study Groups', rate: 82, groups: 1 },
                    { category: 'Gender Groups', rate: 82, groups: 2 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-muted-foreground">{item.groups} group(s)</div>
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