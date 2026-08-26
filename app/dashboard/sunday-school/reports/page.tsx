'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
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
  Users,
  GraduationCap,
  Calendar,
  School,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolStats } from '@/lib/types/sunday-school';
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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30_days');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<SundaySchoolStats | null>(null);

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
      ageGroup: 'Preschool (3-5)',
      totalStudents: 12,
      newEnrollments: 3,
      graduations: 2,
      retentionRate: 95
    },
    {
      ageGroup: 'Elementary (6-10)',
      totalStudents: 18,
      newEnrollments: 5,
      graduations: 4,
      retentionRate: 88
    },
    {
      ageGroup: 'Middle School (11-13)',
      totalStudents: 15,
      newEnrollments: 2,
      graduations: 3,
      retentionRate: 85
    },
    {
      ageGroup: 'High School (14-17)',
      totalStudents: 8,
      newEnrollments: 1,
      graduations: 2,
      retentionRate: 90
    }
  ]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getSundaySchoolStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      toast.error('Failed to load report stats');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = 'Class,Age Group,Teacher,Enrolled,Attendance Rate,Engagement Score\n' +
      classPerformance.map(c => `"${c.name}","${c.ageGroup}","${c.teacher}",${c.totalStudents},${c.averageAttendance}%,${c.engagementScore}%`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunday-school-overall-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/sunday-school')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sunday School Reports</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_90_days">Last 90 Days</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats?.averageAttendance || 87}%`}
          icon={TrendingUp}
          description="Average participation rate"
        />
        <StatCard
          title="Total Enrolled"
          value={stats?.totalStudents || 53}
          icon={Users}
          description="Across all classes"
        />
        <StatCard
          title="Active Classes"
          value={stats?.totalClasses || 4}
          icon={School}
          description="In operation"
        />
        <StatCard
          title="Teaching Staff"
          value={stats?.totalTeachers || 4}
          icon={GraduationCap}
          description="Assigned teachers"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Attendance Trends
          </TabsTrigger>
          <TabsTrigger
            value="classes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Class Performance
          </TabsTrigger>
          <TabsTrigger
            value="teachers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Teacher Workload
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Age Group Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Weekly Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceTrends.map((trend) => (
                  <div key={trend.date} className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{new Date(trend.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        <span className="text-xs text-muted-foreground">{trend.present} of {trend.total} students present</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:w-48">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Rate</span>
                          <span className="font-semibold text-foreground">{trend.rate}%</span>
                        </div>
                        <Progress value={trend.rate} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Performance by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classPerformance.map((cls) => (
                  <div key={cls.id} className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{cls.name}</p>
                        <Badge variant="neutral" size="sm">{cls.ageGroup}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">Teacher: {cls.teacher} • {cls.totalStudents} students</span>
                    </div>

                    <div className="flex items-center gap-4 sm:w-56">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="font-semibold text-foreground">{cls.averageAttendance}%</span>
                        </div>
                        <Progress value={cls.averageAttendance} className="h-1.5" />
                      </div>
                      <Badge variant={cls.averageAttendance >= 85 ? 'neutral' : 'danger'} size="sm">
                        {cls.averageAttendance >= 85 ? 'High' : 'Medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Teacher Allocation & Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teacherWorkload.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-border flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {t.classesAssigned} class(es) • {t.totalStudents} total students
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="neutral" size="sm">
                        Avg. Attendance: {t.averageAttendance}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Enrollment & Retention by Age Group</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studentGrowth.map((g) => (
                  <div key={g.ageGroup} className="p-3 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-foreground">{g.ageGroup}</p>
                      <span className="text-xs text-muted-foreground">
                        {g.totalStudents} enrolled • +{g.newEnrollments} new • {g.graduations} graduated
                      </span>
                    </div>

                    <div className="flex items-center gap-3 sm:w-48">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Retention</span>
                          <span className="font-semibold text-foreground">{g.retentionRate}%</span>
                        </div>
                        <Progress value={g.retentionRate} className="h-1.5" />
                      </div>
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