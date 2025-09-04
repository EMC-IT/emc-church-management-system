'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
import Link from 'next/link';
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
      
      // Load class details
      const classResponse = await sundaySchoolService.getClass(classId);
      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      // Load class students
      const studentsResponse = await sundaySchoolService.getClassStudents(classId);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
      }
      
      // Load recent attendance
      const attendanceResponse = await sundaySchoolService.getClassAttendance(classId, {
        limit: 10,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      if (attendanceResponse.success && attendanceResponse.data) {
        setRecentAttendance(attendanceResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/sunday-school/classes');
  };

  const handleEdit = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/edit`);
  };

  const handleManageStudents = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/students`);
  };

  const handleTakeAttendance = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/attendance`);
  };

  const handleViewReports = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}/reports`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Class Not Found</h2>
          <p className="text-muted-foreground mt-2">The class you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-brand-success';
      case 'Inactive': return 'bg-yellow-500';
      case 'Archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getAttendanceRate = () => {
    if (recentAttendance.length === 0) return 0;
    const presentCount = recentAttendance.filter(a => a.status === 'Present').length;
    return Math.round((presentCount / recentAttendance.length) * 100);
  };

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
              <h1 className="text-3xl font-bold tracking-tight">{classData.name}</h1>
              <p className="text-muted-foreground">{classData.description}</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Class
          </Button>
          <Button onClick={handleTakeAttendance} className="bg-brand-primary hover:bg-brand-primary/90">
            <ClipboardList className="mr-2 h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Class Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              of {classData.maxStudents} maximum
            </p>
            <Progress 
              value={(students.length / classData.maxStudents) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAttendanceRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Last 10 sessions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age Group</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classData.ageGroup}</div>
            <p className="text-xs text-muted-foreground">
              Target age range
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(classData.status)}>
              {classData.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Current status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Recent Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Class Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Class Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {classData.schedule.dayOfWeek && classData.schedule.startTime && classData.schedule.endTime 
                        ? `${classData.schedule.dayOfWeek}s ${classData.schedule.startTime} - ${classData.schedule.endTime}`
                        : 'Schedule not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{classData.location}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">Curriculum</h4>
                    <p className="text-sm text-muted-foreground">{classData.curriculum}</p>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">Objectives</h4>
                    <p className="text-sm text-muted-foreground">{classData.objectives}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Teacher</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={classData.teacher.name} />
                    <AvatarFallback>
                      {classData.teacher.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium">{classData.teacher.name}</h3>
                      <p className="text-sm text-muted-foreground">Class Teacher</p>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{classData.teacher.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{classData.teacher.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for this class
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={handleManageStudents}
                >
                  <UserPlus className="h-6 w-6" />
                  <span>Manage Students</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={handleTakeAttendance}
                >
                  <ClipboardList className="h-6 w-6" />
                  <span>Take Attendance</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={handleViewReports}
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View Reports</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col space-y-2"
                  onClick={handleEdit}
                >
                  <Edit className="h-6 w-6" />
                  <span>Edit Class</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Class Students</CardTitle>
                <CardDescription>
                  {students.length} students enrolled in this class
                </CardDescription>
              </div>
              <Button onClick={handleManageStudents}>
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Students
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No students enrolled</h3>
                    <p className="text-muted-foreground mb-4">
                      Add students to this class to get started
                    </p>
                    <Button onClick={handleManageStudents}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Students
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.slice(0, 6).map((student) => (
                      <Card key={student.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-4">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={student.avatar} alt={student.name} />
                              <AvatarFallback>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{student.name}</h4>
                              <p className="text-sm text-muted-foreground">Age {student.age}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {students.length > 6 && (
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={handleManageStudents}>
                      View All {students.length} Students
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Attendance</CardTitle>
                <CardDescription>
                  Last 10 attendance records
                </CardDescription>
              </div>
              <Button onClick={handleTakeAttendance}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
            </CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No attendance records</h3>
                  <p className="text-muted-foreground mb-4">
                    Start taking attendance to track student participation
                  </p>
                  <Button onClick={handleTakeAttendance}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Take First Attendance
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAttendance.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {record.studentName?.split(' ').map(n => n[0]).join('') || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={record.status === 'Present' ? 'default' : 'secondary'}
                        className={record.status === 'Present' ? 'bg-brand-success' : ''}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <Button variant="outline" onClick={() => router.push(`/dashboard/sunday-school/classes/${classId}/attendance`)}>
                      View All Attendance Records
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}