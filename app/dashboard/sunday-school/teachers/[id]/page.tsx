'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Phone,
  Mail,
  Loader2,
  TrendingUp,
  School
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { Teacher, SundaySchoolClass } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function TeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teacherResponse, classesResponse] = await Promise.all([
        sundaySchoolService.getTeacher(teacherId),
        sundaySchoolService.getTeacherClasses(teacherId)
      ]);

      if (teacherResponse.success && teacherResponse.data) {
        setTeacher(teacherResponse.data);
      } else {
        toast.error('Teacher not found');
        router.push('/dashboard/sunday-school/teachers');
        return;
      }
      
      if (classesResponse.success && classesResponse.data) {
        setClasses(classesResponse.data);
      }
    } catch {
      toast.error('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold">Teacher Not Found</h2>
        <Button onClick={() => router.push('/dashboard/sunday-school/teachers')} variant="outline">
          Back to Teachers
        </Button>
      </div>
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/sunday-school/teachers" aria-label="Back to Teachers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {teacher.name}
            </h1>
            <StatusBadge status={(teacher.status || 'active').toLowerCase() as any} size="sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Classes" value={classes.length} icon={School} />
        <StatCard title="Total Students" value={totalStudents} icon={Users} />
        <StatCard title="Join Date" value={teacher.joinDate || '—'} icon={Calendar} />
        <StatCard title="Experience" value={teacher.experience || '—'} icon={TrendingUp} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Profile & Contact</TabsTrigger>
          <TabsTrigger value="classes">Assigned Classes ({classes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Teacher Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Teacher Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Join Date</span>
                  <span className="font-medium text-foreground">{teacher.joinDate || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Qualifications</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {teacher.qualifications && teacher.qualifications.length > 0 ? (
                      teacher.qualifications.map((q, idx) => (
                        <Badge key={idx} variant="neutral" size="sm">{q}</Badge>
                      ))
                    ) : (
                      <span className="font-medium text-foreground">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={(teacher.status || 'active').toLowerCase() as any} size="sm" />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {teacher.email && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Email</span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{teacher.email}</span>
                    </div>
                  </div>
                )}
                {teacher.phone && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{teacher.phone}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Assigned Classes ({classes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3 rounded-lg border border-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{cls.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {cls.ageGroup} • Room: {cls.location || '—'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {cls.students || 0} students
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs text-primary" asChild>
                        <Link href={`/dashboard/sunday-school/classes/${cls.id}`}>
                          View Class
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {classes.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No classes currently assigned to this teacher.
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