'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Download,
  BadgeCent,
  Calendar
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const budgets = [
  {
    id: '1',
    name: 'Worship Ministry',
    department: 'Worship',
    amount: 15000,
    spent: 12500,
    period: '2024 Q1',
    status: 'Active',
    owner: 'Music Director',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Equipment, sound system maintenance, and worship materials',
  },
  {
    id: '2',
    name: 'Youth Ministry',
    department: 'Youth',
    amount: 10000,
    spent: 8200,
    period: '2024 Q1',
    status: 'Active',
    owner: 'Youth Pastor',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Youth events, camps, and educational materials',
  },
  {
    id: '3',
    name: 'Missions & Outreach',
    department: 'Missions',
    amount: 25000,
    spent: 23800,
    period: '2024 Q1',
    status: 'Exceeded',
    owner: 'Missions Director',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Local and international missions, community outreach',
  },
  {
    id: '4',
    name: 'Facilities & Maintenance',
    department: 'Facilities',
    amount: 20000,
    spent: 18500,
    period: '2024 Q1',
    status: 'Active',
    owner: 'Facilities Manager',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Building maintenance, utilities, and repairs',
  },
  {
    id: '5',
    name: 'Children Ministry',
    department: 'Children',
    amount: 8000,
    spent: 5200,
    period: '2024 Q1',
    status: 'Active',
    owner: 'Children Director',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    description: 'Sunday school materials, children events, and activities',
  },
];

const budgetTrends = [
  { month: 'Jan', allocated: 78000, spent: 65000 },
  { month: 'Feb', allocated: 78000, spent: 72000 },
  { month: 'Mar', allocated: 78000, spent: 68000 },
  { month: 'Apr', allocated: 82000, spent: 75000 },
  { month: 'May', allocated: 82000, spent: 78000 },
  { month: 'Jun', allocated: 82000, spent: 80000 },
];

const departmentSpending = [
  { department: 'Worship', budget: 15000, spent: 12500 },
  { department: 'Youth', budget: 10000, spent: 8200 },
  { department: 'Missions', budget: 25000, spent: 23800 },
  { department: 'Facilities', budget: 20000, spent: 18500 },
  { department: 'Children', budget: 8000, spent: 5200 },
];

export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'default';
      case 'completed': return 'outline';
      case 'exceeded': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'exceeded': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage > 100) return 'text-red-600';
    if (percentage > 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const utilizationRate = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">Plan, track, and manage church budgets across departments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Budgets
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set up a new budget for a department or ministry
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="budgetName">Budget Name</Label>
                    <Input id="budgetName" placeholder="e.g., Worship Ministry Q2" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="worship">Worship</SelectItem>
                        <SelectItem value="youth">Youth</SelectItem>
                        <SelectItem value="missions">Missions</SelectItem>
                        <SelectItem value="facilities">Facilities</SelectItem>
                        <SelectItem value="children">Children</SelectItem>
                        <SelectItem value="administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Budget Amount</Label>
                    <Input id="amount" type="number" placeholder="15000" />
                  </div>
                  <div>
                    <Label htmlFor="period">Period</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q1-2024">Q1 2024</SelectItem>
                        <SelectItem value="q2-2024">Q2 2024</SelectItem>
                        <SelectItem value="q3-2024">Q3 2024</SelectItem>
                        <SelectItem value="q4-2024">Q4 2024</SelectItem>
                        <SelectItem value="annual-2024">Annual 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="owner">Budget Owner</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="music-director">Music Director</SelectItem>
                      <SelectItem value="youth-pastor">Youth Pastor</SelectItem>
                      <SelectItem value="missions-director">Missions Director</SelectItem>
                      <SelectItem value="facilities-manager">Facilities Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of budget purpose and scope"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>
                    Create Budget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated this quarter</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Spent so far</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₵{(totalBudget - totalSpent).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ₵{getUtilizationColor(utilizationRate)}`}>
              {utilizationRate}%
            </div>
            <Progress value={utilizationRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Spending Trends</CardTitle>
            <CardDescription>Monthly budget allocation vs actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={budgetTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="allocated" stroke="#2E8CB0" strokeWidth={2} name="Allocated" />
                <Line type="monotone" dataKey="spent" stroke="#C49831" strokeWidth={2} name="Spent" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Budget Overview</CardTitle>
            <CardDescription>Budget vs spending by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentSpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#2E8CB0" name="Budget" />
                <Bar dataKey="spent" fill="#C49831" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Manage and track all department budgets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search budgets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="exceeded">Exceeded</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Budget Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudgets.map((budget) => {
                const utilization = Math.round((budget.spent / budget.amount) * 100);
                
                return (
                  <TableRow key={budget.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{budget.name}</p>
                        <p className="text-sm text-muted-foreground">{budget.period}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{budget.department}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₵{budget.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold text-orange-600">
                      ₵{budget.spent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className={getUtilizationColor(utilization)}>
                            {utilization}%
                          </span>
                        </div>
                        <Progress value={utilization} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(budget.status)} className="flex items-center space-x-1 w-fit">
                        {getStatusIcon(budget.status)}
                        <span>{budget.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{budget.owner}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
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
    </div>
  );
}