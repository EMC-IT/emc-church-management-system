'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BadgeCent,
  Calendar,
  Download,
  Filter,
  Eye,
  FileBarChart,
  FileText,
  FileSpreadsheet,
  PlusCircle,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend,
  Label
} from 'recharts';

const membershipGrowth = [
  { month: 'Jan', members: 420, newMembers: 15, transfers: 5 },
  { month: 'Feb', members: 445, newMembers: 25, transfers: 8 },
  { month: 'Mar', members: 468, newMembers: 23, transfers: 12 },
  { month: 'Apr', members: 485, newMembers: 17, transfers: 6 },
  { month: 'May', members: 502, newMembers: 17, transfers: 9 },
  { month: 'Jun', members: 520, newMembers: 18, transfers: 4 },
];

const attendanceData = [
  { month: 'Jan', sunday: 365, midweek: 180, events: 120 },
  { month: 'Feb', sunday: 380, midweek: 195, events: 140 },
  { month: 'Mar', sunday: 395, midweek: 210, events: 160 },
  { month: 'Apr', sunday: 410, midweek: 205, events: 155 },
  { month: 'May', sunday: 425, midweek: 220, events: 175 },
  { month: 'Jun', sunday: 440, midweek: 235, events: 190 },
];

const givingTrends = [
  { month: 'Jan', tithes: 15000, offerings: 8000, special: 3000 },
  { month: 'Feb', tithes: 18000, offerings: 9500, special: 4500 },
  { month: 'Mar', tithes: 22000, offerings: 11000, special: 6000 },
  { month: 'Apr', tithes: 19000, offerings: 10200, special: 5200 },
  { month: 'May', tithes: 25000, offerings: 12500, special: 7500 },
  { month: 'Jun', tithes: 28000, offerings: 14000, special: 8000 },
];

const ageDistribution = [
  { name: 'Children (0-12)', value: 120, color: '#2E8DB0' },
  { name: 'Youth (13-17)', value: 85, color: '#C49831' },
  { name: 'Young Adults (18-35)', value: 150, color: '#A5CF5D' },
  { name: 'Adults (36-55)', value: 110, color: '#E74C3C' },
  { name: 'Seniors (55+)', value: 55, color: '#9B59B6' },
];

const departmentEngagement = [
  { department: 'Worship Team', members: 25, engagement: 95 },
  { department: 'Youth Ministry', members: 85, engagement: 88 },
  { department: "Women's Fellowship", members: 45, engagement: 92 },
  { department: "Men's Ministry", members: 32, engagement: 85 },
  { department: "Children's Ministry", members: 65, engagement: 90 },
  { department: 'Prayer Team', members: 28, engagement: 98 },
];

// Chart Configurations
const membershipChartConfig = {
  members: {
    label: 'Members',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const attendanceChartConfig = {
  sunday: {
    label: 'Sunday Service',
    color: 'hsl(var(--chart-1))',
  },
  midweek: {
    label: 'Midweek',
    color: 'hsl(var(--chart-2))',
  },
  events: {
    label: 'Events',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const givingChartConfig = {
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
} satisfies ChartConfig;

const ageChartConfig = {
  value: {
    label: 'Members',
  },
} satisfies ChartConfig;

export default function AnalyticsPage() {
  const handleExport = (format: string) => {
    toast.success(`Exporting analytics as ${format.toUpperCase()}...`);
    // TODO: Implement actual export logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and reports for church growth</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/analytics/reports">
              <FileBarChart className="mr-2 h-4 w-4" />
              Saved Reports
            </Link>
          </Button>
          <Select defaultValue="6months">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="1week">Last Week</SelectItem>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileText className="mr-2 h-4 w-4" />
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-brand-primary hover:bg-brand-primary/90" asChild>
            <Link href="/dashboard/analytics/report-builder">
              <PlusCircle className="mr-2 h-4 w-4" />
              Custom Report
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/dashboard/analytics/report-builder" className="block">
          <Card className="group hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary/10 rounded-lg">
                  <PlusCircle className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                    Report Builder
                  </h3>
                  <p className="text-xs text-muted-foreground">Create custom reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics/reports" className="block">
          <Card className="group hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-secondary/10 rounded-lg">
                  <FileBarChart className="h-5 w-5 text-brand-secondary" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                    Saved Reports
                  </h3>
                  <p className="text-xs text-muted-foreground">View all reports (5)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics/filters" className="block">
          <Card className="group hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-accent/10 rounded-lg">
                  <Filter className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                    Advanced Filters
                  </h3>
                  <p className="text-xs text-muted-foreground">Filter your data</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/analytics/preferences" className="block">
          <Card className="group hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-success/10 rounded-lg">
                  <Settings className="h-5 w-5 text-brand-success" />
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                    Preferences
                  </h3>
                  <p className="text-xs text-muted-foreground">Customize analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">+23.8%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success">+100 members</span> this year
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Member retention</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.6%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-brand-success">+2.3%</span> from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giving Growth</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">+18.5%</div>
            <p className="text-xs text-muted-foreground">Year over year</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
            <CardDescription>Track membership growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={membershipChartConfig} className="h-[300px] w-full">
              <AreaChart data={membershipGrowth} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="members"
                  type="natural"
                  fill="url(#fillMembers)"
                  fillOpacity={0.4}
                  stroke="hsl(var(--chart-1))"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Compare attendance across different services</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-[300px] w-full">
              <LineChart data={attendanceData} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="sunday"
                  type="monotone"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="midweek"
                  type="monotone"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="events"
                  type="monotone"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giving Analysis</CardTitle>
            <CardDescription>Monthly giving breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={givingChartConfig} className="h-[300px] w-full">
              <BarChart data={givingTrends} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="tithes" fill="hsl(var(--chart-1))" radius={4} />
                <Bar dataKey="offerings" fill="hsl(var(--chart-2))" radius={4} />
                <Bar dataKey="special" fill="hsl(var(--chart-3))" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Congregation demographics by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ageChartConfig} className="mx-auto aspect-square max-h-[300px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={ageDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                  label={({ payload, ...props }) => {
                    return (
                      <text
                        cx={props.cx}
                        cy={props.cy}
                        x={props.x}
                        y={props.y}
                        textAnchor={props.textAnchor}
                        dominantBaseline={props.dominantBaseline}
                        fill="hsl(var(--foreground))"
                      >
                        {`${payload.name}: ${payload.value}`}
                      </text>
                    );
                  }}
                >
                  {ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {ageDistribution.reduce((a, b) => a + b.value, 0)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Total Members
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Department Engagement</CardTitle>
          <CardDescription>Engagement levels across different ministries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentEngagement.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{dept.department}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {dept.members} members
                      </span>
                      <Badge variant={dept.engagement >= 90 ? 'default' : dept.engagement >= 80 ? 'secondary' : 'destructive'}>
                        {dept.engagement}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={dept.engagement} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Visualizations */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Dimensional Analysis</CardTitle>
          <CardDescription>Explore complex relationships in your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 border-4 border-brand-primary">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-primary">78%</div>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Engagement Score</p>
                <p className="text-xs text-muted-foreground">Overall member engagement</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-success/20 to-brand-success/10 border-4 border-brand-success">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-success">92%</div>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Retention Rate</p>
                <p className="text-xs text-muted-foreground">6-month member retention</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/10 border-4 border-brand-secondary">
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-secondary">85%</div>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">Service Satisfaction</p>
                <p className="text-xs text-muted-foreground">Based on feedback surveys</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Data-driven observations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Strong Growth Momentum</p>
                <p className="text-xs text-muted-foreground">
                  Membership has grown by 23.8% this year, with consistent monthly additions.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">High Youth Engagement</p>
                <p className="text-xs text-muted-foreground">
                  Youth ministry shows 88% engagement rate with growing participation.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BadgeCent className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Increased Giving</p>
                <p className="text-xs text-muted-foreground">
                  Monthly giving has increased by 18.5% compared to last year.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Actionable insights for growth</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <Eye className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Focus on Senior Ministry</p>
                <p className="text-xs text-muted-foreground">
                  Consider expanding programs for seniors (55+) as they represent the smallest demographic.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-secondary mt-0.5" />
              <div>
                <p className="text-sm font-medium">Enhance Midweek Services</p>
                <p className="text-xs text-muted-foreground">
                  Midweek attendance could be improved with more engaging programs.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <BarChart3 className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm font-medium">Leverage High Engagement</p>
                <p className="text-xs text-muted-foreground">
                  Use Prayer Team's 98% engagement as a model for other ministries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
