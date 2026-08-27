'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Plus,
  MoreHorizontal,
  Users,
  Search,
  Trash2,
  Phone,
  Mail,
  Loader2,
  GraduationCap,
  ArrowLeft,
  School
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { Teacher, TeacherStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function TeachersPage() {
  const router = useRouter();
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getTeachers();
      if (response.success && response.data) {
        setTeachers(response.data);
      } else {
        toast.error('Failed to load teachers');
      }
    } catch {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTeacher) return;
    setDeleting(true);
    try {
      const response = await sundaySchoolService.deleteTeacher(deleteTeacher.id);
      if (response.success) {
        toast.success('Teacher removed successfully');
        setTeachers(prev => prev.filter(t => t.id !== deleteTeacher.id));
      } else {
        toast.error(response.message || 'Failed to remove teacher');
      }
    } catch {
      toast.error('Failed to remove teacher');
    } finally {
      setDeleting(false);
      setDeleteTeacher(null);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const fullName = (teacher.name || '').toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTeachers = teachers.filter(t => t.status === TeacherStatus.ACTIVE).length;
  const totalAssignedClasses = teachers.reduce((sum, t) => sum + (t.assignedClasses?.length || 0), 0);

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={6} />;
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
            <Link href="/dashboard/sunday-school" aria-label="Back to Sunday School">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sunday School Teachers</h1>
        </div>

        <Button size="sm" asChild>
          <Link href="/dashboard/sunday-school/teachers/add">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Teacher
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Teachers" value={teachers.length} icon={GraduationCap} />
        <StatCard title="Active Teachers" value={activeTeachers} icon={Users} />
        <StatCard title="Classes Assigned" value={totalAssignedClasses} icon={School} />
        <StatCard
          title="Active Rate"
          value={`${teachers.length > 0 ? Math.round((activeTeachers / teachers.length) * 100) : 0}%`}
          icon={Users}
        />
      </div>

      {/* Teachers Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Teacher Directory ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={TeacherStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={TeacherStatus.INACTIVE}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary shrink-0">
                        {teacher.name?.slice(0, 2).toUpperCase() || 'TC'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          {teacher.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusBadge status={(teacher.status || 'active').toLowerCase() as any} size="sm" />
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
                          <Link href={`/dashboard/sunday-school/teachers/${teacher.id}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteTeacher(teacher)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                    {teacher.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.email}</span>
                      </div>
                    )}
                    {teacher.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{teacher.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {teacher.assignedClasses?.length || 0} class(es) assigned
                  </span>
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary hover:bg-transparent" asChild>
                    <Link href={`/dashboard/sunday-school/teachers/${teacher.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No teachers found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTeacher} onOpenChange={(open) => !open && setDeleteTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{deleteTeacher?.name}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeacher}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removing...' : 'Remove Teacher'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
