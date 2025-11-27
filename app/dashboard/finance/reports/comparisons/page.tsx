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
  BarChart3,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ComposedChart, Area, AreaChart, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

// Mock data for comparison reports
const incomeVsExpensesData = [
  { month: 'Jan', income: 71000, expenses: 35000, net: 36000, margin: 50.7 },
  { month: 'Feb', income: 73500, expenses: 37000, net: 36500, margin: 49.7 },
  { month: 'Mar', income: 81500, expenses: 38000, net: 43500, margin: 53.4 },
  { month: 'Apr', income: 70500, expenses: 35000, net: 35500, margin: 50.4 },
  { month: 'May', income: 79000, expenses: 37000, net: 42000, margin: 53.2 },
  { month: 'Jun', income: 78800, expenses: 39200, net: 39600, margin: 50.3 },
  { month: 'Jul', income: 86200, expenses: 40000, net: 46200, margin: 53.6 },
  { month: 'Aug', income: 87000, expenses: 39000, net: 48000, margin: 55.2 },
  { month: 'Sep', income: 83800, expenses: 37000, net: 46800, margin: 55.8 },
  { month: 'Oct', income: 92000, expenses: 41000, net: 51000, margin: 55.4 },
  { month: 'Nov', income: 98000, expenses: 42200, net: 55800, margin: 56.9 },
  { month: 'Dec', income: 110000, expenses: 46000, net: 64000, margin: 58.2 },
];

const yearOverYearData = [
  { 
    category: 'Total Income', 
    year2022: 720000, 
    year2023: 810000, 
    year2024: 911200, 
    growth2023: 12.5, 
    growth2024: 12.5,
    trend: 'up'
  },
  { 
    category: 'Total Expenses', 
    year2022: 580000, 
    year2023: 650000, 
    year2024: 466200, 
    growth2023: 12.1, 
    growth2024: -28.3,
    trend: 'down'
  },
  { 
    category: 'Net Income', 
    year2022: 140000, 
    year2023: 160000, 
    year2024: 445000, 
    growth2023: 14.3, 
    growth2024: 178.1,
    trend: 'up'
  },
  { 
    category: 'Tithes', 
    year2022: 450000, 
    year2023: 510000, 
    year2024: 584000, 
    growth2023: 13.3, 
    growth2024: 14.5,
    trend: 'up'
  },
  { 
    category: 'Offerings', 
    year2022: 180000, 
    year2023: 200000, 
    year2024: 225000, 
    growth2023: 11.1, 
    growth2024: 12.5,
    trend: 'up'
  },
  { 
    category: 'Special Donations', 
    year2022: 60000, 
    year2023: 70000, 
    year2024: 77200, 
    growth2023: 16.7, 
    growth2024: 10.3,
    trend: 'up'
  },
];

const quarterlyComparison = [
  { quarter: 'Q1', income2023: 195000, expenses2023: 165000, income2024: 226000, expenses2024: 110000 },
  { quarter: 'Q2', income2023: 205000, expenses2023: 170000, income2024: 228300, expenses2024: 111200 },
  { quarter: 'Q3', income2023: 210000, expenses2023: 175000, income2024: 257000, expenses2024: 116000 },
  { quarter: 'Q4', income2023: 200000, expenses2023: 140000, income2024: 199900, expenses2024: 129000 },
];

const profitabilityMetrics = [
  { metric: 'Gross Margin', value: 53.2, previousYear: 48.5, change: 4.7, target: 50.0 },
  { metric: 'Operating Margin', value: 48.8, previousYear: 44.2, change: 4.6, target: 45.0 },
  { metric: 'Net Margin', value: 48.8, previousYear: 19.8, change: 29.0, target: 25.0 },
  { metric: 'ROI', value: 35.6, previousYear: 13.6, change: 22.0, target: 20.0 },
];

const growthMetrics = [
  { metric: 'Income Growth', value: 12.5, previousYear: 12.5, benchmark: 8.0, status: 'excellent' },
  { metric: 'Expense Growth', value: -28.3, previousYear: 12.1, benchmark: 5.0, status: 'excellent' },
  { metric: 'Donor Growth', value: 8.2, previousYear: 6.5, benchmark: 5.0, status: 'good' },
  { metric: 'Asset Growth', value: 5.9, previousYear: 4.2, benchmark: 3.0, status: 'good' },
];

const comparisonSummary = {
  totalIncomeGrowth: 12.5,
  totalExpenseGrowth: -28.3,
  netIncomeGrowth: 178.1,
  profitMargin: 48.8,
  previousProfitMargin: 19.8,
  bestPerformingCategory: 'Net Income',
  worstPerformingCategory: 'None',
};

export default function ComparisonReportsPage() {
  const router = useRouter();
  const [selectedComparison, setSelectedComparison] = useState('year-over-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getGrowthColor = (growth: number) => {
    if (growth >= 10) return 'text-green-600';
    if (growth >= 5) return 'text-blue-600';
    if (growth >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getPerformanceColor = (value: number, target: number) => {
    if (value >= target * 1.1) return 'text-green-600';
    if (value >= target) return 'text-blue-600';
    if (value >= target * 0.8) return 'text-orange-600';
    return 'text-red-600';
  };

  // Chart configurations
  const comparisonChartConfig = {
    income: { label: 'Income', color: 'hsl(var(--chart-1))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
    net: { label: 'Net', color: 'hsl(var(--chart-3))' },
    margin: { label: 'Margin', color: 'hsl(var(--chart-4))' },
  } satisfies ChartConfig;

  const yearOverYearChartConfig = {
    year2022: { label: '2022', color: 'hsl(var(--chart-1))' },
    year2023: { label: '2023', color: 'hsl(var(--chart-2))' },
    year2024: { label: '2024', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    current: { label: 'Current Year', color: 'hsl(var(--chart-1))' },
    previous: { label: 'Previous Year', color: 'hsl(var(--chart-2))' },
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
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comparison Reports</h1>
            <p className="text-muted-foreground">Income vs Expenses and Year-to-Year trends</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Select value={selectedComparison} onValueChange={setSelectedComparison}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="year-over-year">Year over Year</SelectItem>
              <SelectItem value="quarter-over-quarter">Quarter over Quarter</SelectItem>
              <SelectItem value="month-over-month">Month over Month</SelectItem>
              <SelectItem value="budget-vs-actual">Budget vs Actual</SelectItem>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{comparisonSummary.totalIncomeGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Growth</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{comparisonSummary.totalExpenseGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Growth</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{comparisonSummary.netIncomeGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comparisonSummary.profitMargin}%</div>
            <p className="text-xs text-green-600">
              +{(comparisonSummary.profitMargin - comparisonSummary.previousProfitMargin).toFixed(1)}% vs last year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Category</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{comparisonSummary.bestPerformingCategory}</div>
            <p className="text-xs text-muted-foreground">Top performer</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">Excellent</div>
            <p className="text-xs text-muted-foreground">Financial health</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income-expenses">Income vs Expenses</TabsTrigger>
          <TabsTrigger value="year-over-year">Year over Year</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses Trend</CardTitle>
                <CardDescription>Monthly comparison with profit margin</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={comparisonChartConfig} className="h-[300px] w-full">
                  <ComposedChart data={incomeVsExpensesData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar yAxisId="left" dataKey="income" fill="hsl(var(--chart-1))" name="Income" radius={[8, 8, 0, 0]} />
                    <Bar yAxisId="left" dataKey="expenses" fill="hsl(var(--chart-2))" name="Expenses" radius={[8, 8, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="hsl(var(--chart-4))" strokeWidth={3} name="Margin %" dot={{ fill: 'hsl(var(--chart-4))' }} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance</CardTitle>
                <CardDescription>2023 vs 2024 quarterly comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={yearOverYearChartConfig} className="h-[300px] w-full">
                  <BarChart data={quarterlyComparison} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="quarter" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="income2023" fill="hsl(var(--chart-1))" name="Income 2023" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="income2024" fill="hsl(var(--chart-2))" name="Income 2024" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses2023" fill="hsl(var(--chart-3))" name="Expenses 2023" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses2024" fill="hsl(var(--chart-4))" name="Expenses 2024" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income-expenses" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income vs Expenses</CardTitle>
                <CardDescription>Detailed monthly breakdown with net income</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={comparisonChartConfig} className="h-[400px] w-full">
                  <ComposedChart data={incomeVsExpensesData} margin={{ left: 12, right: 12 }}>
                    <defs>
                      <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="income" fill="url(#fillIncome)" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Income" />
                    <Area type="monotone" dataKey="expenses" fill="url(#fillExpenses)" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-3))" strokeWidth={3} name="Net Income" dot={{ fill: 'hsl(var(--chart-3))' }} />
                  </ComposedChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Summary</CardTitle>
                <CardDescription>Key metrics for each month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Income</TableHead>
                      <TableHead>Expenses</TableHead>
                      <TableHead>Net Income</TableHead>
                      <TableHead>Margin %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeVsExpensesData.slice(-6).map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell>₵{month.income.toLocaleString()}</TableCell>
                        <TableCell>₵{month.expenses.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600">₵{month.net.toLocaleString()}</TableCell>
                        <TableCell>{month.margin.toFixed(1)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="year-over-year" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>Growth trends across key financial categories</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>2022</TableHead>
                    <TableHead>2023</TableHead>
                    <TableHead>2024</TableHead>
                    <TableHead>2023 Growth</TableHead>
                    <TableHead>2024 Growth</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yearOverYearData.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell>₵{item.year2022.toLocaleString()}</TableCell>
                      <TableCell>₵{item.year2023.toLocaleString()}</TableCell>
                      <TableCell>₵{item.year2024.toLocaleString()}</TableCell>
                      <TableCell className={getGrowthColor(item.growth2023)}>
                        <div className="flex items-center space-x-1">
                          {getGrowthIcon(item.growth2023)}
                          <span>{item.growth2023 >= 0 ? '+' : ''}{item.growth2023.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className={getGrowthColor(item.growth2024)}>
                        <div className="flex items-center space-x-1">
                          {getGrowthIcon(item.growth2024)}
                          <span>{item.growth2024 >= 0 ? '+' : ''}{item.growth2024.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.trend === 'up' ? 'default' : 'secondary'}>
                          {item.trend === 'up' ? 'Growing' : 'Declining'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Metrics</CardTitle>
                <CardDescription>Key profitability indicators vs targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitabilityMetrics.map((metric) => (
                    <div key={metric.metric} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{metric.metric}</span>
                        <div className="text-right">
                          <span className={`font-bold ${getPerformanceColor(metric.value, metric.target)}`}>
                            {metric.value.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            (Target: {metric.target.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-600" 
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Previous: {metric.previousYear.toFixed(1)}%</span>
                        <span className={getGrowthColor(metric.change)}>
                          {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>Growth performance vs benchmarks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {growthMetrics.map((metric) => (
                    <div key={metric.metric} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{metric.metric}</p>
                        <p className="text-sm text-muted-foreground">
                          Benchmark: {metric.benchmark.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getGrowthColor(metric.value)}`}>
                          {metric.value >= 0 ? '+' : ''}{metric.value.toFixed(1)}%
                        </p>
                        <Badge variant={getStatusBadge(metric.status)}>
                          {metric.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trend Analysis</CardTitle>
              <CardDescription>Multi-year growth patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={comparisonChartConfig} className="h-[400px] w-full">
                <LineChart data={[
                  { year: '2022', income: 720000, expenses: 580000, net: 140000 },
                  { year: '2023', income: 810000, expenses: 650000, net: 160000 },
                  { year: '2024', income: 911200, expenses: 466200, net: 445000 },
                ]} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" strokeWidth={3} name="Income" dot={{ fill: 'hsl(var(--chart-1))', r: 5 }} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Expenses" dot={{ fill: 'hsl(var(--chart-2))', r: 5 }} />
                  <Line type="monotone" dataKey="net" stroke="hsl(var(--chart-3))" strokeWidth={3} name="Net Income" dot={{ fill: 'hsl(var(--chart-3))', r: 5 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}