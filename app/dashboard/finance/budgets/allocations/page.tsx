'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wallet, Plus, TrendingUp, Users, Calendar, BarChart3, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

// Mock data for allocations
const allocationSummary = {
  totalAllocated: 125000,
  totalBudgets: 8,
  activeAllocations: 24,
  utilizationRate: 78
};

const recentAllocations = [
  {
    id: '1',
    budgetName: 'Youth Ministry 2024',
    department: 'Youth',
    amount: 15000,
    allocatedAmount: 12000,
    utilizationRate: 80,
    lastUpdated: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    budgetName: 'Building Maintenance',
    department: 'Facilities',
    amount: 25000,
    allocatedAmount: 18500,
    utilizationRate: 74,
    lastUpdated: '2024-01-14',
    status: 'active'
  },
  {
    id: '3',
    budgetName: 'Worship Equipment',
    department: 'Worship',
    amount: 8000,
    allocatedAmount: 7200,
    utilizationRate: 90,
    lastUpdated: '2024-01-13',
    status: 'active'
  },
  {
    id: '4',
    budgetName: 'Community Outreach',
    department: 'Outreach',
    amount: 12000,
    allocatedAmount: 8400,
    utilizationRate: 70,
    lastUpdated: '2024-01-12',
    status: 'active'
  },
  {
    id: '5',
    budgetName: 'Children Ministry',
    department: 'Children',
    amount: 6000,
    allocatedAmount: 4800,
    utilizationRate: 80,
    lastUpdated: '2024-01-11',
    status: 'active'
  }
];

const budgetOptions = [
  { id: '1', name: 'Youth Ministry 2024', department: 'Youth' },
  { id: '2', name: 'Building Maintenance', department: 'Facilities' },
  { id: '3', name: 'Worship Equipment', department: 'Worship' },
  { id: '4', name: 'Community Outreach', department: 'Outreach' },
  { id: '5', name: 'Children Ministry', department: 'Children' },
  { id: '6', name: 'Administrative', department: 'Admin' },
  { id: '7', name: 'Missions Support', department: 'Missions' },
  { id: '8', name: 'Special Events', department: 'Events' }
];

export default function AllocationsOverviewPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('');

  const filteredAllocations = recentAllocations.filter(allocation => {
    const matchesSearch = allocation.budgetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         allocation.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || allocation.department.toLowerCase() === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleAllocateFunds = () => {
    if (selectedBudget) {
      router.push(`/dashboard/finance/budgets/${selectedBudget}/allocations`);
    }
  };

  const getStatusColor = (utilizationRate: number) => {
    if (utilizationRate >= 90) return 'bg-red-500';
    if (utilizationRate >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (utilizationRate: number) => {
    if (utilizationRate >= 90) return 'High Usage';
    if (utilizationRate >= 75) return 'Moderate Usage';
    return 'Low Usage';
  };

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
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Wallet className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budget Allocations</h1>
            <p className="text-muted-foreground">Manage fund allocations across all budgets</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{allocationSummary.totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all budgets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocationSummary.totalBudgets}</div>
            <p className="text-xs text-muted-foreground">With allocations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allocations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocationSummary.activeAllocations}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocationSummary.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">Budget utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Allocate Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Allocate Funds
          </CardTitle>
          <CardDescription>
            Select a budget to allocate funds quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a budget to allocate funds" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{budget.name}</span>
                        <Badge variant="outline" className="ml-2">{budget.department}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleAllocateFunds} 
              disabled={!selectedBudget}
              className="bg-brand-primary hover:bg-brand-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Allocate Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Allocations</CardTitle>
              <CardDescription>Overview of budget allocations and utilization</CardDescription>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="flex gap-4 mt-4">
            <div className="flex-1">
              <Input
                placeholder="Search budgets or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="youth">Youth</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
                <SelectItem value="worship">Worship</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="children">Children</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="missions">Missions</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Total Budget</TableHead>
                <TableHead>Allocated</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.map((allocation) => (
                <TableRow 
                  key={allocation.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/dashboard/finance/budgets/${allocation.id}/allocations`)}
                >
                  <TableCell className="font-medium">{allocation.budgetName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{allocation.department}</Badge>
                  </TableCell>
                  <TableCell>₵{allocation.amount.toLocaleString()}</TableCell>
                  <TableCell>₵{allocation.allocatedAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{allocation.utilizationRate}%</span>
                      </div>
                      <Progress value={allocation.utilizationRate} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(allocation.utilizationRate)}`} />
                      <span className="text-sm">{getStatusText(allocation.utilizationRate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(allocation.lastUpdated).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/finance/budgets/${allocation.id}/allocations`);
                      }}
                    >
                      Manage
                    </Button>
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