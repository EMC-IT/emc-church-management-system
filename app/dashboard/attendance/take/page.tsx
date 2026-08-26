'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Clock, 
  Save, 
  Search,
  CalendarIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceService } from '@/services/attendance-service';
import { AttendanceStatus } from '@/lib/types';

// Mock members data for selection
const MOCK_MEMBERS = [
  {
    id: 'mem_001',
    name: 'John Doe',
    phone: '+233 24 123 4567',
    department: 'Media Ministry',
    group: 'Youth Group',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_002',
    name: 'Jane Smith',
    phone: '+233 24 234 5678',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_003',
    name: 'Michael Johnson',
    phone: '+233 24 345 6789',
    department: 'Ushering',
    group: 'Men Fellowship',
    status: AttendanceStatus.LATE
  },
  {
    id: 'mem_004',
    name: 'Sarah Wilson',
    phone: '+233 24 456 7890',
    department: 'Music Ministry',
    group: 'Choir',
    status: AttendanceStatus.EXCUSED
  },
  {
    id: 'mem_005',
    name: 'David Brown',
    phone: '+233 24 567 8901',
    department: 'Security',
    group: 'Men Fellowship',
    status: AttendanceStatus.ABSENT
  },
  {
    id: 'mem_006',
    name: 'Grace Asante',
    phone: '+233 24 678 9012',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_007',
    name: 'Emmanuel Osei',
    phone: '+233 24 789 0123',
    department: 'Media Ministry',
    group: 'Youth Group',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_008',
    name: 'Abena Mensah',
    phone: '+233 24 890 1234',
    department: 'Music Ministry',
    group: 'Choir',
    status: AttendanceStatus.LATE
  }
];

const attendanceFormSchema = z.object({
  serviceType: z.string().min(1, 'Service type is required'),
  serviceDate: z.date({ required_error: 'Service date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  expectedAttendees: z.number().optional(),
  notes: z.string().optional()
});

type AttendanceFormValues = z.infer<typeof attendanceFormSchema>;

export default function TakeAttendancePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [members, setMembers] = useState(MOCK_MEMBERS);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      serviceType: 'Sunday Service',
      serviceDate: new Date(),
      startTime: '09:00',
      endTime: '11:30',
      location: 'Main Sanctuary',
      expectedAttendees: 450,
      notes: ''
    }
  });

  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      setCurrentStep(2);
      toast.success('Session created. Please mark attendance for attendees.');
    } catch {
      toast.error('Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberStatusChange = (memberId: string, status: AttendanceStatus) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, status } : member
    ));
  };

  const handleBulkStatusChange = (status: AttendanceStatus) => {
    if (selectedMembers.length === 0) return;
    setMembers(prev => prev.map(member => 
      selectedMembers.includes(member.id) ? { ...member, status } : member
    ));
    setSelectedMembers([]);
    toast.success(`Updated ${selectedMembers.length} members`);
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSubmitAttendance = async () => {
    setIsLoading(true);
    try {
      await attendanceService.bulkMarkAttendance({
        sessionId: 'session_001',
        attendances: members.map(m => ({
          memberId: m.id,
          status: m.status
        }))
      });
      toast.success('Attendance submitted successfully');
      router.push('/dashboard/attendance');
    } catch {
      toast.error('Failed to submit attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.phone.includes(searchTerm);
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesGroup = selectedGroup === 'all' || member.group === selectedGroup;
    return matchesSearch && matchesDepartment && matchesGroup;
  });

  const attendanceStats = {
    total: members.length,
    present: members.filter(m => m.status === AttendanceStatus.PRESENT).length,
    late: members.filter(m => m.status === AttendanceStatus.LATE).length,
    absent: members.filter(m => m.status === AttendanceStatus.ABSENT).length,
    excused: members.filter(m => m.status === AttendanceStatus.EXCUSED).length
  };

  const attendanceRate = Math.round(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/attendance')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Take Attendance</h1>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-3 mb-6">
        <div className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold",
          currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className={cn(
          "h-0.5 w-12",
          currentStep >= 2 ? "bg-primary" : "bg-border"
        )} />
        <div className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold",
          currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      {/* Step 1: Service Details */}
      {currentStep === 1 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                            <SelectItem value="Bible Study">Bible Study</SelectItem>
                            <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                            <SelectItem value="Youth Service">Youth Service</SelectItem>
                            <SelectItem value="Special Service">Special Service</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serviceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time (Optional)</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Sanctuary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Attendees</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="450" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional service notes..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Continue to Attendance'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Mark Attendance */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Attendance Stats Cards */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="text-xl font-bold mt-0.5">{attendanceStats.total}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Present</div>
              <div className="text-xl font-bold text-primary mt-0.5">{attendanceStats.present}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Late</div>
              <div className="text-xl font-bold mt-0.5">{attendanceStats.late}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Absent</div>
              <div className="text-xl font-bold mt-0.5">{attendanceStats.absent}</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Rate</div>
              <div className="text-xl font-bold text-primary mt-0.5">{attendanceRate}%</div>
            </Card>
          </div>

          {/* Filters and Bulk Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Media Ministry">Media Ministry</SelectItem>
                      <SelectItem value="Music Ministry">Music Ministry</SelectItem>
                      <SelectItem value="Children Ministry">Children Ministry</SelectItem>
                      <SelectItem value="Ushering">Ushering</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Groups</SelectItem>
                      <SelectItem value="Youth Group">Youth Group</SelectItem>
                      <SelectItem value="Women Fellowship">Women Fellowship</SelectItem>
                      <SelectItem value="Men Fellowship">Men Fellowship</SelectItem>
                      <SelectItem value="Choir">Choir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedMembers.length > 0 && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange(AttendanceStatus.PRESENT)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1 text-primary" />
                      Mark Present ({selectedMembers.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange(AttendanceStatus.ABSENT)}
                    >
                      <XCircle className="h-4 w-4 mr-1 text-muted-foreground" />
                      Mark Absent ({selectedMembers.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Members ({filteredMembers.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-muted/30 px-2 rounded-md transition-colors">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberSelect(member.id)}
                      />
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.department} • {member.group}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={member.status} size="sm" />
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.PRESENT ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.PRESENT)}
                          className="h-7 w-7 p-0"
                          title="Mark Present"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.LATE ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.LATE)}
                          className="h-7 w-7 p-0"
                          title="Mark Late"
                        >
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.EXCUSED ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.EXCUSED)}
                          className="h-7 w-7 p-0"
                          title="Mark Excused"
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.ABSENT ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.ABSENT)}
                          className="h-7 w-7 p-0"
                          title="Mark Absent"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" onClick={() => setCurrentStep(1)} size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>
            <Button 
              onClick={handleSubmitAttendance} 
              disabled={isLoading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isLoading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}