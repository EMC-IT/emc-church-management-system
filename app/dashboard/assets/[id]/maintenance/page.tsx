'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plus,
  Calendar,
  Wrench,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  AlertTriangle,
  Package,
  Edit,
  Trash2,
  Filter,
  Download,
  Search,
  ArrowLeft
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Asset, AssetMaintenance } from '@/lib/types/assets';

interface MaintenancePageProps {
  params: {
    id: string;
  };
}

// Validation schema for maintenance form
const maintenanceFormSchema = z.object({
  type: z.enum(['preventive', 'corrective', 'emergency', 'upgrade']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  estimatedDuration: z.number().min(0.1, 'Duration must be at least 0.1 hours'),
  assignedTo: z.string().min(1, 'Assigned person is required'),
  estimatedCost: z.number().min(0, 'Cost must be positive'),
  currency: z.string().default('GHS'),
  notes: z.string().optional(),
  partsNeeded: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    estimatedCost: z.number()
  })).optional()
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

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

// Mock maintenance history
const mockMaintenanceHistory: AssetMaintenance[] = [
  {
    id: '1',
    assetId: '1',
    type: 'preventive' as any,
    status: 'completed' as any,
    priority: 'medium' as any,
    title: 'Quarterly Maintenance Check',
    description: 'Routine cleaning, calibration, and software updates',
    scheduledDate: '2023-12-01',
    completedDate: '2023-12-01',
    estimatedDuration: 2,
    actualDuration: 1.5,
    assignedTo: 'Mike Johnson',
    performedBy: 'Mike Johnson',
    estimatedCost: 200,
    actualCost: 150,
    currency: 'GHS',
    partsUsed: [
      {
        name: 'Cleaning Kit',
        quantity: 1,
        cost: 50,
        supplier: 'Audio Pro'
      }
    ],
    notes: 'All systems functioning properly. Updated firmware to latest version.',
    createdBy: 'admin',
    updatedBy: 'mike.johnson',
    createdAt: '2023-11-25T09:00:00Z',
    updatedAt: '2023-12-01T16:00:00Z'
  },
  {
    id: '2',
    assetId: '1',
    type: 'corrective' as any,
    status: 'completed' as any,
    priority: 'high' as any,
    title: 'Channel 5 Repair',
    description: 'Fixed intermittent audio dropout on channel 5',
    scheduledDate: '2023-09-15',
    completedDate: '2023-09-15',
    estimatedDuration: 3,
    actualDuration: 2,
    assignedTo: 'Mike Johnson',
    performedBy: 'Mike Johnson',
    estimatedCost: 300,
    actualCost: 250,
    currency: 'GHS',
    partsUsed: [
      {
        name: 'Input Module',
        quantity: 1,
        cost: 200,
        supplier: 'Yamaha Parts'
      }
    ],
    notes: 'Replaced faulty input module. Tested all channels - working perfectly.',
    createdBy: 'admin',
    updatedBy: 'mike.johnson',
    createdAt: '2023-09-10T11:00:00Z',
    updatedAt: '2023-09-15T15:30:00Z'
  },
  {
    id: '3',
    assetId: '1',
    type: 'preventive' as any,
    status: 'scheduled' as any,
    priority: 'medium' as any,
    title: 'Semi-Annual Deep Clean',
    description: 'Comprehensive cleaning and calibration of all components',
    scheduledDate: '2024-06-01',
    estimatedDuration: 4,
    assignedTo: 'Mike Johnson',
    estimatedCost: 300,
    currency: 'GHS',
    notes: 'Schedule during low-usage period. Coordinate with worship team.',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    assetId: '1',
    type: 'emergency' as any,
    status: 'in_progress' as any,
    priority: 'critical' as any,
    title: 'Power Supply Issue',
    description: 'Intermittent power issues causing system shutdowns',
    scheduledDate: '2024-01-20',
    estimatedDuration: 6,
    assignedTo: 'Mike Johnson',
    estimatedCost: 500,
    currency: 'GHS',
    notes: 'Urgent repair needed before Sunday service. May require external technician.',
    createdBy: 'admin',
    updatedBy: 'mike.johnson',
    createdAt: '2024-01-18T14:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z'
  }
];

// Mock technicians
const technicians = [
  'Mike Johnson',
  'Sarah Wilson',
  'David Brown',
  'Lisa Anderson',
  'External Technician'
];

export default function MaintenancePage({ params }: MaintenancePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenanceHistory, setMaintenanceHistory] = useState<AssetMaintenance[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AssetMaintenance[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<AssetMaintenance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, estimatedCost: 0 });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      currency: 'GHS',
      partsNeeded: []
    }
  });

  useEffect(() => {
    // Simulate API call to fetch asset and maintenance data
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAsset(mockAsset);
        setMaintenanceHistory(mockMaintenanceHistory);
        setFilteredHistory(mockMaintenanceHistory);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load maintenance data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  useEffect(() => {
    // Filter maintenance history based on search and filters
    let filtered = maintenanceHistory;

    if (searchTerm) {
      filtered = filtered.filter(maintenance => 
        maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        maintenance.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(maintenance => maintenance.type === typeFilter);
    }

    setFilteredHistory(filtered);
  }, [maintenanceHistory, searchTerm, statusFilter, typeFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-brand-success">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-brand-secondary">In Progress</Badge>;
      case 'scheduled':
        return <Badge className="bg-brand-accent">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-brand-accent">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'preventive':
        return <Badge className="bg-brand-success">Preventive</Badge>;
      case 'corrective':
        return <Badge className="bg-brand-secondary">Corrective</Badge>;
      case 'emergency':
        return <Badge variant="destructive">Emergency</Badge>;
      case 'upgrade':
        return <Badge className="bg-brand-primary">Upgrade</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const onSubmit = async (data: MaintenanceFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Maintenance data:', data);
      toast.success(editingMaintenance ? 'Maintenance updated successfully!' : 'Maintenance scheduled successfully!');
      setIsDialogOpen(false);
      setEditingMaintenance(null);
      form.reset();
      
      // Refresh data
      // In a real app, you would refetch the data
    } catch (error) {
      console.error('Error saving maintenance:', error);
      toast.error('Failed to save maintenance');
    }
  };

  const handleEdit = (maintenance: AssetMaintenance) => {
    setEditingMaintenance(maintenance);
    form.reset({
      type: maintenance.type as any,
      priority: maintenance.priority as any,
      title: maintenance.title,
      description: maintenance.description,
      scheduledDate: maintenance.scheduledDate,
      estimatedDuration: maintenance.estimatedDuration,
      assignedTo: maintenance.assignedTo,
      estimatedCost: maintenance.estimatedCost,
      currency: maintenance.currency,
      notes: maintenance.notes || '',
      partsNeeded: maintenance.partsUsed?.map(part => ({
        name: part.name,
        quantity: part.quantity,
        estimatedCost: part.cost
      })) || []
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (maintenanceId: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success('Maintenance record deleted successfully!');
        // In a real app, you would refetch the data
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        toast.error('Failed to delete maintenance record');
      }
    }
  };

  const addPart = () => {
    if (newPart.name.trim()) {
      const currentParts = form.getValues('partsNeeded') || [];
      form.setValue('partsNeeded', [...currentParts, newPart]);
      setNewPart({ name: '', quantity: 1, estimatedCost: 0 });
    }
  };

  const removePart = (index: number) => {
    const currentParts = form.getValues('partsNeeded') || [];
    form.setValue('partsNeeded', currentParts.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
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

  const upcomingMaintenance = maintenanceHistory.filter(m => 
    m.status === 'scheduled' && new Date(m.scheduledDate) >= new Date()
  );
  const overdueMaintenance = maintenanceHistory.filter(m => 
    m.status === 'scheduled' && new Date(m.scheduledDate) < new Date()
  );
  const inProgressMaintenance = maintenanceHistory.filter(m => m.status === 'in_progress');
  const completedMaintenance = maintenanceHistory.filter(m => m.status === 'completed');

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
            <Wrench className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Maintenance</h1>
            <p className="text-gray-600">
              Maintenance tracking for {asset.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingMaintenance(null);
                form.reset({
                  currency: 'GHS',
                  partsNeeded: []
                });
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Maintenance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMaintenance ? 'Edit Maintenance' : 'Schedule New Maintenance'}
                </DialogTitle>
                <DialogDescription>
                  {editingMaintenance ? 'Update maintenance details' : 'Schedule maintenance for this asset'}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="preventive">Preventive</SelectItem>
                              <SelectItem value="corrective">Corrective</SelectItem>
                              <SelectItem value="emergency">Emergency</SelectItem>
                              <SelectItem value="upgrade">Upgrade</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter maintenance title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the maintenance work to be performed"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedDuration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Duration (hours) *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="2.5"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="assignedTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assigned To *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select technician" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {technicians.map((tech) => (
                                <SelectItem key={tech} value={tech}>
                                  {tech}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₵</span>
                              <Input 
                                type="number" 
                                step="0.01"
                                className="pl-8"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Parts Needed */}
                  <div>
                    <Label>Parts Needed</Label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Part name"
                          value={newPart.name}
                          onChange={(e) => setNewPart(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={newPart.quantity}
                          onChange={(e) => setNewPart(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        />
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-6"
                            placeholder="Cost"
                            value={newPart.estimatedCost}
                            onChange={(e) => setNewPart(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                          />
                        </div>
                        <Button type="button" variant="outline" onClick={addPart}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {form.watch('partsNeeded') && form.watch('partsNeeded')!.length > 0 && (
                        <div className="space-y-1">
                          {form.watch('partsNeeded')!.map((part, index) => (
                            <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                              <span>{part.name} (Qty: {part.quantity}) - {formatCurrency(part.estimatedCost)}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removePart(index)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes or special instructions"
                            className="min-h-[60px]"
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
                      {editingMaintenance ? 'Update' : 'Schedule'} Maintenance
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled maintenance tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Past due maintenance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-brand-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMaintenance.length}</div>
            <p className="text-xs text-muted-foreground">
              Finished this year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Maintenance History</CardTitle>
              <CardDescription>
                All maintenance records for this asset
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search maintenance..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="preventive">Preventive</SelectItem>
                  <SelectItem value="corrective">Corrective</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((maintenance) => (
              <div key={maintenance.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{maintenance.title}</h4>
                    {getTypeBadge(maintenance.type)}
                    {getStatusBadge(maintenance.status)}
                    {getPriorityBadge(maintenance.priority)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(maintenance)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(maintenance.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {maintenance.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Scheduled:</span> {formatDate(maintenance.scheduledDate)}
                  </div>
                  <div>
                    <span className="font-medium">Assigned to:</span> {maintenance.assignedTo}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {maintenance.estimatedDuration}h
                    {maintenance.actualDuration && ` (${maintenance.actualDuration}h actual)`}
                  </div>
                  <div>
                    <span className="font-medium">Cost:</span> {formatCurrency(maintenance.estimatedCost || 0)}
                    {maintenance.actualCost && ` (${formatCurrency(maintenance.actualCost)} actual)`}
                  </div>
                </div>
                
                {maintenance.partsUsed && maintenance.partsUsed.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1">Parts Used:</p>
                    <div className="flex flex-wrap gap-1">
                      {maintenance.partsUsed.map((part, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {part.name} (x{part.quantity})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {maintenance.notes && (
                  <div className="mt-3">
                    <p className="text-xs font-medium mb-1">Notes:</p>
                    <p className="text-xs text-muted-foreground">{maintenance.notes}</p>
                  </div>
                )}
              </div>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No maintenance records found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Schedule the first maintenance for this asset'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}