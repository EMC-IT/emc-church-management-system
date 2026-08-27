'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { DetailsPageSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  UserPlus,
  ClipboardList,
  BarChart3,
  BookOpen,
  Clock,
  Loader2
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student, ClassAttendance } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function ClassDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (classId) {
      loadClassData();
    }
  }, [classId]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, attendanceResponse] = await Promise.all([
        sundaySchoolService.getClass(classId),
        sundaySchoolService.getClassStudents(classId),
        sundaySchoolService.getClassAttendance(classId, { limit: 10, sortBy: 'date', sortOrder: 'desc' })
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
      
      if (attendanceResponse.success && attendanceResponse.data) {
        setRecentAttendance(attendanceResponse.data);
      }
    } catch {
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsPageSkeleton />;
  }

  if (!classData) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold">Class Not Found</h2>
        <Button onClick={() => router.push('/dashboard/sunday-school/classes')} variant="outline">
          Back to Classes
        </Button>
      </div>
    );
  }

  const getAttendanceRate = () => {
    if (recentAttendance.length === 0) return 0;
    const presentCount = recentAttendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / recentAttendance.length) * 100);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/sunday-school/classes" aria-label="Back to Classes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{classData.name}</h1>
            <StatusBadge status={(classData.status || 'active').toLowerCase() as any} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/sunday-school/classes/${classId}/edit`)}>
            <Edit className="mr-1.5 h-4 w-4" />
            Edit Class
          </Button>
          <Button size="sm" onClick={() => router.push(`/dashboard/sunday-school/classes/${classId}/attendance`)}>
            <ClipboardList className="mr-1.5 h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Students"
          value={students.length}
          icon={Users}
        />
        <StatCard
          title="Attendance Rate"
          value={`${getAttendanceRate()}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Age Group"
          value={classData.ageGroup}
          icon={BookOpen}
        />
        <StatCard
          title="Room / Location"
          value={classData.location || '—'}
          icon={MapPin}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="attendance">Recent Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Class Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Class Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Description</span>
                  <p className="text-foreground mt-0.5">{classData.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">
                    {classData.schedule?.dayOfWeek && classData.schedule?.startTime 
                      ? `${classData.schedule.dayOfWeek}s, ${classData.schedule.startTime} - ${classData.schedule.endTime}`
                      : 'Schedule not set'}
                  </span>
                </div>

                {classData.curriculum && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground block">Curriculum</span>
                    <p className="font-medium text-foreground mt-0.5">{classData.curriculum}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Assigned Teacher</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classData.teacher ? (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary shrink-0">
                      {classData.teacher.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">{classData.teacher.name}</p>
                      {classData.teacher.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{classData.teacher.email}</span>
                        </div>
                      )}
                      {classData.teacher.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{classData.teacher.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No teacher assigned to this class.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Management Shortcuts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
                  <Link href={`/dashboard/sunday-school/classes/${classId}/students`}>
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Manage Students</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
                  <Link href={`/dashboard/sunday-school/classes/${classId}/attendance`}>
                    <ClipboardList className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Take Attendance</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
                  <Link href={`/dashboard/sunday-school/classes/${classId}/reports`}>
                    <BarChart3 className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">Class Reports</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Enrolled Students ({students.length})</CardTitle>
              <Button size="sm" asChild>
                <Link href={`/dashboard/sunday-school/classes/${classId}/students/add`}>
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Add Students
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {student.name}
                        </p>
                        <span className="text-xs text-muted-foreground">Age: {student.age}</span>
                      </div>
                    </div>
                    <StatusBadge status={(student.status || 'active').toLowerCase() as any} size="sm" />
                  </div>
                ))}

                {students.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">No students enrolled yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAttendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-border text-sm">
                    <div>
                      <p className="font-medium text-foreground">{record.studentName}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <StatusBadge status={record.status.toLowerCase() as any} size="sm" />
                  </div>
                ))}

                {recentAttendance.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">No attendance records found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}