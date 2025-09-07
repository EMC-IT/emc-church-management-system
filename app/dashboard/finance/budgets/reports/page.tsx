'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Download, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

// Mock data for reports
const yearlyComparison = [
  {
    year: '2022',
    totalBudget: 450000,
    totalSpent: 398000,
    budgetCount: 25,
    utilization: 88.4,
  },
  {
    year: '2023',
    totalBudget: 520000,
    totalSpent: 467000,
    budgetCount: 32,
    utilization: 89.8,
  },
  {
    year: '2024',
    totalBudget: 680000,
    totalSpent: 485000,
    budgetCount: 45,
    utilization: 71.3,
  },
];

const monthlyTrends = [
  { month: 'Jan', budget: 45000, spent: 42000, variance: -3000 },
  { month: 'Feb', budget: 48000, spent: 51000, variance: 3000 },
  { month: 'Mar', budget: 52000, spent: 49000, variance: -3000 },
  { month: 'Apr', budget: 55000, spent: 58000, variance: 3000 },
  { month: 'May', budget: 60000, spent: 57000, variance: -3000 },
  { month: 'Jun', budget: 58000, spent: 61000, variance: 3000 },
  { month: 'Jul', budget: 62000, spent: 59000, variance: -3000 },
  { month: 'Aug', budget: 65000, spent: 68000, variance: 3000 },
  { month: 'Sep', budget: 63000, spent: 60000, variance: -3000 },
  { month: 'Oct', budget: 67000, spent: 70000, variance: 3000 },
  { month: 'Nov', budget: 70000, spent: 67000, variance: -3000 },
  { month: 'Dec', budget: 75000, spent: 78000, variance: 3000 },
];

const departmentPerformance = [
  {
    department: 'Worship Ministry',
    budgets: 8,
    allocated: 125000,
    spent: 89500,
    utilization: 71.6,
    variance: -35500,
    status: 'Under Budget',
  },
  {
    department: 'Youth Ministry',
    budgets: 6,
    allocated: 95000,
    spent: 87200,
    utilization: 91.8,
    variance: -7800,
    status: 'On Track',
  },
  {
    department: 'Children Ministry',
    budgets: 5,
    allocated: 75000,
    spent: 78500,
    utilization: 104.7,
    variance: 3500,
    status: 'Over Budget',
  },
  {
    department: 'Missions',
    budgets: 7,
    allocated: 110000,
    spent: 95000,
    utilization: 86.4,
    variance: -15000,
    status: 'Under Budget',
  },
  {
    department: 'Facilities',
    budgets: 4,
    allocated: 85000,
    spent: 82000,
    utilization: 96.5,
    variance: -3000,
    status: 'On Track',
  },
  {
    department: 'Administration',
    budgets: 3,
    allocated: 45000,
    spent: 43800,
    utilization: 97.3,
    variance: -1200,
    status: 'On Track',
  },
];

const categoryBreakdown = [
  { name: 'Ministry Operations', value: 285000, color: '#2E8DB0', percentage: 42 },
  { name: 'Events & Programs', value: 165000, color: '#28ACD1', percentage: 24 },
  { name: 'Building Projects', value: 135000, color: '#C49831', percentage: 20 },
  { name: 'Equipment & Technology', value: 65000, color: '#A5CF5D', percentage: 10 },
  { name: 'Training & Development', value: 30000, color: '#080A09', percentage: 4 },
];

const performanceMetrics = [
  {
    metric: 'Budget Accuracy',
    current: 89.2,
    previous: 85.7,
    change: 3.5,
    trend: 'up',
    description: 'Average variance from planned budget',
  },
  {
    metric: 'Utilization Rate',
    current: 84.6,
    previous: 87.3,
    change: -2.7,
    trend: 'down',
    description: 'Percentage of allocated budget spent',
  },
  {
    metric: 'Budget Completion',
    current: 76.8,
    previous: 72.1,
    change: 4.7,
    trend: 'up',
    description: 'Percentage of budgets completed on time',
  },
  {
    metric: 'Cost Efficiency',
    current: 92.4,
    previous: 89.8,
    change: 2.6,
    trend: 'up',
    description: 'Efficiency in budget allocation and spending',
  },
];

const COLORS = ['#2E8DB0', '#28ACD1', '#C49831', '#A5CF5D', '#080A09'];

export default function BudgetReportsPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'default';
      case 'Under Budget':
        return 'secondary';
      case 'Over Budget':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const currentYearData = yearlyComparison.find(year => year.year === selectedYear);
  const totalBudgets = departmentPerformance.reduce((sum, dept) => sum + dept.budgets, 0);
  const totalAllocated = departmentPerformance.reduce((sum, dept) => sum + dept.allocated, 0);
  const totalSpent = departmentPerformance.reduce((sum, dept) => sum + dept.spent, 0);
  const overallUtilization = (totalSpent / totalAllocated) * 100;

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
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Budget Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive budget analysis and performance tracking</p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBudgets}</div>
            <p className="text-xs text-muted-foreground">
              Across all departments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Allocated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalAllocated.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {selectedYear} budget allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {overallUtilization.toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{(totalAllocated - totalSpent).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - overallUtilization).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="yearly">Yearly Comparison</TabsTrigger>
          <TabsTrigger value="departments">Department Performance</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget vs Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                    <Area 
                      type="monotone" 
                      dataKey="budget" 
                      stackId="1" 
                      stroke="#2E8DB0" 
                      fill="#2E8DB0" 
                      fillOpacity={0.6}
                      name="Budget"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="spent" 
                      stackId="2" 
                      stroke="#28ACD1" 
                      fill="#28ACD1" 
                      fillOpacity={0.6}
                      name="Actual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yearly">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                    <Bar dataKey="totalBudget" fill="#2E8DB0" name="Total Budget" />
                    <Bar dataKey="totalSpent" fill="#28ACD1" name="Total Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Yearly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Total Budget</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Budget Count</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Growth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {yearlyComparison.map((year, index) => {
                      const previousYear = yearlyComparison[index - 1];
                      const growth = previousYear 
                        ? ((year.totalBudget - previousYear.totalBudget) / previousYear.totalBudget) * 100
                        : 0;
                      
                      return (
                        <TableRow key={year.year}>
                          <TableCell className="font-medium">{year.year}</TableCell>
                          <TableCell>₵{year.totalBudget.toLocaleString()}</TableCell>
                          <TableCell>₵{year.totalSpent.toLocaleString()}</TableCell>
                          <TableCell>{year.budgetCount}</TableCell>
                          <TableCell>{year.utilization.toFixed(1)}%</TableCell>
                          <TableCell>
                            {index > 0 && (
                              <div className={`flex items-center gap-1 ${
                                growth > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                {Math.abs(growth).toFixed(1)}%
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Budgets</TableHead>
                    <TableHead>Allocated</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentPerformance.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>{dept.budgets}</TableCell>
                      <TableCell>₵{dept.allocated.toLocaleString()}</TableCell>
                      <TableCell>₵{dept.spent.toLocaleString()}</TableCell>
                      <TableCell>{dept.utilization.toFixed(1)}%</TableCell>
                      <TableCell className={getVarianceColor(dept.variance)}>
                        {dept.variance > 0 ? '+' : ''}₵{Math.abs(dept.variance).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(dept.status)}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">₵{category.value.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">{category.percentage}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${category.percentage}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid gap-4 md:grid-cols-2">
            {performanceMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.metric}</span>
                    {getTrendIcon(metric.trend)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold">{metric.current}%</div>
                    <div className={`text-sm flex items-center gap-1 ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}% from previous period
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}