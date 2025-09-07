'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Users,
  Building,
  UserCheck,
  Calendar,
  Package,
  ArrowRight,
  ArrowLeft,
  History,
  Plus,
  Edit,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Asset, AssetAssignment, AssetCondition } from '@/lib/types/assets';

interface AssignmentPageProps {
  params: {
    id: string;
  };
}

// Validation schema for assignment form
const assignmentFormSchema = z.object({
  type: z.enum(['department', 'group', 'person', 'location']),
  assignedTo: z.string().min(1, 'Assignment target is required'),
  assignedToType: z.string(),
  assignedDate: z.string().min(1, 'Assignment date is required'),
  actualReturnDate: z.string().optional(),
  conditionAtAssignment: z.nativeEnum(AssetCondition),
  assignmentNotes: z.string().optional(),
  isTemporary: z.boolean().default(false),
  expectedReturnDate: z.string().optional()
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

// Mock asset data
const mockAsset: Asset = {
  id: '1',
  name: 'Sound Mixing Console',
  description: 'Professional digital mixing console for main sanctuary audio system',
  category: 'AUDIO_VISUAL' as any,
  status: 'ACTIVE' as any,
  condition: 'EXCELLENT' as any,
  priority: 'high' as any,
  purchasePrice: 25000,
  currentValue: 22000,
  depreciationRate: 10,
  currency: 'GHS',
  location: 'Main Sanctuary',
  assignedTo: 'John Smith',
  assignedDepartment: 'Media Ministry',
  assignedGroup: 'Sound Team',
  purchaseDate: '2023-08-15',
  warrantyExpiry: '2025-08-15',
  lastMaintenance: '2023-12-01',
  nextMaintenance: '2024-06-01',
  serialNumber: 'YM2023CL5001',
  model: 'CL5',
  manufacturer: 'Yamaha',
  createdBy: 'admin',
  updatedBy: 'john.smith',
  createdAt: '2023-08-15T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z'
};

// Mock assignment history
const mockAssignmentHistory: AssetAssignment[] = [
  {
    id: '1',
    assetId: '1',
    type: 'department' as any,
    status: 'active' as any,
    assignedTo: 'Media Ministry',
    assignedToType: 'department',
    assignedBy: 'admin',
    assignedDate: '2023-08-15',
    conditionAtAssignment: AssetCondition.EXCELLENT,
    assignmentNotes: 'Assigned for main sanctuary audio operations',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2023-08-15T10:30:00Z'
  },
  {
    id: '2',
    assetId: '1',
    type: 'group' as any,
    status: 'active' as any,
    assignedTo: 'Sound Team',
    assignedToType: 'group',
    assignedBy: 'admin',
    assignedDate: '2023-08-15',
    conditionAtAssignment: AssetCondition.EXCELLENT,
    assignmentNotes: 'Specific assignment to sound team for daily operations',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-08-15T10:45:00Z',
    updatedAt: '2023-08-15T10:45:00Z'
  },
  {
    id: '3',
    assetId: '1',
    type: 'person' as any,
    status: 'active' as any,
    assignedTo: 'John Smith',
    assignedToType: 'person',
    assignedBy: 'admin',
    assignedDate: '2023-09-01',
    conditionAtAssignment: AssetCondition.EXCELLENT,
    assignmentNotes: 'Primary operator responsible for setup and maintenance coordination',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-09-01T09:00:00Z',
    updatedAt: '2023-09-01T09:00:00Z'
  },
  {
    id: '4',
    assetId: '1',
    type: 'person' as any,
    status: 'returned' as any,
    assignedTo: 'Mike Johnson',
    assignedToType: 'person',
    assignedBy: 'admin',
    assignedDate: '2023-07-01',
    actualReturnDate: '2023-08-14',
    conditionAtAssignment: AssetCondition.GOOD,
    conditionAtReturn: AssetCondition.EXCELLENT,
    assignmentNotes: 'Temporary assignment for summer events setup',
    returnNotes: 'Returned in excellent condition after professional cleaning',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-07-01T10:00:00Z',
    updatedAt: '2023-08-14T16:00:00Z'
  }
];

// Mock data for dropdowns
const departments = [
  'Media Ministry',
  'Worship Ministry',
  'Children Ministry',
  'Youth Ministry',
  'Administration',
  'Facilities',
  'Security',
  'Kitchen Ministry'
];

const groups = [
  'Sound Team',
  'Video Team',
  'Lighting Team',
  'Worship Team',
  'Choir',
  'Ushers',
  'Security Team',
  'Cleaning Team'
];

const people = [
  'John Smith',
  'Mary Johnson',
  'David Wilson',
  'Sarah Brown',
  'Michael Davis',
  'Lisa Anderson',
  'Robert Taylor',
  'Jennifer Wilson'
];

const locations = [
  'Main Sanctuary',
  'Fellowship Hall',
  'Children Church',
  'Youth Center',
  'Office Building',
  'Kitchen',
  'Storage Room',
  'Parking Lot',
  'Prayer Garden'
];

export default function AssignmentPage({ params }: AssignmentPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assignmentHistory, setAssignmentHistory] = useState<AssetAssignment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssetAssignment | null>(null);
  const [assignmentType, setAssignmentType] = useState<string>('');

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      isTemporary: false,
      conditionAtAssignment: AssetCondition.EXCELLENT
    }
  });

  useEffect(() => {
    // Simulate API call to fetch asset and assignment data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAsset(mockAsset);
        setAssignmentHistory(mockAssignmentHistory);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load assignment data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-brand-success">Active</Badge>;
      case 'returned':
        return <Badge variant="outline">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'department':
        return <Badge className="bg-brand-primary">Department</Badge>;
      case 'group':
        return <Badge className="bg-brand-secondary">Group</Badge>;
      case 'person':
        return <Badge className="bg-brand-accent">Person</Badge>;
      case 'location':
        return <Badge variant="outline">Location</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT:
        return <Badge className="bg-brand-success">Excellent</Badge>;
      case AssetCondition.GOOD:
        return <Badge className="bg-brand-secondary">Good</Badge>;
      case AssetCondition.FAIR:
        return <Badge variant="secondary">Fair</Badge>;
      case AssetCondition.POOR:
        return <Badge variant="destructive">Poor</Badge>;
      case AssetCondition.DAMAGED:
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const onSubmit = async (data: AssignmentFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Assignment data:', data);
      toast.success(editingAssignment ? 'Assignment updated successfully!' : 'Asset assigned successfully!');
      setIsDialogOpen(false);
      setEditingAssignment(null);
      form.reset();
      setAssignmentType('');
      
      // Refresh data
      // In a real app, you would refetch the data
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    }
  };

  const handleEdit = (assignment: AssetAssignment) => {
    setEditingAssignment(assignment);
    setAssignmentType(assignment.type);
    form.reset({
      type: assignment.type as any,
      assignedTo: assignment.assignedTo,
      assignedToType: assignment.assignedToType,
      assignedDate: assignment.assignedDate,
      actualReturnDate: assignment.actualReturnDate || '',
      conditionAtAssignment: assignment.conditionAtAssignment,
      assignmentNotes: assignment.assignmentNotes || '',
      isTemporary: !!assignment.actualReturnDate,
      expectedReturnDate: assignment.expectedReturnDate || ''
    });
    setIsDialogOpen(true);
  };

  const handleReturn = async (assignmentId: string) => {
    if (confirm('Are you sure you want to mark this assignment as returned?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('Assignment marked as returned successfully!');
        // In a real app, you would refetch the data
      } catch (error) {
        console.error('Error returning assignment:', error);
        toast.error('Failed to mark assignment as returned');
      }
    }
  };

  const getAssignmentOptions = () => {
    switch (assignmentType) {
      case 'department':
        return departments;
      case 'group':
        return groups;
      case 'person':
        return people;
      case 'location':
        return locations;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Asset not found</h3>
          <p className="text-muted-foreground">The asset you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/assets">Back to Assets</Link>
          </Button>
        </div>
      </div>
    );
  }

  const activeAssignments = assignmentHistory.filter(a => a.status === 'active');
  const returnedAssignments = assignmentHistory.filter(a => a.status === 'returned');
  const overdueAssignments = assignmentHistory.filter(a => 
    a.status === 'active' && a.expectedReturnDate && new Date(a.expectedReturnDate) < new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/dashboard/assets/${params.id}`)}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <Users className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Assignment</h1>
            <p className="text-gray-600">Manage assignments for {asset.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingAssignment(null);
                setAssignmentType('');
                form.reset({
                  isTemporary: false,
                  conditionAtAssignment: AssetCondition.EXCELLENT
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </DialogTitle>
                <DialogDescription>
                  {editingAssignment ? 'Update assignment details' : 'Assign this asset to a department, group, person, or location'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Type *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setAssignmentType(value);
                            form.setValue('assignedTo', '');
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="department">Department</SelectItem>
                            <SelectItem value="group">Group</SelectItem>
                            <SelectItem value="person">Person</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {assignmentType && (
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assign To *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={`Select ${assignmentType}`} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getAssignmentOptions().map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="conditionAtAssignment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Condition *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select condition" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(AssetCondition).map((condition) => (
                                <SelectItem key={condition} value={condition}>
                                  {condition.replace('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Actual Return Date - Only show when editing returned assignments */}
                  {editingAssignment && (editingAssignment.status === 'returned' || editingAssignment.actualReturnDate) && (
                    <FormField
                      control={form.control}
                      name="actualReturnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actual Return Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            The date when this asset was actually returned
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isTemporary"
                      checked={form.watch('isTemporary')}
                      onChange={(e) => form.setValue('isTemporary', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isTemporary">Temporary Assignment</Label>
                  </div>

                  {form.watch('isTemporary') && (
                    <FormField
                      control={form.control}
                      name="expectedReturnDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expected Return Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>
                            When should this asset be returned?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="assignmentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assignment Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes about this assignment"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingAssignment ? 'Update' : 'Create'} Assignment
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Assignment Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently assigned
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Past return date
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignment Details */}
      {activeAssignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Assignments</CardTitle>
            <CardDescription>
              Active assignments for this asset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {assignment.type === 'department' && <Building className="h-5 w-5 text-brand-primary" />}
                      {assignment.type === 'group' && <Users className="h-5 w-5 text-brand-secondary" />}
                      {assignment.type === 'person' && <UserCheck className="h-5 w-5 text-brand-accent" />}
                      {assignment.type === 'location' && <Package className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <p className="font-medium">{assignment.assignedTo}</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned on {formatDate(assignment.assignedDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(assignment.type)}
                      {getStatusBadge(assignment.status)}
                      {getConditionBadge(assignment.conditionAtAssignment)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReturn(assignment.id)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment History */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment History</CardTitle>
          <CardDescription>
            Complete history of all assignments for this asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignmentHistory.map((assignment, index) => (
              <div key={assignment.id} className="relative">
                {index < assignmentHistory.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                      {assignment.type === 'department' && <Building className="h-5 w-5" />}
                      {assignment.type === 'group' && <Users className="h-5 w-5" />}
                      {assignment.type === 'person' && <UserCheck className="h-5 w-5" />}
                      {assignment.type === 'location' && <Package className="h-5 w-5" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{assignment.assignedTo}</p>
                        {getTypeBadge(assignment.type)}
                        {getStatusBadge(assignment.status)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(assignment.assignedDate)}
                        </span>
                        {assignment.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(assignment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Assigned:</span> {formatDate(assignment.assignedDate)}
                      </div>
                      {assignment.actualReturnDate && (
                        <div>
                          <span className="font-medium">Returned:</span> {formatDate(assignment.actualReturnDate)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Condition:</span> {assignment.conditionAtAssignment.replace('_', ' ')}
                      </div>
                      {assignment.conditionAtReturn && (
                        <div>
                          <span className="font-medium">Return Condition:</span> {assignment.conditionAtReturn.replace('_', ' ')}
                        </div>
                      )}
                    </div>
                    
                    {assignment.assignmentNotes && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Notes:</span> {assignment.assignmentNotes}
                        </p>
                      </div>
                    )}
                    
                    {assignment.returnNotes && (
                      <div className="mt-1">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Return Notes:</span> {assignment.returnNotes}
                        </p>
                      </div>
                    )}
                    
                    {assignment.expectedReturnDate && assignment.status === 'active' && (
                      <div className="mt-2">
                        <Badge 
                          variant={new Date(assignment.expectedReturnDate) < new Date() ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Expected return: {formatDate(assignment.expectedReturnDate)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {assignmentHistory.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No assignments yet</h3>
                <p className="text-muted-foreground">
                  This asset hasn't been assigned to anyone yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}