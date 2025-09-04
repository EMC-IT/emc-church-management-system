"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Trash2,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  UserCheck,
  CalendarDays,
  BarChart3,
  Settings,
  Plus,
  FileText
} from 'lucide-react';
import { Department, DepartmentStats } from '@/lib/types/departments';
import { departmentsService } from '@/services/departments-service';
import { toast } from 'sonner';

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);



  useEffect(() => {
    if (departmentId) {
      loadDepartment();
      loadDepartmentStats();
    }
  }, [departmentId]);

  const loadDepartment = async () => {
    try {
      setLoading(true);
      const response = await departmentsService.getDepartment(departmentId);
      
      if (response.success && response.data) {
        setDepartment(response.data);
      } else {
        toast.error(response.message);
        router.push('/dashboard/departments');
      }
    } catch (error) {
      toast.error('Failed to load department');
      router.push('/dashboard/departments');
    } finally {
      setLoading(false);
    }
  };

  const loadDepartmentStats = async () => {
    try {
      const response = await departmentsService.getDepartmentStats(departmentId);
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load department stats:', error);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!department) return;
    
    try {
      const response = await departmentsService.deleteDepartment(department.id);
      if (response.success) {
        toast.success('Department deleted successfully');
        router.push('/dashboard/departments');
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to delete department');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!department) {
    return (
    <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Department Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested department could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/departments">Back to Departments</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-brand-primary text-white text-lg">
                {department.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{department.name}</h1>
                <StatusBadge 
                  status={(department.status || 'active').toLowerCase() as any} 
                  variant={getStatusColor(department.status || 'active')}
                />
              </div>
              <p className="text-muted-foreground">{department.description}</p>
              {department.category && (
                <Badge 
                  variant="outline" 
                  className="mt-2"
                  style={{ 
                    borderColor: department.category.color,
                    color: department.category.color,
                    backgroundColor: `${department.category.color}10`
                  }}
                >
                  {department.category.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeMembers || 0} active members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendanceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Average meeting attendance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMeetings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Meetings held this year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {department.budget ? formatCurrency(department.budget) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.spentBudget ? `${formatCurrency(stats.spentBudget)} spent` : 'No budget set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Department Leader</p>
                <p className="text-sm text-muted-foreground">{department.leader}</p>
              </div>
            </div>
            
            {department.departmentType && (
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Department Type</p>
                  <p className="text-sm text-muted-foreground">{department.departmentType}</p>
                </div>
              </div>
            )}
            
            {department.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Primary Location</p>
                  <p className="text-sm text-muted-foreground">{department.location}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(department.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meeting Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {department.meetingSchedule ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Day & Frequency</p>
                    <p className="text-sm text-muted-foreground">
                      {department.meetingSchedule.dayOfWeek}s ({department.meetingSchedule.frequency})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {department.meetingSchedule.startTime} - {department.meetingSchedule.endTime}
                    </p>
                  </div>
                </div>
                {department.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{department.location}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No regular meeting schedule set</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="mr-2 h-4 w-4" />
                  Set Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/members`}>
                <Users className="h-6 w-6 mb-2" />
                Manage Members
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/roles`}>
                <UserCheck className="h-6 w-6 mb-2" />
                Department Roles
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/meetings`}>
                <Calendar className="h-6 w-6 mb-2" />
                Meetings
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/events`}>
                <CalendarDays className="h-6 w-6 mb-2" />
                Events
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/attendance`}>
                <BarChart3 className="h-6 w-6 mb-2" />
                Attendance
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href={`/dashboard/departments/${departmentId}/reports`}>
                <FileText className="h-6 w-6 mb-2" />
                Reports
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">Upcoming Meetings</p>
                  <p className="text-sm text-muted-foreground">
                    {department.stats?.upcomingMeetings || 0} meetings scheduled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CalendarDays className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Upcoming Events</p>
                  <p className="text-sm text-muted-foreground">
                    {department.stats?.upcomingEvents || 0} events planned
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium">Average Attendance</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.averageAttendance}% attendance rate
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{department.name}"? This action cannot be undone.
              All associated data including members, meetings, events, and reports will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Department
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}