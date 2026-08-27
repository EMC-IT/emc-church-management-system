'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  School,
  Plus,
  Search,
  Users,
  Calendar,
  MapPin,
  UserCheck,
  Edit,
  MoreHorizontal,
  Loader2,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { sundaySchoolService } from '@/services';
import { SundaySchoolClass, AgeGroup, ClassStatus } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

const ageGroups = Object.values(AgeGroup);
const statusOptions = Object.values(ClassStatus);

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadClasses();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, ageGroupFilter, statusFilter]);

  const loadClasses = async () => {
    try {
      const response = await sundaySchoolService.getClasses({
        search: searchTerm || undefined,
        ageGroup: ageGroupFilter !== 'All' ? ageGroupFilter as AgeGroup : undefined,
        status: statusFilter !== 'All' ? statusFilter as ClassStatus : undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast.error(response.message || 'Failed to load classes');
      }
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={6} />;
  }

  const activeClasses = classes.filter(c => c.status === ClassStatus.ACTIVE).length;
  const totalEnrolled = classes.reduce((sum, c) => sum + (c.students || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/sunday-school" aria-label="Back to Sunday School">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sunday School Classes</h1>
        </div>

        <Button size="sm" asChild>
          <Link href="/dashboard/sunday-school/classes/add">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Class
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Classes"
          value={classes.length}
          icon={School}
        />
        <StatCard
          title="Total Enrolled"
          value={totalEnrolled}
          icon={Users}
        />
        <StatCard
          title="Teachers"
          value={classes.filter(c => !!c.teacher?.name).length}
          icon={GraduationCap}
        />
        <StatCard
          title="Active Classes Rate"
          value={`${classes.length > 0 ? Math.round((activeClasses / classes.length) * 100) : 0}%`}
          icon={UserCheck}
        />
      </div>

      {/* Classes Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Classes Directory ({classes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Age Groups</SelectItem>
                {ageGroups.map((group) => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => {
              const enrolled = cls.students || 0;
              const capacity = cls.maxStudents || 20;
              const capacityPercent = Math.round((enrolled / capacity) * 100);

              return (
                <Card key={cls.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{cls.name}</h4>
                        <span className="text-xs text-muted-foreground">{cls.location}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={(cls.status || 'active').toLowerCase() as any} size="sm" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/sunday-school/classes/${cls.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/sunday-school/classes/${cls.id}/edit`}>
                                Edit Class
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/sunday-school/classes/${cls.id}/attendance`}>
                                Take Attendance
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/sunday-school/classes/${cls.id}/students`}>
                                Manage Students
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="neutral" size="sm">{cls.ageGroup}</Badge>
                      {cls.schedule && (
                        <span className="text-xs text-muted-foreground">
                          {cls.schedule.startTime} - {cls.schedule.endTime}
                        </span>
                      )}
                    </div>

                    {cls.teacher?.name && (
                      <div className="text-xs text-muted-foreground pt-1 flex items-center gap-1">
                        <span className="font-medium text-foreground">Teacher:</span>
                        <span>{cls.teacher.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="font-medium text-foreground">
                        {enrolled} / {capacity}
                      </span>
                    </div>
                    <Progress value={capacityPercent} className="h-1.5" />
                  </div>
                </Card>
              );
            })}
          </div>

          {classes.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No Sunday School classes found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
