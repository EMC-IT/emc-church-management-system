'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Wallet, Edit, Settings, BarChart3, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

// Mock data for budget details
const mockBudgetDetails = {
  id: '1',
  name: 'Worship Ministry Q2 2024',
  department: 'Worship Ministry',
  category: 'Ministry Operations',
  allocated: 25000,
  spent: 18500,
  remaining: 6500,
  status: 'Active',
  priority: 'High',
  period: 'Q2 2024 (Apr - Jun)',
  startDate: '2024-04-01',
  endDate: '2024-06-30',
  owner: 'Sarah Johnson (Worship Director)',
  description: 'Budget for worship ministry operations including equipment maintenance, music licensing, and special events.',
  createdAt: '2024-03-15',
  lastUpdated: '2024-05-20',
  utilization: 74,
};

const mockBudgetItems = [
  {
    id: '1',
    category: 'Equipment',
    description: 'Sound system maintenance',
    allocated: 8000,
    spent: 7200,
    remaining: 800,
    status: 'On Track',
  },
  {
    id: '2',
    category: 'Licensing',
    description: 'Music licensing fees',
    allocated: 5000,
    spent: 5000,
    remaining: 0,
    status: 'Completed',
  },
  {
    id: '3',
    category: 'Events',
    description: 'Special worship events',
    allocated: 7000,
    spent: 4300,
    remaining: 2700,
    status: 'On Track',
  },
  {
    id: '4',
    category: 'Supplies',
    description: 'Worship supplies and materials',
    allocated: 3000,
    spent: 1500,
    remaining: 1500,
    status: 'Under Budget',
  },
  {
    id: '5',
    category: 'Training',
    description: 'Team training and development',
    allocated: 2000,
    spent: 500,
    remaining: 1500,
    status: 'Under Budget',
  },
];

const mockAllocations = [
  {
    id: '1',
    department: 'Main Sanctuary',
    allocated: 15000,
    spent: 12000,
    percentage: 60,
  },
  {
    id: '2',
    department: 'Youth Chapel',
    allocated: 6000,
    spent: 4500,
    percentage: 24,
  },
  {
    id: '3',
    department: 'Children Ministry',
    allocated: 4000,
    spent: 2000,
    percentage: 16,
  },
];

const mockRecentTransactions = [
  {
    id: '1',
    date: '2024-05-20',
    description: 'Sound equipment repair',
    amount: 1200,
    category: 'Equipment',
    type: 'expense',
  },
  {
    id: '2',
    date: '2024-05-18',
    description: 'CCLI License renewal',
    amount: 2500,
    category: 'Licensing',
    type: 'expense',
  },
  {
    id: '3',
    date: '2024-05-15',
    description: 'Special event supplies',
    amount: 800,
    category: 'Events',
    type: 'expense',
  },
  {
    id: '4',
    date: '2024-05-10',
    description: 'Worship team training',
    amount: 500,
    category: 'Training',
    type: 'expense',
  },
];

export default function BudgetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [budget, setBudget] = useState(mockBudgetDetails);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading budget details
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'On Track':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Over Budget':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'On Track':
        return 'secondary';
      case 'Over Budget':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading budget details...</p>
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
            <Wallet className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{budget.name}</h1>
            <p className="text-muted-foreground">{budget.department} • {budget.period}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/finance/budgets/${params.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Budget
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{budget.allocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Budget period: {budget.period}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{budget.spent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {budget.utilization}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{budget.remaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {100 - budget.utilization}% remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={budget.status === 'Active' ? 'default' : 'secondary'}>
                {budget.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Priority: {budget.priority}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{budget.utilization}%</span>
            </div>
            <Progress value={budget.utilization} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₵0</span>
              <span>₵{budget.allocated.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Budget Items</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Budget Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBudgetItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>₵{item.allocated.toLocaleString()}</TableCell>
                      <TableCell>₵{item.spent.toLocaleString()}</TableCell>
                      <TableCell>₵{item.remaining.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(item.status)}
                          <Badge variant={getStatusVariant(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Department Allocations</CardTitle>
                <Button asChild size="sm">
                  <Link href={`/dashboard/finance/budgets/${params.id}/allocations`}>
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Allocations
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAllocations.map((allocation) => (
                  <div key={allocation.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{allocation.department}</span>
                      <span className="text-sm text-muted-foreground">
                        ₵{allocation.spent.toLocaleString()} / ₵{allocation.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(allocation.spent / allocation.allocated) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{allocation.percentage}% of total budget</span>
                      <span>{Math.round((allocation.spent / allocation.allocated) * 100)}% used</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/finance/budgets/${params.id}/reports`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                      </TableCell>
                      <TableCell className="text-red-600">
                        -₵{transaction.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Budget Owner</Label>
                    <p className="text-sm">{budget.owner}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <p className="text-sm">{budget.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <Badge variant="outline">{budget.priority}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <p className="text-sm">{new Date(budget.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p className="text-sm">{new Date(budget.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                    <p className="text-sm">{new Date(budget.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                    <p className="text-sm">{new Date(budget.lastUpdated).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{budget.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add Label component if not imported
function Label({ className, children, ...props }: { className?: string; children: React.ReactNode }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}