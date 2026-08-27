'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { DetailsPageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Loader2,
  Users,
  BookOpen
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { Student, ClassAttendance } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentResponse = await sundaySchoolService.getStudent(studentId);
      if (studentResponse.success && studentResponse.data) {
        setStudent(studentResponse.data);
      } else {
        toast.error('Student not found');
        router.push('/dashboard/sunday-school/students');
        return;
      }
      
      const attendanceResponse = await sundaySchoolService.getAttendance({ studentId });
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
    } catch {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DetailsPageSkeleton />;
  }

  if (!student) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold">Student Not Found</h2>
        <Button onClick={() => router.push('/dashboard/sunday-school/students')} variant="outline">
          Back to Students
        </Button>
      </div>
    );
  }

  const totalClasses = attendance.length;
  const attendedClasses = attendance.filter(a => a.status === 'Present').length;
  const attendanceRate = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/sunday-school/students" aria-label="Back to Students">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight">
              {student.name}
            </h1>
            <StatusBadge status={(student.status || 'active').toLowerCase() as any} size="sm" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Age" value={`${student.age} years`} icon={Calendar} />
        <StatCard title="Gender" value={student.gender || '—'} icon={Users} />
        <StatCard title="Total Sessions" value={totalClasses} icon={BookOpen} />
        <StatCard title="Attendance Rate" value={`${attendanceRate}%`} icon={TrendingUp} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Profile Information</TabsTrigger>
          <TabsTrigger value="attendance">Attendance History ({attendance.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="font-medium text-foreground">{student.dateOfBirth || '—'}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Medical / Special Info</span>
                  <span className="font-medium text-foreground">{student.medicalInfo || student.notes || 'None'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Guardian / Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Guardian Name</span>
                  <span className="font-medium text-foreground">{student.parentContact?.parentName || '—'}</span>
                </div>
                {student.parentContact?.relationship && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Relationship</span>
                    <span className="font-medium text-foreground">{student.parentContact.relationship}</span>
                  </div>
                )}
                {student.parentContact?.phone && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Phone</span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{student.parentContact.phone}</span>
                    </div>
                  </div>
                )}
                {student.parentContact?.email && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Email</span>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{student.parentContact.email}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Attendance Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border text-sm"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                      {record.notes && (
                        <p className="text-xs text-muted-foreground">{record.notes}</p>
                      )}
                    </div>
                    <StatusBadge status={record.status.toLowerCase() as any} size="sm" />
                  </div>
                ))}

                {attendance.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No attendance records for this student.
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