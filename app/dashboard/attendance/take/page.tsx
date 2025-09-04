'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Save, 
  Search,
  CalendarIcon,
  MapPin,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceService } from '@/services/attendance-service';
import membersService from '@/services/members-service';
import { AttendanceStatus, ServiceType, AttendanceFormData, BulkAttendanceData } from '@/lib/types';

// Mock members data for selection
const MOCK_MEMBERS = [
  {
    id: 'mem_001',
    name: 'John Doe',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 123 4567',
    department: 'Media Ministry',
    group: 'Youth Group',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_002',
    name: 'Jane Smith',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 234 5678',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_003',
    name: 'Michael Johnson',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 345 6789',
    department: 'Ushering',
    group: 'Men Fellowship',
    status: AttendanceStatus.LATE
  },
  {
    id: 'mem_004',
    name: 'Sarah Wilson',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 456 7890',
    department: 'Music Ministry',
    group: 'Choir',
    status: AttendanceStatus.EXCUSED
  },
  {
    id: 'mem_005',
    name: 'David Brown',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 567 8901',
    department: 'Security',
    group: 'Men Fellowship',
    status: AttendanceStatus.ABSENT
  },
  {
    id: 'mem_006',
    name: 'Grace Asante',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
    phone: '+233 24 678 9012',
    department: 'Children Ministry',
    group: 'Women Fellowship',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_007',
    name: 'Emmanuel Osei',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
    phone: '+233 24 789 0123',
    department: 'Media Ministry',
    group: 'Youth Group',
    status: AttendanceStatus.PRESENT
  },
  {
    id: 'mem_008',
    name: 'Abena Mensah',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20woman%20in%20church%20attire&image_size=square',
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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<AttendanceStatus | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      serviceType: 'Sunday Service',
      serviceDate: new Date(),
      startTime: '09:00',
      location: 'Main Auditorium',
      expectedAttendees: 450
    }
  });

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleCreateSession = async (data: AttendanceFormValues) => {
    setIsLoading(true);
    try {
      const sessionData: AttendanceFormData = {
        serviceType: data.serviceType as ServiceType,
        serviceDate: format(data.serviceDate, 'yyyy-MM-dd'),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        expectedAttendees: data.expectedAttendees,
        notes: data.notes
      };

      const response = await attendanceService.createAttendanceSession(sessionData);
      if (response.success && response.data) {
        setSessionId(response.data.id);
        setCurrentStep(2);
        toast.success('Attendance session created successfully!');
      } else {
        toast.error(response.message || 'Failed to create attendance session');
      }
    } catch (error) {
      toast.error('An error occurred while creating the session');
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
    if (selectedMembers.length === 0) {
      toast.error('Please select members first');
      return;
    }

    setMembers(prev => prev.map(member => 
      selectedMembers.includes(member.id) ? { ...member, status } : member
    ));
    setSelectedMembers([]);
    setBulkAction(null);
    toast.success(`Marked ${selectedMembers.length} members as ${status}`);
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
    if (!sessionId) {
      toast.error('No session created');
      return;
    }

    setIsLoading(true);
    try {
      const bulkData: BulkAttendanceData = {
        sessionId,
        attendances: members.map(member => ({
          memberId: member.id,
          status: member.status,
          checkInTime: member.status === AttendanceStatus.PRESENT || member.status === AttendanceStatus.LATE 
            ? format(new Date(), 'HH:mm') : undefined
        }))
      };

      const response = await attendanceService.bulkMarkAttendance(bulkData);
      if (response.success) {
        toast.success('Attendance submitted successfully!');
        router.push('/dashboard/attendance');
      } else {
        toast.error(response.message || 'Failed to submit attendance');
      }
    } catch (error) {
      toast.error('An error occurred while submitting attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case AttendanceStatus.LATE:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case AttendanceStatus.EXCUSED:
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'bg-green-100 text-green-800 border-green-200';
      case AttendanceStatus.LATE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case AttendanceStatus.ABSENT:
        return 'bg-red-100 text-red-800 border-red-200';
      case AttendanceStatus.EXCUSED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Take Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Record attendance for church service
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          currentStep >= 1 ? "bg-brand-primary text-white" : "bg-gray-200 text-gray-600"
        )}>
          1
        </div>
        <div className={cn(
          "h-1 w-16",
          currentStep >= 2 ? "bg-brand-primary" : "bg-gray-200"
        )} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          currentStep >= 2 ? "bg-brand-primary text-white" : "bg-gray-200 text-gray-600"
        )}>
          2
        </div>
        <div className={cn(
          "h-1 w-16",
          currentStep >= 3 ? "bg-brand-primary" : "bg-gray-200"
        )} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          currentStep >= 3 ? "bg-brand-primary text-white" : "bg-gray-200 text-gray-600"
        )}>
          3
        </div>
      </div>

      {/* Step 1: Service Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Set up the attendance session details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date("1900-01-01")
                              }
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
                          <Input placeholder="e.g., Main Auditorium" {...field} />
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
                          placeholder="Any additional notes about this service..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} className="bg-brand-primary hover:bg-brand-primary/90">
                    {isLoading ? 'Creating...' : 'Create Session & Continue'}
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
          {/* Attendance Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{attendanceStats.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Late</p>
                    <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rate</p>
                    <p className="text-2xl font-bold text-brand-primary">{attendanceRate}%</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand-primary">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Bulk Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full sm:w-48">
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
                    <SelectTrigger className="w-full sm:w-48">
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
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange(AttendanceStatus.PRESENT)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Mark Present ({selectedMembers.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkStatusChange(AttendanceStatus.ABSENT)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Mark Absent ({selectedMembers.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Members ({filteredMembers.length})</CardTitle>
                  <CardDescription>
                    Mark attendance for each member
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedMembers.length === filteredMembers.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleMemberSelect(member.id)}
                      />
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-brand-primary">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.department} • {member.group}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getStatusColor(member.status)}>
                        {getStatusIcon(member.status)}
                        <span className="ml-1 capitalize">{member.status}</span>
                      </Badge>
                      
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.PRESENT ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.PRESENT)}
                          className={member.status === AttendanceStatus.PRESENT ? "bg-green-600 hover:bg-green-700" : ""}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.LATE ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.LATE)}
                          className={member.status === AttendanceStatus.LATE ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.EXCUSED ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.EXCUSED)}
                          className={member.status === AttendanceStatus.EXCUSED ? "bg-blue-600 hover:bg-blue-700" : ""}
                        >
                          <AlertCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={member.status === AttendanceStatus.ABSENT ? "default" : "outline"}
                          onClick={() => handleMemberStatusChange(member.id, AttendanceStatus.ABSENT)}
                          className={member.status === AttendanceStatus.ABSENT ? "bg-red-600 hover:bg-red-700" : ""}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Details
            </Button>
            <Button 
              onClick={handleSubmitAttendance} 
              disabled={isLoading}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              {isLoading ? 'Submitting...' : 'Submit Attendance'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}