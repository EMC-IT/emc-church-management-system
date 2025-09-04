'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  School,
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  UserCheck,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Loader2,
  GraduationCap,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, AgeGroup, ClassStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const ageGroups = Object.values(AgeGroup);
const statusOptions = Object.values(ClassStatus);

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClasses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, ageGroupFilter, statusFilter]);

  const loadClasses = async () => {
    try {
      const response = await sundaySchoolService.getClasses({
        search: searchTerm || undefined,
        ageGroup: ageGroupFilter !== 'All' ? ageGroupFilter as AgeGroup : undefined,
        status: statusFilter !== 'All' ? statusFilter as ClassStatus : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast.error(response.message || 'Failed to load classes');
      }
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewClass = (classId: string) => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  const handleEditClass = (classId: string) => {
    router.push(`/dashboard/sunday-school/classes/${classId}/edit`);
  };

  const handleTakeAttendance = (classId: string) => {
    router.push(`/dashboard/sunday-school/classes/${classId}/attendance`);
  };

  const handleManageStudents = (classId: string) => {
    router.push(`/dashboard/sunday-school/classes/${classId}/students`);
  };

  const getStatusColor = (status: ClassStatus) => {
    switch (status) {
      case ClassStatus.ACTIVE:
        return 'bg-brand-success';
      case ClassStatus.INACTIVE:
        return 'bg-yellow-500';
      case ClassStatus.SUSPENDED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-brand-success';
    if (rate >= 75) return 'text-brand-secondary';
    return 'text-destructive';
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage Sunday School classes and schedules</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Classes
          </Button>
          <Button 
            className="bg-brand-primary hover:bg-brand-primary/90"
            asChild
          >
            <Link href="/dashboard/sunday-school/classes/add">
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
            <p className="text-xs text-muted-foreground">
              {classes.filter(c => c.status === ClassStatus.ACTIVE).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classes.reduce((sum, cls) => sum + cls.students, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(classes.map(c => c.teacher.id)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique teachers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (classes.reduce((sum, cls) => sum + cls.students, 0) /
                classes.reduce((sum, cls) => sum + cls.maxStudents, 0)) * 100
              ) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Classes */}
      <Card>
        <CardHeader>
          <CardTitle>Class Management</CardTitle>
          <CardDescription>View and manage all Sunday School classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Age Groups</SelectItem>
                {ageGroups.map((ageGroup) => (
                  <SelectItem key={ageGroup} value={ageGroup}>
                    {ageGroup}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <Badge variant="outline">{cls.ageGroup}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewClass(cls.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClass(cls.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Class
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleManageStudents(cls.id)}>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Students
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTakeAttendance(cls.id)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Take Attendance
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{cls.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Students</span>
                      <span className="font-medium">{cls.students} / {cls.maxStudents}</span>
                    </div>
                    <Progress value={(cls.students / cls.maxStudents) * 100} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.schedule.dayOfWeek} {cls.schedule.startTime} - {cls.schedule.endTime}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{cls.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {cls.teacher.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{cls.teacher.name}</span>
                    </div>
                    
                    <Badge 
                      variant={cls.status === ClassStatus.ACTIVE ? 'default' : 'secondary'}
                      className={cls.status === ClassStatus.ACTIVE ? getStatusColor(cls.status) : ''}
                    >
                      {cls.status}
                    </Badge>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => handleTakeAttendance(cls.id)}
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Take Attendance
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-12">
              <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No classes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || ageGroupFilter !== 'All' || statusFilter !== 'All'
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first Sunday School class'}
              </p>
              {!searchTerm && ageGroupFilter === 'All' && statusFilter === 'All' && (
                <Button asChild>
                  <Link href="/dashboard/sunday-school/classes/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Class
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}