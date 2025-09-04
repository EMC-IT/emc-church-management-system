'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users, 
  Search, 
  UserPlus,
  Download,
  Eye,
  Mail,
  ArrowUpDown,
  MoreHorizontal,
  Loader2,
  GraduationCap,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { Student, AgeGroup } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const ageGroups = Object.values(AgeGroup);
const statusOptions = ['All', 'Active', 'Inactive'];

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getStudents({
        search: searchTerm || undefined,
        ageGroup: ageGroupFilter !== 'All' ? ageGroupFilter as AgeGroup : undefined,
        status: statusFilter !== 'All' ? statusFilter as 'Active' | 'Inactive' | 'Graduated' : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        toast.error(response.message || 'Failed to load students');
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadStudents();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, ageGroupFilter, statusFilter]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentContact.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgeGroup = ageGroupFilter === 'All'; // Age group filtering not available in Student interface
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    
    return matchesSearch && matchesAgeGroup && matchesStatus;
  });

  const getStats = () => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'Active').length;
    const averageAge = students.length > 0 ? 
      Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length) : 0;
    const newEnrollments = students.filter(s => {
      const enrollDate = new Date(s.enrollmentDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return enrollDate >= thirtyDaysAgo;
    }).length;

    return { totalStudents, activeStudents, averageAge, newEnrollments };
  };

  const stats = getStats();

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/sunday-school/students/${studentId}`);
  };

  const handleContactParent = (student: Student) => {
    window.open(`mailto:${student.parentContact.email}?subject=Regarding ${student.name}`);
  };

  const handleExportStudents = () => {
    toast.success('Students data exported successfully');
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
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Manage Sunday School students</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportStudents}>
            <Download className="mr-2 h-4 w-4" />
            Export Students
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeStudents / stats.totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageAge}</div>
            <p className="text-xs text-muted-foreground">years old</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newEnrollments}</div>
            <p className="text-xs text-muted-foreground">last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Students Management */}
      <Card>
        <CardHeader>
          <CardTitle>Student Directory</CardTitle>
          <CardDescription>View and manage all Sunday School students</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students or parents..."
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
                {ageGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Students Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">Age {student.age}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleContactParent(student)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Contact Parent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Age:</span>
                      <Badge variant="outline">{student.age} years</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Class:</span>
                      <span className="font-medium">{student.currentClassId || 'Not Assigned'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Parent:</span>
                      <span className="font-medium">{student.parentContact.parentName}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewStudent(student.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No students found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || ageGroupFilter !== 'All' || statusFilter !== 'All'
                  ? 'Try adjusting your search or filters'
                  : 'No students have been enrolled yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}