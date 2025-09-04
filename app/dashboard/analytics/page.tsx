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
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Calendar,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
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
  { name: 'Children (0-12)', value: 120, color: '#2E8CB0' },
  { name: 'Youth (13-17)', value: 85, color: '#C49831' },
  { name: 'Young Adults (18-35)', value: 150, color: '#A2CD5E' },
  { name: 'Adults (36-55)', value: 110, color: '#E74C3C' },
  { name: 'Seniors (55+)', value: 55, color: '#9B59B6' },
];

const departmentEngagement = [
  { department: 'Worship Team', members: 25, engagement: 95 },
  { department: 'Youth Ministry', members: 85, engagement: 88 },
  { department: 'Women\'s Fellowship', members: 45, engagement: 92 },
  { department: 'Men\'s Ministry', members: 32, engagement: 85 },
  { department: 'Children\'s Ministry', members: 65, engagement: 90 },
  { department: 'Prayer Team', members: 28, engagement: 98 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights and reports for church growth</p>
        </div>
        <div className="flex space-x-2">
          <Select defaultValue="6months">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
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
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={membershipGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="members" 
                  stroke="hsl(var(--brand-primary))" 
                  fill="hsl(var(--brand-primary))" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Compare attendance across different services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sunday" stroke="#2E8CB0" strokeWidth={2} name="Sunday Service" />
                <Line type="monotone" dataKey="midweek" stroke="#C49831" strokeWidth={2} name="Midweek" />
                <Line type="monotone" dataKey="events" stroke="#A2CD5E" strokeWidth={2} name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Giving Analysis</CardTitle>
            <CardDescription>Monthly giving breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={givingTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tithes" fill="#2E8CB0" name="Tithes" />
                <Bar dataKey="offerings" fill="#C49831" name="Offerings" />
                <Bar dataKey="special" fill="#A2CD5E" name="Special" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Congregation demographics by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
              <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
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