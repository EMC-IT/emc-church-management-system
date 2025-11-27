'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Target,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, ComposedChart, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

// Mock data for budget reports
const budgetVsActual = [
  { 
    category: 'Salaries & Benefits', 
    budgeted: 125000, 
    actual: 120000, 
    variance: -5000, 
    percentage: 96.0, 
    status: 'Under Budget',
    color: '#2E8DB0'
  },
  { 
    category: 'Facilities & Utilities', 
    budgeted: 42000, 
    actual: 45000, 
    variance: 3000, 
    percentage: 107.1, 
    status: 'Over Budget',
    color: '#C49831'
  },
  { 
    category: 'Missions & Outreach', 
    budgeted: 38000, 
    actual: 35000, 
    variance: -3000, 
    percentage: 92.1, 
    status: 'Under Budget',
    color: '#A5CF5D'
  },
  { 
    category: 'Ministry Programs', 
    budgeted: 28000, 
    actual: 25000, 
    variance: -3000, 
    percentage: 89.3, 
    status: 'Under Budget',
    color: '#E74C3C'
  },
  { 
    category: 'Administration', 
    budgeted: 22000, 
    actual: 20000, 
    variance: -2000, 
    percentage: 90.9, 
    status: 'Under Budget',
    color: '#9B59B6'
  },
];

const monthlyBudgetData = [
  { month: 'Jan', budgeted: 21250, actual: 20417, variance: -833, utilization: 96.1 },
  { month: 'Feb', budgeted: 21250, actual: 20833, variance: -417, utilization: 98.0 },
  { month: 'Mar', budgeted: 21250, actual: 21667, variance: 417, utilization: 102.0 },
  { month: 'Apr', budgeted: 21250, actual: 20000, variance: -1250, utilization: 94.1 },
  { month: 'May', budgeted: 21250, actual: 20833, variance: -417, utilization: 98.0 },
  { month: 'Jun', budgeted: 21250, actual: 22083, variance: 833, utilization: 103.9 },
  { month: 'Jul', budgeted: 21250, actual: 22500, variance: 1250, utilization: 105.9 },
  { month: 'Aug', budgeted: 21250, actual: 21250, variance: 0, utilization: 100.0 },
  { month: 'Sep', budgeted: 21250, actual: 20417, variance: -833, utilization: 96.1 },
  { month: 'Oct', budgeted: 21250, actual: 22917, variance: 1667, utilization: 107.8 },
  { month: 'Nov', budgeted: 21250, actual: 23333, variance: 2083, utilization: 109.8 },
  { month: 'Dec', budgeted: 21250, actual: 25000, variance: 3750, utilization: 117.6 },
];

const departmentBudgets = [
  { 
    department: 'Worship Ministry', 
    budgeted: 15000, 
    actual: 12500, 
    remaining: 2500, 
    utilization: 83.3, 
    status: 'On Track',
    monthsLeft: 3
  },
  { 
    department: 'Youth Ministry', 
    budgeted: 10000, 
    actual: 8200, 
    remaining: 1800, 
    utilization: 82.0, 
    status: 'On Track',
    monthsLeft: 3
  },
  { 
    department: 'Missions', 
    budgeted: 25000, 
    actual: 23800, 
    remaining: 1200, 
    utilization: 95.2, 
    status: 'Near Limit',
    monthsLeft: 3
  },
  { 
    department: 'Facilities', 
    budgeted: 20000, 
    actual: 21500, 
    remaining: -1500, 
    utilization: 107.5, 
    status: 'Over Budget',
    monthsLeft: 3
  },
  { 
    department: 'Children Ministry', 
    budgeted: 8000, 
    actual: 5200, 
    remaining: 2800, 
    utilization: 65.0, 
    status: 'Under Budget',
    monthsLeft: 3
  },
  { 
    department: 'Administration', 
    budgeted: 12000, 
    actual: 11800, 
    remaining: 200, 
    utilization: 98.3, 
    status: 'Near Limit',
    monthsLeft: 3
  },
];

const budgetAlerts = [
  { 
    type: 'Over Budget', 
    department: 'Facilities', 
    amount: 1500, 
    severity: 'high',
    description: 'Exceeded budget by ₵1,500 due to unexpected repairs'
  },
  { 
    type: 'Near Limit', 
    department: 'Missions', 
    amount: 1200, 
    severity: 'medium',
    description: 'Only ₵1,200 remaining with 3 months left'
  },
  { 
    type: 'Near Limit', 
    department: 'Administration', 
    amount: 200, 
    severity: 'medium',
    description: 'Only ₵200 remaining with 3 months left'
  },
  { 
    type: 'Under Utilized', 
    department: 'Children Ministry', 
    amount: 2800, 
    severity: 'low',
    description: 'Significantly under budget - consider reallocation'
  },
];

const budgetSummary = {
  totalBudget: 255000,
  totalSpent: 245000,
  totalRemaining: 10000,
  overallUtilization: 96.1,
  departmentsOverBudget: 1,
  departmentsOnTrack: 4,
  departmentsUnderBudget: 1,
};

const quarterlyComparison = [
  { quarter: 'Q1 2023', budgeted: 63750, actual: 62917, variance: -833 },
  { quarter: 'Q2 2023', budgeted: 63750, actual: 62916, variance: -834 },
  { quarter: 'Q3 2023', budgeted: 63750, actual: 64167, variance: 417 },
  { quarter: 'Q4 2023', budgeted: 63750, actual: 70250, variance: 6500 },
];

export default function BudgetReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on track': return 'default';
      case 'near limit': return 'destructive';
      case 'over budget': return 'destructive';
      case 'under budget': return 'secondary';
      default: return 'default';
    }
  };

  const getVarianceColor = (variance: number) => {
    return variance >= 0 ? 'text-red-600' : 'text-green-600';
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  // Chart configurations
  const budgetChartConfig = {
    budgeted: { label: 'Budgeted', color: 'hsl(var(--chart-1))' },
    actual: { label: 'Actual', color: 'hsl(var(--chart-2))' },
    variance: { label: 'Variance', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;

  const utilizationChartConfig = {
    utilized: { label: 'Utilized', color: 'hsl(var(--chart-1))' },
    remaining: { label: 'Remaining', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    budgeted: { label: 'Budgeted', color: 'hsl(var(--chart-1))' },
    spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

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
            <Target className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Budget Reports</h1>
            <p className="text-muted-foreground">Planned vs actual budget analysis</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="last-quarter">Last Quarter</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{budgetSummary.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Annual budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{budgetSummary.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₵{budgetSummary.totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetSummary.overallUtilization}%</div>
            <p className="text-xs text-muted-foreground">Of total budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over Budget</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{budgetSummary.departmentsOverBudget}</div>
            <p className="text-xs text-muted-foreground">Departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{budgetSummary.departmentsOnTrack}</div>
            <p className="text-xs text-muted-foreground">Departments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{budgetSummary.departmentsUnderBudget}</div>
            <p className="text-xs text-muted-foreground">Departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Monthly Budget vs Actual</CardTitle>
                <CardDescription>Budget performance throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={budgetChartConfig} className="h-[300px] w-full">
                  <ComposedChart data={monthlyBudgetData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="budgeted" fill="hsl(var(--chart-1))" name="Budgeted" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="utilization" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Utilization %" dot={{ fill: 'hsl(var(--chart-3))' }} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Comparison</CardTitle>
                <CardDescription>Budget vs actual by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={budgetChartConfig} className="h-[300px] w-full">
                  <BarChart data={quarterlyComparison} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="budgeted" fill="hsl(var(--chart-1))" name="Budgeted" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Actual" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Category</CardTitle>
              <CardDescription>Performance across expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budgeted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetVsActual.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>₵{category.budgeted.toLocaleString()}</TableCell>
                      <TableCell>₵{category.actual.toLocaleString()}</TableCell>
                      <TableCell className={getVarianceColor(category.variance)}>
                        {category.variance >= 0 ? '+' : ''}₵{category.variance.toLocaleString()}
                      </TableCell>
                      <TableCell>{category.percentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(category.status)}>
                          {category.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Performance</CardTitle>
              <CardDescription>Budget utilization by department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Projection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentBudgets.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>₵{dept.budgeted.toLocaleString()}</TableCell>
                      <TableCell>₵{dept.actual.toLocaleString()}</TableCell>
                      <TableCell className={getVarianceColor(-dept.remaining)}>
                        ₵{dept.remaining.toLocaleString()}
                      </TableCell>
                      <TableCell>{dept.utilization.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(dept.status)}>
                          {dept.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {dept.monthsLeft} months left
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization Trend</CardTitle>
              <CardDescription>Monthly budget utilization percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyChartConfig} className="h-[400px] w-full">
                <LineChart data={monthlyBudgetData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis domain={[90, 120]} tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="utilization" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={3} 
                    name="Utilization %" 
                    dot={{ fill: 'hsl(var(--chart-1))', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey={100} 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="Target (100%)" 
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>Important budget notifications and warnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.type} - {alert.department}</h4>
                        <span className="font-bold">₵{alert.amount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}