'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { DetailsPageSkeleton } from '@/components/ui/skeleton-loaders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
  Trash2,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  Clock,
  UserCheck,
  CalendarDays,
  FolderTree,
  Loader2
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
        toast.error(response.message || 'Department not found');
        router.push('/dashboard/departments');
      }
    } catch {
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
    } catch {
      toast.error('Failed to delete department');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <DetailsPageSkeleton />;
  }

  if (!department) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-semibold">Department Not Found</h2>
        <Button onClick={() => router.push('/dashboard/departments')} variant="outline">
          Back to Departments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/departments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold tracking-tight">{department.name}</h1>
            <StatusBadge status={(department.status || 'active').toLowerCase() as any} size="sm" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats?.totalMembers || 0}
          icon={Users}
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Meetings"
          value={stats?.totalMeetings || 0}
          icon={Calendar}
        />
        <StatCard
          title="Leader"
          value={department.leader}
          icon={UserCheck}
        />
      </div>

      {/* Department Information & Schedule */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">General Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Description</span>
              <p className="text-foreground mt-0.5">{department.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Leader</span>
                <p className="font-medium text-foreground">{department.leader}</p>
              </div>
              {department.departmentType && (
                <div>
                  <span className="text-xs text-muted-foreground block">Type</span>
                  <p className="font-medium text-foreground">{department.departmentType}</p>
                </div>
              )}
              {department.location && (
                <div>
                  <span className="text-xs text-muted-foreground block">Location</span>
                  <p className="font-medium text-foreground">{department.location}</p>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground block">Created</span>
                <p className="font-medium text-foreground">
                  {new Date(department.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Meeting Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {department.meetingSchedule ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {department.meetingSchedule.dayOfWeek}s ({department.meetingSchedule.frequency})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {department.meetingSchedule.startTime} - {department.meetingSchedule.endTime}
                  </span>
                </div>
                {department.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{department.location}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4">No regular meeting schedule set.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Shortcuts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
              <Link href={`/dashboard/departments/${departmentId}/members`}>
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Members</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
              <Link href={`/dashboard/departments/${departmentId}/roles`}>
                <UserCheck className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Roles</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-16 flex-col justify-center items-center">
              <Link href={`/dashboard/departments/${departmentId}/meetings`}>
                <Calendar className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Meetings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{department.name}&quot;? All associated records will be removed.
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