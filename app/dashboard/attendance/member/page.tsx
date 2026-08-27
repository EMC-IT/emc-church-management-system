'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Download, 
  Eye, 
  MoreHorizontal, 
  Award, 
  Target, 
  TrendingUp,
  AlertTriangle
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

// Mock members data with attendance information
const MOCK_MEMBERS_ATTENDANCE = [
  {
    id: 'mem_001',
    name: 'John Doe',
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
    status: 'active',
    gender: 'Male'
  },
  {
    id: 'mem_002',
    name: 'Jane Smith',
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
    status: 'active',
    gender: 'Female'
  },
  {
    id: 'mem_003',
    name: 'Michael Johnson',
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
    status: 'active',
    gender: 'Male'
  },
  {
    id: 'mem_004',
    name: 'Sarah Wilson',
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
    status: 'active',
    gender: 'Female'
  },
  {
    id: 'mem_005',
    name: 'David Brown',
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
    status: 'inactive',
    gender: 'Male'
  },
  {
    id: 'mem_006',
    name: 'Grace Asante',
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
    status: 'active',
    gender: 'Female'
  },
  {
    id: 'mem_007',
    name: 'Emmanuel Osei',
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
    status: 'active',
    gender: 'Male'
  },
  {
    id: 'mem_008',
    name: 'Abena Mensah',
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
    status: 'active',
    gender: 'Female'
  }
];

const attendanceDistribution = [
  { name: 'Excellent (90%+)', value: 3, color: 'hsl(var(--primary))' },
  { name: 'Good (80-89%)', value: 3, color: 'hsl(var(--muted-foreground))' },
  { name: 'Needs Attention (<80%)', value: 2, color: 'hsl(var(--destructive))' }
];

const attendanceTrends = [
  { month: 'Jan', excellent: 3, good: 3, attention: 2 },
  { month: 'Feb', excellent: 4, good: 2, attention: 2 },
  { month: 'Mar', excellent: 3, good: 4, attention: 1 },
  { month: 'Apr', excellent: 5, good: 2, attention: 1 }
];

const distributionChartConfig = {
  value: {
    label: 'Members',
  },
} satisfies ChartConfig;

const trendsChartConfig = {
  excellent: {
    label: 'Excellent (90%+)',
    color: 'hsl(var(--primary))',
  },
  good: {
    label: 'Good (80-89%)',
    color: 'hsl(var(--muted-foreground))',
  },
  attention: {
    label: 'Needs Attention (<80%)',
    color: 'hsl(var(--destructive))',
  },
} satisfies ChartConfig;

const memberColumns = [
  {
    accessorKey: 'name',
    header: 'Member',
    cell: ({ row }: any) => {
      const member = row.original;
      return (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'group',
    header: 'Group',
    cell: ({ row }: any) => (
      <Badge variant="neutral" size="sm">
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
        <div className="text-sm">
          <span className="font-medium text-foreground">{member.attendedSessions}</span>
          <span className="text-muted-foreground">/{member.totalSessions}</span>
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
        <Badge variant={streak >= 8 ? 'primary' : 'neutral'} size="sm">
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
      return <StatusBadge status={status} size="sm" />;
    }
  },
  {
    accessorKey: 'lastAttended',
    header: 'Last Attended',
    cell: ({ row }: any) => {
      const date = new Date(row.getValue('lastAttended'));
      return (
        <span className="text-xs text-muted-foreground">
          {format(date, 'MMM dd, yyyy')}
        </span>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/members/${member.id}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function MemberAttendancePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [membersData] = useState(MOCK_MEMBERS_ATTENDANCE);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredMembers = membersData.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesGroup = selectedGroup === 'all' || member.group === selectedGroup;
    return matchesSearch && matchesDepartment && matchesGroup;
  });

  const stats = {
    totalMembers: membersData.length,
    excellentAttendance: membersData.filter(m => m.attendanceRate >= 90).length,
    goodAttendance: membersData.filter(m => m.attendanceRate >= 80 && m.attendanceRate < 90).length,
    needsAttention: membersData.filter(m => m.attendanceRate < 80).length,
    averageRate: Math.round(membersData.reduce((sum, m) => sum + m.attendanceRate, 0) / membersData.length),
  };

  const handleExportData = () => {
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
            Member Attendance
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
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
        />
        <StatCard
          title="Excellent (90%+)"
          value={stats.excellentAttendance}
          icon={Award}
        />
        <StatCard
          title="Average Rate"
          value={`${stats.averageRate}%`}
          icon={Target}
        />
        <StatCard
          title="Needs Attention"
          value={stats.needsAttention}
          icon={AlertTriangle}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Members ({filteredMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-48">
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
                  <SelectTrigger className="w-full sm:w-48">
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
              </div>

              <DataTable
                columns={memberColumns}
                data={filteredMembers}
                recordLabel="member"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="name"
                searchPlaceholder="Search members..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Attendance Distribution</CardTitle>
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
                                  Members
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

            {/* Attendance Trends */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendsChartConfig} className="h-[280px] w-full">
                  <BarChart data={attendanceTrends} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
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
                    <Bar 
                      dataKey="excellent" 
                      stackId="a" 
                      fill="hsl(var(--primary))" 
                    />
                    <Bar 
                      dataKey="good" 
                      stackId="a" 
                      fill="hsl(var(--muted-foreground))" 
                    />
                    <Bar 
                      dataKey="attention" 
                      stackId="a" 
                      fill="hsl(var(--destructive))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
