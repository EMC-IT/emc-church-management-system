'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
} from 'recharts';

// Mock data
const mockBudgetInfo = {
  id: '1',
  name: 'Worship Ministry Q2 2024',
  totalBudget: 25000,
  totalSpent: 18500,
  period: 'Q2 2024',
  startDate: '2024-04-01',
  endDate: '2024-06-30',
};

const monthlyData = [
  {
    month: 'Apr 2024',
    budgeted: 8333,
    actual: 7200,
    variance: -1133,
    variancePercent: -13.6,
  },
  {
    month: 'May 2024',
    budgeted: 8333,
    actual: 9100,
    variance: 767,
    variancePercent: 9.2,
  },
  {
    month: 'Jun 2024',
    budgeted: 8334,
    actual: 2200,
    variance: -6134,
    variancePercent: -73.6,
  },
];

const categoryBreakdown = [
  {
    category: 'Equipment',
    budgeted: 8000,
    actual: 7200,
    variance: -800,
    variancePercent: -10,
    status: 'Under Budget',
  },
  {
    category: 'Licensing',
    budgeted: 5000,
    actual: 5000,
    variance: 0,
    variancePercent: 0,
    status: 'On Target',
  },
  {
    category: 'Events',
    budgeted: 7000,
    actual: 4300,
    variance: -2700,
    variancePercent: -38.6,
    status: 'Under Budget',
  },
  {
    category: 'Supplies',
    budgeted: 3000,
    actual: 1500,
    variance: -1500,
    variancePercent: -50,
    status: 'Under Budget',
  },
  {
    category: 'Training',
    budgeted: 2000,
    actual: 500,
    variance: -1500,
    variancePercent: -75,
    status: 'Under Budget',
  },
];

const weeklyTrends = [
  { week: 'Week 1', spending: 1800, budget: 2083 },
  { week: 'Week 2', spending: 2200, budget: 2083 },
  { week: 'Week 3', spending: 1900, budget: 2083 },
  { week: 'Week 4', spending: 1300, budget: 2083 },
  { week: 'Week 5', spending: 2400, budget: 2083 },
  { week: 'Week 6', spending: 1800, budget: 2083 },
  { week: 'Week 7', spending: 2100, budget: 2083 },
  { week: 'Week 8', spending: 1600, budget: 2083 },
  { week: 'Week 9', spending: 1400, budget: 2083 },
  { week: 'Week 10', spending: 1200, budget: 2083 },
  { week: 'Week 11', spending: 800, budget: 2083 },
  { week: 'Week 12', spending: 1100, budget: 2083 },
];

const pieChartData = [
  { name: 'Equipment', value: 7200, color: '#2E8DB0' },
  { name: 'Licensing', value: 5000, color: '#28ACD1' },
  { name: 'Events', value: 4300, color: '#C49831' },
  { name: 'Supplies', value: 1500, color: '#A5CF5D' },
  { name: 'Training', value: 500, color: '#080A09' },
];

const COLORS = ['#2E8DB0', '#28ACD1', '#C49831', '#A5CF5D', '#080A09'];

export default function BudgetReportsPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate loading reports
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-red-600';
    if (variance < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 0) return <TrendingUp className="h-4 w-4 text-red-600" />;
    if (variance < 0) return <TrendingDown className="h-4 w-4 text-green-600" />;
    return <AlertTriangle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'On Target':
        return 'default';
      case 'Under Budget':
        return 'secondary';
      case 'Over Budget':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalVariance = mockBudgetInfo.totalSpent - mockBudgetInfo.totalBudget;
  const totalVariancePercent = (totalVariance / mockBudgetInfo.totalBudget) * 100;
  const remainingBudget = mockBudgetInfo.totalBudget - mockBudgetInfo.totalSpent;
  const utilizationRate = (mockBudgetInfo.totalSpent / mockBudgetInfo.totalBudget) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
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
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Budget vs Actual Reports</h1>
            <p className="text-muted-foreground">{mockBudgetInfo.name} • {mockBudgetInfo.period}</p>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="monthly">Monthly View</SelectItem>
                <SelectItem value="weekly">Weekly View</SelectItem>
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
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{mockBudgetInfo.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Allocated for {mockBudgetInfo.period}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actual Spending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{mockBudgetInfo.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            {getVarianceIcon(totalVariance)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVarianceColor(totalVariance)}`}>
              {totalVariance > 0 ? '+' : ''}₵{Math.abs(totalVariance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalVariancePercent > 0 ? '+' : ''}{totalVariancePercent.toFixed(1)}% vs budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{remainingBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {(100 - utilizationRate).toFixed(1)}% remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{utilizationRate.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationRate} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>₵0</span>
              <span>₵{mockBudgetInfo.totalBudget.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                    <Bar dataKey="budgeted" fill="#2E8DB0" name="Budgeted" />
                    <Bar dataKey="actual" fill="#28ACD1" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
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

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Budgeted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Variance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>₵{month.budgeted.toLocaleString()}</TableCell>
                      <TableCell>₵{month.actual.toLocaleString()}</TableCell>
                      <TableCell className={getVarianceColor(month.variance)}>
                        {month.variance > 0 ? '+' : ''}₵{Math.abs(month.variance).toLocaleString()}
                      </TableCell>
                      <TableCell className={getVarianceColor(month.variance)}>
                        {month.variancePercent > 0 ? '+' : ''}{month.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={month.variance <= 0 ? 'secondary' : 'destructive'}>
                          {month.variance <= 0 ? 'Under Budget' : 'Over Budget'}
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
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Budgeted</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Variance</TableHead>
                    <TableHead>Variance %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryBreakdown.map((category, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>₵{category.budgeted.toLocaleString()}</TableCell>
                      <TableCell>₵{category.actual.toLocaleString()}</TableCell>
                      <TableCell className={getVarianceColor(category.variance)}>
                        {category.variance > 0 ? '+' : ''}₵{Math.abs(category.variance).toLocaleString()}
                      </TableCell>
                      <TableCell className={getVarianceColor(category.variance)}>
                        {category.variancePercent > 0 ? '+' : ''}{category.variancePercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(category.status)}>
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

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₵${value.toLocaleString()}`, '']} />
                  <Line 
                    type="monotone" 
                    dataKey="spending" 
                    stroke="#2E8DB0" 
                    strokeWidth={2}
                    name="Actual Spending"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="budget" 
                    stroke="#C49831" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Weekly Budget"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}