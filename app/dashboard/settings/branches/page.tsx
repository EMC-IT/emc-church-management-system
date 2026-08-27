"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Edit, 
  Trash2, 
  Building2, 
  ArrowLeft 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// Mock data for branches
const mockBranches = [
  {
    id: '1',
    name: 'Main Campus',
    address: '123 Faith Avenue, Springfield, IL 62701',
    city: 'Springfield',
    state: 'Illinois',
    phone: '+1 (555) 123-4567',
    email: 'main@emcchurch.org',
    pastor: 'Rev. Dr. John Smith',
    members: 350,
    capacity: 500,
    status: 'active',
    type: 'Headquarters',
    established: '1995',
  },
  {
    id: '2',
    name: 'North Branch',
    address: '456 Hope Street, Springfield, IL 62702',
    city: 'Springfield',
    state: 'Illinois',
    phone: '+1 (555) 234-5678',
    email: 'north@emcchurch.org',
    pastor: 'Pastor Michael Anderson',
    members: 180,
    capacity: 250,
    status: 'active',
    type: 'Branch',
    established: '2010',
  },
  {
    id: '3',
    name: 'South Campus',
    address: '789 Grace Boulevard, Springfield, IL 62703',
    city: 'Springfield',
    state: 'Illinois',
    phone: '+1 (555) 345-6789',
    email: 'south@emcchurch.org',
    pastor: 'Pastor Sarah Williams',
    members: 120,
    capacity: 200,
    status: 'active',
    type: 'Branch',
    established: '2015',
  },
  {
    id: '4',
    name: 'East Community Center',
    address: '321 Faith Lane, Springfield, IL 62704',
    city: 'Springfield',
    state: 'Illinois',
    phone: '+1 (555) 456-7890',
    email: 'east@emcchurch.org',
    pastor: 'Pastor David Brown',
    members: 85,
    capacity: 150,
    status: 'active',
    type: 'Branch',
    established: '2020',
  },
];

export default function BranchesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = mockBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.pastor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMembers = mockBranches.reduce((sum, branch) => sum + branch.members, 0);
  const totalCapacity = mockBranches.reduce((sum, branch) => sum + branch.capacity, 0);

  const handleDelete = (branchId: string, branchName: string) => {
    // TODO: Replace with actual API call
    toast({
      title: "Branch Deleted",
      description: `${branchName} has been removed from the system.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings?tab=general">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Branch Management</h1>
        </div>
        <Button asChild>
          <Link href="/dashboard/settings/branches/add">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Branch
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Branches"
          value={mockBranches.length}
          icon={Building2}
          accent="primary"
        />
        <StatCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          accent="secondary"
        />
        <StatCard
          title="Total Capacity"
          value={totalCapacity}
          icon={MapPin}
          accent="accent"
        />
        <StatCard
          title="Average Occupancy"
          value={`${Math.round((totalMembers / totalCapacity) * 100)}%`}
          icon={Users}
          accent="success"
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search branches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Branches Grid View */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.map((branch) => (
          <Card key={branch.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {branch.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base font-semibold">{branch.name}</CardTitle>
                    <Badge variant={branch.type === 'Headquarters' ? 'primary' : 'neutral'} className="mt-1">
                      {branch.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{branch.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{branch.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">{branch.email}</span>
              </div>

              <div className="pt-2 border-t space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pastor:</span>
                  <span className="font-medium">{branch.pastor}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">{branch.members} / {branch.capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Established:</span>
                  <span className="font-medium">{branch.established}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/settings/branches/${branch.id}/edit`}>
                    <Edit className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {branch.name}? This action cannot be undone.
                        All associated data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(branch.id, branch.name)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
