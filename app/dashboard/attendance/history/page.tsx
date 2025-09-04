'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DataTable } from '@/components/ui/data-table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  CalendarIcon,
  Users,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Eye,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';
import { attendanceService, MOCK_ATTENDANCE_RECORDS } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType, AttendanceSearchParams } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Extended mock data for history
const EXTENDED_ATTENDANCE_HISTORY = [
  ...MOCK_ATTENDANCE_RECORDS,
  {
    id: 'att_006',
    memberId: 'mem_006',
    member: {
      id: 'mem_006',
      name: 'Grace Asante',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
      phone: '+233 24 678 9012',
      department: 'Children Ministry',
      group: 'Women Fellowship'
    },
    serviceType: 'Sunday Service' as ServiceType,
    serviceDate: '2024-01-14',
    status: AttendanceStatus.PRESENT,
    checkInTime: '08:50',
    recordedBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-14T08:50:00Z'
  },
  {
    id: 'att_007',
    memberId: 'mem_007',
    member: {
      id: 'mem_007',
      name: 'Emmanuel Osei',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
      phone: '+233 24 789 0123',
      department: 'Media Ministry',
      group: 'Youth Group'
    },
    serviceType: 'Youth Service' as ServiceType,
    serviceDate: '2024-01-20',
    status: AttendanceStatus.LATE,
    checkInTime: '16:20',
    notes: 'Work commitment',
    recordedBy: 'admin_004',
    branch: 'Main Campus',
    createdAt: '2024-01-20T16:20:00Z'
  },
  {
    id: 'att_008',
    memberId: 'mem_008',
    member: {
      id: 'mem_008',
      name: 'Abena Mensah',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20middle%20aged%20african%20woman%20in%20church%20attire&image_size=square',
      phone: '+233 24 890 1234',
      department: 'Music Ministry',
      group: 'Choir'
    },
    serviceType: 'Bible Study' as ServiceType,
    serviceDate: '2024-01-17',
    status: AttendanceStatus.ABSENT,
    recordedBy: 'admin_002',
    branch: 'Main Campus',
    createdAt: '2024-01-17T18:30:00Z'
  },
  {
    id: 'att_009',
    memberId: 'mem_001',
    member: {
      id: 'mem_001',
      name: 'John Doe',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20man%20in%20church%20attire&image_size=square',
      phone: '+233 24 123 4567',
      department: 'Media Ministry',
      group: 'Youth Group'
    },
    serviceType: 'Prayer Meeting' as ServiceType,
    serviceDate: '2024-01-19',
    status: AttendanceStatus.PRESENT,
    checkInTime: '06:05',
    recordedBy: 'admin_003',
    branch: 'Main Campus',
    createdAt: '2024-01-19T06:05:00Z'
  },
  {
    id: 'att_010',
    memberId: 'mem_002',
    member: {
      id: 'mem_002',
      name: 'Jane Smith',
      avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20of%20a%20young%20african%20woman%20in%20church%20attire&image_size=square',
      phone: '+233 24 234 5678',
      department: 'Children Ministry',
      group: 'Women Fellowship'
    },
    serviceType: 'Sunday Service' as ServiceType,
    serviceDate: '2024-01-07',
    status: AttendanceStatus.EXCUSED,
    notes: 'Family emergency',
    recordedBy: 'admin_001',
    branch: 'Main Campus',
    createdAt: '2024-01-07T09:00:00Z'
  }
];



const attendanceColumns = [
  {
    accessorKey: 'member.name',
    header: 'Member',
    cell: ({ row }: any) => {
      const member = row.original.member;
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-brand-primary">
              {member.name.split(' ').map((n: string) => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="font-medium">{member.name}</div>
            <div className="text-sm text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'serviceType',
    header: 'Service Type',
    cell: ({ row }: any) => (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {row.getValue('serviceType')}
      </Badge>
    )
  },
  {
    accessorKey: 'serviceDate',
    header: 'Date',
    cell: ({ row }: any) => {
      const date = new Date(row.getValue('serviceDate'));
      return (
        <div>
          <div className="font-medium">{format(date, 'MMM dd, yyyy')}</div>
          <div className="text-sm text-muted-foreground">{format(date, 'EEEE')}</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'checkInTime',
    header: 'Check In',
    cell: ({ row }: any) => {
      const checkInTime = row.getValue('checkInTime');
      return checkInTime ? (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span>{checkInTime}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">N/A</span>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as AttendanceStatus;
      const statusConfig = {
        [AttendanceStatus.PRESENT]: { 
          label: 'Present', 
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: UserCheck
        },
        [AttendanceStatus.LATE]: { 
          label: 'Late', 
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock
        },
        [AttendanceStatus.ABSENT]: { 
          label: 'Absent', 
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: UserX
        },
        [AttendanceStatus.EXCUSED]: { 
          label: 'Excused', 
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: AlertCircle
        },
        [AttendanceStatus.PARTIAL]: { 
          label: 'Partial', 
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: Clock
        }
      };
      
      const config = statusConfig[status] || statusConfig[AttendanceStatus.ABSENT];
      const Icon = config.icon;
      
      return (
        <Badge variant="outline" className={config.className}>
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }: any) => {
      const notes = row.getValue('notes');
      return notes ? (
        <span className="text-sm text-muted-foreground truncate max-w-32" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    }
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const record = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(`/dashboard/members/${record.memberId}`, '_blank')}>
              <Eye className="mr-2 h-4 w-4" />
              View Member
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];

export default function AttendanceHistoryPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [attendanceData, setAttendanceData] = useState(EXTENDED_ATTENDANCE_HISTORY);
  const [activeTab, setActiveTab] = useState('all');

  // Filter data based on current filters
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.member.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.member.group?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesService = selectedService === 'all' || record.serviceType === selectedService;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'all' || record.member.department === selectedDepartment;
    
    const recordDate = new Date(record.serviceDate);
    const matchesDateRange = recordDate >= dateRange.from && recordDate <= dateRange.to;
    
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'present' && record.status === AttendanceStatus.PRESENT) ||
                      (activeTab === 'absent' && record.status === AttendanceStatus.ABSENT) ||
                      (activeTab === 'late' && record.status === AttendanceStatus.LATE) ||
                      (activeTab === 'excused' && record.status === AttendanceStatus.EXCUSED);
    
    return matchesSearch && matchesService && matchesStatus && matchesDepartment && matchesDateRange && matchesTab;
  });

  // Calculate statistics
  const stats = {
    total: filteredData.length,
    present: filteredData.filter(r => r.status === AttendanceStatus.PRESENT).length,
    absent: filteredData.filter(r => r.status === AttendanceStatus.ABSENT).length,
    late: filteredData.filter(r => r.status === AttendanceStatus.LATE).length,
    excused: filteredData.filter(r => r.status === AttendanceStatus.EXCUSED).length
  };

  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const searchParams: AttendanceSearchParams = {
        search: searchTerm || undefined,
        serviceType: selectedService !== 'all' ? selectedService as ServiceType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus as AttendanceStatus : undefined,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd')
      };
      
      const response = await attendanceService.exportAttendanceData(searchParams);
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `attendance-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to refresh data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, fetch fresh data from API
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedService('all');
    setSelectedStatus('all');
    setSelectedDepartment('all');
    setDateRange({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    });
    setActiveTab('all');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
            <p className="text-muted-foreground mt-1">
              View and analyze past attendance records
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.present}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
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
                <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              </div>
              <UserX className="h-8 w-8 text-red-600" />
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                <SelectItem value="Bible Study">Bible Study</SelectItem>
                <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
                <SelectItem value="Youth Service">Youth Service</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={AttendanceStatus.PRESENT}>Present</SelectItem>
                <SelectItem value={AttendanceStatus.LATE}>Late</SelectItem>
                <SelectItem value={AttendanceStatus.ABSENT}>Absent</SelectItem>
                <SelectItem value={AttendanceStatus.EXCUSED}>Excused</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records ({filteredData.length})</CardTitle>
          <CardDescription>
            Historical attendance data with filtering and search
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="present" className="text-green-600">Present ({stats.present})</TabsTrigger>
              <TabsTrigger value="late" className="text-yellow-600">Late ({stats.late})</TabsTrigger>
              <TabsTrigger value="absent" className="text-red-600">Absent ({stats.absent})</TabsTrigger>
              <TabsTrigger value="excused" className="text-blue-600">Excused ({stats.excused})</TabsTrigger>
            </TabsList>
          </Tabs>

          <DataTable
            columns={attendanceColumns}
            data={filteredData}
            searchKey="member.name"
            searchPlaceholder="Search members..."
          />
        </CardContent>
      </Card>
    </div>
  );
}