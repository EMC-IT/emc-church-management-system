'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Clock,
  Download,
  Target,
  Award,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student, ClassAttendance, AttendanceStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

interface StudentPerformance {
  student: Student;
  attendanceRate: number;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  trend: 'improving' | 'declining' | 'stable';
}

const attendanceTrendsConfig = {
  rate: { label: 'Attendance Rate %', color: 'hsl(var(--primary))' },
} satisfies ChartConfig;

const attendanceStatsConfig = {
  present: { label: 'Present', color: 'hsl(var(--primary))' },
  late: { label: 'Late', color: 'hsl(var(--chart-2))' },
  absent: { label: 'Absent', color: 'hsl(var(--destructive))' },
  excused: { label: 'Excused', color: 'hsl(var(--muted-foreground))' },
} satisfies ChartConfig;

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--muted-foreground))',
  'hsl(var(--destructive))',
];

export default function ClassReportsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('3months');
  
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  useEffect(() => {
    if (attendanceHistory.length > 0 && students.length > 0) {
      processAttendanceData();
      processStudentPerformance();
    }
  }, [attendanceHistory, students, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, historyResponse] = await Promise.all([
        sundaySchoolService.getClass(classId),
        sundaySchoolService.getClassStudents(classId),
        sundaySchoolService.getClassAttendance(classId, { limit: 200, sortBy: 'date', sortOrder: 'desc' })
      ]);

      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
      
      if (historyResponse.success && historyResponse.data) {
        setAttendanceHistory(historyResponse.data);
      }
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = () => {
    const groupedByDate: { [key: string]: { present: number; absent: number; late: number; excused: number; total: number } } = {};

    attendanceHistory.forEach(record => {
      const date = record.date;
      if (!groupedByDate[date]) {
        groupedByDate[date] = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
      }
      groupedByDate[date].total++;
      if (record.status === AttendanceStatus.PRESENT) groupedByDate[date].present++;
      else if (record.status === AttendanceStatus.ABSENT) groupedByDate[date].absent++;
      else if (record.status === AttendanceStatus.LATE) groupedByDate[date].late++;
      else if (record.status === AttendanceStatus.EXCUSED) groupedByDate[date].excused++;
    });

    const sortedData: AttendanceData[] = Object.keys(groupedByDate)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .map(date => {
        const stats = groupedByDate[date];
        const rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;
        return {
          date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          ...stats,
          rate
        };
      });

    setAttendanceData(sortedData);
  };

  const processStudentPerformance = () => {
    const performance: StudentPerformance[] = students.map(student => {
      const studentRecords = attendanceHistory.filter(r => r.studentId === student.id);
      const totalSessions = studentRecords.length;
      const presentCount = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const lateCount = studentRecords.filter(r => r.status === AttendanceStatus.LATE).length;
      const absentCount = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const excusedCount = studentRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length;
      
      const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

      return {
        student,
        attendanceRate,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        trend: attendanceRate >= 80 ? 'improving' : attendanceRate >= 60 ? 'stable' : 'declining'
      };
    });

    performance.sort((a, b) => b.attendanceRate - a.attendanceRate);
    setStudentPerformance(performance);
  };

  const getOverallStats = () => {
    const totalRecords = attendanceHistory.length;
    const presentRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const lateRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.LATE).length;
    const absentRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const excusedRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    const averageRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

    return {
      totalRecords,
      presentRecords,
      lateRecords,
      absentRecords,
      excusedRecords,
      averageRate
    };
  };

  const pieData = [
    { name: 'Present', value: getOverallStats().presentRecords },
    { name: 'Late', value: getOverallStats().lateRecords },
    { name: 'Excused', value: getOverallStats().excusedRecords },
    { name: 'Absent', value: getOverallStats().absentRecords }
  ].filter(d => d.value > 0);

  const handleExport = () => {
    const csvContent = 'Student,Enrolled,Attendance Rate,Present,Late,Excused,Absent\n' +
      studentPerformance.map(p =>
        `"${p.student.name}",${p.totalSessions},${p.attendanceRate}%,${p.presentCount},${p.lateCount},${p.excusedCount},${p.absentCount}`
      ).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reports-${classData?.name || 'class'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={6} />;
  }

  const overall = getOverallStats();

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
            <Link href={`/dashboard/sunday-school/classes/${classId}`} aria-label="Back to Class Details">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Class Reports</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Overall Attendance" value={`${overall.averageRate}%`} icon={TrendingUp} />
        <StatCard title="Total Sessions" value={attendanceData.length} icon={Calendar} />
        <StatCard title="Active Students" value={students.length} icon={Users} />
        <StatCard
          title="High Attenders (80%+)"
          value={studentPerformance.filter(p => p.attendanceRate >= 80).length}
          icon={Award}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview & Trends</TabsTrigger>
          <TabsTrigger value="students">Student Breakdown ({studentPerformance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Trend Chart */}
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Attendance Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  {attendanceData.length > 0 ? (
                    <ChartContainer config={attendanceTrendsConfig} className="h-full w-full">
                      <LineChart data={attendanceData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No attendance trend data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Status Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {pieData.length > 0 ? (
                    <ChartContainer config={attendanceStatsConfig} className="h-full w-full">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                      No distribution data
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{item.name}:</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session History Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Session History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                {attendanceData.length > 0 ? (
                  <ChartContainer config={attendanceStatsConfig} className="h-full w-full">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="present" fill="hsl(var(--primary))" stackId="a" />
                      <Bar dataKey="late" fill="hsl(var(--chart-2))" stackId="a" />
                      <Bar dataKey="excused" fill="hsl(var(--muted-foreground))" stackId="a" />
                      <Bar dataKey="absent" fill="hsl(var(--destructive))" stackId="a" />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    No session data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Individual Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentPerformance.map((item) => (
                  <div
                    key={item.student.id}
                    className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        {item.student.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground">
                          {item.student.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {item.presentCount} present, {item.lateCount} late, {item.absentCount} absent ({item.totalSessions} sessions)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-56">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-semibold text-foreground">{item.attendanceRate}%</span>
                        </div>
                        <Progress value={item.attendanceRate} className="h-1.5" />
                      </div>
                      <Badge variant={item.attendanceRate >= 80 ? 'neutral' : 'danger'} size="sm">
                        {item.attendanceRate >= 80 ? 'Good' : 'Needs Focus'}
                      </Badge>
                    </div>
                  </div>
                ))}

                {studentPerformance.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No student records found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}