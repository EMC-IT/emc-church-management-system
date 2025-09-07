'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FolderOpen, Edit, Wallet, BarChart3, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Mock data for category details
const mockCategoryDetails = {
  id: '1',
  name: 'Ministry Operations',
  description: 'Day-to-day ministry operations and activities including worship services, pastoral care, and regular ministry functions.',
  color: '#2E8DB0',
  status: 'Active',
  createdAt: '2024-01-15',
  lastUsed: '2024-05-20',
  budgetCount: 8,
  totalBudget: 125000,
  totalSpent: 89500,
  totalRemaining: 35500,
};

const mockBudgetsInCategory = [
  {
    id: '1',
    name: 'Worship Ministry Q2 2024',
    department: 'Worship Ministry',
    allocated: 25000,
    spent: 18500,
    remaining: 6500,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Sarah Johnson',
    utilization: 74,
  },
  {
    id: '2',
    name: 'Pastoral Care Q2 2024',
    department: 'Pastoral Care',
    allocated: 15000,
    spent: 12000,
    remaining: 3000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Pastor John Smith',
    utilization: 80,
  },
  {
    id: '3',
    name: 'Youth Ministry Operations',
    department: 'Youth Ministry',
    allocated: 20000,
    spent: 16000,
    remaining: 4000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Michael Brown',
    utilization: 80,
  },
  {
    id: '4',
    name: 'Children Ministry Q2',
    department: 'Children Ministry',
    allocated: 18000,
    spent: 14000,
    remaining: 4000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Emily Davis',
    utilization: 78,
  },
  {
    id: '5',
    name: 'Missions Operations',
    department: 'Missions',
    allocated: 22000,
    spent: 15000,
    remaining: 7000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'David Wilson',
    utilization: 68,
  },
  {
    id: '6',
    name: 'Administration Q2',
    department: 'Administration',
    allocated: 12000,
    spent: 8000,
    remaining: 4000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Lisa Anderson',
    utilization: 67,
  },
  {
    id: '7',
    name: 'Outreach Ministry',
    department: 'Outreach',
    allocated: 8000,
    spent: 4000,
    remaining: 4000,
    status: 'Active',
    period: 'Q2 2024',
    owner: 'Robert Taylor',
    utilization: 50,
  },
  {
    id: '8',
    name: 'Education Ministry Q1',
    department: 'Christian Education',
    allocated: 5000,
    spent: 2000,
    remaining: 3000,
    status: 'Completed',
    period: 'Q1 2024',
    owner: 'Sarah Johnson',
    utilization: 40,
  },
];

const monthlyTrends = [
  { month: 'Jan 2024', budgets: 2, amount: 15000 },
  { month: 'Feb 2024', budgets: 3, amount: 28000 },
  { month: 'Mar 2024', budgets: 5, amount: 45000 },
  { month: 'Apr 2024', budgets: 6, amount: 68000 },
  { month: 'May 2024', budgets: 8, amount: 125000 },
];

export default function CategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [category, setCategory] = useState(mockCategoryDetails);
  const [budgets, setBudgets] = useState(mockBudgetsInCategory);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading category details
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Completed':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const averageUtilization = budgets.reduce((sum, budget) => sum + budget.utilization, 0) / budgets.length;
  const activeBudgets = budgets.filter(budget => budget.status === 'Active').length;
  const completedBudgets = budgets.filter(budget => budget.status === 'Completed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading category details...</p>
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
            <FolderOpen className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
              <Badge variant={category.status === 'Active' ? 'default' : 'secondary'}>
                {category.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
          <Button asChild size="sm">
            <Link href={`/dashboard/finance/budgets/categories/${params.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{category.budgetCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeBudgets} active, {completedBudgets} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{category.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{category.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((category.totalSpent / category.totalBudget) * 100).toFixed(1)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageUtilization.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across active budgets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Category Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{((category.totalSpent / category.totalBudget) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={(category.totalSpent / category.totalBudget) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₵{category.totalSpent.toLocaleString()} spent</span>
              <span>₵{category.totalRemaining.toLocaleString()} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="budgets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budgets">Budgets in Category</TabsTrigger>
          <TabsTrigger value="trends">Growth Trends</TabsTrigger>
          <TabsTrigger value="details">Category Details</TabsTrigger>
        </TabsList>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>Budgets in this Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => (
                    <TableRow 
                      key={budget.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/finance/budgets/${budget.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{budget.name}</div>
                          <div className="text-sm text-muted-foreground">{budget.period}</div>
                        </div>
                      </TableCell>
                      <TableCell>{budget.department}</TableCell>
                      <TableCell>₵{budget.allocated.toLocaleString()}</TableCell>
                      <TableCell>₵{budget.spent.toLocaleString()}</TableCell>
                      <TableCell>₵{budget.remaining.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={budget.utilization} className="h-1" />
                          <div className="text-xs text-muted-foreground">
                            {budget.utilization}%
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{budget.owner}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(budget.status)}>
                          {budget.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Category Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Monthly Budget Growth</h4>
                    <div className="space-y-3">
                      {monthlyTrends.map((trend, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{trend.month}</span>
                          <div className="text-right">
                            <div className="font-medium">₵{trend.amount.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {trend.budgets} budgets
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Key Metrics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Created</span>
                        <span className="font-medium">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Last Used</span>
                        <span className="font-medium">
                          {new Date(category.lastUsed).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average Budget Size</span>
                        <span className="font-medium">
                          ₵{Math.round(category.totalBudget / category.budgetCount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Growth Rate</span>
                        <span className="font-medium text-green-600">+25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category Name</Label>
                    <p className="text-sm">{category.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <Badge variant={category.status === 'Active' ? 'default' : 'secondary'}>
                      {category.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Color</Label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm">{category.color}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                    <p className="text-sm">{new Date(category.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Used</Label>
                    <p className="text-sm">{new Date(category.lastUsed).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Budgets</Label>
                    <p className="text-sm">{category.budgetCount} budgets</p>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1">{category.description}</p>
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