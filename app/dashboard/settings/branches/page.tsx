"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const activeBranches = mockBranches.filter(b => b.status === 'active').length;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings?tab=general">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
            <p className="text-muted-foreground">Manage church branches and locations</p>
          </div>
        </div>
        <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
          <Link href="/dashboard/settings/branches/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBranches.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeBranches} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">
              Across all branches
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">
              Combined seating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Occupancy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalMembers / totalCapacity) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Utilization rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Grid View */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.map((branch) => (
          <Card key={branch.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-brand-primary text-white">
                      {branch.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{branch.name}</CardTitle>
                    <Badge variant={branch.type === 'Headquarters' ? 'default' : 'secondary'} className="mt-1">
                      {branch.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">{branch.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{branch.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{branch.email}</span>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Pastor:</span>
                  <span className="font-medium">{branch.pastor}</span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Members:</span>
                  <span className="font-medium">{branch.members} / {branch.capacity}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Established:</span>
                  <span className="font-medium">{branch.established}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/dashboard/settings/branches/${branch.id}/edit`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
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

      {/* Table View (Alternative) */}
      <Card className="hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Branches</CardTitle>
              <CardDescription>Complete list of church branches</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-[300px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Pastor</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.city}, {branch.state}</TableCell>
                  <TableCell>{branch.pastor}</TableCell>
                  <TableCell>{branch.members}</TableCell>
                  <TableCell>
                    <Badge variant={branch.type === 'Headquarters' ? 'default' : 'secondary'}>
                      {branch.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600">
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/settings/branches/${branch.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {branch.name}? This action cannot be undone.
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
