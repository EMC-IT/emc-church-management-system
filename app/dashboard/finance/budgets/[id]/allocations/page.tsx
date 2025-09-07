'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Settings, Plus, Edit, Trash2, Users, Building, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data
const mockBudgetInfo = {
  id: '1',
  name: 'Worship Ministry Q2 2024',
  totalBudget: 25000,
  allocated: 22000,
  remaining: 3000,
};

const mockAllocations = [
  {
    id: '1',
    name: 'Main Sanctuary Operations',
    type: 'Department',
    allocated: 15000,
    spent: 12000,
    remaining: 3000,
    percentage: 60,
    status: 'Active',
    responsible: 'Sarah Johnson',
    description: 'Main sanctuary worship services and equipment',
  },
  {
    id: '2',
    name: 'Youth Chapel Services',
    type: 'Department',
    allocated: 4000,
    spent: 3200,
    remaining: 800,
    percentage: 16,
    status: 'Active',
    responsible: 'Michael Brown',
    description: 'Youth worship services and activities',
  },
  {
    id: '3',
    name: 'Easter Special Event',
    type: 'Event',
    allocated: 2000,
    spent: 2000,
    remaining: 0,
    percentage: 8,
    status: 'Completed',
    responsible: 'Sarah Johnson',
    description: 'Easter worship celebration special arrangements',
  },
  {
    id: '4',
    name: 'Children Ministry Music',
    type: 'Group',
    allocated: 1000,
    spent: 500,
    remaining: 500,
    percentage: 4,
    status: 'Active',
    responsible: 'Emily Davis',
    description: 'Children worship music and instruments',
  },
];

const allocationTypes = [
  { value: 'department', label: 'Department' },
  { value: 'group', label: 'Group' },
  { value: 'event', label: 'Event' },
  { value: 'project', label: 'Project' },
];

const responsiblePersons = [
  { value: 'sarah-johnson', label: 'Sarah Johnson (Worship Director)' },
  { value: 'michael-brown', label: 'Michael Brown (Youth Pastor)' },
  { value: 'emily-davis', label: 'Emily Davis (Children Director)' },
  { value: 'david-wilson', label: 'David Wilson (Missions Coordinator)' },
  { value: 'robert-taylor', label: 'Robert Taylor (Facilities Manager)' },
];

export default function BudgetAllocationsPage() {
  const router = useRouter();
  const params = useParams();
  const [allocations, setAllocations] = useState(mockAllocations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    allocated: '',
    responsible: '',
    description: '',
  });

  useEffect(() => {
    // Simulate loading allocations
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleAddAllocation = () => {
    setEditingAllocation(null);
    setFormData({
      name: '',
      type: '',
      allocated: '',
      responsible: '',
      description: '',
    });
    setIsDialogOpen(true);
  };

  const handleEditAllocation = (allocation: any) => {
    setEditingAllocation(allocation);
    setFormData({
      name: allocation.name,
      type: allocation.type.toLowerCase(),
      allocated: allocation.allocated.toString(),
      responsible: allocation.responsible.toLowerCase().replace(' ', '-'),
      description: allocation.description,
    });
    setIsDialogOpen(true);
  };

  const handleSubmitAllocation = () => {
    if (!formData.name || !formData.type || !formData.allocated || !formData.responsible) {
      toast.error('Please fill in all required fields');
      return;
    }

    const allocatedAmount = parseFloat(formData.allocated);
    const currentTotal = allocations.reduce((sum, alloc) => 
      alloc.id !== editingAllocation?.id ? sum + alloc.allocated : sum, 0
    );
    
    if (currentTotal + allocatedAmount > mockBudgetInfo.totalBudget) {
      toast.error('Allocation exceeds remaining budget');
      return;
    }

    if (editingAllocation) {
      // Update existing allocation
      setAllocations(prev => prev.map(alloc => 
        alloc.id === editingAllocation.id 
          ? {
              ...alloc,
              name: formData.name,
              type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
              allocated: allocatedAmount,
              remaining: allocatedAmount - alloc.spent,
              percentage: Math.round((allocatedAmount / mockBudgetInfo.totalBudget) * 100),
              responsible: formData.responsible.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              description: formData.description,
            }
          : alloc
      ));
      toast.success('Allocation updated successfully');
    } else {
      // Add new allocation
      const newAllocation = {
        id: Date.now().toString(),
        name: formData.name,
        type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1),
        allocated: allocatedAmount,
        spent: 0,
        remaining: allocatedAmount,
        percentage: Math.round((allocatedAmount / mockBudgetInfo.totalBudget) * 100),
        status: 'Active',
        responsible: formData.responsible.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        description: formData.description,
      };
      setAllocations(prev => [...prev, newAllocation]);
      toast.success('Allocation added successfully');
    }

    setIsDialogOpen(false);
  };

  const handleDeleteAllocation = (id: string) => {
    setAllocations(prev => prev.filter(alloc => alloc.id !== id));
    toast.success('Allocation deleted successfully');
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.allocated, 0);
  const remainingBudget = mockBudgetInfo.totalBudget - totalAllocated;
  const allocationPercentage = (totalAllocated / mockBudgetInfo.totalBudget) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading allocations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Budget Allocations</h1>
            <p className="text-muted-foreground">{mockBudgetInfo.name}</p>
          </div>
          <Button onClick={handleAddAllocation}>
            <Plus className="h-4 w-4 mr-2" />
            Add Allocation
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{mockBudgetInfo.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available for allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allocated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {allocationPercentage.toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - allocationPercentage).toFixed(1)}% unallocated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Allocated</span>
              <span>{allocationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={allocationPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₵0</span>
              <span>₵{mockBudgetInfo.totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Allocations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Responsible</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => {
                const progress = (allocation.spent / allocation.allocated) * 100;
                return (
                  <TableRow key={allocation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{allocation.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {allocation.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{allocation.type}</Badge>
                    </TableCell>
                    <TableCell>₵{allocation.allocated.toLocaleString()}</TableCell>
                    <TableCell>₵{allocation.spent.toLocaleString()}</TableCell>
                    <TableCell>₵{allocation.remaining.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1" />
                        <div className="text-xs text-muted-foreground">
                          {progress.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{allocation.responsible}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={allocation.status === 'Active' ? 'default' : 'secondary'}
                      >
                        {allocation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditAllocation(allocation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteAllocation(allocation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Allocation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {editingAllocation ? 'Edit Allocation' : 'Add New Allocation'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Allocation Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Main Sanctuary Operations"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allocated">Amount (₵) *</Label>
                <Input
                  id="allocated"
                  type="number"
                  placeholder="5000"
                  value={formData.allocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, allocated: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="responsible">Responsible Person *</Label>
              <Select 
                value={formData.responsible} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, responsible: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select responsible person" />
                </SelectTrigger>
                <SelectContent>
                  {responsiblePersons.map((person) => (
                    <SelectItem key={person.value} value={person.value}>
                      {person.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of allocation purpose"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitAllocation}>
                {editingAllocation ? 'Update' : 'Add'} Allocation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}