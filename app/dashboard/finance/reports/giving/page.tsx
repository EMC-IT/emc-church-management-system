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
  Heart,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Gift,
  Wallet,
  Star,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

// Mock data for giving reports
const givingByCategory = [
  { category: 'Tithes', amount: 180000, percentage: 66.7, donors: 245, avgDonation: 735, color: '#2E8DB0' },
  { category: 'General Offerings', amount: 45000, percentage: 16.7, donors: 180, avgDonation: 250, color: '#C49831' },
  { category: 'Special Offerings', amount: 25000, percentage: 9.3, donors: 95, avgDonation: 263, color: '#A5CF5D' },
  { category: 'Mission Offerings', amount: 12000, percentage: 4.4, donors: 65, avgDonation: 185, color: '#E74C3C' },
  { category: 'Building Fund', amount: 8000, percentage: 3.0, donors: 40, avgDonation: 200, color: '#9B59B6' },
];

const monthlyGivingData = [
  { month: 'Jan', tithes: 42000, general: 8000, special: 4000, mission: 2000, building: 1500, total: 57500 },
  { month: 'Feb', tithes: 45000, general: 9000, special: 3500, mission: 1800, building: 1200, total: 60500 },
  { month: 'Mar', tithes: 48000, general: 10000, special: 4500, mission: 2200, building: 1800, total: 66500 },
  { month: 'Apr', tithes: 44000, general: 8500, special: 3000, mission: 1500, building: 1000, total: 58000 },
  { month: 'May', tithes: 46000, general: 9500, special: 4200, mission: 2000, building: 1300, total: 63000 },
  { month: 'Jun', tithes: 47000, general: 10500, special: 3800, mission: 1700, building: 1000, total: 64000 },
  { month: 'Jul', tithes: 49000, general: 11000, special: 5000, mission: 2500, building: 1500, total: 69000 },
  { month: 'Aug', tithes: 51000, general: 11500, special: 4800, mission: 2200, building: 1500, total: 71000 },
  { month: 'Sep', tithes: 48000, general: 10000, special: 4000, mission: 1800, building: 1200, total: 65000 },
  { month: 'Oct', tithes: 52000, general: 12000, special: 5500, mission: 2800, building: 2000, total: 74300 },
  { month: 'Nov', tithes: 54000, general: 13000, special: 6000, mission: 3000, building: 2500, total: 78500 },
  { month: 'Dec', tithes: 58000, general: 15000, special: 8000, mission: 4000, building: 3000, total: 88000 },
];

const givingByFrequency = [
  { frequency: 'Weekly', donors: 120, amount: 145000, percentage: 53.7, avgPerDonor: 1208 },
  { frequency: 'Monthly', donors: 85, amount: 78000, percentage: 28.9, avgPerDonor: 918 },
  { frequency: 'Quarterly', donors: 35, amount: 32000, percentage: 11.9, avgPerDonor: 914 },
  { frequency: 'Annual', donors: 25, amount: 15000, percentage: 5.6, avgPerDonor: 600 },
];

const topGivers = [
  { name: 'Anonymous Donor', totalGiving: 25000, categories: ['Tithes', 'Building Fund'], frequency: 'Monthly', lastGift: '2024-01-20' },
  { name: 'Smith Family', totalGiving: 18000, categories: ['Tithes', 'General'], frequency: 'Weekly', lastGift: '2024-01-21' },
  { name: 'Johnson Foundation', totalGiving: 15000, categories: ['Special', 'Mission'], frequency: 'Quarterly', lastGift: '2024-01-15' },
  { name: 'Brown Family', totalGiving: 12000, categories: ['Tithes'], frequency: 'Bi-weekly', lastGift: '2024-01-19' },
  { name: 'Davis Family', totalGiving: 10000, categories: ['Tithes', 'General'], frequency: 'Monthly', lastGift: '2024-01-18' },
];

const givingMethods = [
  { method: 'Online/Digital', amount: 162000, percentage: 60.0, transactions: 1250 },
  { method: 'Cash', amount: 54000, percentage: 20.0, transactions: 890 },
  { method: 'Check', amount: 40500, percentage: 15.0, transactions: 320 },
  { method: 'Bank Transfer', amount: 13500, percentage: 5.0, transactions: 85 },
];

const givingSummary = {
  totalGiving: 270000,
  monthlyAverage: 22500,
  yearOverYearGrowth: 15.2,
  totalDonors: 315,
  averageGift: 857,
  recurringGivers: 245,
};

export default function GivingReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getFrequencyColor = (frequency: string) => {
    switch (frequency.toLowerCase()) {
      case 'weekly': return 'bg-green-500/10 text-green-600';
      case 'monthly': return 'bg-blue-500/10 text-blue-600';
      case 'quarterly': return 'bg-orange-500/10 text-orange-600';
      case 'annual': return 'bg-purple-500/10 text-purple-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  // Chart configurations
  const categoryChartConfig = {
    amount: { label: 'Amount' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    tithes: { label: 'Tithes', color: 'hsl(var(--chart-1))' },
    general: { label: 'General', color: 'hsl(var(--chart-2))' },
    special: { label: 'Special', color: 'hsl(var(--chart-3))' },
    mission: { label: 'Mission', color: 'hsl(var(--chart-4))' },
    building: { label: 'Building', color: 'hsl(var(--chart-5))' },
    total: { label: 'Total', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const frequencyChartConfig = {
    amount: { label: 'Amount', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const donorsChartConfig = {
    donors: { label: 'Donors', color: 'hsl(var(--chart-2))' },
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
            <Heart className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Giving Reports</h1>
            <p className="text-muted-foreground">All giving categories and donor analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Giving</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{givingSummary.totalGiving.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{givingSummary.monthlyAverage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{givingSummary.yearOverYearGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Givers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{givingSummary.totalDonors}</div>
            <p className="text-xs text-muted-foreground">Active givers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Gift</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{givingSummary.averageGift}</div>
            <p className="text-xs text-muted-foreground">Per gift</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Givers</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{givingSummary.recurringGivers}</div>
            <p className="text-xs text-muted-foreground">{((givingSummary.recurringGivers / givingSummary.totalDonors) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="frequency">Frequency</TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Monthly Giving Trend</CardTitle>
                <CardDescription>Total giving throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
                  <AreaChart data={monthlyGivingData} margin={{ left: 12, right: 12 }}>
                    <defs>
                      <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--chart-1))" fill="url(#fillTotal)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Givers</CardTitle>
                <CardDescription>Highest contributing givers this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topGivers.map((giver, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{giver.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getFrequencyColor(giver.frequency)}>
                            {giver.frequency}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {giver.categories.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{giver.totalGiving.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
                <CardDescription>Distribution across giving categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={givingByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${category} ${percentage}%`}
                      outerRadius={100}
                      dataKey="amount"
                      strokeWidth={2}
                    >
                      {givingByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Donors</TableHead>
                      <TableHead>Avg/Donor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {givingByCategory.map((category) => (
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
                        <TableCell>₵{category.amount.toLocaleString()}</TableCell>
                        <TableCell>{category.donors}</TableCell>
                        <TableCell>₵{category.avgDonation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Giving by Frequency</CardTitle>
                <CardDescription>How often people give</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={frequencyChartConfig} className="h-[300px] w-full">
                  <BarChart data={givingByFrequency} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="frequency" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequency Analysis</CardTitle>
                <CardDescription>Detailed frequency breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {givingByFrequency.map((freq) => (
                    <div key={freq.frequency} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{freq.frequency}</p>
                        <p className="text-sm text-muted-foreground">{freq.donors} donors</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{freq.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{freq.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Giving Methods</CardTitle>
                <CardDescription>How people prefer to give</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={givingMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ method, percentage }) => `${method} ${percentage}%`}
                      outerRadius={100}
                      dataKey="amount"
                      strokeWidth={2}
                    >
                      {givingMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'][index]} stroke="hsl(var(--background))" />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Method Performance</CardTitle>
                <CardDescription>Transaction volume by method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {givingMethods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{method.method}</p>
                        <p className="text-sm text-muted-foreground">{method.transactions} transactions</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{method.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{method.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Giving Trends by Category</CardTitle>
              <CardDescription>Monthly breakdown of all giving categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyChartConfig} className="h-[400px] w-full">
                <LineChart data={monthlyGivingData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="tithes" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Tithes" dot={{ fill: 'hsl(var(--chart-1))' }} />
                  <Line type="monotone" dataKey="general" stroke="hsl(var(--chart-2))" strokeWidth={2} name="General Offerings" dot={{ fill: 'hsl(var(--chart-2))' }} />
                  <Line type="monotone" dataKey="special" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Special Offerings" dot={{ fill: 'hsl(var(--chart-3))' }} />
                  <Line type="monotone" dataKey="mission" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Mission Offerings" dot={{ fill: 'hsl(var(--chart-4))' }} />
                  <Line type="monotone" dataKey="building" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Building Fund" dot={{ fill: 'hsl(var(--chart-5))' }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}