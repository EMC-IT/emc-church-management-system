'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  ArrowLeft,
  Search,
  UserPlus,
  MoreHorizontal,
  UserMinus,
  Eye,
  Mail,
  Phone,
  Calendar,
  Users,
  TrendingUp,
  Loader2
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
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    if (classId) {
      loadClassData();
      loadStudents();
    }
  }, [classId]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadClassData = async () => {
    try {
      const response = await sundaySchoolService.getClass(classId);
      if (response.success && response.data) {
        setClassData(response.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
      }
    } catch (error) {
      toast.error('Failed to load class data');
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getClassStudents(classId);
      
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

  const filterStudents = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.parentContact.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.age.toString().includes(searchTerm)
    );
    
    setFilteredStudents(filtered);
  };

  const handleBack = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  const handleAddStudents = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/students/add`);
  };

  const handleViewStudent = (studentId: string) => {
    router.push(`/dashboard/sunday-school/students/${studentId}`);
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
    } catch (error) {
      toast.error('Failed to remove student');
    } finally {
      setRemoving(false);
      setStudentToRemove(null);
    }
  };

  const getAttendanceRate = (student: Student) => {
    // Mock calculation - in real app, this would come from attendance data
    return Math.floor(Math.random() * 30) + 70; // 70-100%
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
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Class Students</h1>
              <p className="text-muted-foreground">
                {classData?.name} - {students.length} students enrolled
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleAddStudents} className="bg-brand-primary hover:bg-brand-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Students
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
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              of {classData?.maxStudents} maximum
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
              {classData ? Math.round((students.length / classData.maxStudents) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Class utilization
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0 
                ? Math.round(students.reduce((sum, s) => sum + s.age, 0) / students.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Years old
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Spots</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classData ? classData.maxStudents - students.length : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Remaining capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Students Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                Manage students enrolled in this class
              </CardDescription>
            </div>
          </div>
          
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              {students.length === 0 ? (
                <>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No students enrolled</h3>
                  <p className="text-muted-foreground mb-6">
                    Add students to this class to get started
                  </p>
                  <Button onClick={handleAddStudents}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Students
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No students found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const attendanceRate = getAttendanceRate(student);
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{student.name}</h4>
                          <Badge variant="outline">Age {student.age}</Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{student.parentContact.email}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{student.parentContact.phone}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">Parent:</span>
                          <span className="text-sm font-medium">{student.parentContact.parentName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Attendance</div>
                        <div className={`text-sm ${getAttendanceColor(attendanceRate)}`}>
                          {attendanceRate}%
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewStudent(student.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setStudentToRemove(student)}
                            className="text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove from Class
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={!!studentToRemove} onOpenChange={() => setStudentToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {studentToRemove?.name} from this class?
              This will not delete the student record, but they will no longer be enrolled in this class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removing}
            >
              {removing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}