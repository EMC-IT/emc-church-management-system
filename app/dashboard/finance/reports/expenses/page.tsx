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
  Receipt,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingDown,
  Building,
  Users,
  Zap,
  Heart,
  Settings
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from 'recharts';

// Mock data for expense reports
const expenseByCategory = [
  { category: 'Salaries & Benefits', amount: 120000, percentage: 49.0, budget: 125000, variance: -5000, color: '#2E8DB0' },
  { category: 'Facilities & Utilities', amount: 45000, percentage: 18.4, budget: 42000, variance: 3000, color: '#C49831' },
  { category: 'Missions & Outreach', amount: 35000, percentage: 14.3, budget: 38000, variance: -3000, color: '#A5CF5D' },
  { category: 'Ministry Programs', amount: 25000, percentage: 10.2, budget: 28000, variance: -3000, color: '#E74C3C' },
  { category: 'Administration', amount: 20000, percentage: 8.2, budget: 22000, variance: -2000, color: '#9B59B6' },
];

const monthlyExpenseData = [
  { month: 'Jan', salaries: 18000, facilities: 6500, missions: 4200, programs: 3800, admin: 2500, total: 35000 },
  { month: 'Feb', salaries: 19000, facilities: 7200, missions: 3800, programs: 4200, admin: 2800, total: 37000 },
  { month: 'Mar', salaries: 20000, facilities: 6800, missions: 4500, programs: 3600, admin: 3100, total: 38000 },
  { month: 'Apr', salaries: 18500, facilities: 7000, missions: 3200, programs: 4000, admin: 2300, total: 35000 },
  { month: 'May', salaries: 19500, facilities: 6200, missions: 4800, programs: 3800, admin: 2700, total: 37000 },
  { month: 'Jun', salaries: 20500, facilities: 8000, missions: 3600, programs: 4200, admin: 2900, total: 39200 },
  { month: 'Jul', salaries: 21000, facilities: 7500, missions: 5200, programs: 3900, admin: 2400, total: 40000 },
  { month: 'Aug', salaries: 20800, facilities: 6900, missions: 4400, programs: 4100, admin: 2800, total: 39000 },
  { month: 'Sep', salaries: 19800, facilities: 7300, missions: 3900, programs: 3700, admin: 2300, total: 37000 },
  { month: 'Oct', salaries: 21200, facilities: 8200, missions: 4600, programs: 4300, admin: 2700, total: 41000 },
  { month: 'Nov', salaries: 22000, facilities: 7800, missions: 5000, programs: 4500, admin: 2900, total: 42200 },
  { month: 'Dec', salaries: 23000, facilities: 8500, missions: 5800, programs: 5200, admin: 3500, total: 46000 },
];

const expenseByDepartment = [
  { department: 'Worship Ministry', budget: 15000, spent: 12500, variance: -2500, percentage: 83.3, status: 'On Track' },
  { department: 'Youth Ministry', budget: 10000, spent: 8200, variance: -1800, percentage: 82.0, status: 'On Track' },
  { department: 'Missions', budget: 25000, spent: 23800, variance: -1200, percentage: 95.2, status: 'Near Limit' },
  { department: 'Facilities', budget: 20000, spent: 18500, variance: -1500, percentage: 92.5, status: 'Near Limit' },
  { department: 'Children Ministry', budget: 8000, spent: 5200, variance: -2800, percentage: 65.0, status: 'Under Budget' },
  { department: 'Administration', budget: 12000, spent: 11800, variance: -200, percentage: 98.3, status: 'Near Limit' },
];

const topExpenses = [
  { description: 'Staff Salaries - December', amount: 23000, category: 'Salaries & Benefits', date: '2024-01-01', department: 'Administration' },
  { description: 'Electricity Bill - Q4', amount: 8500, category: 'Facilities & Utilities', date: '2024-01-15', department: 'Facilities' },
  { description: 'Mission Trip - Ghana', amount: 5800, category: 'Missions & Outreach', date: '2024-01-10', department: 'Missions' },
  { description: 'Youth Camp Equipment', amount: 5200, category: 'Ministry Programs', date: '2024-01-12', department: 'Youth Ministry' },
  { description: 'Office Supplies & Software', amount: 3500, category: 'Administration', date: '2024-01-08', department: 'Administration' },
];

const expenseSummary = {
  totalExpenses: 245000,
  monthlyAverage: 20417,
  yearOverYearGrowth: 8.2,
  budgetUtilization: 87.5,
  largestCategory: 'Salaries & Benefits',
  departmentCount: 6,
};

export default function ExpenseReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on track': return 'default';
      case 'near limit': return 'destructive';
      case 'under budget': return 'secondary';
      case 'over budget': return 'destructive';
      default: return 'default';
    }
  };

  const getVarianceColor = (variance: number) => {
    return variance >= 0 ? 'text-red-600' : 'text-green-600';
  };

  const getVarianceIcon = (variance: number) => {
    return variance >= 0 ? '↗' : '↘';
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
            <Receipt className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expense Reports</h1>
            <p className="text-muted-foreground">Category and department expense analysis</p>
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
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{expenseSummary.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{expenseSummary.monthlyAverage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">+{expenseSummary.yearOverYearGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseSummary.budgetUtilization}%</div>
            <p className="text-xs text-muted-foreground">Of total budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{expenseSummary.largestCategory}</div>
            <p className="text-xs text-muted-foreground">49% of expenses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseSummary.departmentCount}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expense Trend</CardTitle>
                <CardDescription>Total expenses throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#E74C3C" fill="#E74C3C" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expenses</CardTitle>
                <CardDescription>Largest expenses this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topExpenses.map((expense, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.category} • {expense.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{expense.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
                <CardDescription>Distribution of expense categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Category performance against budget</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseByCategory.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-sm">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">₵{category.amount.toLocaleString()}</p>
                          <p className={`text-xs ${getVarianceColor(category.variance)}`}>
                            {getVarianceIcon(category.variance)} ₵{Math.abs(category.variance).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(category.amount / category.budget) * 100}%`,
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseByDepartment.map((dept) => (
                    <TableRow key={dept.department}>
                      <TableCell className="font-medium">{dept.department}</TableCell>
                      <TableCell>₵{dept.budget.toLocaleString()}</TableCell>
                      <TableCell>₵{dept.spent.toLocaleString()}</TableCell>
                      <TableCell className={getVarianceColor(-dept.variance)}>
                        ₵{Math.abs(dept.variance).toLocaleString()}
                      </TableCell>
                      <TableCell>{dept.percentage.toFixed(1)}%</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(dept.status)}>
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

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends by Category</CardTitle>
              <CardDescription>Monthly breakdown of all expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="salaries" stroke="#2E8DB0" strokeWidth={2} name="Salaries & Benefits" />
                  <Line type="monotone" dataKey="facilities" stroke="#C49831" strokeWidth={2} name="Facilities & Utilities" />
                  <Line type="monotone" dataKey="missions" stroke="#A5CF5D" strokeWidth={2} name="Missions & Outreach" />
                  <Line type="monotone" dataKey="programs" stroke="#E74C3C" strokeWidth={2} name="Ministry Programs" />
                  <Line type="monotone" dataKey="admin" stroke="#9B59B6" strokeWidth={2} name="Administration" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}