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
  TrendingUp,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Wallet,
  Heart,
  Gift,
  Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, Label } from 'recharts';
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig
} from '@/components/ui/chart';

// Mock data for income reports
const incomeBySource = [
  { source: 'Tithes', amount: 180000, percentage: 63.2, growth: 8.5, color: '#2E8DB0' },
  { source: 'Offerings', amount: 65000, percentage: 22.8, growth: 12.3, color: '#C49831' },
  { source: 'Special Donations', amount: 25000, percentage: 8.8, growth: -2.1, color: '#A5CF5D' },
  { source: 'Fundraising Events', amount: 15000, percentage: 5.3, growth: 25.4, color: '#E74C3C' },
];

const monthlyIncomeData = [
  { month: 'Jan', tithes: 42000, offerings: 18000, special: 8000, fundraising: 3000, total: 71000 },
  { month: 'Feb', tithes: 45000, offerings: 20000, special: 6000, fundraising: 2500, total: 73500 },
  { month: 'Mar', tithes: 48000, offerings: 22000, special: 7500, fundraising: 4000, total: 81500 },
  { month: 'Apr', tithes: 44000, offerings: 19000, special: 5500, fundraising: 2000, total: 70500 },
  { month: 'May', tithes: 46000, offerings: 21000, special: 8500, fundraising: 3500, total: 79000 },
  { month: 'Jun', tithes: 47000, offerings: 23000, special: 6000, fundraising: 2800, total: 78800 },
  { month: 'Jul', tithes: 49000, offerings: 24000, special: 9000, fundraising: 4200, total: 86200 },
  { month: 'Aug', tithes: 51000, offerings: 25000, special: 7200, fundraising: 3800, total: 87000 },
  { month: 'Sep', tithes: 48000, offerings: 22000, special: 8800, fundraising: 5000, total: 83800 },
  { month: 'Oct', tithes: 52000, offerings: 26000, special: 9500, fundraising: 4500, total: 92000 },
  { month: 'Nov', tithes: 54000, offerings: 28000, special: 10000, fundraising: 6000, total: 98000 },
  { month: 'Dec', tithes: 58000, offerings: 32000, special: 12000, fundraising: 8000, total: 110000 },
];

const incomeByDemographic = [
  { demographic: 'Young Adults (18-35)', amount: 45000, percentage: 15.8, donors: 120 },
  { demographic: 'Middle Age (36-55)', amount: 125000, percentage: 43.9, donors: 85 },
  { demographic: 'Seniors (56+)', amount: 95000, percentage: 33.3, donors: 65 },
  { demographic: 'Youth (Under 18)', amount: 20000, percentage: 7.0, donors: 45 },
];

const topDonors = [
  { name: 'Anonymous Donor', amount: 25000, frequency: 'Monthly', lastDonation: '2024-01-20' },
  { name: 'Smith Family', amount: 18000, frequency: 'Weekly', lastDonation: '2024-01-21' },
  { name: 'Johnson Foundation', amount: 15000, frequency: 'Quarterly', lastDonation: '2024-01-15' },
  { name: 'Brown Family', amount: 12000, frequency: 'Bi-weekly', lastDonation: '2024-01-19' },
  { name: 'Davis Family', amount: 10000, frequency: 'Monthly', lastDonation: '2024-01-18' },
];

const incomeSummary = {
  totalIncome: 285000,
  monthlyAverage: 23750,
  yearOverYearGrowth: 12.5,
  donorCount: 315,
  averageDonation: 904,
  recurringDonors: 245,
};

// Chart configurations
const sourceChartConfig = {
  amount: {
    label: 'Amount',
  },
} satisfies ChartConfig;

const monthlyChartConfig = {
  tithes: {
    label: 'Tithes',
    color: 'hsl(var(--chart-1))',
  },
  offerings: {
    label: 'Offerings',
    color: 'hsl(var(--chart-2))',
  },
  special: {
    label: 'Special',
    color: 'hsl(var(--chart-3))',
  },
  fundraising: {
    label: 'Fundraising',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig;

const trendChartConfig = {
  total: {
    label: 'Total Income',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function IncomeReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
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
            <TrendingUp className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Income Reports</h1>
            <p className="text-muted-foreground">Source analysis, trends, and monthly breakdown</p>
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
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{incomeSummary.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Average</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{incomeSummary.monthlyAverage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YoY Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{incomeSummary.yearOverYearGrowth}%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeSummary.donorCount}</div>
            <p className="text-xs text-muted-foreground">Active donors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{incomeSummary.averageDonation}</div>
            <p className="text-xs text-muted-foreground">Per donation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring Donors</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incomeSummary.recurringDonors}</div>
            <p className="text-xs text-muted-foreground">{((incomeSummary.recurringDonors / incomeSummary.donorCount) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sources">By Source</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Monthly Income Trend</CardTitle>
                <CardDescription>Income progression throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={trendChartConfig} className="h-[300px] w-full">
                  <AreaChart data={monthlyIncomeData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                      content={<ChartTooltipContent indicator="line" />} 
                    />
                    <defs>
                      <linearGradient id="fillTotalIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--chart-1))" 
                      fill="url(#fillTotalIncome)" 
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Donors</CardTitle>
                <CardDescription>Highest contributing donors this period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDonors.map((donor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-sm text-muted-foreground">{donor.frequency} • Last: {new Date(donor.lastDonation).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{donor.amount.toLocaleString()}</p>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Income by Source</CardTitle>
                <CardDescription>Distribution of income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={sourceChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip 
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />} 
                    />
                    <Pie
                      data={incomeBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ source, percentage }) => `${source} ${percentage}%`}
                      outerRadius={100}
                      dataKey="amount"
                      strokeWidth={2}
                    >
                      {incomeBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Performance</CardTitle>
                <CardDescription>Growth rates by income source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incomeBySource.map((source) => (
                    <div key={source.source} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{source.amount.toLocaleString()}</p>
                        <p className={`text-sm ${getGrowthColor(source.growth)}`}>
                          {getGrowthIcon(source.growth)} {Math.abs(source.growth)}%
                        </p>
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
              <CardTitle>Income Trends by Source</CardTitle>
              <CardDescription>Monthly breakdown of all income sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={monthlyChartConfig} className="h-[400px] w-full">
                <LineChart data={monthlyIncomeData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    className="text-xs"
                  />
                  <ChartTooltip 
                    cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                    content={<ChartTooltipContent indicator="line" />} 
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="tithes" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="offerings" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="special" 
                    stroke="hsl(var(--chart-3))" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="fundraising" 
                    stroke="hsl(var(--chart-4))" 
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Income by Age Group</CardTitle>
                <CardDescription>Contribution patterns by demographic</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={sourceChartConfig} className="h-[300px] w-full">
                  <BarChart data={incomeByDemographic} margin={{ left: 12, right: 12, bottom: 60 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="demographic" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tickLine={false}
                      axisLine={false}
                      className="text-xs"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      className="text-xs"
                    />
                    <ChartTooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                      content={<ChartTooltipContent indicator="dot" />} 
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Demographic Details</CardTitle>
                <CardDescription>Detailed breakdown by age group</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Age Group</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Donors</TableHead>
                      <TableHead>Avg/Donor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incomeByDemographic.map((demo) => (
                      <TableRow key={demo.demographic}>
                        <TableCell className="font-medium">{demo.demographic}</TableCell>
                        <TableCell>₵{demo.amount.toLocaleString()}</TableCell>
                        <TableCell>{demo.donors}</TableCell>
                        <TableCell>₵{Math.round(demo.amount / demo.donors).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}