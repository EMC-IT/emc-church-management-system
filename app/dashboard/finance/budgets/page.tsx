'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Calendar,
  Wallet,
  BarChart3,
  Tag,
  FileText,
  Users,
  ArrowRight,
  Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';

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

// Quick Actions for budget management
const quickActions = [
  {
    title: 'Create Budget',
    description: 'Set up new budget',
    href: '/dashboard/finance/budgets/add',
    icon: Plus,
    color: 'bg-brand-primary'
  },
  {
    title: 'Manage Categories',
    description: 'Budget categories',
    href: '/dashboard/finance/budgets/categories',
    icon: Tag,
    color: 'bg-brand-secondary'
  },
  {
    title: 'View Reports',
    description: 'Budget analytics',
    href: '/dashboard/finance/budgets/reports',
    icon: BarChart3,
    color: 'bg-brand-accent'
  },
  {
    title: 'Allocate Funds',
    description: 'Manage allocations',
    href: '/dashboard/finance/budgets/allocations',
    icon: Users,
    color: 'bg-brand-success'
  }
];

export default function BudgetsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetToDelete, setBudgetToDelete] = useState<any>(null);

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

  const handleDeleteBudget = (budget: any) => {
    // In a real app, this would call an API
    console.log('Deleting budget:', budget.name);
    // For now, just show a success message or update local state
    setBudgetToDelete(null);
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
          <Button asChild>
            <Link href="/dashboard/finance/budgets/add">
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Link>
          </Button>
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

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="group hover:shadow-md transition-shadow cursor-pointer">
                <Link href={action.href} className="block p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
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
                  <TableRow 
                    key={budget.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/dashboard/finance/budgets/${budget.id}`)}
                  >
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/dashboard/finance/budgets/${budget.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => router.push(`/dashboard/finance/budgets/${budget.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setBudgetToDelete(budget)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Budget</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the budget "{budgetToDelete?.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setBudgetToDelete(null)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (budgetToDelete) {
                                    handleDeleteBudget(budgetToDelete);
                                  }
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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