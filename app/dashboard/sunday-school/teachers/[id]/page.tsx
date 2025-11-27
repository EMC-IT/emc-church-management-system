'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Users,
  BookOpen,
  Calendar,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  UserMinus,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { sundaySchoolService } from '@/services';
import { Teacher, SundaySchoolClass, Student, ClassAttendance, TeacherStatus, AttendanceStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

interface ClassWithStats extends SundaySchoolClass {
  studentCount: number;
  attendanceRate: number;
  lastSession: string;
}

interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  averageAttendance: number;
  yearsOfService: number;
  totalSessions: number;
  activeClasses: number;
}

interface AttendanceData {
  date: string;
  rate: number;
  present: number;
  total: number;
}

// Chart configuration
const attendanceRateConfig = {
  rate: { label: 'Attendance Rate', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export default function TeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    yearsOfService: 0,
    totalSessions: 0,
    activeClasses: 0
  });
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('3months');
  const [showRemoveDialog, setShowRemoveDialog] = useState<SundaySchoolClass | null>(null);

  useEffect(() => {
    if (teacherId) {
      loadData();
    }
  }, [teacherId]);

  useEffect(() => {
    if (classes.length > 0) {
      loadAttendanceData();
    }
  }, [classes, timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load teacher data
      const teacherResponse = await sundaySchoolService.getTeacher(teacherId);
      if (teacherResponse.success && teacherResponse.data) {
        setTeacher(teacherResponse.data);
      } else {
        toast.error('Teacher not found');
        router.push('/dashboard/sunday-school/teachers');
        return;
      }
      
      // Load teacher's classes
      const classesResponse = await sundaySchoolService.getTeacherClasses(teacherId);
      if (classesResponse.success && classesResponse.data) {
        const classesWithStats = await Promise.all(
          classesResponse.data.map(async (classData) => {
            // Get student count
            const studentsResponse = await sundaySchoolService.getClassStudents(classData.id);
            const studentCount = studentsResponse.success ? studentsResponse.data?.length || 0 : 0;
            
            // Get attendance data for rate calculation
            const attendanceResponse = await sundaySchoolService.getClassAttendance(classData.id, {
              limit: 50,
              sortBy: 'date',
              sortOrder: 'desc'
            });
            
            let attendanceRate = 0;
            let lastSession = 'No sessions yet';
            
            if (attendanceResponse.success && attendanceResponse.data && attendanceResponse.data.length > 0) {
              const records = attendanceResponse.data;
              const presentCount = records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
              attendanceRate = Math.round((presentCount / records.length) * 100);
              
              // Get last session date
              const lastRecord = records[0];
              lastSession = new Date(lastRecord.date).toLocaleDateString();
            }
            
            return {
              ...classData,
              studentCount,
              attendanceRate,
              lastSession
            };
          })
        );
        
        setClasses(classesWithStats);
        calculateStats(classesWithStats, teacherResponse.data);
      }
      
    } catch (error) {
      toast.error('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (classesData: ClassWithStats[], teacherData: Teacher) => {
    const totalClasses = classesData.length;
    const activeClasses = classesData.filter(c => c.status === 'Active').length;
    const totalStudents = classesData.reduce((sum, c) => sum + c.studentCount, 0);
    const averageAttendance = classesData.length > 0 
      ? Math.round(classesData.reduce((sum, c) => sum + c.attendanceRate, 0) / classesData.length)
      : 0;
    
    const yearsOfService = teacherData.joinDate 
      ? Math.floor((new Date().getTime() - new Date(teacherData.joinDate).getTime()) / (1000 * 60 * 60 * 24 * 365))
      : 0;
    
    // Mock total sessions - would be calculated from actual data
    const totalSessions = classesData.length * 20; // Assuming ~20 sessions per class
    
    setStats({
      totalClasses,
      totalStudents,
      averageAttendance,
      yearsOfService,
      totalSessions,
      activeClasses
    });
  };

  const loadAttendanceData = async () => {
    try {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeRange) {
        case '1month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Aggregate attendance data from all classes
      const allAttendanceData: AttendanceData[] = [];
      
      for (const classData of classes) {
        const attendanceResponse = await sundaySchoolService.getClassAttendance(classData.id, {
          limit: 100,
          sortBy: 'date',
          sortOrder: 'desc'
        });
        
        if (attendanceResponse.success && attendanceResponse.data) {
          const filteredRecords = attendanceResponse.data.filter(
            record => new Date(record.date) >= cutoffDate
          );
          
          // Group by date
          const dateGroups = new Map<string, ClassAttendance[]>();
          filteredRecords.forEach(record => {
            const date = new Date(record.date).toISOString().split('T')[0];
            if (!dateGroups.has(date)) {
              dateGroups.set(date, []);
            }
            dateGroups.get(date)!.push(record);
          });
          
          // Process each date
          dateGroups.forEach((records, date) => {
            const present = records.filter(r => r.status === AttendanceStatus.PRESENT || r.status === AttendanceStatus.LATE).length;
            const total = records.length;
            const rate = total > 0 ? Math.round((present / total) * 100) : 0;
            
            const existingData = allAttendanceData.find(d => d.date === date);
            if (existingData) {
              existingData.present += present;
              existingData.total += total;
              existingData.rate = Math.round((existingData.present / existingData.total) * 100);
            } else {
              allAttendanceData.push({
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                rate,
                present,
                total
              });
            }
          });
        }
      }
      
      // Sort by date
      allAttendanceData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAttendanceData(allAttendanceData.slice(-20)); // Last 20 data points
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/sunday-school/teachers');
  };

  const handleEditTeacher = () => {
    router.push(`/dashboard/sunday-school/teachers/${teacherId}/edit`);
  };

  const handleViewClass = (classId: string) => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  const handleRemoveFromClass = async (classData: SundaySchoolClass) => {
    try {
      // In a real app, you would call an API to remove teacher from class
      // For now, we'll just show a success message
      toast.success(`Teacher removed from ${classData.name}`);
      loadData(); // Reload data
    } catch (error) {
      toast.error('Failed to remove teacher from class');
    } finally {
      setShowRemoveDialog(null);
    }
  };

  const getStatusBadge = (status: TeacherStatus) => {
    switch (status) {
      case TeacherStatus.ACTIVE:
        return <Badge className="bg-brand-success/10 text-brand-success border-brand-success/20">Active</Badge>;
      case TeacherStatus.INACTIVE:
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (rate: number) => {
    if (rate >= 85) return <TrendingUp className="h-4 w-4 text-brand-success" />;
    if (rate >= 70) return <Target className="h-4 w-4 text-brand-accent" />;
    return <TrendingDown className="h-4 w-4 text-destructive" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Teacher not found</h3>
        <p className="text-muted-foreground mb-4">The teacher you're looking for doesn't exist.</p>
        <Button onClick={handleBack}>Back to Teachers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={teacher.avatar} alt={teacher.name} />
              <AvatarFallback className="text-lg">
                {teacher.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{teacher.name}</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{teacher.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phone}</span>
                </div>
                {getStatusBadge(teacher.status)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          
          <Button onClick={handleEditTeacher}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeClasses} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              across all classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{stats.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              across all classes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.yearsOfService}</div>
            <p className="text-xs text-muted-foreground">
              years of service
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              taught
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Specialization</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {teacher.specializations && teacher.specializations.length > 0 ? 
                teacher.specializations[0] : 
                'General'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              area of focus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="classes">Assigned Classes</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Classes */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Classes</CardTitle>
                <CardDescription>
                  Classes taught by this teacher
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No classes assigned</h3>
                    <p className="text-muted-foreground">
                      This teacher is not currently assigned to any classes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classes.slice(0, 3).map((classData) => (
                      <div key={classData.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{classData.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {classData.studentCount} students • {classData.ageGroup}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-sm font-medium">{classData.attendanceRate}%</div>
                            <div className="text-xs text-muted-foreground">attendance</div>
                          </div>
                          {getTrendIcon(classData.attendanceRate)}
                        </div>
                      </div>
                    ))}
                    
                    {classes.length > 3 && (
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('classes')}>
                        View All Classes ({classes.length})
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card>
              <CardHeader>
                <CardTitle>Teacher Information</CardTitle>
                <CardDescription>
                  Personal and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{teacher.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{teacher.phone}</div>
                    </div>
                  </div>
                  

                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Start Date</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(teacher.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
              <CardDescription>
                All classes currently assigned to this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No classes assigned</h3>
                  <p className="text-muted-foreground">
                    This teacher is not currently assigned to any classes
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.map((classData) => (
                    <div key={classData.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-medium">{classData.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {classData.ageGroup} • {classData.studentCount} students • Last session: {classData.lastSession}
                          </p>
                          {classData.description && (
                            <p className="text-sm text-muted-foreground mt-1">{classData.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold">{classData.attendanceRate}%</span>
                            {getTrendIcon(classData.attendanceRate)}
                          </div>
                          <div className="w-24">
                            <Progress value={classData.attendanceRate} className="h-2" />
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewClass(classData.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Class
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setShowRemoveDialog(classData)}
                              className="text-destructive"
                            >
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove from Class
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Performance Analytics</h3>
              <p className="text-muted-foreground">Attendance trends and teaching effectiveness</p>
            </div>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trends</CardTitle>
              <CardDescription>
                Student attendance rates across all classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceData.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No attendance data</h3>
                  <p className="text-muted-foreground">
                    Start taking attendance to see performance trends
                  </p>
                </div>
              ) : (
                <ChartContainer config={attendanceRateConfig} className="h-64 w-full">
                  <LineChart data={attendanceData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="line" />} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                  </LineChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Qualifications */}
            <Card>
              <CardHeader>
                <CardTitle>Qualifications & Experience</CardTitle>
                <CardDescription>
                  Educational background and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teacher.qualifications && teacher.qualifications.length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2">Qualifications</h4>
                    <div className="flex flex-wrap gap-2">
                      {teacher.qualifications.map((qualification, index) => (
                        <Badge key={index} variant="secondary">
                          {qualification}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No qualifications listed</p>
                )}
                
                {teacher.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground">{teacher.experience}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium mb-2">Specialization</h4>
                  <p className="text-sm text-muted-foreground">
                    {teacher.specializations && teacher.specializations.length > 0 ? 
                  teacher.specializations[0] : 
                  'General Teaching'
                }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Notes and other details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  {getStatusBadge(teacher.status)}
                </div>
                


              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Remove from Class Dialog */}
      <AlertDialog open={!!showRemoveDialog} onOpenChange={() => setShowRemoveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {teacher.name} from {showRemoveDialog?.name}? 
              This will unassign the teacher from this class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showRemoveDialog && handleRemoveFromClass(showRemoveDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove from Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}