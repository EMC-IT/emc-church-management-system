'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  Phone,
  Users,
  TrendingUp,
  Loader2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function ClassStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse] = await Promise.all([
        sundaySchoolService.getClass(classId),
        sundaySchoolService.getClassStudents(classId)
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
    } catch {
      toast.error('Failed to load class students');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    setRemoving(true);
    try {
      const response = await sundaySchoolService.removeStudentFromClass(classId, studentToRemove.id);
      if (response.success) {
        toast.success(`${studentToRemove.name} removed from class`);
        setStudents(prev => prev.filter(s => s.id !== studentToRemove.id));
      } else {
        toast.error(response.message || 'Failed to remove student');
      }
    } catch {
      toast.error('Failed to remove student');
    } finally {
      setRemoving(false);
      setStudentToRemove(null);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = (student.name || '').toLowerCase();
    const parentName = student.parentContact?.parentName?.toLowerCase() || '';
    return fullName.includes(searchTerm.toLowerCase()) ||
           parentName.includes(searchTerm.toLowerCase()) ||
           student.age.toString().includes(searchTerm);
  });

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={4} rows={6} />;
  }

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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Class Students</h1>
          </div>
        </div>

        <Button size="sm" asChild>
          <Link href={`/dashboard/sunday-school/classes/${classId}/students/add`}>
            <UserPlus className="mr-1.5 h-4 w-4" />
            Add Students
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Enrolled Students" value={students.length} icon={Users} />
        <StatCard title="Class Capacity" value={classData?.maxStudents || 20} icon={Users} />
        <StatCard
          title="Capacity Filled"
          value={`${Math.round((students.length / (classData?.maxStudents || 20)) * 100)}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Students Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Enrolled Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, parent name, or age..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary shrink-0">
                      {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {student.name}
                        </span>
                        <Badge variant="neutral" size="sm">Age: {student.age}</Badge>
                        <StatusBadge status={(student.status || 'active').toLowerCase() as any} size="sm" />
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        {student.parentContact?.parentName && (
                          <span>Parent: {student.parentContact.parentName}</span>
                        )}
                        {student.parentContact?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.parentContact.phone}
                          </span>
                        )}
                        {student.parentContact?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.parentContact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/sunday-school/students/${student.id}`}>
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStudentToRemove(student)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove from Class
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No students found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation */}
      <AlertDialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{studentToRemove?.name}&quot; from this class?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? 'Removing...' : 'Remove Student'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}