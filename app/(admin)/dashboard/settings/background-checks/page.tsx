'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Search,
  Plus,
  ArrowLeft,
  User,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface BackgroundCheck {
  id: string;
  candidateName: string;
  email: string;
  role: string;
  department: string;
  status: 'Approved' | 'Pending' | 'In Review' | 'Expired' | 'Rejected';
  submittedDate: string;
  completedDate?: string;
  verificationLevel: 'Standard' | 'Child Protection' | 'Financial Access' | 'Executive';
  provider: string;
}

const mockChecks: BackgroundCheck[] = [
  {
    id: 'chk_001',
    candidateName: 'John Smith',
    email: 'john.smith@email.com',
    role: 'Sunday School Teacher',
    department: 'Children Ministry',
    status: 'Approved',
    submittedDate: '2026-01-15',
    completedDate: '2026-01-18',
    verificationLevel: 'Child Protection',
    provider: 'SafeMinistry National Check',
  },
  {
    id: 'chk_002',
    candidateName: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    role: 'Youth Leader',
    department: 'Youth Ministry',
    status: 'Approved',
    submittedDate: '2026-02-10',
    completedDate: '2026-02-12',
    verificationLevel: 'Child Protection',
    provider: 'SafeMinistry National Check',
  },
  {
    id: 'chk_003',
    candidateName: 'Michael Davis',
    email: 'michael.davis@email.com',
    role: 'Accountant',
    department: 'Finance',
    status: 'In Review',
    submittedDate: '2026-08-25',
    verificationLevel: 'Financial Access',
    provider: 'Credit & Background Screening',
  },
  {
    id: 'chk_004',
    candidateName: 'Emmanuel Osei',
    email: 'emmanuel.osei@email.com',
    role: 'Ushering Volunteer',
    department: 'Ushering',
    status: 'Pending',
    submittedDate: '2026-08-28',
    verificationLevel: 'Standard',
    provider: 'National Police Clearance',
  },
  {
    id: 'chk_005',
    candidateName: 'Abena Mensah',
    email: 'abena.mensah@email.com',
    role: 'Choir Director',
    department: 'Music Ministry',
    status: 'Approved',
    submittedDate: '2025-08-10',
    completedDate: '2025-08-14',
    verificationLevel: 'Standard',
    provider: 'National Police Clearance',
  },
];

export default function BackgroundChecksPage() {
  const [checks, setChecks] = useState<BackgroundCheck[]>(mockChecks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCheck, setNewCheck] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    level: 'Child Protection' as BackgroundCheck['verificationLevel'],
  });

  const handleInitiateCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheck.name.trim() || !newCheck.email.trim() || !newCheck.role.trim()) {
      toast.error('Please complete all required fields');
      return;
    }

    const created: BackgroundCheck = {
      id: `chk_${Date.now()}`,
      candidateName: newCheck.name.trim(),
      email: newCheck.email.trim(),
      role: newCheck.role.trim(),
      department: newCheck.department || 'General',
      status: 'Pending',
      submittedDate: new Date().toISOString().split('T')[0],
      verificationLevel: newCheck.level,
      provider: 'SafeMinistry National Screening',
    };

    setChecks([created, ...checks]);
    setDialogOpen(false);
    setNewCheck({ name: '', email: '', role: '', department: '', level: 'Child Protection' });
    toast.success(`Background check initiated for ${created.candidateName}`);
  };

  const filteredChecks = checks.filter((item) => {
    const matchesSearch =
      item.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<BackgroundCheck>[] = [
    {
      accessorKey: 'candidateName',
      header: 'Candidate',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
            {row.original.candidateName.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-foreground">{row.original.candidateName}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role & Dept',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.role}</p>
          <p className="text-xs text-muted-foreground">{row.original.department}</p>
        </div>
      ),
    },
    {
      accessorKey: 'verificationLevel',
      header: 'Clearance Tier',
      cell: ({ row }) => (
        <Badge variant="neutral" className="text-xs font-normal">
          {row.original.verificationLevel}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<string, string> = {
          Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          Pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          'In Review': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
          Rejected: 'bg-destructive/10 text-destructive border-destructive/20',
          Expired: 'bg-muted text-muted-foreground border-border',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[status] || ''}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'submittedDate',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.submittedDate}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Background Checks & Security</h1>
            <p className="text-sm text-muted-foreground">Screening and safety verifications for church staff and ministry volunteers</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Initiate Background Check</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>New Background Check Request</span>
              </DialogTitle>
              <DialogDescription>
                Send an encrypted screening authorization request to candidate.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleInitiateCheck} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Candidate Full Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Samuel K. Johnson"
                  value={newCheck.name}
                  onChange={(e) => setNewCheck({ ...newCheck, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Candidate Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="samuel@example.com"
                  value={newCheck.email}
                  onChange={(e) => setNewCheck({ ...newCheck, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="role">Ministry Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g. Children Teacher"
                    value={newCheck.role}
                    onChange={(e) => setNewCheck({ ...newCheck, role: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g. Children Ministry"
                    value={newCheck.department}
                    onChange={(e) => setNewCheck({ ...newCheck, department: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Clearance Tier</Label>
                <Select
                  value={newCheck.level}
                  onValueChange={(val: any) => setNewCheck({ ...newCheck, level: val })}
                >
                  <SelectTrigger id="level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Child Protection">Child Protection (Sunday School & Youth)</SelectItem>
                    <SelectItem value="Financial Access">Financial Access (Treasury & Cashiers)</SelectItem>
                    <SelectItem value="Standard">Standard (Ushers & General Volunteers)</SelectItem>
                    <SelectItem value="Executive">Executive (Pastors & Department Heads)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="pt-4">
                <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Screened</p>
              <p className="text-2xl font-bold mt-1">42</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Approved & Valid</p>
              <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">38</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">3</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due For Renewal</p>
              <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">1</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search candidate, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in review">In Review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={filteredChecks} />
      </Card>
    </div>
  );
}
