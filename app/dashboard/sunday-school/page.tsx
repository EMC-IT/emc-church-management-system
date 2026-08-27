'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  GraduationCap,
  Plus,
  FileText,
  Loader2,
  School,
  UserCheck,
  BookMarked,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { SundaySchoolStats } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function SundaySchoolPage() {
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
        toast.error(response.message || 'Failed to load stats');
      }
    } catch {
      toast.error('Failed to load Sunday School stats');
    } finally {
      setLoading(false);
    }
  };

  const moduleCards = [
    {
      title: 'Classes',
      description: 'Sunday School classes, age groups, and schedules',
      icon: School,
      href: '/dashboard/sunday-school/classes',
      count: stats?.totalClasses || 0,
      label: 'Classes'
    },
    {
      title: 'Teachers',
      description: 'Teachers, assistants, and class assignments',
      icon: GraduationCap,
      href: '/dashboard/sunday-school/teachers',
      count: stats?.totalTeachers || 0,
      label: 'Teachers'
    },
    {
      title: 'Students',
      description: 'Enrolled students and attendance tracking',
      icon: Users,
      href: '/dashboard/sunday-school/students',
      count: stats?.totalStudents || 0,
      label: 'Students'
    },
    {
      title: 'Materials',
      description: 'Curriculum, lesson plans, and teaching resources',
      icon: BookMarked,
      href: '/dashboard/sunday-school/materials',
      count: 0,
      label: 'Resources'
    }
  ];

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
        <h1 className="font-heading text-2xl font-bold tracking-tight">Sunday School</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/sunday-school/reports">
              <FileText className="mr-1.5 h-4 w-4" />
              Reports
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/sunday-school/classes/add">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses || 0}
          icon={School}
        />
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers || 0}
          icon={GraduationCap}
        />
        <StatCard
          title="Average Attendance"
          value={`${stats?.averageAttendance || 0}%`}
          icon={UserCheck}
        />
      </div>

      {/* Module Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {moduleCards.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card key={module.title} className="p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {module.count > 0 && (
                    <Badge variant="neutral" size="sm">
                      {module.count} {module.label}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-base text-foreground mt-2">{module.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-border">
                <Button variant="ghost" size="sm" className="w-full justify-between px-0 text-xs text-primary hover:text-primary hover:bg-transparent" asChild>
                  <Link href={module.href}>
                    Manage {module.title}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Attendance & Growth</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Student Growth</span>
              <span className="font-medium text-foreground">+{stats?.growthRate || 0}%</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">Attendance This Week</span>
              <span className="font-medium text-foreground">{stats?.attendanceThisWeek || 0}%</span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Active Class Ratio</span>
              <span className="font-medium text-foreground">
                {stats?.activeClasses || 0} of {stats?.totalClasses || 0} classes
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Quick Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start text-xs">
              <Link href="/dashboard/sunday-school/teachers/add">
                <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                Register New Teacher
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-xs">
              <Link href="/dashboard/sunday-school/materials/upload">
                <BookMarked className="mr-2 h-4 w-4 text-muted-foreground" />
                Upload Curriculum Material
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-xs">
              <Link href="/dashboard/sunday-school/reports">
                <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                View Sunday School Analytics
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}