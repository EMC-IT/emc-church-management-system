'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge, PriorityBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Heart, 
  Plus, 
  Eye,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  Lock,
  Users,
  FolderOpen,
  MoreHorizontal
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface PrayerRequestItem {
  id: string;
  title: string;
  description: string;
  requester: string;
  priority: string;
  status: string;
  isConfidential: boolean;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const prayerRequests: PrayerRequestItem[] = [
  {
    id: '1',
    title: 'Healing for Sister Mary',
    description: 'Please pray for Sister Mary who is recovering from surgery. Pray for complete healing and strength.',
    requester: 'John Smith',
    priority: 'High',
    status: 'New',
    isConfidential: false,
    assignedTo: 'Prayer Team',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
  {
    id: '2',
    title: 'Job Search',
    description: 'Seeking prayers for guidance in finding new employment opportunities.',
    requester: 'Anonymous',
    priority: 'Medium',
    status: 'In Progress',
    isConfidential: true,
    assignedTo: 'Pastor John',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-19',
  },
  {
    id: '3',
    title: 'Family Reconciliation',
    description: 'Please pray for restoration and healing in our family relationships.',
    requester: 'Sarah Wilson',
    priority: 'High',
    status: 'In Progress',
    isConfidential: false,
    assignedTo: 'Elder Mary',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
  },
  {
    id: '4',
    title: 'Traveling Mercies',
    description: 'Prayers for safe travels during upcoming mission trip to Africa.',
    requester: 'Mission Team',
    priority: 'Low',
    status: 'Answered',
    isConfidential: false,
    assignedTo: 'Prayer Warriors',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-16',
  },
  {
    id: '5',
    title: 'Financial Breakthrough',
    description: 'Seeking God\'s provision and wisdom in financial matters.',
    requester: 'David Brown',
    priority: 'Medium',
    status: 'New',
    isConfidential: true,
    assignedTo: null,
    createdAt: '2024-01-21',
    updatedAt: '2024-01-21',
  },
];

export default function PrayerRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const totalRequests = prayerRequests.length;
  const newRequests = prayerRequests.filter(r => r.status === 'New').length;
  const inProgress = prayerRequests.filter(r => r.status === 'In Progress').length;
  const answered = prayerRequests.filter(r => r.status === 'Answered').length;

  const columns: ColumnDef<PrayerRequestItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Request',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">{request.title}</span>
              {request.isConfidential && (
                <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Confidential" />
              )}
            </div>
            <p className="text-xs text-muted-foreground max-w-xs truncate">
              {request.description}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: 'requester',
      header: 'Requester',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {request.requester === 'Anonymous'
                  ? 'A'
                  : request.requester
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{request.requester}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.original.priority.toLowerCase() as any;
        return <PriorityBadge priority={priority} size="sm" />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status.toLowerCase() as any;
        return <StatusBadge status={status} size="sm" />;
      },
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const assignedTo = row.original.assignedTo;
        return assignedTo ? (
          <span className="text-sm text-foreground">{assignedTo}</span>
        ) : (
          <span className="text-xs text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const request = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/prayer-requests/${request.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/prayer-requests/${request.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Request
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'New', label: 'New' },
        { value: 'In Progress', label: 'In Progress' },
        { value: 'Answered', label: 'Answered' },
        { value: 'Closed', label: 'Closed' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'Low', label: 'Low' },
        { value: 'Medium', label: 'Medium' },
        { value: 'High', label: 'High' },
        { value: 'Urgent', label: 'Urgent' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Prayer Requests</h1>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/prayer-requests/categories">
              <FolderOpen className="mr-1.5 h-4 w-4" />
              Categories
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/prayer-requests/add">
              <Plus className="mr-1.5 h-4 w-4" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Requests" value={totalRequests} icon={Heart} />
        <StatCard title="New Requests" value={newRequests} icon={AlertCircle} />
        <StatCard title="In Progress" value={inProgress} icon={Clock} />
        <StatCard title="Answered" value={answered} icon={CheckCircle} />
      </div>

      {/* Prayer Requests Table */}
      <DataTable
        columns={columns}
        data={prayerRequests}
        recordLabel="prayer request"
        recordLabelPlural="prayer requests"
        searchKey="title"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search prayer requests by title..."
        filters={searchFilters}
        pagination={{
          pageSize: 10,
          pageSizeOptions: [10, 20, 50],
        }}
      />
    </div>
  );
}