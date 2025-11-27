'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Settings,
  Save,
  RotateCcw,
  Bell,
  Eye,
  BarChart3,
  Calendar,
  Mail,
  Palette,
  Download,
  Clock,
  TrendingUp,
  Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PreferencesPage() {
  const router = useRouter();
  
  // Display Preferences
  const [defaultView, setDefaultView] = useState('overview');
  const [defaultPeriod, setDefaultPeriod] = useState('6months');
  const [chartType, setChartType] = useState('line');
  const [colorScheme, setColorScheme] = useState('default');
  const [showGridLines, setShowGridLines] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [animateCharts, setAnimateCharts] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // Data Preferences
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [cacheData, setCacheData] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);
  const [dataAggregation, setDataAggregation] = useState('daily');
  const [excludeOutliers, setExcludeOutliers] = useState(false);

  // Export Preferences
  const [defaultExportFormat, setDefaultExportFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeRawData, setIncludeRawData] = useState(false);
  const [exportOrientation, setExportOrientation] = useState('portrait');
  const [paperSize, setPaperSize] = useState('a4');

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportReadyEmail, setReportReadyEmail] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [monthlyReport, setMonthlyReport] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);

  // Dashboard Preferences
  const [showKeyMetrics, setShowKeyMetrics] = useState(true);
  const [showGrowthTrends, setShowGrowthTrends] = useState(true);
  const [showComparison, setShowComparison] = useState(true);
  const [showInsights, setShowInsights] = useState(true);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [metricsToShow, setMetricsToShow] = useState(4);

  const handleSave = () => {
    toast.success('Preferences saved successfully');
    // TODO: Implement actual save logic
  };

  const handleReset = () => {
    // Reset to defaults
    setDefaultView('overview');
    setDefaultPeriod('6months');
    setChartType('line');
    setColorScheme('default');
    setShowGridLines(true);
    setShowLegend(true);
    setAnimateCharts(true);
    setCompactView(false);
    
    setAutoRefresh(true);
    setRefreshInterval('5');
    setCacheData(true);
    setIncludeInactive(false);
    setDataAggregation('daily');
    setExcludeOutliers(false);

    setDefaultExportFormat('pdf');
    setIncludeCharts(true);
    setIncludeRawData(false);
    setExportOrientation('portrait');
    setPaperSize('a4');

    setEmailNotifications(true);
    setReportReadyEmail(true);
    setWeeklyDigest(true);
    setMonthlyReport(true);
    setAnomalyAlerts(true);
    setGoalAlerts(true);

    setShowKeyMetrics(true);
    setShowGrowthTrends(true);
    setShowComparison(true);
    setShowInsights(true);
    setShowRecommendations(true);
    setMetricsToShow(4);

    toast.success('Preferences reset to defaults');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/analytics')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Preferences</h1>
            <p className="text-muted-foreground">Customize your analytics experience</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>

      <Tabs defaultValue="display" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
        </TabsList>

        {/* Display Preferences */}
        <TabsContent value="display" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default View Settings</CardTitle>
              <CardDescription>Set your default analytics view preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default View</Label>
                  <Select value={defaultView} onValueChange={setDefaultView}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overview">Overview Dashboard</SelectItem>
                      <SelectItem value="members">Member Analytics</SelectItem>
                      <SelectItem value="attendance">Attendance Analytics</SelectItem>
                      <SelectItem value="giving">Giving Analytics</SelectItem>
                      <SelectItem value="events">Event Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Time Period</Label>
                  <Select value={defaultPeriod} onValueChange={setDefaultPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1week">Last Week</SelectItem>
                      <SelectItem value="1month">Last Month</SelectItem>
                      <SelectItem value="3months">Last 3 Months</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Chart Type</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Brand Colors)</SelectItem>
                      <SelectItem value="monochrome">Monochrome</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                      <SelectItem value="pastel">Pastel</SelectItem>
                      <SelectItem value="dark">Dark Mode Optimized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Grid Lines</Label>
                    <p className="text-sm text-muted-foreground">Display grid lines on charts</p>
                  </div>
                  <Switch checked={showGridLines} onCheckedChange={setShowGridLines} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Legend</Label>
                    <p className="text-sm text-muted-foreground">Display chart legends</p>
                  </div>
                  <Switch checked={showLegend} onCheckedChange={setShowLegend} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animate Charts</Label>
                    <p className="text-sm text-muted-foreground">Enable chart animations</p>
                  </div>
                  <Switch checked={animateCharts} onCheckedChange={setAnimateCharts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">Use compact layout for more data</p>
                  </div>
                  <Switch checked={compactView} onCheckedChange={setCompactView} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Preferences */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Handling</CardTitle>
              <CardDescription>Configure how data is loaded and processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Refresh Data</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh analytics data</p>
                </div>
                <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label>Refresh Interval (minutes)</Label>
                  <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 minute</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cache Data Locally</Label>
                  <p className="text-sm text-muted-foreground">Store data locally for faster loading</p>
                </div>
                <Switch checked={cacheData} onCheckedChange={setCacheData} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Inactive Records</Label>
                  <p className="text-sm text-muted-foreground">Show data from inactive members/groups</p>
                </div>
                <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Exclude Outliers</Label>
                  <p className="text-sm text-muted-foreground">Remove statistical outliers from calculations</p>
                </div>
                <Switch checked={excludeOutliers} onCheckedChange={setExcludeOutliers} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Data Aggregation</Label>
                <Select value={dataAggregation} onValueChange={setDataAggregation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How to group data points in time-based charts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Preferences */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Customize default export options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select value={defaultExportFormat} onValueChange={setDefaultExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Page Orientation</Label>
                  <Select value={exportOrientation} onValueChange={setExportOrientation}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Paper Size</Label>
                  <Select value={paperSize} onValueChange={setPaperSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Charts</Label>
                    <p className="text-sm text-muted-foreground">Include visualizations in exports</p>
                  </div>
                  <Switch checked={includeCharts} onCheckedChange={setIncludeCharts} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include Raw Data</Label>
                    <p className="text-sm text-muted-foreground">Include raw data tables in exports</p>
                  </div>
                  <Switch checked={includeRawData} onCheckedChange={setIncludeRawData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Preferences */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage analytics-related email alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive analytics updates via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              {emailNotifications && (
                <>
                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Report Ready Notifications</Label>
                        <p className="text-sm text-muted-foreground">When custom reports finish generating</p>
                      </div>
                      <Switch checked={reportReadyEmail} onCheckedChange={setReportReadyEmail} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          Weekly Digest
                          <Badge variant="secondary" className="text-xs">Weekly</Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">Summary of weekly analytics</p>
                      </div>
                      <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="flex items-center gap-2">
                          Monthly Report
                          <Badge variant="secondary" className="text-xs">Monthly</Badge>
                        </Label>
                        <p className="text-sm text-muted-foreground">Comprehensive monthly analytics report</p>
                      </div>
                      <Switch checked={monthlyReport} onCheckedChange={setMonthlyReport} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Anomaly Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify when unusual patterns are detected</p>
                      </div>
                      <Switch checked={anomalyAlerts} onCheckedChange={setAnomalyAlerts} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Goal Alerts</Label>
                        <p className="text-sm text-muted-foreground">Notify when goals are reached or missed</p>
                      </div>
                      <Switch checked={goalAlerts} onCheckedChange={setGoalAlerts} />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Preferences */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Layout</CardTitle>
              <CardDescription>Customize your analytics dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Key Metrics Cards</Label>
                    <p className="text-sm text-muted-foreground">Show key metrics at the top</p>
                  </div>
                  <Switch checked={showKeyMetrics} onCheckedChange={setShowKeyMetrics} />
                </div>

                {showKeyMetrics && (
                  <div className="space-y-2 ml-6">
                    <Label>Number of Metrics to Display</Label>
                    <Select value={metricsToShow.toString()} onValueChange={(v) => setMetricsToShow(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Metrics</SelectItem>
                        <SelectItem value="4">4 Metrics</SelectItem>
                        <SelectItem value="6">6 Metrics</SelectItem>
                        <SelectItem value="8">8 Metrics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Growth Trends</Label>
                    <p className="text-sm text-muted-foreground">Show growth trend charts</p>
                  </div>
                  <Switch checked={showGrowthTrends} onCheckedChange={setShowGrowthTrends} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Comparison Charts</Label>
                    <p className="text-sm text-muted-foreground">Show year-over-year comparisons</p>
                  </div>
                  <Switch checked={showComparison} onCheckedChange={setShowComparison} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Key Insights</Label>
                    <p className="text-sm text-muted-foreground">Show AI-generated insights</p>
                  </div>
                  <Switch checked={showInsights} onCheckedChange={setShowInsights} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Show actionable recommendations</p>
                  </div>
                  <Switch checked={showRecommendations} onCheckedChange={setShowRecommendations} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
