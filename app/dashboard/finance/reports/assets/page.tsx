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
  Package,
  Download,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingDown,
  Building,
  Car,
  Monitor,
  Music,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

// Mock data for asset reports
const assetsByCategory = [
  { 
    category: 'Buildings & Property', 
    originalValue: 850000, 
    currentValue: 780000, 
    depreciation: 70000, 
    maintenanceCosts: 25000,
    count: 3,
    color: '#2E8DB0'
  },
  { 
    category: 'Audio/Visual Equipment', 
    originalValue: 125000, 
    currentValue: 95000, 
    depreciation: 30000, 
    maintenanceCosts: 8500,
    count: 45,
    color: '#C49831'
  },
  { 
    category: 'Vehicles', 
    originalValue: 85000, 
    currentValue: 62000, 
    depreciation: 23000, 
    maintenanceCosts: 12000,
    count: 4,
    color: '#A5CF5D'
  },
  { 
    category: 'Furniture & Fixtures', 
    originalValue: 65000, 
    currentValue: 48000, 
    depreciation: 17000, 
    maintenanceCosts: 3200,
    count: 120,
    color: '#E74C3C'
  },
  { 
    category: 'Office Equipment', 
    originalValue: 35000, 
    currentValue: 22000, 
    depreciation: 13000, 
    maintenanceCosts: 2800,
    count: 25,
    color: '#9B59B6'
  },
];

const depreciationData = [
  { year: '2020', buildings: 15000, equipment: 8000, vehicles: 6000, furniture: 4000, office: 3000, total: 36000 },
  { year: '2021', buildings: 16000, equipment: 9500, vehicles: 6500, furniture: 4200, office: 3200, total: 39400 },
  { year: '2022', buildings: 17000, equipment: 11000, vehicles: 7000, furniture: 4500, office: 3500, total: 43000 },
  { year: '2023', buildings: 18000, equipment: 12500, vehicles: 7500, furniture: 4800, office: 3800, total: 46600 },
  { year: '2024', buildings: 19000, equipment: 14000, vehicles: 8000, furniture: 5000, office: 4000, total: 50000 },
];

const maintenanceByMonth = [
  { month: 'Jan', buildings: 2100, equipment: 650, vehicles: 800, furniture: 200, office: 180, total: 3930 },
  { month: 'Feb', buildings: 1800, equipment: 720, vehicles: 950, furniture: 250, office: 200, total: 3920 },
  { month: 'Mar', buildings: 2200, equipment: 680, vehicles: 1100, furniture: 300, office: 220, total: 4500 },
  { month: 'Apr', buildings: 1900, equipment: 750, vehicles: 850, furniture: 180, office: 190, total: 3870 },
  { month: 'May', buildings: 2500, equipment: 800, vehicles: 1200, furniture: 320, office: 250, total: 5070 },
  { month: 'Jun', buildings: 2000, equipment: 700, vehicles: 900, furniture: 280, office: 210, total: 4090 },
  { month: 'Jul', buildings: 2300, equipment: 850, vehicles: 1000, furniture: 350, office: 280, total: 4780 },
  { month: 'Aug', buildings: 1700, equipment: 600, vehicles: 750, furniture: 200, office: 150, total: 3400 },
  { month: 'Sep', buildings: 2100, equipment: 780, vehicles: 950, furniture: 290, office: 220, total: 4340 },
  { month: 'Oct', buildings: 2400, equipment: 900, vehicles: 1100, furniture: 380, office: 300, total: 5080 },
  { month: 'Nov', buildings: 2200, equipment: 820, vehicles: 1000, furniture: 320, office: 260, total: 4600 },
  { month: 'Dec', buildings: 2000, equipment: 740, vehicles: 900, furniture: 280, office: 230, total: 4150 },
];

const highValueAssets = [
  { 
    name: 'Main Church Building', 
    category: 'Buildings & Property', 
    originalValue: 650000, 
    currentValue: 600000, 
    acquisitionDate: '2015-03-15',
    condition: 'Good',
    lastMaintenance: '2024-01-10'
  },
  { 
    name: 'Sound System - Main Sanctuary', 
    category: 'Audio/Visual Equipment', 
    originalValue: 45000, 
    currentValue: 32000, 
    acquisitionDate: '2020-08-20',
    condition: 'Excellent',
    lastMaintenance: '2024-01-05'
  },
  { 
    name: 'Church Bus', 
    category: 'Vehicles', 
    originalValue: 55000, 
    currentValue: 38000, 
    acquisitionDate: '2019-06-10',
    condition: 'Good',
    lastMaintenance: '2024-01-15'
  },
  { 
    name: 'Fellowship Hall', 
    category: 'Buildings & Property', 
    originalValue: 180000, 
    currentValue: 165000, 
    acquisitionDate: '2018-11-30',
    condition: 'Excellent',
    lastMaintenance: '2023-12-20'
  },
  { 
    name: 'LED Display System', 
    category: 'Audio/Visual Equipment', 
    originalValue: 28000, 
    currentValue: 22000, 
    acquisitionDate: '2021-04-12',
    condition: 'Good',
    lastMaintenance: '2024-01-08'
  },
];

const maintenanceAlerts = [
  {
    asset: 'HVAC System - Main Building',
    type: 'Scheduled Maintenance',
    dueDate: '2024-02-15',
    estimatedCost: 2500,
    priority: 'high',
    description: 'Annual HVAC system inspection and filter replacement'
  },
  {
    asset: 'Church Van #2',
    type: 'Oil Change',
    dueDate: '2024-02-10',
    estimatedCost: 150,
    priority: 'medium',
    description: 'Regular oil change and basic inspection'
  },
  {
    asset: 'Piano - Main Sanctuary',
    type: 'Tuning',
    dueDate: '2024-02-05',
    estimatedCost: 200,
    priority: 'low',
    description: 'Quarterly piano tuning'
  },
  {
    asset: 'Security System',
    type: 'System Update',
    dueDate: '2024-02-20',
    estimatedCost: 800,
    priority: 'high',
    description: 'Security system software update and camera maintenance'
  },
];

const assetSummary = {
  totalOriginalValue: 1160000,
  totalCurrentValue: 1007000,
  totalDepreciation: 153000,
  totalMaintenanceCosts: 51500,
  totalAssets: 197,
  averageAge: 6.2,
  depreciationRate: 13.2,
};

export default function AssetReportsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('current-year');
  const [activeTab, setActiveTab] = useState('overview');

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-orange-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'buildings & property': return <Building className="h-4 w-4" />;
      case 'audio/visual equipment': return <Monitor className="h-4 w-4" />;
      case 'vehicles': return <Car className="h-4 w-4" />;
      case 'furniture & fixtures': return <Package className="h-4 w-4" />;
      case 'office equipment': return <Settings className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Chart configurations
  const assetChartConfig = {
    currentValue: { label: 'Current Value', color: 'hsl(var(--chart-1))' },
    originalValue: { label: 'Original Value', color: 'hsl(var(--chart-2))' },
    depreciation: { label: 'Depreciation', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;

  const categoryChartConfig = {
    value: { label: 'Value' },
  } satisfies ChartConfig;

  const depreciationChartConfig = {
    totalValue: { label: 'Total Value', color: 'hsl(var(--chart-1))' },
    accumulated: { label: 'Accumulated Depreciation', color: 'hsl(var(--chart-2))' },
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
            <Package className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset Reports</h1>
            <p className="text-muted-foreground">Value, depreciation, and maintenance costs</p>
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
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{assetSummary.totalCurrentValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Original Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{assetSummary.totalOriginalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Purchase value</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₵{assetSummary.totalDepreciation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{assetSummary.depreciationRate}% rate</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵{assetSummary.totalMaintenanceCosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetSummary.totalAssets}</div>
            <p className="text-xs text-muted-foreground">All categories</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetSummary.averageAge}</div>
            <p className="text-xs text-muted-foreground">Years</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{maintenanceAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Asset Value Distribution</CardTitle>
                <CardDescription>Current value by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                  <RechartsPieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={assetsByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, currentValue }) => `${category.split(' ')[0]} ₵${(currentValue/1000).toFixed(0)}k`}
                      outerRadius={100}
                      dataKey="currentValue"
                      strokeWidth={2}
                    >
                      {assetsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>High Value Assets</CardTitle>
                <CardDescription>Most valuable assets and their condition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highValueAssets.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-1 bg-gray-100 rounded">
                          {getCategoryIcon(asset.category)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">₵{asset.currentValue.toLocaleString()}</p>
                        <Badge variant={getConditionBadge(asset.condition)} className="text-xs">
                          {asset.condition}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assets by Category</CardTitle>
              <CardDescription>Detailed breakdown by asset category</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Original Value</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Depreciation</TableHead>
                    <TableHead>Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetsByCategory.map((category) => (
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
                      <TableCell>{category.count}</TableCell>
                      <TableCell>₵{category.originalValue.toLocaleString()}</TableCell>
                      <TableCell>₵{category.currentValue.toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">₵{category.depreciation.toLocaleString()}</TableCell>
                      <TableCell>₵{category.maintenanceCosts.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Depreciation Trends</CardTitle>
              <CardDescription>Annual depreciation by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={depreciationChartConfig} className="h-[400px] w-full">
                <AreaChart data={depreciationData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Area type="monotone" dataKey="buildings" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} strokeWidth={2} />
                  <Area type="monotone" dataKey="equipment" stackId="1" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} strokeWidth={2} />
                  <Area type="monotone" dataKey="vehicles" stackId="1" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.6} strokeWidth={2} />
                  <Area type="monotone" dataKey="furniture" stackId="1" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} strokeWidth={2} />
                  <Area type="monotone" dataKey="office" stackId="1" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.6} strokeWidth={2} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Monthly Maintenance Costs</CardTitle>
              <CardDescription>Maintenance expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={depreciationChartConfig} className="h-[400px] w-full">
                <LineChart data={maintenanceByMonth} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                  <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line type="monotone" dataKey="buildings" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Buildings" dot={{ fill: 'hsl(var(--chart-1))' }} />
                  <Line type="monotone" dataKey="equipment" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Equipment" dot={{ fill: 'hsl(var(--chart-2))' }} />
                  <Line type="monotone" dataKey="vehicles" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Vehicles" dot={{ fill: 'hsl(var(--chart-3))' }} />
                  <Line type="monotone" dataKey="furniture" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Furniture" dot={{ fill: 'hsl(var(--chart-4))' }} />
                  <Line type="monotone" dataKey="office" stroke="hsl(var(--chart-5))" strokeWidth={2} name="Office" dot={{ fill: 'hsl(var(--chart-5))' }} />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--foreground))" strokeWidth={3} strokeDasharray="5 5" name="Total" dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
              <CardDescription>Upcoming maintenance and service requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="mt-0.5">
                      {getPriorityIcon(alert.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{alert.asset}</h4>
                        <div className="text-right">
                          <span className="font-bold">₵{alert.estimatedCost.toLocaleString()}</span>
                          <p className="text-xs text-muted-foreground">Due: {new Date(alert.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-blue-600 mt-1">{alert.type}</p>
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