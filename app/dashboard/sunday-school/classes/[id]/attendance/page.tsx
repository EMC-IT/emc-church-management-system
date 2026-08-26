'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowLeft,
  Calendar as CalendarIcon,
  Save,
  Users,
  TrendingUp,
  Clock,
  Search,
  Download,
  Loader2,
  Check
} from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('take-attendance');
  
  // Take Attendance State
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [sessionNotes, setSessionNotes] = useState('');
  
  // History State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, historyResponse] = await Promise.all([
        sundaySchoolService.getClass(classId),
        sundaySchoolService.getClassStudents(classId),
        sundaySchoolService.getClassAttendance(classId, { limit: 100, sortBy: 'date', sortOrder: 'desc' })
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
        const initialRecords = new Map<string, AttendanceRecord>();
        studentsResponse.data.forEach(student => {
          initialRecords.set(student.id, {
            studentId: student.id,
            status: AttendanceStatus.PRESENT,
            notes: ''
          });
        });
        setAttendanceRecords(initialRecords);
      }
      
      if (historyResponse.success && historyResponse.data) {
        setAttendanceHistory(historyResponse.data);
      }
    } catch {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceRecords(prev => {
      const updated = new Map(prev);
      const existing = updated.get(studentId) || { studentId, status: AttendanceStatus.PRESENT };
      updated.set(studentId, { ...existing, status });
      return updated;
    });
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendanceRecords(prev => {
      const updated = new Map(prev);
      const existing = updated.get(studentId) || { studentId, status: AttendanceStatus.PRESENT };
      updated.set(studentId, { ...existing, notes });
      return updated;
    });
  };

  const handleMarkAllPresent = () => {
    setAttendanceRecords(prev => {
      const updated = new Map();
      students.forEach(student => {
        const existing = prev.get(student.id);
        updated.set(student.id, {
          studentId: student.id,
          status: AttendanceStatus.PRESENT,
          notes: existing?.notes || ''
        });
      });
      return updated;
    });
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = Array.from(attendanceRecords.values()).map(r => ({
        studentId: r.studentId,
        status: r.status,
        notes: r.notes || sessionNotes
      }));

      await sundaySchoolService.recordAttendance({
        classId,
        date: selectedDate,
        attendanceRecords: recordsToSave
      });
      toast.success('Attendance saved successfully');
      loadData();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleExportHistory = () => {
    const csvContent = 'Student,Date,Status,Notes\n' +
      attendanceHistory.map(r => `${r.studentName},${r.date},${r.status},${r.notes || ''}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${classData?.name || 'class'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Attendance exported');
  };

  const filteredHistory = attendanceHistory.filter(record => {
    const matchesSearch = record.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const presentCount = Array.from(attendanceRecords.values()).filter(r => r.status === AttendanceStatus.PRESENT).length;
  const absentCount = Array.from(attendanceRecords.values()).filter(r => r.status === AttendanceStatus.ABSENT).length;
  const totalCount = students.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/sunday-school/classes/${classId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Class Attendance</h1>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleExportHistory}>
          <Download className="mr-1.5 h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={totalCount} icon={Users} />
        <StatCard title="Marked Present" value={presentCount} icon={Check} />
        <StatCard title="Marked Absent" value={absentCount} icon={Clock} />
        <StatCard
          title="Attendance Rate"
          value={`${totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent p-0 gap-6">
          <TabsTrigger
            value="take-attendance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Take Attendance
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 text-sm font-medium"
          >
            Attendance History ({attendanceHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="take-attendance" className="space-y-6">
          <Card>
            <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold">Attendance Roster</CardTitle>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40 h-8 text-xs"
                />
              </div>

              <Button variant="outline" size="sm" onClick={handleMarkAllPresent}>
                <Check className="mr-1.5 h-3.5 w-3.5" />
                Mark All Present
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {students.map((student) => {
                  const record = attendanceRecords.get(student.id) || {
                    studentId: student.id,
                    status: AttendanceStatus.PRESENT
                  };

                  return (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                          {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {student.name}
                          </p>
                          <span className="text-xs text-muted-foreground">Age: {student.age}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Select
                          value={record.status}
                          onValueChange={(val) => handleStatusChange(student.id, val as AttendanceStatus)}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                            <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                            <SelectItem value={AttendanceStatus.EXCUSED}>Excused</SelectItem>
                            <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Note (optional)"
                          value={record.notes || ''}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                          className="w-full sm:w-44 h-8 text-xs"
                        />
                      </div>
                    </div>
                  );
                })}

                {students.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No students enrolled in this class.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="sessionNotes" className="text-xs">General Session Note</Label>
                  <Textarea
                    id="sessionNotes"
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Lesson coverage, memory verse, remarks..."
                    rows={2}
                    className="mt-1 text-xs"
                  />
                </div>

                <Button onClick={handleSaveAttendance} disabled={saving || students.length === 0}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Attendance Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 text-xs">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                    <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                    <SelectItem value={AttendanceStatus.EXCUSED}>Excused</SelectItem>
                    <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredHistory.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border text-xs"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{record.studentName}</p>
                      <span className="text-muted-foreground">
                        {new Date(record.date).toLocaleDateString()}
                        {record.notes ? ` • ${record.notes}` : ''}
                      </span>
                    </div>

                    <StatusBadge status={record.status.toLowerCase() as any} size="sm" />
                  </div>
                ))}

                {filteredHistory.length === 0 && (
                  <p className="text-center py-8 text-xs text-muted-foreground">
                    No attendance records found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}