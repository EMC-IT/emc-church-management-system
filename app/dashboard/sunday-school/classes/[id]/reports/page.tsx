'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  FileText,
  Target,
  Award,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';
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

// Chart configurations
const attendanceDistributionConfig = {
  value: { label: 'Students', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const attendanceTrendsConfig = {
  rate: { label: 'Attendance Rate', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const attendanceStatsConfig = {
  present: { label: 'Present', color: 'hsl(var(--chart-1))' },
  late: { label: 'Late', color: 'hsl(var(--chart-2))' },
  absent: { label: 'Absent', color: 'hsl(var(--chart-3))' },
  excused: { label: 'Excused', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

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
      
      // Load class data
      const classResponse = await sundaySchoolService.getClass(classId);
      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      // Load students
      const studentsResponse = await sundaySchoolService.getClassStudents(classId);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
      
      // Load attendance history
      const historyResponse = await sundaySchoolService.getClassAttendance(classId, {
        limit: 200,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      if (historyResponse.success && historyResponse.data) {
        setAttendanceHistory(historyResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const processAttendanceData = () => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Filter attendance by date range
    const filteredAttendance = attendanceHistory.filter(
      record => new Date(record.date) >= cutoffDate
    );

    // Group by date
    const dateGroups = new Map<string, ClassAttendance[]>();
    filteredAttendance.forEach(record => {
      const date = new Date(record.date).toISOString().split('T')[0];
      if (!dateGroups.has(date)) {
        dateGroups.set(date, []);
      }
      dateGroups.get(date)!.push(record);
    });

    // Process each date
    const processedData: AttendanceData[] = [];
    dateGroups.forEach((records, date) => {
      const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const late = records.filter(r => r.status === AttendanceStatus.LATE).length;
      const excused = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;
      const total = records.length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      processedData.push({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present,
        absent,
        late,
        excused,
        total,
        rate
      });
    });

    // Sort by date
    processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setAttendanceData(processedData);
  };

  const processStudentPerformance = () => {
    const performance: StudentPerformance[] = students.map(student => {
      const studentRecords = attendanceHistory.filter(r => r.studentId === student.id);
      
      const totalSessions = studentRecords.length;
      const presentCount = studentRecords.filter(r => r.status === AttendanceStatus.PRESENT).length;
      const lateCount = studentRecords.filter(r => r.status === AttendanceStatus.LATE).length;
      const absentCount = studentRecords.filter(r => r.status === AttendanceStatus.ABSENT).length;
      const excusedCount = studentRecords.filter(r => r.status === AttendanceStatus.EXCUSED).length;
      
      const attendanceRate = totalSessions > 0 
        ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
        : 0;

      // Calculate trend (simplified)
      const recentRecords = studentRecords.slice(0, 5);
      const olderRecords = studentRecords.slice(5, 10);
      
      const recentRate = recentRecords.length > 0 
        ? (recentRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length / recentRecords.length) * 100
        : 0;
      
      const olderRate = olderRecords.length > 0 
        ? (olderRecords.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length / olderRecords.length) * 100
        : 0;

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentRate > olderRate + 10) trend = 'improving';
      else if (recentRate < olderRate - 10) trend = 'declining';

      return {
        student,
        attendanceRate,
        totalSessions,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        trend
      };
    });

    // Sort by attendance rate
    performance.sort((a, b) => b.attendanceRate - a.attendanceRate);
    setStudentPerformance(performance);
  };

  const handleBack = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  const getOverallStats = () => {
    const totalRecords = attendanceHistory.length;
    const presentRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const lateRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.LATE).length;
    const absentRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const excusedRecords = attendanceHistory.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    
    const overallRate = totalRecords > 0 
      ? Math.round(((presentRecords + lateRecords) / totalRecords) * 100)
      : 0;

    return {
      totalRecords,
      presentRecords,
      lateRecords,
      absentRecords,
      excusedRecords,
      overallRate
    };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-brand-success" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Target className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const pieData = [
    { name: 'Present', value: getOverallStats().presentRecords, color: '#A5CF5D' },
    { name: 'Late', value: getOverallStats().lateRecords, color: '#C49831' },
    { name: 'Excused', value: getOverallStats().excusedRecords, color: '#28ACD1' },
    { name: 'Absent', value: getOverallStats().absentRecords, color: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = getOverallStats();

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
              <h1 className="text-3xl font-bold tracking-tight">Class Reports</h1>
              <p className="text-muted-foreground">
                {classData?.name} - Performance and attendance analytics
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRecords} total records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{stats.presentRecords}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRecords > 0 ? Math.round((stats.presentRecords / stats.totalRecords) * 100) : 0}% of sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absentRecords}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalRecords > 0 ? Math.round((stats.absentRecords / stats.totalRecords) * 100) : 0}% of sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              enrolled in class
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Attendance Trends</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Attendance Distribution</CardTitle>
                <CardDescription>
                  Breakdown of attendance status across all sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={attendanceDistributionConfig} className="h-64 w-full">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke="hsl(var(--background))"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Class Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Class Summary</CardTitle>
                <CardDescription>
                  Key metrics and information about this class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Class Name</span>
                    <span className="text-sm text-muted-foreground">{classData?.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Age Group</span>
                    <span className="text-sm text-muted-foreground">{classData?.ageGroup}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Teacher</span>
                    <span className="text-sm text-muted-foreground">{classData?.teacher.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Enrolled Students</span>
                    <span className="text-sm text-muted-foreground">{students.length}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Class Capacity</span>
                    <span className="text-sm text-muted-foreground">{classData?.maxStudents}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Utilization</span>
                    <span className="text-sm text-muted-foreground">
                      {classData ? Math.round((students.length / classData.maxStudents) * 100) : 0}%
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Sessions</span>
                      <span className="text-sm text-muted-foreground">
                        {new Set(attendanceHistory.map(r => r.date.split('T')[0])).size}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends Over Time</CardTitle>
              <CardDescription>
                Track attendance patterns and identify trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No attendance data</h3>
                  <p className="text-muted-foreground">
                    Start taking attendance to see trends here
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Attendance Rate Line Chart */}
                  <div>
                    <h4 className="font-medium mb-4">Attendance Rate Trend</h4>
                    <ChartContainer config={attendanceTrendsConfig} className="h-64 w-full">
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
                          domain={[0, 100]}
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
                          stroke="hsl(var(--chart-2))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-2))' }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>

                  {/* Attendance Breakdown Bar Chart */}
                  <div>
                    <h4 className="font-medium mb-4">Attendance Breakdown by Session</h4>
                    <ChartContainer config={attendanceStatsConfig} className="h-64 w-full">
                      <BarChart data={attendanceData} margin={{ left: 12, right: 12 }}>
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
                          cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                          content={<ChartTooltipContent indicator="dot" />} 
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="present" stackId="a" fill="hsl(var(--chart-1))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="late" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="excused" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="absent" stackId="a" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Performance</CardTitle>
              <CardDescription>
                Individual student attendance rates and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No student data</h3>
                  <p className="text-muted-foreground">
                    Add students to the class to see performance metrics
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studentPerformance.map((performance, index) => (
                    <div key={performance.student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {index < 3 && (
                            <Award className={`h-5 w-5 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-amber-600'
                            }`} />
                          )}
                          <span className="text-sm font-medium">#{index + 1}</span>
                        </div>
                        
                        <Avatar>
                          <AvatarImage src={performance.student.avatar} alt={performance.student.name} />
                          <AvatarFallback>
                            {performance.student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium">{performance.student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {performance.totalSessions} sessions attended
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">{performance.attendanceRate}%</span>
                            {getTrendIcon(performance.trend)}
                          </div>
                          <div className="w-32">
                            <Progress value={performance.attendanceRate} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="text-right text-sm text-muted-foreground">
                          <div>Present: {performance.presentCount}</div>
                          <div>Late: {performance.lateCount}</div>
                          <div>Absent: {performance.absentCount}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}