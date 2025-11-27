'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  ArrowLeft,
  Download,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  FileText,
  UserCheck,
  UserX,
  Clock,
  Activity,
  Target,
  Award,
  Loader2
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupEvent, GroupAttendance, GroupStats } from '@/lib/types/groups';
import { AttendanceStatus } from '@/lib/types/attendance';
import { toast } from 'sonner';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

const reportTypes = [
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'membership', label: 'Membership Report' },
  { value: 'events', label: 'Events Report' },
  { value: 'growth', label: 'Growth Report' },
  { value: 'engagement', label: 'Engagement Report' }
];

const timeRanges = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
  { value: 'all', label: 'All Time' }
];

const COLORS = ['#2E8DB0', '#28ACD1', '#C49831', '#A5CF5D', '#FF6B6B', '#4ECDC4'];

// Chart configurations
const attendanceChartConfig = {
  count: { label: 'Attendance', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const growthChartConfig = {
  members: { label: 'Members', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const eventTypeConfig = {
  value: { label: 'Events', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export default function GroupReportsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [attendance, setAttendance] = useState<GroupAttendance[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('attendance');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId, selectedTimeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      // Load group members
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      // Load group events
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
      
      // Load attendance records
      const attendanceResponse = await groupsService.getGroupAttendance(groupId);
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
      
      // Load group statistics
      const statsResponse = await groupsService.getGroupStats();
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  const handleExportReport = async () => {
    setExporting(true);
    
    try {
      const response = await groupsService.exportGroupReport(groupId, selectedReport, selectedTimeRange);
      
      if (response.success) {
        toast.success('Report exported successfully');
        // In a real implementation, this would trigger a file download
      } else {
        toast.error(response.message || 'Failed to export report');
      }
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const getAttendanceData = () => {
    const attendanceByDate: Record<string, { present: number; absent: number; excused: number }> = {};
    
    attendance.forEach(record => {
      const event = events.find(e => e.id === record.eventId);
      if (event) {
        const date = new Date(event.startDate).toLocaleDateString();
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = { present: 0, absent: 0, excused: 0 };
        }
        
        if (record.status === AttendanceStatus.PRESENT) attendanceByDate[date].present++;
        else if (record.status === AttendanceStatus.ABSENT) attendanceByDate[date].absent++;
        else if (record.status === AttendanceStatus.EXCUSED) attendanceByDate[date].excused++;
      }
    });
    
    return Object.entries(attendanceByDate)
      .map(([date, data]) => ({
        date,
        ...data,
        total: data.present + data.absent + data.excused,
        rate: Math.round((data.present / (data.present + data.absent + data.excused)) * 100)
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMembershipGrowthData = () => {
    const growthByMonth: Record<string, number> = {};
    
    members.forEach(member => {
      const joinDate = new Date(member.joinedAt);
      const monthKey = `${joinDate.getFullYear()}-${String(joinDate.getMonth() + 1).padStart(2, '0')}`;
      growthByMonth[monthKey] = (growthByMonth[monthKey] || 0) + 1;
    });
    
    return Object.entries(growthByMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getEventTypeDistribution = () => {
    const typeCount: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.type) {
        typeCount[event.type] = (typeCount[event.type] || 0) + 1;
      }
    });
    
    return Object.entries(typeCount).map(([type, count]) => ({ type, count }));
  };

  const getTopAttendees = () => {
    const memberAttendance: Record<string, { present: number; total: number }> = {};
    
    attendance.forEach(record => {
      if (!memberAttendance[record.memberId]) {
        memberAttendance[record.memberId] = { present: 0, total: 0 };
      }
      
      memberAttendance[record.memberId].total++;
      if (record.status === AttendanceStatus.PRESENT) {
        memberAttendance[record.memberId].present++;
      }
    });
    
    return Object.entries(memberAttendance)
      .map(([memberId, data]) => {
        const member = members.find(m => m.id === memberId);
        return {
          member,
          attendanceRate: Math.round((data.present / data.total) * 100),
          totalEvents: data.total,
          presentCount: data.present
        };
      })
      .filter(item => item.member)
      .sort((a, b) => b.attendanceRate - a.attendanceRate)
      .slice(0, 10);
  };

  const renderAttendanceReport = () => {
    const attendanceData = getAttendanceData();
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Attendance patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-80 w-full">
              <LineChart data={attendanceData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
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
                  dataKey="rate" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Attendees</CardTitle>
            <CardDescription>Members with highest attendance rates</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Attendance Rate</TableHead>
                  <TableHead>Events Attended</TableHead>
                  <TableHead>Total Events</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getTopAttendees().map((item, index) => (
                  <TableRow key={item.member?.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-brand-primary">
                            {item.member?.firstName?.[0]}{item.member?.lastName?.[0]}
                          </span>
                        </div>
                        <span>{item.member?.firstName} {item.member?.lastName}</span>
                        {index < 3 && <Award className="h-4 w-4 text-yellow-500" />}
                      </div>
                    </TableCell>
                    <TableCell>{item.member?.role}</TableCell>
                    <TableCell>
                      <Badge className={item.attendanceRate >= 80 ? 'bg-green-100 text-green-800' : 
                                     item.attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-red-100 text-red-800'}>
                        {item.attendanceRate}%
                      </Badge>
                    </TableCell>
                    <TableCell>{item.presentCount}</TableCell>
                    <TableCell>{item.totalEvents}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMembershipReport = () => {
    const growthData = getMembershipGrowthData();
    const roleDistribution = members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
            <CardDescription>New members joining over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthChartConfig} className="h-80 w-full">
              <BarChart data={growthData} margin={{ left: 12, right: 12 }}>
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
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  content={<ChartTooltipContent indicator="dot" />} 
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--chart-2))" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
              <CardDescription>Members by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roleDistribution).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="font-medium">{role}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-brand-primary h-2 rounded-full" 
                          style={{ width: `${(count / members.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Member Statistics</CardTitle>
              <CardDescription>Key membership metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Members</span>
                  <span className="font-bold text-2xl">{members.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Members</span>
                  <span className="font-bold text-2xl text-green-600">
                    {members.filter(m => m.status === 'Active').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>New This Month</span>
                  <span className="font-bold text-2xl text-blue-600">
                    {members.filter(m => {
                      const joinDate = new Date(m.joinedAt);
                      const now = new Date();
                      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderEventsReport = () => {
    const eventTypeData = getEventTypeDistribution();
    const upcomingEvents = events.filter(e => new Date(e.startDate) > new Date()).length;
    const completedEvents = events.filter(e => e.status === 'Completed').length;
    
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">All time events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Scheduled events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedEvents}</div>
              <p className="text-xs text-muted-foreground">Finished events</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Event Type Distribution</CardTitle>
            <CardDescription>Types of events organized</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={eventTypeConfig} className="h-80 w-full">
              <RechartsPieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie 
                  data={eventTypeData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100}
                  dataKey="count"
                  strokeWidth={2}
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="hsl(var(--background))"
                    />
                  ))}
                </Pie>
              </RechartsPieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {eventTypeData.map((entry, index) => (
                <div key={entry.type} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.type}: {entry.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCurrentReport = () => {
    switch (selectedReport) {
      case 'attendance':
        return renderAttendanceReport();
      case 'membership':
        return renderMembershipReport();
      case 'events':
        return renderEventsReport();
      case 'growth':
        return renderMembershipReport(); // Reuse membership report for growth
      case 'engagement':
        return renderAttendanceReport(); // Reuse attendance report for engagement
      default:
        return renderAttendanceReport();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Group Reports</h1>
              <p className="text-muted-foreground">
                Analytics and insights for {group?.name}
              </p>
            </div>
          </div>
    
        </div>
        
        <Button 
          onClick={handleExportReport} 
          disabled={exporting}
          className="bg-brand-primary hover:bg-brand-primary/90"
        >
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </>
          )}
        </Button>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Report Configuration</span>
          </CardTitle>
          <CardDescription>
            Select the type of report and time range to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {renderCurrentReport()}
    </div>
  );
}