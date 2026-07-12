'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  TrendingUp,
  Plus,
  Eye,
  FileText,
  Upload,
  Settings,
  Loader2,
  School,
  UserCheck,
  BookMarked
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { SundaySchoolStats } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function SundaySchoolPage() {
  const router = useRouter();
  const [stats, setStats] = useState<SundaySchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await sundaySchoolService.getSundaySchoolStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        toast.error(response.message || 'Failed to load Sunday School stats');
      }
    } catch (error) {
      toast.error('Failed to load Sunday School stats');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create New Class',
      description: 'Set up a new Sunday School class',
      icon: Plus,
      href: '/dashboard/sunday-school/classes/add',
      color: 'bg-brand-primary'
    },
    {
      title: 'Add Teacher',
      description: 'Register a new Sunday School teacher',
      icon: GraduationCap,
      href: '/dashboard/sunday-school/teachers/add',
      color: 'bg-brand-secondary'
    },
    {
      title: 'Upload Material',
      description: 'Add teaching materials and resources',
      icon: Upload,
      href: '/dashboard/sunday-school/materials/upload',
      color: 'bg-brand-accent'
    },
    {
      title: 'View Reports',
      description: 'Check attendance and performance reports',
      icon: FileText,
      href: '/dashboard/sunday-school/reports',
      color: 'bg-brand-success'
    }
  ];

  const moduleCards = [
    {
      title: 'Classes',
      description: 'Manage Sunday School classes and schedules',
      icon: School,
      href: '/dashboard/sunday-school/classes',
      count: stats?.totalClasses || 0,
      label: 'Active Classes'
    },
    {
      title: 'Teachers',
      description: 'Manage Sunday School teachers and assignments',
      icon: GraduationCap,
      href: '/dashboard/sunday-school/teachers',
      count: stats?.totalTeachers || 0,
      label: 'Teachers'
    },
    {
      title: 'Students',
      description: 'View and manage all Sunday School students',
      icon: Users,
      href: '/dashboard/sunday-school/students',
      count: stats?.totalStudents || 0,
      label: 'Students'
    },
    {
      title: 'Materials',
      description: 'Teaching materials and resources library',
      icon: BookMarked,
      href: '/dashboard/sunday-school/materials',
      count: 0, // Will be updated when materials stats are available
      label: 'Materials'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sunday School"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/sunday-school/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button className="bg-brand-primary hover:bg-brand-primary/90" asChild>
              <Link href="/dashboard/sunday-school/classes/add">
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Link>
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses || 0}
          icon={School}
          accent="primary"
          description={`${stats?.activeClasses || 0} active, ${stats?.inactiveClasses || 0} inactive`}
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          accent="secondary"
          description={`${stats?.studentsThisWeek || 0} attended this week`}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
          accent="success"
          description="Active teaching staff"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.averageAttendance || 0}%`}
          icon={UserCheck}
          accent="accent"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <div className="group cursor-pointer rounded-lg border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {moduleCards.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card key={module.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-5 w-5 text-brand-primary" />
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{module.count}</Badge>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{module.label}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={module.href}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Growth */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Growth Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Student Growth</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-brand-success">
                  +{stats?.growthRate || 0}%
                </span>
                <TrendingUp className="h-4 w-4 text-brand-success" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Weekly Attendance</span>
              <span className="text-sm font-medium">
                {stats?.attendanceThisWeek || 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Classes</span>
              <span className="text-sm font-medium">
                {stats?.activeClasses || 0} of {stats?.totalClasses || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>This Week</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Weekly schedule and upcoming events will be displayed here
              </p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href="/dashboard/sunday-school/classes">
                  View Class Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}