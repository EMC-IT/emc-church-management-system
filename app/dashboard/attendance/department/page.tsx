'use client';

import { useState } from 'react';
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
  Building2 
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
    meetingSchedule: 'Sundays 7:00 AM',
    location: 'Media Room',
    growth: 8.5,
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
    meetingSchedule: 'Sundays 7:30 AM',
    location: 'Music Room',
    growth: 6.2,
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
    meetingSchedule: 'Sundays 9:00 AM',
    location: 'Children Hall',
    growth: 4.8,
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
    meetingSchedule: 'Sundays 8:00 AM',
    location: 'Main Entrance',
    growth: 2.1,
  },
  {
    id: 'dept_005',
    name: 'Security Department',
    type: 'Safety',
    head: 'Brother David',
    totalMembers: 15,
    activeMembers: 12,
    averageAttendance: 11,
    attendanceRate: 80,
    meetingSchedule: 'Sundays 7:00 AM',
    location: 'Security Post',
    growth: -1.5,
  }
];

const departmentAttendanceTrends = [
  { week: 'W1', 'Media Ministry': 20, 'Music Ministry': 26, 'Children Ministry': 22, 'Ushering': 15 },
  { week: 'W2', 'Media Ministry': 21, 'Music Ministry': 28, 'Children Ministry': 24, 'Ushering': 16 },
  { week: 'W3', 'Media Ministry': 22, 'Music Ministry': 27, 'Children Ministry': 23, 'Ushering': 16 },
  { week: 'W4', 'Media Ministry': 23, 'Music Ministry': 31, 'Children Ministry': 26, 'Ushering': 18 }
];

const trendChartConfig = {
  'Media Ministry': {
    label: 'Media Ministry',
    color: 'hsl(var(--primary))',
  },
  'Music Ministry': {
    label: 'Music Ministry',
    color: 'hsl(var(--muted-foreground))',
  },
  'Children Ministry': {
    label: 'Children Ministry',
    color: 'hsl(var(--border))',
  },
  'Ushering': {
    label: 'Ushering',
    color: 'hsl(var(--card-foreground))',
  },
} satisfies ChartConfig;

const departmentColumns = [
  {
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
            {dept.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-foreground">{dept.name}</div>
            <div className="text-xs text-muted-foreground">{dept.type}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'head',
    header: 'Department Head',
    cell: ({ row }: any) => (
      <span className="text-sm text-foreground">{row.getValue('head')}</span>
    )
  },
  {
    accessorKey: 'totalMembers',
    header: 'Members',
    cell: ({ row }: any) => {
      const dept = row.original;
      return (
        <div className="text-sm">
          <span className="font-medium text-foreground">{dept.activeMembers}</span>
          <span className="text-muted-foreground">/{dept.totalMembers}</span>
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
        <div className="text-sm">
          <span className="font-medium text-foreground">{dept.averageAttendance}</span>
          <span className="text-xs text-muted-foreground ml-1">/svc</span>
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
      const dept = row.original;
      return (
        <div className="text-xs">
          <div className="font-medium text-foreground">{dept.meetingSchedule}</div>
          <div className="text-muted-foreground">{dept.location}</div>
        </div>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/departments/${dept.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Department
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function DepartmentAttendancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [departmentsData] = useState(MOCK_DEPARTMENTS);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredDepartments = departmentsData.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || dept.type === selectedType;
    return matchesSearch && matchesType;
  });

  const overallStats = {
    totalDepartments: departmentsData.length,
    totalMembers: departmentsData.reduce((sum, dept) => sum + dept.totalMembers, 0),
    averageAttendance: Math.round(departmentsData.reduce((sum, dept) => sum + dept.averageAttendance, 0) / departmentsData.length),
    overallRate: Math.round(departmentsData.reduce((sum, dept) => sum + dept.attendanceRate, 0) / departmentsData.length),
  };

  const handleExportData = () => {
    const csvContent = 'Department,Head,Type,Total Members,Active Members,Average Attendance,Attendance Rate,Growth,Schedule,Location\n' +
      filteredDepartments.map(dept => 
        `${dept.name},${dept.head},${dept.type},${dept.totalMembers},${dept.activeMembers},${dept.averageAttendance},${dept.attendanceRate}%,${dept.growth}%,${dept.meetingSchedule},${dept.location}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `departments-attendance.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Department Attendance
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
          title="Total Departments"
          value={overallStats.totalDepartments}
          icon={Building2}
        />
        <StatCard
          title="Total Members"
          value={overallStats.totalMembers}
          icon={Users}
        />
        <StatCard
          title="Avg Attendance"
          value={overallStats.averageAttendance}
          icon={UserCheck}
          description="Per department service"
        />
        <StatCard
          title="Overall Rate"
          value={`${overallStats.overallRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Departments ({filteredDepartments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Department Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Worship">Worship</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Service">Service</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DataTable
                columns={departmentColumns}
                data={filteredDepartments}
                recordLabel="department"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="name"
                searchPlaceholder="Search departments..."
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
                <LineChart data={departmentAttendanceTrends} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                    dataKey="Media Ministry" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Music Ministry" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Children Ministry" 
                    stroke="hsl(var(--border))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Ushering" 
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
