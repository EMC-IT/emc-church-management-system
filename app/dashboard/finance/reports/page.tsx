'use client';

import { useState } from 'react';
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
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Eye,
  Filter
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const financialSummary = {
  totalIncome: 285000,
  totalExpenses: 245000,
  netIncome: 40000,
  growthRate: 12.5,
  previousPeriod: {
    totalIncome: 254000,
    totalExpenses: 220000,
    netIncome: 34000,
  }
};

const monthlyData = [
  { month: 'Jan', income: 45000, expenses: 38000, net: 7000 },
  { month: 'Feb', income: 48000, expenses: 41000, net: 7000 },
  { month: 'Mar', income: 52000, expenses: 44000, net: 8000 },
  { month: 'Apr', income: 47000, expenses: 40000, net: 7000 },
  { month: 'May', income: 51000, expenses: 42000, net: 9000 },
  { month: 'Jun', income: 42000, expenses: 40000, net: 2000 },
];

const incomeBreakdown = [
  { category: 'Tithes', amount: 180000, percentage: 63.2, color: '#2E8CB0' },
  { category: 'Offerings', amount: 65000, percentage: 22.8, color: '#C49831' },
  { category: 'Special Donations', amount: 25000, percentage: 8.8, color: '#A2CD5E' },
  { category: 'Fundraising', amount: 15000, percentage: 5.3, color: '#E74C3C' },
];

const expenseBreakdown = [
  { category: 'Salaries & Benefits', amount: 120000, percentage: 49.0, color: '#2E8CB0' },
  { category: 'Facilities & Utilities', amount: 45000, percentage: 18.4, color: '#C49831' },
  { category: 'Missions & Outreach', amount: 35000, percentage: 14.3, color: '#A2CD5E' },
  { category: 'Ministry Programs', amount: 25000, percentage: 10.2, color: '#E74C3C' },
  { category: 'Administration', amount: 20000, percentage: 8.2, color: '#9B59B6' },
];

const departmentReports = [
  {
    id: '1',
    department: 'Worship Ministry',
    budget: 15000,
    spent: 12500,
    income: 8000,
    variance: -4500,
    status: 'On Track',
  },
  {
    id: '2',
    department: 'Youth Ministry',
    budget: 10000,
    spent: 8200,
    income: 5000,
    variance: -3200,
    status: 'On Track',
  },
  {
    id: '3',
    department: 'Missions',
    budget: 25000,
    spent: 23800,
    income: 15000,
    variance: -8800,
    status: 'Over Budget',
  },
  {
    id: '4',
    department: 'Facilities',
    budget: 20000,
    spent: 18500,
    income: 2000,
    variance: -16500,
    status: 'On Track',
  },
];

const availableReports = [
  {
    id: '1',
    name: 'Monthly Financial Summary',
    description: 'Complete overview of income, expenses, and net position',
    type: 'Summary',
    period: 'Monthly',
    lastGenerated: '2024-01-21',
  },
  {
    id: '2',
    name: 'Donor Contribution Report',
    description: 'Individual and family giving patterns and totals',
    type: 'Giving',
    period: 'Quarterly',
    lastGenerated: '2024-01-15',
  },
  {
    id: '3',
    name: 'Budget vs Actual Analysis',
    description: 'Variance analysis across all departments and categories',
    type: 'Budget',
    period: 'Monthly',
    lastGenerated: '2024-01-20',
  },
  {
    id: '4',
    name: 'Tax Deduction Statements',
    description: 'Annual giving statements for tax purposes',
    type: 'Tax',
    period: 'Annual',
    lastGenerated: '2024-01-01',
  },
  {
    id: '5',
    name: 'Cash Flow Projection',
    description: 'Future cash flow analysis and projections',
    type: 'Projection',
    period: 'Quarterly',
    lastGenerated: '2024-01-18',
  },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('current-quarter');
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on track': return 'default';
      case 'over budget': return 'destructive';
      case 'under budget': return 'secondary';
      default: return 'default';
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'summary': return 'default';
      case 'giving': return 'secondary';
      case 'budget': return 'outline';
      case 'tax': return 'destructive';
      case 'projection': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive financial analysis and reporting</p>
        </div>
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
            Advanced Filters
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="income">Income Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
          <TabsTrigger value="reports">Report Library</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{financialSummary.totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +₵{(financialSummary.totalIncome - financialSummary.previousPeriod.totalIncome).toLocaleString()}
                  </span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₵{financialSummary.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">
                    +₵{(financialSummary.totalExpenses - financialSummary.previousPeriod.totalExpenses).toLocaleString()}
                  </span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₵{financialSummary.netIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    +₵{(financialSummary.netIncome - financialSummary.previousPeriod.netIncome).toLocaleString()}
                  </span> from last period
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{financialSummary.growthRate}%
                </div>
                <p className="text-xs text-muted-foreground">Year over year</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trends</CardTitle>
                <CardDescription>Income vs expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="income" stroke="#2E8CB0" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#C49831" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="net" stroke="#A2CD5E" strokeWidth={2} name="Net" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Budget vs actual spending by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentReports.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{dept.department}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              ₵{dept.spent.toLocaleString()} / ₵{dept.budget.toLocaleString()}
                            </span>
                            <Badge variant={getStatusColor(dept.status)}>
                              {dept.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Income Distribution</CardTitle>
                <CardDescription>Breakdown of income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={incomeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {incomeBreakdown.map((entry, index) => (
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
                <CardTitle>Income Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{item.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>Breakdown of expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expenseBreakdown.map((entry, index) => (
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
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{item.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate and download financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{report.name}</CardTitle>
                          <Badge variant={getReportTypeColor(report.type)}>
                            {report.type}
                          </Badge>
                        </div>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Period:</span>
                          <span className="font-medium">{report.period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Generated:</span>
                          <span className="font-medium">{new Date(report.lastGenerated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}