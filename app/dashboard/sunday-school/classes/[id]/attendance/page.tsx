'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  ArrowLeft,
  ClipboardList,
  Calendar as CalendarIcon,
  Save,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, Student, ClassAttendance, AttendanceStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export default function ClassAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;
  
  const [classData, setClassData] = useState<SundaySchoolClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<ClassAttendance[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ClassAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('take-attendance');
  
  // Take Attendance State
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [sessionNotes, setSessionNotes] = useState('');
  
  // History State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  useEffect(() => {
    filterAttendanceHistory();
  }, [attendanceHistory, searchTerm, statusFilter, dateFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load class data
      const classResponse = await sundaySchoolService.getClass(classId);
      if (classResponse.success && classResponse.data) {
        setClassData(classResponse.data);
      } else {
        toast.error('Class not found');
        router.push('/dashboard/sunday-school/classes');
        return;
      }
      
      // Load students
      const studentsResponse = await sundaySchoolService.getClassStudents(classId);
      if (studentsResponse.success && studentsResponse.data) {
        setStudents(studentsResponse.data);
        
        // Initialize attendance records for today
        const initialRecords = new Map<string, AttendanceRecord>();
        studentsResponse.data.forEach(student => {
          initialRecords.set(student.id, {
            studentId: student.id,
            status: AttendanceStatus.ABSENT,
            notes: ''
          });
        });
        setAttendanceRecords(initialRecords);
      }
      
      // Load attendance history
      const historyResponse = await sundaySchoolService.getClassAttendance(classId, {
        limit: 100,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      if (historyResponse.success && historyResponse.data) {
        setAttendanceHistory(historyResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterAttendanceHistory = () => {
    let filtered = [...attendanceHistory];

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(record =>
        record.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(record => 
            new Date(record.date) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(record => 
            new Date(record.date) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(record => 
            new Date(record.date) >= filterDate
          );
          break;
      }
    }

    setFilteredHistory(filtered);
  };

  const handleBack = () => {
    router.push(`/dashboard/sunday-school/classes/${classId}`);
  };

  const updateAttendance = (studentId: string, status: AttendanceStatus, notes?: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, {
      studentId,
      status,
      notes: notes || ''
    });
    setAttendanceRecords(newRecords);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    
    try {
      const attendanceData = Array.from(attendanceRecords.values()).map(record => ({
        ...record,
        date: selectedDate.toISOString(),
        classId,
        sessionNotes
      }));
      
      const response = await sundaySchoolService.recordAttendance({
        classId,
        date: selectedDate.toISOString(),
        attendanceRecords: attendanceData
      });
      
      if (response.success) {
        toast.success('Attendance recorded successfully');
        // Reload attendance history
        loadData();
        // Reset form
        setSessionNotes('');
        setSelectedDate(new Date());
      } else {
        toast.error(response.message || 'Failed to record attendance');
      }
    } catch (error) {
      toast.error('Failed to record attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = filteredHistory.length;
    const present = filteredHistory.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent = filteredHistory.filter(r => r.status === AttendanceStatus.ABSENT).length;
    const late = filteredHistory.filter(r => r.status === AttendanceStatus.LATE).length;
    const excused = filteredHistory.filter(r => r.status === AttendanceStatus.EXCUSED).length;
    
    return { total, present, absent, late, excused };
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'bg-brand-success';
      case AttendanceStatus.LATE: return 'bg-brand-accent';
      case AttendanceStatus.EXCUSED: return 'bg-brand-secondary';
      case AttendanceStatus.ABSENT: return 'bg-destructive';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return <CheckCircle className="h-4 w-4" />;
      case AttendanceStatus.LATE: return <Clock className="h-4 w-4" />;
      case AttendanceStatus.EXCUSED: return <AlertCircle className="h-4 w-4" />;
      case AttendanceStatus.ABSENT: return <XCircle className="h-4 w-4" />;
      default: return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const stats = getAttendanceStats();

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
              <h1 className="text-3xl font-bold tracking-tight">Class Attendance</h1>
              <p className="text-muted-foreground">
                {classData?.name} - Track and manage attendance
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Records
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              attendance entries
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              including late arrivals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="take-attendance">Take Attendance</TabsTrigger>
          <TabsTrigger value="history">Attendance History</TabsTrigger>
        </TabsList>

        <TabsContent value="take-attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5" />
                <span>Record Attendance</span>
              </CardTitle>
              <CardDescription>
                Mark attendance for students in this class
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Label>Session Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Students Attendance */}
              <div className="space-y-4">
                <h4 className="font-medium">Students ({students.length})</h4>
                
                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No students enrolled</h3>
                    <p className="text-muted-foreground">
                      Add students to this class to start taking attendance
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => {
                      const record = attendanceRecords.get(student.id);
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                          
                          <div className="flex items-center space-x-2">
                            {Object.values(AttendanceStatus).map((status) => (
                              <Button
                                key={status}
                                variant={record?.status === status ? "default" : "outline"}
                                size="sm"
                                className={record?.status === status ? getStatusColor(status) : ''}
                                onClick={() => updateAttendance(student.id, status)}
                              >
                                {getStatusIcon(status)}
                                <span className="ml-1 hidden sm:inline">{status}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Session Notes */}
              <div className="space-y-2">
                <Label htmlFor="sessionNotes">Session Notes (Optional)</Label>
                <Textarea
                  id="sessionNotes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Add any notes about this session..."
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveAttendance}
                  disabled={saving || students.length === 0}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance History</CardTitle>
              <CardDescription>
                View and filter past attendance records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(AttendanceStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* History List */}
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No attendance records found</h3>
                  <p className="text-muted-foreground">
                    {attendanceHistory.length === 0 
                      ? 'Start taking attendance to see records here'
                      : 'Try adjusting your search filters'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map((record) => (
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
                            {format(new Date(record.date), 'PPP')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusIcon(record.status)}
                          <span className="ml-1">{record.status}</span>
                        </Badge>
                        {record.notes && (
                          <div className="text-xs text-muted-foreground max-w-xs truncate">
                            {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}