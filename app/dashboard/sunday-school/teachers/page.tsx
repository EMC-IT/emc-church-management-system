'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  BookOpen,
  Calendar,
  Award,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Filter,
  Download,
  UserCheck,
  Clock,
  Loader2
} from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { sundaySchoolService } from '@/services';
import { Teacher, SundaySchoolClass, TeacherStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

interface TeacherWithStats extends Omit<Teacher, 'assignedClasses'> {
  assignedClasses: number;
  totalStudents: number;
  averageAttendance: number;
  lastActive: string;
  yearsOfService: number;
}

interface TeachersStats {
  totalTeachers: number;
  activeTeachers: number;
  inactiveTeachers: number;
  totalClasses: number;
  averageClassSize: number;
  totalStudents: number;
}

export default function TeachersPage() {
  const router = useRouter();
  
  const [teachers, setTeachers] = useState<TeacherWithStats[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherWithStats[]>([]);
  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [stats, setStats] = useState<TeachersStats>({
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
    totalClasses: 0,
    averageClassSize: 0,
    totalStudents: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, statusFilter, sortBy]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load teachers
      const teachersResponse = await sundaySchoolService.getTeachers();
      if (teachersResponse.success && teachersResponse.data) {
        const teachersWithStats = await Promise.all(
          teachersResponse.data.map(async (teacher) => {
            // Get teacher's assigned classes
            const classesResponse = await sundaySchoolService.getTeacherClasses(teacher.id);
            const assignedClasses = classesResponse.success ? classesResponse.data?.length || 0 : 0;
            
            // Calculate total students across all classes
            let totalStudents = 0;
            if (classesResponse.success && classesResponse.data) {
              for (const classData of classesResponse.data) {
                const studentsResponse = await sundaySchoolService.getClassStudents(classData.id);
                if (studentsResponse.success && studentsResponse.data) {
                  totalStudents += studentsResponse.data.length;
                }
              }
            }
            
            // Calculate years of service
            const yearsOfService = teacher.joinDate 
              ? Math.floor((new Date().getTime() - new Date(teacher.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
              : 0;
            
            return {
              ...teacher,
              assignedClasses: teacher.assignedClasses.length,
              totalStudents,
              averageAttendance: 85, // Mock data - would calculate from actual attendance
              lastActive: new Date().toISOString().split('T')[0], // Mock last active date
              yearsOfService
            };
          })
        );
        
        setTeachers(teachersWithStats);
      }
      
      // Load classes for stats
      const classesResponse = await sundaySchoolService.getClasses();
      if (classesResponse.success && classesResponse.data) {
        setClasses(classesResponse.data);
      }
      
    } catch (error) {
      toast.error('Failed to load teachers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teachers.length > 0) {
      calculateStats();
    }
  }, [teachers, classes]);

  const calculateStats = () => {
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === TeacherStatus.ACTIVE).length;
    const inactiveTeachers = teachers.filter(t => t.status === TeacherStatus.INACTIVE).length;
    const totalClasses = classes.length;
    const totalStudents = teachers.reduce((sum, teacher) => sum + teacher.totalStudents, 0);
    const averageClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

    setStats({
      totalTeachers,
      activeTeachers,
      inactiveTeachers,
      totalClasses,
      averageClassSize,
      totalStudents
    });
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.includes(searchTerm) ||
        teacher.specializations?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => teacher.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'classes':
          return b.assignedClasses - a.assignedClasses;
        case 'students':
          return b.totalStudents - a.totalStudents;
        case 'experience':
          return b.yearsOfService - a.yearsOfService;
        case 'attendance':
          return b.averageAttendance - a.averageAttendance;
        default:
          return 0;
      }
    });

    setFilteredTeachers(filtered);
  };

  const handleViewTeacher = (teacherId: string) => {
    router.push(`/dashboard/sunday-school/teachers/${teacherId}`);
  };

  const handleEditTeacher = (teacherId: string) => {
    router.push(`/dashboard/sunday-school/teachers/${teacherId}/edit`);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    try {
      const response = await sundaySchoolService.deleteTeacher(teacher.id);
      if (response.success) {
        toast.success('Teacher deleted successfully');
        loadData();
      } else {
        toast.error(response.message || 'Failed to delete teacher');
      }
    } catch (error) {
      toast.error('Failed to delete teacher');
    } finally {
      setDeleteTeacher(null);
    }
  };

  const getStatusBadge = (status: TeacherStatus) => {
    switch (status) {
      case TeacherStatus.ACTIVE:
        return <Badge variant="success">Active</Badge>;
      case TeacherStatus.INACTIVE:
        return <Badge variant="neutral">Inactive</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const columns = [
    {
      accessorKey: 'teacher',
      header: 'Teacher',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={teacher.avatar} alt={teacher.name} />
              <AvatarFallback>
                {teacher.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{teacher.name}</div>
              <div className="text-sm text-muted-foreground">{teacher.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <div>
            <div className="font-medium">{teacher.specialization || 'General'}</div>
            <div className="text-sm text-muted-foreground">
              {teacher.yearsOfService} years experience
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'classes',
      header: 'Classes',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <div className="text-center">
            <div className="font-medium">{teacher.assignedClasses}</div>
            <div className="text-sm text-muted-foreground">assigned</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'students',
      header: 'Students',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <div className="text-center">
            <div className="font-medium">{teacher.totalStudents}</div>
            <div className="text-sm text-muted-foreground">total</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return getStatusBadge(teacher.status);
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="h-3 w-3 mr-1" />
              {teacher.phone}
            </div>
            {teacher.address && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {teacher.address}
              </div>
            )}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const teacher = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewTeacher(teacher.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditTeacher(teacher.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Teacher
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setDeleteTeacher(teacher)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Teacher
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

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
      <PageHeader
        title="Teachers"
        actions={
          <>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>

            <Button asChild>
              <Link href="/dashboard/sunday-school/teachers/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          icon={Users}
          description={`${stats.activeTeachers} active`}
        />
        <StatCard
          title="Active Teachers"
          value={stats.activeTeachers}
          icon={UserCheck}
          accent="success"
          description={`${stats.totalTeachers > 0 ? Math.round((stats.activeTeachers / stats.totalTeachers) * 100) : 0}% of total`}
        />
        <StatCard
          title="Total Classes"
          value={stats.totalClasses}
          icon={BookOpen}
          description="being taught"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          description="across all classes"
        />
        <StatCard
          title="Avg Class Size"
          value={stats.averageClassSize}
          icon={Calendar}
          description="students per class"
        />
        <StatCard
          title="Experience"
          value={teachers.length > 0 ? Math.round(teachers.reduce((sum, t) => sum + t.yearsOfService, 0) / teachers.length) : 0}
          icon={Award}
          description="avg years"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Teachers Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={TeacherStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={TeacherStatus.INACTIVE}>Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="classes">Classes</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredTeachers}
            recordLabel="teacher"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchKey="name"
            pagination={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTeacher} onOpenChange={() => setDeleteTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTeacher?.name}? This action cannot be undone.
              All class assignments will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTeacher && handleDeleteTeacher(deleteTeacher)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Teacher
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
