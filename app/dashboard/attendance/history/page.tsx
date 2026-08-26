'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  CalendarIcon,
  Users,
  UserCheck,
  UserX,
  Clock,
  Eye,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
            <div className="text-xs text-muted-foreground">{member.department}</div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: 'serviceType',
    header: 'Service Type',
    cell: ({ row }: any) => (
      <Badge variant="neutral" size="sm">
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
          <div className="font-medium text-foreground">{format(date, 'MMM dd, yyyy')}</div>
          <div className="text-xs text-muted-foreground">{format(date, 'EEEE')}</div>
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
        <span className="text-sm text-muted-foreground">{checkInTime}</span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: any) => {
      const status = row.getValue('status') as AttendanceStatus;
      return <StatusBadge status={status} size="sm" />;
    }
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }: any) => {
      const notes = row.getValue('notes');
      return notes ? (
        <span className="text-xs text-muted-foreground truncate max-w-32 inline-block" title={notes}>
          {notes}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
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
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
  const [attendanceData] = useState(EXTENDED_ATTENDANCE_HISTORY);
  const [activeTab, setActiveTab] = useState('all');

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Attendance History
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Records"
          value={stats.total}
          icon={Users}
        />
        <StatCard
          title="Present"
          value={stats.present}
          icon={UserCheck}
        />
        <StatCard
          title="Late"
          value={stats.late}
          icon={Clock}
        />
        <StatCard
          title="Absent"
          value={stats.absent}
          icon={UserX}
        />
        <StatCard
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          icon={UserCheck}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Filter Records</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            Clear Filters
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Records ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
            <TabsList className="grid w-full grid-cols-5 max-w-lg">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="present">Present</TabsTrigger>
              <TabsTrigger value="late">Late</TabsTrigger>
              <TabsTrigger value="absent">Absent</TabsTrigger>
              <TabsTrigger value="excused">Excused</TabsTrigger>
            </TabsList>
          </Tabs>

          <DataTable
            columns={attendanceColumns}
            data={filteredData}
            recordLabel="attendance record"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchKey="member.name"
            searchPlaceholder="Search members..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
