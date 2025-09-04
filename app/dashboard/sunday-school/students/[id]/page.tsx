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
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  TrendingUp,
  Award,
  MessageSquare,
  Loader2,
  User,
  BookOpen,
  Clock
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
      
      // Load student details
      const studentResponse = await sundaySchoolService.getStudent(studentId);
      if (studentResponse.success && studentResponse.data) {
        setStudent(studentResponse.data);
      } else {
        toast.error('Student not found');
        router.push('/dashboard/sunday-school/students');
        return;
      }
      
      // Load student attendance
      const attendanceResponse = await sundaySchoolService.getAttendance({ studentId });
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/sunday-school/students');
  };

  const handleContactParent = () => {
    if (student) {
      window.open(`mailto:${student.parentContact.email}?subject=Regarding ${student.name}`);
    }
  };

  const handleCallParent = () => {
    if (student) {
      window.open(`tel:${student.parentContact.phone}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Student Not Found</h2>
          <p className="text-muted-foreground mt-2">The student you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

  const getAttendanceStats = () => {
    const totalClasses = attendance.length;
    const attendedClasses = attendance.filter(a => a.status === 'Present').length;
    const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
    
    return { totalClasses, attendedClasses, attendanceRate };
  };

  const attendanceStats = getAttendanceStats();

  const getRecentAttendance = () => {
    return attendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'bg-brand-success';
      case 'Absent': return 'bg-destructive';
      case 'Late': return 'bg-brand-accent';
      case 'Excused': return 'bg-brand-secondary';
      default: return 'bg-gray-500';
    }
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
              <h1 className="text-3xl font-bold tracking-tight">{student.name}</h1>
              <p className="text-muted-foreground">Student Profile</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleContactParent}>
            <Mail className="mr-2 h-4 w-4" />
            Email Parent
          </Button>
          <Button variant="outline" onClick={handleCallParent}>
            <Phone className="mr-2 h-4 w-4" />
            Call Parent
          </Button>
        </div>
      </div>

      {/* Student Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{student.age}</div>
            <p className="text-xs text-muted-foreground">
              Born {new Date(student.dateOfBirth).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.attendedClasses} of {attendanceStats.totalClasses} classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Class</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{student.currentClassId || 'Not Assigned'}</div>
            <p className="text-xs text-muted-foreground">
              Age: {student.age} years old
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(student.enrollmentDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor((Date.now() - new Date(student.enrollmentDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Student Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={student.avatar} alt={student.name} />
                    <AvatarFallback className="text-lg">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{student.name}</h3>
                    <p className="text-muted-foreground">Age {student.age}</p>
                    <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">{new Date(student.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Age:</span>
                    <span className="text-sm">{student.age} years old</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Enrollment Date:</span>
                    <span className="text-sm">{new Date(student.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Parent Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold">{student.parentContact.parentName}</h4>
                  <p className="text-sm text-muted-foreground">{student.parentContact.relationship}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.parentContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{student.parentContact.phone}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleContactParent}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCallParent}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Class History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.classHistory.map((classRecord, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{classRecord.className}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(classRecord.startDate).toLocaleDateString()} - 
                        {classRecord.endDate ? new Date(classRecord.endDate).toLocaleDateString() : 'Present'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Class ID: {classRecord.classId}</p>
                      <p className="text-xs text-muted-foreground">
                        {classRecord.endDate ? 'Completed' : 'Current'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                Recent attendance records for {student.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getRecentAttendance().map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">Class ID: {record.classId}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(record.status)} text-white`}
                      >
                        {record.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Performance & Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Attendance Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Attendance</span>
                      <span>{attendanceStats.attendanceRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendanceStats.attendanceRate} className="h-2" />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-sm">{student.notes || 'No notes available'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Teacher Notes & Observations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {student.notes ? (
                  <div className="p-3 border rounded-lg">
                    <p className="text-sm">{student.notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notes available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}