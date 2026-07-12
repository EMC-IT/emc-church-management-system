"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
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
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp,
  Building2,
  Settings
} from 'lucide-react';
import { Department, DepartmentCategory } from '@/lib/types/departments';
import { departmentsService } from '@/services/departments-service';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<DepartmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const searchTimer = window.setTimeout(() => {
      loadDepartments();
    }, 250);

    return () => window.clearTimeout(searchTimer);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsService.getDepartments({
        search: searchTerm || undefined,
        categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'Active' | 'Inactive' : undefined
      });
      
      if (response.success && response.data) {
        setDepartments(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await departmentsService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;
    
    try {
      const response = await departmentsService.deleteDepartment(departmentToDelete.id);
      if (response.success) {
        toast.success('Department deleted successfully');
        loadDepartments();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to delete department');
    } finally {
      setDeleteDialogOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const openDeleteDialog = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'neutral';
      default:
        return 'primary';
    }
  };

  const getCategoryBadgeColor = (categoryId?: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Department',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-brand-primary text-white">
                {department.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{department.name}</div>
              <div className="text-sm text-muted-foreground">
                {department.description.length > 50 
                  ? `${department.description.substring(0, 50)}...` 
                  : department.description
                }
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        const category = categories.find(cat => cat.id === department.categoryId);
        return category ? (
          <Badge 
            variant="neutral" 
            style={{ 
              borderColor: category.color,
              color: category.color,
              backgroundColor: `${category.color}10`
            }}
          >
            {category.name}
          </Badge>
        ) : (
          <Badge variant="neutral">Uncategorized</Badge>
        );
      },
    },
    {
      accessorKey: 'leader',
      header: 'Leader',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted">
                {department.leader.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{department.leader}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'stats',
      header: 'Members',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return (
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{department.stats?.totalMembers || 0}</span>
            <span className="text-muted-foreground">({department.stats?.activeMembers || 0} active)</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'meetingSchedule',
      header: 'Meeting Schedule',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return department.meetingSchedule ? (
          <div className="text-sm">
            <div className="font-medium">{department.meetingSchedule.dayOfWeek}s</div>
            <div className="text-muted-foreground">
              {department.meetingSchedule.startTime} - {department.meetingSchedule.endTime}
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground">Not scheduled</span>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return (
          <StatusBadge 
            status={(department.status || 'active').toLowerCase() as any} 
            variant={getStatusColor(department.status || 'active')}
          />
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const department = row.original as Department;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/departments/${department.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/departments/${department.id}/members`}>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Members
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/departments/${department.id}/meetings`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Meetings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/departments/${department.id}/reports`}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Reports
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(department)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const totalMembers = departments.reduce((sum, dept) => sum + (dept.stats?.totalMembers || 0), 0);
  const activeDepartments = departments.filter(dept => dept.status === 'Active').length;
  const averageAttendance = departments.length > 0 
    ? Math.round(departments.reduce((sum, dept) => sum + (dept.stats?.averageAttendance || 0), 0) / departments.length)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/departments/categories">
                <Settings className="mr-2 h-4 w-4" />
                Categories
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/departments/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Department
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Departments"
          value={departments.length}
          icon={Building2}
          accent="primary"
          description={`${activeDepartments} active departments`}
        />
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          accent="secondary"
          description="Across all departments"
        />
        <StatCard
          title="Average Attendance"
          value={`${averageAttendance}%`}
          icon={TrendingUp}
          accent="success"
          description="Department meetings"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={Filter}
          accent="accent"
          description="Department categories"
        />
      </div>

      {/* Departments Table */}
      <DataTable
        columns={columns}
        data={departments}
        recordLabel="department"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search departments..."
        loading={loading}
        pagination={true}
        toolbarContent={
          <>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-10 w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{departmentToDelete?.name}"? This action cannot be undone.
              All associated data including members, meetings, and events will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
