'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Loader2,
  CalendarDays
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupEvent, GroupAttendance } from '@/lib/types/groups';
import { toast } from 'sonner';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';

const reportTypes = [
  { value: 'attendance', label: 'Attendance Report' },
  { value: 'membership', label: 'Membership Report' },
  { value: 'events', label: 'Events Report' },
];

const timeRanges = [
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: '1y', label: 'Last Year' },
];

const attendanceChartConfig = {
  rate: { label: 'Attendance %', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const growthChartConfig = {
  count: { label: 'New Members', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

export default function GroupReportsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [attendance, setAttendance] = useState<GroupAttendance[]>([]);
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
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
      
      const attendanceResponse = await groupsService.getGroupAttendance(groupId);
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
    } catch {
      toast.error('Failed to load group report data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setExporting(true);
    try {
      let csvContent = '';
      if (selectedReport === 'attendance') {
        csvContent = 'Member,Role,Attendance Rate,Events Attended\n' +
          getTopAttendees().map(item => `${item.memberName},${item.role},${item.attendanceRate}%,${item.presentCount}`).join('\n');
      } else if (selectedReport === 'membership') {
        csvContent = 'Member,Role,Email,Status,Joined\n' +
          members.map(m => `${m.memberName},${m.role},${m.memberEmail},${m.status},${m.joinedAt}`).join('\n');
      } else {
        csvContent = 'Event,Date,Location,Registrations\n' +
          events.map(e => `${e.title},${e.startDate},${e.location},${e.registeredAttendees}`).join('\n');
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `group-${selectedReport}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const getAttendanceTrendData = () => {
    return [
      { date: 'Week 1', rate: 75 },
      { date: 'Week 2', rate: 82 },
      { date: 'Week 3', rate: 78 },
      { date: 'Week 4', rate: 88 },
      { date: 'Week 5', rate: 85 },
      { date: 'Week 6', rate: 91 },
    ];
  };

  const getMembershipGrowthData = () => {
    return [
      { month: 'Nov', count: 3 },
      { month: 'Dec', count: 5 },
      { month: 'Jan', count: 4 },
      { month: 'Feb', count: 6 },
    ];
  };

  const getTopAttendees = () => {
    return members.map(member => {
      const memberAttendance = attendance.filter(a => a.memberId === member.id);
      const presentCount = memberAttendance.filter(a => String(a.status).toLowerCase() === 'present').length;
      const totalEvents = events.length || 1;
      const attendanceRate = Math.round((presentCount / totalEvents) * 100);
      
      return {
        memberName: member.memberName,
        role: member.role,
        presentCount,
        totalEvents,
        attendanceRate
      };
    }).sort((a, b) => b.attendanceRate - a.attendanceRate);
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Group Reports</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExportReport} disabled={exporting}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 border-b border-border pb-2">
        {reportTypes.map((type) => (
          <Button
            key={type.value}
            variant={selectedReport === type.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedReport(type.value)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Attendance Report */}
      {selectedReport === 'attendance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={attendanceChartConfig} className="h-72 w-full">
                <LineChart data={getAttendanceTrendData()} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Attendee Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead className="text-right">Events Attended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getTopAttendees().map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-foreground">{item.memberName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.role}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.attendanceRate >= 80
                              ? 'success'
                              : item.attendanceRate >= 60
                                ? 'neutral'
                                : 'danger'
                          }
                          size="sm"
                        >
                          {item.attendanceRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.presentCount} / {item.totalEvents}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Membership Report */}
      {selectedReport === 'membership' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">New Members Joined</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={growthChartConfig} className="h-72 w-full">
                <BarChart data={getMembershipGrowthData()} margin={{ top: 10, left: 10, right: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-4 space-y-2">
              <span className="text-xs text-muted-foreground">Total Enrolled</span>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="text-xs text-muted-foreground">Active Members</span>
              <p className="text-2xl font-bold text-foreground">
                {members.filter(m => m.status === 'Active').length}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Events Report */}
      {selectedReport === 'events' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4 space-y-2">
              <span className="text-xs text-muted-foreground">Total Events Held</span>
              <p className="text-2xl font-bold text-foreground">{events.length}</p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="text-xs text-muted-foreground">Total Registrations</span>
              <p className="text-2xl font-bold text-foreground">
                {events.reduce((sum, e) => sum + e.registeredAttendees, 0)}
              </p>
            </Card>
            <Card className="p-4 space-y-2">
              <span className="text-xs text-muted-foreground">Avg per Event</span>
              <p className="text-2xl font-bold text-foreground">
                {events.length > 0 ? Math.round(events.reduce((sum, e) => sum + e.registeredAttendees, 0) / events.length) : 0}
              </p>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Events Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Registrations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium text-foreground">{event.title}</TableCell>
                      <TableCell className="text-muted-foreground">{new Date(event.startDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-muted-foreground">{event.location}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {event.registeredAttendees} / {event.maxAttendees}
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        No events found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}