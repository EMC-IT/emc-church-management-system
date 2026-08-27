'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
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
  TrendingUp, 
  Users, 
  BadgeCent,
  Calendar,
  Download,
  Filter,
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
  { name: 'Youth (13-17)', value: 85, color: '#28ACD1' },
  { name: 'Young Adults (18-35)', value: 150, color: '#C49831' },
  { name: 'Adults (36-55)', value: 110, color: '#A5CF5D' },
  { name: 'Seniors (55+)', value: 55, color: '#080A09' },
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
      <PageHeader
        title="Analytics"
        actions={
          <div className="flex items-center space-x-2">
            <Select defaultValue="6months">
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
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
                <Button variant="outline" size="sm">
                  More
                  <Download className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Saved Views & Tools</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics/reports">
                    <FileBarChart className="mr-2 h-4 w-4" />
                    Saved Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics/filters">
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filters
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analytics/preferences">
                    <Settings className="mr-2 h-4 w-4" />
                    Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
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
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" asChild>
              <Link href="/dashboard/analytics/report-builder">
                <PlusCircle className="mr-1.5 h-4 w-4" />
                Custom Report
              </Link>
            </Button>
          </div>
        }
      />

      {/* 4 Key Metrics StatCards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Growth Rate"
          value="+23.8%"
          icon={TrendingUp}
          accent="success"
          trend={{ value: '+100 members this year', direction: 'up' }}
        />
        <StatCard
          title="Retention Rate"
          value="94.2%"
          icon={Users}
          accent="primary"
          trend={{ value: '94.2% retained', direction: 'up' }}
        />
        <StatCard
          title="Avg. Attendance"
          value="84.6%"
          icon={Calendar}
          accent="secondary"
          trend={{ value: '+2.3% from last month', direction: 'up' }}
        />
        <StatCard
          title="Giving Growth"
          value="+18.5%"
          icon={BadgeCent}
          accent="accent"
          trend={{ value: '+18.5% year over year', direction: 'up' }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
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
                      <Badge variant={dept.engagement >= 90 ? 'primary' : dept.engagement >= 80 ? 'neutral' : 'danger'}>
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

      {/* Multi-Dimensional Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Multi-Dimensional Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
              <div className="text-2xl font-bold text-primary">78%</div>
              <p className="font-medium text-sm text-foreground">Engagement Score</p>
              <p className="text-xs text-muted-foreground">Overall member engagement</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
              <div className="text-2xl font-bold text-primary">92%</div>
              <p className="font-medium text-sm text-foreground">Retention Rate</p>
              <p className="text-xs text-muted-foreground">6-month member retention</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-muted/40 border border-border/50 space-y-1">
              <div className="text-2xl font-bold text-primary">85%</div>
              <p className="font-medium text-sm text-foreground">Service Satisfaction</p>
              <p className="text-xs text-muted-foreground">Based on feedback surveys</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Key Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 pb-3 border-b border-border/50">
              <p className="text-sm font-medium text-foreground">Strong Growth Momentum</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Membership has grown by 23.8% this year, with consistent monthly additions.
              </p>
            </div>
            
            <div className="space-y-1 pb-3 border-b border-border/50">
              <p className="text-sm font-medium text-foreground">High Youth Engagement</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Youth ministry shows 88% engagement rate with growing participation.
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Increased Giving</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Monthly giving has increased by 18.5% compared to last year.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 pb-3 border-b border-border/50">
              <p className="text-sm font-medium text-foreground">Focus on Senior Ministry</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consider expanding programs for seniors (55+) as they represent the smallest demographic.
              </p>
            </div>
            
            <div className="space-y-1 pb-3 border-b border-border/50">
              <p className="text-sm font-medium text-foreground">Enhance Midweek Services</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Midweek attendance could be improved with more engaging programs.
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Leverage High Engagement</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use Prayer Team's 98% engagement as a model for other ministries.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
