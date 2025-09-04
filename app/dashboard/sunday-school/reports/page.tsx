'use client';

import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Target,
  BarChart3,
  PieChart,
  Loader2,
  Filter
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { toast } from 'sonner';

interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  total: number;
  rate: number;
}

interface ClassPerformance {
  id: string;
  name: string;
  ageGroup: string;
  teacher: string;
  totalStudents: number;
  averageAttendance: number;
  engagementScore: number;
  trend: 'up' | 'down' | 'stable';
}

interface TeacherWorkload {
  id: string;
  name: string;
  classesAssigned: number;
  totalStudents: number;
  averageAttendance: number;
  workloadScore: number;
}

interface StudentGrowth {
  ageGroup: string;
  totalStudents: number;
  newEnrollments: number;
  graduations: number;
  retentionRate: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data - in a real app, this would come from the API
  const [attendanceTrends] = useState<AttendanceTrend[]>([
    { date: '2024-01-07', present: 45, absent: 8, total: 53, rate: 84.9 },
    { date: '2024-01-14', present: 48, absent: 5, total: 53, rate: 90.6 },
    { date: '2024-01-21', present: 42, absent: 11, total: 53, rate: 79.2 },
    { date: '2024-01-28', present: 50, absent: 3, total: 53, rate: 94.3 },
  ]);
  
  const [classPerformance] = useState<ClassPerformance[]>([
    {
      id: '1',
      name: 'Little Lambs',
      ageGroup: 'Preschool',
      teacher: 'Sarah Johnson',
      totalStudents: 12,
      averageAttendance: 92.5,
      engagementScore: 88,
      trend: 'up'
    },
    {
      id: '2',
      name: 'Young Disciples',
      ageGroup: 'Elementary',
      teacher: 'Mike Davis',
      totalStudents: 18,
      averageAttendance: 85.3,
      engagementScore: 82,
      trend: 'stable'
    },
    {
      id: '3',
      name: 'Faith Builders',
      ageGroup: 'Middle School',
      teacher: 'Lisa Chen',
      totalStudents: 15,
      averageAttendance: 78.9,
      engagementScore: 75,
      trend: 'down'
    },
    {
      id: '4',
      name: 'Truth Seekers',
      ageGroup: 'High School',
      teacher: 'David Wilson',
      totalStudents: 8,
      averageAttendance: 81.2,
      engagementScore: 79,
      trend: 'up'
    }
  ]);
  
  const [teacherWorkload] = useState<TeacherWorkload[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      classesAssigned: 1,
      totalStudents: 12,
      averageAttendance: 92.5,
      workloadScore: 75
    },
    {
      id: '2',
      name: 'Mike Davis',
      classesAssigned: 2,
      totalStudents: 25,
      averageAttendance: 85.3,
      workloadScore: 85
    },
    {
      id: '3',
      name: 'Lisa Chen',
      classesAssigned: 1,
      totalStudents: 15,
      averageAttendance: 78.9,
      workloadScore: 70
    },
    {
      id: '4',
      name: 'David Wilson',
      classesAssigned: 1,
      totalStudents: 8,
      averageAttendance: 81.2,
      workloadScore: 60
    }
  ]);
  
  const [studentGrowth] = useState<StudentGrowth[]>([
    {
      ageGroup: 'Preschool',
      totalStudents: 12,
      newEnrollments: 3,
      graduations: 0,
      retentionRate: 95.8
    },
    {
      ageGroup: 'Elementary',
      totalStudents: 18,
      newEnrollments: 2,
      graduations: 1,
      retentionRate: 88.9
    },
    {
      ageGroup: 'Middle School',
      totalStudents: 15,
      newEnrollments: 1,
      graduations: 2,
      retentionRate: 83.3
    },
    {
      ageGroup: 'High School',
      totalStudents: 8,
      newEnrollments: 0,
      graduations: 3,
      retentionRate: 72.7
    }
  ]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getOverallStats = () => {
    const totalStudents = studentGrowth.reduce((sum, group) => sum + group.totalStudents, 0);
    const totalClasses = classPerformance.length;
    const totalTeachers = teacherWorkload.length;
    const averageAttendance = classPerformance.reduce((sum, cls) => sum + cls.averageAttendance, 0) / classPerformance.length;
    const newEnrollments = studentGrowth.reduce((sum, group) => sum + group.newEnrollments, 0);
    const overallRetention = studentGrowth.reduce((sum, group) => sum + group.retentionRate, 0) / studentGrowth.length;
    
    return {
      totalStudents,
      totalClasses,
      totalTeachers,
      averageAttendance,
      newEnrollments,
      overallRetention
    };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-brand-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Target className="h-4 w-4 text-brand-secondary" />;
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return 'text-destructive';
    if (score >= 60) return 'text-brand-accent';
    return 'text-brand-success';
  };

  const handleExportReport = (type: string) => {
    toast.success(`${type} report exported successfully`);
  };

  const stats = getOverallStats();

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Sunday School performance insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_7_days">Last 7 days</SelectItem>
              <SelectItem value="last_30_days">Last 30 days</SelectItem>
              <SelectItem value="last_3_months">Last 3 months</SelectItem>
              <SelectItem value="last_year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newEnrollments} new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAttendance.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallRetention.toFixed(1)}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newEnrollments}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Reports */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Trends</TabsTrigger>
          <TabsTrigger value="classes">Class Performance</TabsTrigger>
          <TabsTrigger value="teachers">Teacher Workload</TabsTrigger>
          <TabsTrigger value="growth">Student Growth</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Attendance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Attendance Overview</span>
                </CardTitle>
                <CardDescription>Weekly attendance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(trend.date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trend.present} present, {trend.absent} absent
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{trend.rate.toFixed(1)}%</p>
                        <Progress value={trend.rate} className="w-20 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Top Performing Classes</span>
                </CardTitle>
                <CardDescription>Based on attendance and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classPerformance
                    .sort((a, b) => b.averageAttendance - a.averageAttendance)
                    .slice(0, 4)
                    .map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{cls.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cls.teacher} • {cls.totalStudents} students
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold">
                              {cls.averageAttendance.toFixed(1)}%
                            </span>
                            {getTrendIcon(cls.trend)}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Attendance Trends</span>
                </div>
                <Button variant="outline" onClick={() => handleExportReport('Attendance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendanceTrends.map((trend, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        Week of {new Date(trend.date).toLocaleDateString()}
                      </h4>
                      <Badge variant={trend.rate >= 90 ? 'default' : trend.rate >= 80 ? 'secondary' : 'destructive'}>
                        {trend.rate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Present</p>
                        <p className="font-semibold text-brand-success">{trend.present}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Absent</p>
                        <p className="font-semibold text-destructive">{trend.absent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-semibold">{trend.total}</p>
                      </div>
                    </div>
                    <Progress value={trend.rate} className="mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Class Performance</span>
                </div>
                <Button variant="outline" onClick={() => handleExportReport('Class Performance')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classPerformance.map((cls) => (
                  <div key={cls.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{cls.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cls.ageGroup} • {cls.teacher}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(cls.trend)}
                        <Badge variant="outline">{cls.totalStudents} students</Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Average Attendance</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={cls.averageAttendance} className="flex-1" />
                          <span className="text-sm font-semibold">
                            {cls.averageAttendance.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Engagement Score</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={cls.engagementScore} className="flex-1" />
                          <span className="text-sm font-semibold">
                            {cls.engagementScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Teacher Workload</span>
                </div>
                <Button variant="outline" onClick={() => handleExportReport('Teacher Workload')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherWorkload.map((teacher) => (
                  <div key={teacher.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{teacher.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={getWorkloadColor(teacher.workloadScore)}
                      >
                        Workload: {teacher.workloadScore}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Classes</p>
                        <p className="font-semibold">{teacher.classesAssigned}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Students</p>
                        <p className="font-semibold">{teacher.totalStudents}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Attendance</p>
                        <p className="font-semibold">{teacher.averageAttendance.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress value={teacher.workloadScore} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Student Growth by Age Group</span>
                </div>
                <Button variant="outline" onClick={() => handleExportReport('Student Growth')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentGrowth.map((group, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{group.ageGroup}</h4>
                      <Badge variant="outline">{group.totalStudents} students</Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">New Enrollments</p>
                        <p className="font-semibold text-brand-success">+{group.newEnrollments}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Graduations</p>
                        <p className="font-semibold text-brand-accent">{group.graduations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Retention Rate</p>
                        <p className="font-semibold">{group.retentionRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Growth</p>
                        <p className={`font-semibold ${
                          group.newEnrollments - group.graduations > 0 
                            ? 'text-brand-success' 
                            : 'text-destructive'
                        }`}>
                          {group.newEnrollments - group.graduations > 0 ? '+' : ''}
                          {group.newEnrollments - group.graduations}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Retention Rate</p>
                      <Progress value={group.retentionRate} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}