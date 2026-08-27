'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
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
  Users, 
  Search, 
  Download, 
  MoreHorizontal,
  Loader2,
  Phone,
  Mail,
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { sundaySchoolService } from '@/services';
import { Student } from '@/lib/types/sunday-school';
import { toast } from 'sonner';

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await sundaySchoolService.getStudents();
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        toast.error(response.message || 'Failed to load students');
      }
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const fullName = (student.name || '').toLowerCase();
    const parentName = student.parentContact?.parentName?.toLowerCase() || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || parentName.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeStudents = students.filter(s => (s.status || 'Active') === 'Active').length;
  const averageAge = students.length > 0
    ? (students.reduce((sum, s) => sum + s.age, 0) / students.length).toFixed(1)
    : '0';

  const handleExport = () => {
    const csvContent = 'Name,Age,Gender,Parent Name,Parent Phone,Parent Email,Status\n' +
      students.map(s =>
        `"${s.name}",${s.age},"${s.gender}","${s.parentContact?.parentName || ''}","${s.parentContact?.phone || ''}","${s.parentContact?.email || ''}","${s.status || 'Active'}"`
      ).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sunday-school-students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Students exported successfully');
  };

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
          <h1 className="font-heading text-2xl font-bold tracking-tight">Sunday School Students</h1>
        </div>

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-1.5 h-4 w-4" />
          Export Students
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={students.length} icon={Users} />
        <StatCard title="Active Students" value={activeStudents} icon={Users} />
        <StatCard title="Average Age" value={`${averageAge} yrs`} icon={Calendar} />
        <StatCard
          title="Active Rate"
          value={`${students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0}%`}
          icon={Users}
        />
      </div>

      {/* Students Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Student Directory ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or parent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <Card key={student.id} className="p-4 space-y-3 flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary shrink-0">
                        {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          {student.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="neutral" size="sm">Age: {student.age}</Badge>
                          <StatusBadge status={(student.status || 'active').toLowerCase() as any} size="sm" />
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sunday-school/students/${student.id}`}>
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                    {student.parentContact?.parentName && (
                      <p className="text-foreground font-medium">Parent: {student.parentContact.parentName}</p>
                    )}
                    {student.parentContact?.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{student.parentContact.phone}</span>
                      </div>
                    )}
                    {student.parentContact?.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{student.parentContact.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Button variant="ghost" size="sm" className="text-xs h-7 text-primary hover:text-primary hover:bg-transparent" asChild>
                    <Link href={`/dashboard/sunday-school/students/${student.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No students found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}