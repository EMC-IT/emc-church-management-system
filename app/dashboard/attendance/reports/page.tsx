'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Download, 
  CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import { attendanceService } from '@/services/attendance-service';
import { AttendanceStatus, ServiceType, AttendanceSearchParams } from '@/lib/types';

// Mock data for comprehensive reports
const monthlyAttendanceData = [
  { month: 'Jan', attendance: 380, rate: 84, target: 400 },
  { month: 'Feb', attendance: 395, rate: 88, target: 400 },
  { month: 'Mar', attendance: 375, rate: 83, target: 400 },
  { month: 'Apr', attendance: 387, rate: 86, target: 400 },
  { month: 'May', attendance: 412, rate: 91, target: 400 },
  { month: 'Jun', attendance: 398, rate: 88, target: 400 }
];

const serviceTypeAnalytics = [
  { name: 'Sunday Service', attendance: 387, rate: 86, growth: 2.5 },
  { name: 'Bible Study', attendance: 98, rate: 82, growth: -1.2 },
  { name: 'Prayer Meeting', attendance: 38, rate: 84, growth: 5.8 },
  { name: 'Youth Service', attendance: 72, rate: 85, growth: 3.1 },
  { name: 'Special Service', attendance: 156, rate: 89, growth: 8.4 }
];

const departmentAttendanceData = [
  { department: 'Media Ministry', members: 25, attendance: 23, rate: 92 },
  { department: 'Music Ministry', members: 35, attendance: 31, rate: 89 },
  { department: 'Children Ministry', members: 28, attendance: 24, rate: 86 },
  { department: 'Ushering', members: 20, attendance: 17, rate: 85 },
  { department: 'Security', members: 15, attendance: 12, rate: 80 },
  { department: 'Youth Ministry', members: 45, attendance: 38, rate: 84 }
];

const weeklyTrendData = [
  { week: 'Week 1', present: 380, late: 15, absent: 55, excused: 8 },
  { week: 'Week 2', present: 395, late: 12, absent: 48, excused: 5 },
  { week: 'Week 3', present: 387, late: 18, absent: 52, excused: 7 },
  { week: 'Week 4', present: 402, late: 14, absent: 45, excused: 6 }
];

const topAttendersData = [
  { name: 'John Doe', department: 'Media Ministry', rate: 98, streak: 24 },
  { name: 'Jane Smith', department: 'Children Ministry', rate: 96, streak: 22 },
  { name: 'Michael Johnson', department: 'Ushering', rate: 94, streak: 20 },
  { name: 'Sarah Wilson', department: 'Music Ministry', rate: 92, streak: 18 },
  { name: 'David Brown', department: 'Security', rate: 90, streak: 16 }
];

const attendanceDistribution = [
  { name: 'Present', value: 387, color: '#A5CF5D' },
  { name: 'Late', value: 18, color: '#C49831' },
  { name: 'Absent', value: 52, color: '#EF4444' },
  { name: 'Excused', value: 7, color: '#3B82F6' }
];



export default function AttendanceReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedService, setSelectedService] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 5),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');

  const handleExportReport = async (reportType: string) => {
    setIsLoading(true);
    try {
      const searchParams: AttendanceSearchParams = {
        serviceType: selectedService !== 'all' ? selectedService as ServiceType : undefined,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd')
      };
      
      const response = await attendanceService.getAttendanceReport(searchParams);
      if (response.success && response.data) {
        // Simulate export functionality
        const exportData = await attendanceService.exportAttendanceData(searchParams);
        if (exportData.success && exportData.data) {
          const url = window.URL.createObjectURL(exportData.data);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `attendance-${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const overallStats = {
    totalSessions: 24,
    totalAttendees: 1250,
    averageAttendance: 387,
    attendanceRate: 86,
    growth: 2.5,
    bestMonth: 'May',
    bestRate: 91
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
            <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive attendance analytics and insights
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportReport('summary')} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
          <Button variant="outline" onClick={() => handleExportReport('detailed')} disabled={isLoading}>
            <FileText className="h-4 w-4 mr-2" />
            Detailed Report
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>

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

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-3xl font-bold">{overallStats.totalSessions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all services
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-brand-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Attendance</p>
                <p className="text-3xl font-bold">{overallStats.averageAttendance}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{overallStats.growth}% from last period
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{overallStats.attendanceRate}%</p>
                <Progress value={overallStats.attendanceRate} className="mt-2" />
              </div>
              <div className="h-12 w-12 rounded-full bg-brand-secondary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-brand-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Performance</p>
                <p className="text-3xl font-bold">{overallStats.bestRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {overallStats.bestMonth} 2024
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-brand-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="members">Top Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Attendance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-brand-primary" />
                  Monthly Attendance Trend
                </CardTitle>
                <CardDescription>
                  Attendance patterns over the past 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyAttendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="attendance" 
                      stroke="#2E8DB0" 
                      fill="#2E8DB0" 
                      fillOpacity={0.1}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#C49831" 
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-brand-primary" />
                  Attendance Distribution
                </CardTitle>
                <CardDescription>
                  Current period attendance breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={attendanceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {attendanceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Service Type Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Service Type Performance</CardTitle>
              <CardDescription>
                Attendance rates and growth by service type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceTypeAnalytics.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.attendance} attendees
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{service.rate}%</div>
                        <div className={cn(
                          "text-sm flex items-center",
                          service.growth >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {service.growth >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {Math.abs(service.growth)}%
                        </div>
                      </div>
                      <Progress value={service.rate} className="w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trends</CardTitle>
              <CardDescription>
                Detailed breakdown of attendance patterns by week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" stackId="a" fill="#A5CF5D" name="Present" />
                  <Bar dataKey="late" stackId="a" fill="#C49831" name="Late" />
                  <Bar dataKey="excused" stackId="a" fill="#3B82F6" name="Excused" />
                  <Bar dataKey="absent" stackId="a" fill="#EF4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Department Attendance Analysis</CardTitle>
              <CardDescription>
                Attendance performance by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentAttendanceData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-brand-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{dept.department}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.members} total members
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{dept.attendance}/{dept.members}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.rate}% attendance
                        </div>
                      </div>
                      <Progress value={dept.rate} className="w-24" />
                      <Badge 
                        variant="outline" 
                        className={cn(
                          dept.rate >= 90 ? "bg-green-100 text-green-800 border-green-200" :
                          dept.rate >= 80 ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                          "bg-red-100 text-red-800 border-red-200"
                        )}
                      >
                        {dept.rate >= 90 ? 'Excellent' : dept.rate >= 80 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Attending Members</CardTitle>
              <CardDescription>
                Members with highest attendance rates and streaks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topAttendersData.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-brand-primary">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{member.rate}%</div>
                        <div className="text-sm text-muted-foreground">
                          {member.streak} week streak
                        </div>
                      </div>
                      <Progress value={member.rate} className="w-24" />
                      <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Top Performer
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}