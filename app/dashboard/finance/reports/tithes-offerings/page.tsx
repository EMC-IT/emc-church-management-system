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
  Wallet,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Gift,
  Heart,
  Star,
  Target,
  Crown
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

// Mock data for tithes and offerings reports
const tithesVsOfferings = [
  { type: 'Tithes', amount: 180000, percentage: 80.0, givers: 245, avgGift: 735, color: '#2E8DB0' },
  { type: 'General Offerings', amount: 45000, percentage: 20.0, givers: 180, avgGift: 250, color: '#C49831' },
];

const monthlyTithesOfferingsData = [
  { month: 'Jan', tithes: 42000, offerings: 8000, total: 50000, tithers: 220, offerers: 165 },
  { month: 'Feb', tithes: 45000, offerings: 9000, total: 54000, tithers: 225, offerers: 170 },
  { month: 'Mar', tithes: 48000, offerings: 10000, total: 58000, tithers: 230, offerers: 175 },
  { month: 'Apr', tithes: 44000, offerings: 8500, total: 52500, tithers: 218, offerers: 160 },
  { month: 'May', tithes: 46000, offerings: 9500, total: 55500, tithers: 235, offerers: 172 },
  { month: 'Jun', tithes: 47000, offerings: 10500, total: 57500, tithers: 240, offerers: 178 },
  { month: 'Jul', tithes: 49000, offerings: 11000, total: 60000, tithers: 245, offerers: 180 },
  { month: 'Aug', tithes: 51000, offerings: 11500, total: 62500, tithers: 248, offerers: 182 },
  { month: 'Sep', tithes: 48000, offerings: 10000, total: 58000, tithers: 242, offerers: 175 },
  { month: 'Oct', tithes: 52000, offerings: 12000, total: 64000, tithers: 250, offerers: 185 },
  { month: 'Nov', tithes: 54000, offerings: 13000, total: 67000, tithers: 255, offerers: 190 },
  { month: 'Dec', tithes: 58000, offerings: 15000, total: 73000, tithers: 260, offerers: 200 },
];

const faithfulTithers = [
  { name: 'Smith Family', consistency: 100, monthsActive: 12, totalTithes: 18000, avgMonthly: 1500, status: 'Faithful' },
  { name: 'Johnson Family', consistency: 100, monthsActive: 12, totalTithes: 15000, avgMonthly: 1250, status: 'Faithful' },
  { name: 'Brown Family', consistency: 92, monthsActive: 11, totalTithes: 12000, avgMonthly: 1091, status: 'Consistent' },
  { name: 'Davis Family', consistency: 83, monthsActive: 10, totalTithes: 10000, avgMonthly: 1000, status: 'Regular' },
  { name: 'Wilson Family', consistency: 75, monthsActive: 9, totalTithes: 8500, avgMonthly: 944, status: 'Regular' },
];

const offeringsByService = [
  { service: 'Sunday Morning', amount: 25000, percentage: 55.6, avgPerService: 481, services: 52 },
  { service: 'Sunday Evening', amount: 12000, percentage: 26.7, avgPerService: 231, services: 52 },
  { service: 'Wednesday Prayer', amount: 5000, percentage: 11.1, avgPerService: 96, services: 52 },
  { service: 'Special Events', amount: 3000, percentage: 6.7, avgPerService: 250, services: 12 },
];

const tithesOfferingsSummary = {
  totalTithes: 180000,
  totalOfferings: 45000,
  combined: 225000,
  tithersCount: 245,
  offerersCount: 180,
  faithfulTithers: 85, // 100% consistency
  averageTithe: 735,
  averageOffering: 250,
};

const givingPatterns = [
  { pattern: 'Weekly Tithers', count: 120, amount: 95000, percentage: 52.8 },
  { pattern: 'Monthly Tithers', count: 85, amount: 65000, percentage: 36.1 },
  { pattern: 'Quarterly Tithers', count: 25, amount: 15000, percentage: 8.3 },
  { pattern: 'Irregular Tithers', count: 15, amount: 5000, percentage: 2.8 },
];

export default function TithesOfferingsReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getConsistencyColor = (consistency: number) => {
    if (consistency >= 95) return 'text-green-600';
    if (consistency >= 80) return 'text-blue-600';
    if (consistency >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'faithful': return 'default';
      case 'consistent': return 'secondary';
      case 'regular': return 'outline';
      default: return 'destructive';
    }
  };

  // Chart configurations
  const typeChartConfig = {
    amount: { label: 'Amount' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    tithes: { label: 'Tithes', color: 'hsl(var(--chart-1))' },
    offerings: { label: 'Offerings', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const totalChartConfig = {
    total: { label: 'Total', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const participationChartConfig = {
    tithers: { label: 'Tithers', color: 'hsl(var(--chart-1))' },
    offerers: { label: 'Offerers', color: 'hsl(var(--chart-2))' },
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
            <Wallet className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tithes & Offerings Reports</h1>
            <p className="text-muted-foreground">Specific tithes and offerings analysis</p>
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
            <CardTitle className="text-sm font-medium">Total Tithes</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{tithesOfferingsSummary.totalTithes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Offerings</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{tithesOfferingsSummary.totalOfferings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combined Total</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{tithesOfferingsSummary.combined.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Tithes + Offerings</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tithers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tithesOfferingsSummary.tithersCount}</div>
            <p className="text-xs text-muted-foreground">Active tithers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offerers</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tithesOfferingsSummary.offerersCount}</div>
            <p className="text-xs text-muted-foreground">Active offerers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faithful Tithers</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tithesOfferingsSummary.faithfulTithers}</div>
            <p className="text-xs text-muted-foreground">100% consistency</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tithe</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{tithesOfferingsSummary.averageTithe}</div>
            <p className="text-xs text-muted-foreground">Per tithe</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Offering</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{tithesOfferingsSummary.averageOffering}</div>
            <p className="text-xs text-muted-foreground">Per offering</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tithes">Tithes Analysis</TabsTrigger>
          <TabsTrigger value="offerings">Offerings Analysis</TabsTrigger>
          <TabsTrigger value="faithful">Faithful Givers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Tithes vs Offerings</CardTitle>
                <CardDescription>Distribution between tithes and offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={typeChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={tithesVsOfferings}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} ${percentage}%`}
                      outerRadius={100}
                      dataKey="amount"
                      strokeWidth={2}
                    >
                      {tithesVsOfferings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Tithes and offerings throughout the year</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
                  <AreaChart data={monthlyTithesOfferingsData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area type="monotone" dataKey="tithes" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} strokeWidth={2} />
                    <Area type="monotone" dataKey="offerings" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tithes" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Tithing Patterns</CardTitle>
                <CardDescription>How people tithe</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={totalChartConfig} className="h-[300px] w-full">
                  <BarChart data={givingPatterns} margin={{ left: 12, right: 12, bottom: 60 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="pattern" angle={-45} textAnchor="end" height={80} tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tithing Frequency</CardTitle>
                <CardDescription>Breakdown by giving frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {givingPatterns.map((pattern) => (
                    <div key={pattern.pattern} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pattern.pattern}</p>
                        <p className="text-sm text-muted-foreground">{pattern.count} people</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₵{pattern.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{pattern.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offerings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Offerings by Service</CardTitle>
                <CardDescription>Which services generate most offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={totalChartConfig} className="h-[300px] w-full">
                  <BarChart data={offeringsByService} margin={{ left: 12, right: 12, bottom: 60 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} tickLine={false} axisLine={false} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
                <CardDescription>Average offerings per service</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Avg/Service</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offeringsByService.map((service) => (
                      <TableRow key={service.service}>
                        <TableCell className="font-medium">{service.service}</TableCell>
                        <TableCell>₵{service.amount.toLocaleString()}</TableCell>
                        <TableCell>{service.services}</TableCell>
                        <TableCell>₵{service.avgPerService}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faithful" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faithful Tithers</CardTitle>
              <CardDescription>Most consistent tithers and their giving patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Consistency</TableHead>
                    <TableHead>Months Active</TableHead>
                    <TableHead>Total Tithes</TableHead>
                    <TableHead>Avg Monthly</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faithfulTithers.map((tither) => (
                    <TableRow key={tither.name}>
                      <TableCell className="font-medium">{tither.name}</TableCell>
                      <TableCell>
                        <span className={getConsistencyColor(tither.consistency)}>
                          {tither.consistency}%
                        </span>
                      </TableCell>
                      <TableCell>{tither.monthsActive}/12</TableCell>
                      <TableCell>₵{tither.totalTithes.toLocaleString()}</TableCell>
                      <TableCell>₵{tither.avgMonthly.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(tither.status)}>
                          {tither.status}
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
          <div className="grid gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Monthly Tithes & Offerings Trend</CardTitle>
                <CardDescription>Detailed monthly breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={monthlyChartConfig} className="h-[400px] w-full">
                  <LineChart data={monthlyTithesOfferingsData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="tithes" stroke="hsl(var(--chart-1))" strokeWidth={3} name="Tithes" dot={{ fill: 'hsl(var(--chart-1))' }} />
                    <Line type="monotone" dataKey="offerings" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Offerings" dot={{ fill: 'hsl(var(--chart-2))' }} />
                    <Line type="monotone" dataKey="total" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Total" strokeDasharray="5 5" dot={{ fill: 'hsl(var(--chart-3))' }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Giver Count Trends</CardTitle>
                <CardDescription>Number of tithers and offerers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={participationChartConfig} className="h-[300px] w-full">
                  <LineChart data={monthlyTithesOfferingsData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="tithers" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Tithers" dot={{ fill: 'hsl(var(--chart-1))' }} />
                    <Line type="monotone" dataKey="offerers" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Offerers" dot={{ fill: 'hsl(var(--chart-2))' }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}