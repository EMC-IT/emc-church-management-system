'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Download, 
  Eye, 
  MoreHorizontal, 
  BarChart3 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  CartesianGrid, 
  LineChart, 
  Line 
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
    meetingSchedule: 'Saturdays 4:00 PM',
    location: 'Youth Hall',
    growth: 5.2,
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
    meetingSchedule: 'Thursdays 6:00 PM',
    location: 'Fellowship Hall',
    growth: 3.8,
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
    meetingSchedule: 'Fridays 7:00 PM',
    location: 'Conference Room',
    growth: -1.2,
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
    meetingSchedule: 'Sundays 7:30 AM',
    location: 'Music Room',
    growth: 8.1,
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
    meetingSchedule: 'Sundays 9:00 AM',
    location: 'Children Hall',
    growth: 6.5,
  }
];

const groupAttendanceTrends = [
  { week: 'W1', 'Youth Group': 35, 'Women Fellowship': 55, 'Men Fellowship': 38, 'Choir': 29 },
  { week: 'W2', 'Youth Group': 38, 'Women Fellowship': 58, 'Men Fellowship': 41, 'Choir': 31 },
  { week: 'W3', 'Youth Group': 36, 'Women Fellowship': 60, 'Men Fellowship': 39, 'Choir': 30 },
  { week: 'W4', 'Youth Group': 40, 'Women Fellowship': 62, 'Men Fellowship': 43, 'Choir': 33 }
];

const trendChartConfig = {
  'Youth Group': {
    label: 'Youth Group',
    color: 'hsl(var(--primary))',
  },
  'Women Fellowship': {
    label: 'Women Fellowship',
    color: 'hsl(var(--muted-foreground))',
  },
  'Men Fellowship': {
    label: 'Men Fellowship',
    color: 'hsl(var(--border))',
  },
  'Choir': {
    label: 'Choir',
    color: 'hsl(var(--card-foreground))',
  },
} satisfies ChartConfig;

const groupColumns = [
  {
    accessorKey: 'name',
    header: 'Group Name',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
            {group.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-foreground">{group.name}</div>
            <div className="text-xs text-muted-foreground">{group.category}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'leader',
    header: 'Leader',
    cell: ({ row }: any) => (
      <span className="text-sm text-foreground">{row.getValue('leader')}</span>
    )
  },
  {
    accessorKey: 'totalMembers',
    header: 'Members',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="text-sm">
          <span className="font-medium text-foreground">{group.activeMembers}</span>
          <span className="text-muted-foreground">/{group.totalMembers}</span>
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
        <div className="text-sm">
          <span className="font-medium text-foreground">{group.averageAttendance}</span>
          <span className="text-xs text-muted-foreground ml-1">/mtg</span>
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
        <Badge variant={growth >= 0 ? 'success' : 'danger'} size="sm">
          {growth >= 0 ? `+${growth}%` : `${growth}%`}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'meetingSchedule',
    header: 'Schedule',
    cell: ({ row }: any) => {
      const group = row.original;
      return (
        <div className="text-xs">
          <div className="font-medium text-foreground">{group.meetingSchedule}</div>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/groups/${group.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function GroupsAttendancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [groupsData] = useState(MOCK_GROUPS);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredGroups = groupsData.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.leader.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const overallStats = {
    totalGroups: groupsData.length,
    totalMembers: groupsData.reduce((sum, g) => sum + g.totalMembers, 0),
    averageAttendance: Math.round(groupsData.reduce((sum, g) => sum + g.averageAttendance, 0) / groupsData.length),
    overallRate: Math.round(groupsData.reduce((sum, g) => sum + g.attendanceRate, 0) / groupsData.length),
  };

  const handleExportData = () => {
    const csvContent = 'Group Name,Category,Leader,Total Members,Active Members,Avg Attendance,Rate,Growth,Schedule,Location\n' +
      filteredGroups.map(g => 
        `${g.name},${g.category},${g.leader},${g.totalMembers},${g.activeMembers},${g.averageAttendance},${g.attendanceRate}%,${g.growth}%,${g.meetingSchedule},${g.location}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `groups-attendance.csv`;
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
            <Link href="/dashboard/attendance" aria-label="Back to Attendance">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Group Attendance
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Groups"
          value={overallStats.totalGroups}
          icon={Users}
        />
        <StatCard
          title="Total Members"
          value={overallStats.totalMembers}
          icon={UserCheck}
        />
        <StatCard
          title="Avg Attendance"
          value={overallStats.averageAttendance}
          icon={BarChart3}
        />
        <StatCard
          title="Overall Rate"
          value={`${overallStats.overallRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Groups ({filteredGroups.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
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
              </div>

              <DataTable
                columns={groupColumns}
                data={filteredGroups}
                recordLabel="group"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="name"
                searchPlaceholder="Search groups..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Weekly Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="h-[340px] w-full">
                <LineChart data={groupAttendanceTrends} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                    content={<ChartTooltipContent indicator="line" />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="Youth Group" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Women Fellowship" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Men Fellowship" 
                    stroke="hsl(var(--border))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Choir" 
                    stroke="hsl(var(--card-foreground))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
