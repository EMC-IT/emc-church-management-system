'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  Save,
  Play,
  FileBarChart,
  Settings,
  Calendar,
  Filter,
  Eye,
  Download,
  Trash2,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

// Available data sources
const dataSources = [
  {
    id: 'members',
    name: 'Members',
    description: 'Member demographic and information',
    fields: [
      { id: 'name', name: 'Full Name', type: 'text' },
      { id: 'age', name: 'Age', type: 'number' },
      { id: 'gender', name: 'Gender', type: 'category' },
      { id: 'joinDate', name: 'Join Date', type: 'date' },
      { id: 'status', name: 'Status', type: 'category' },
      { id: 'department', name: 'Department', type: 'category' },
      { id: 'maritalStatus', name: 'Marital Status', type: 'category' },
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance',
    description: 'Service and event attendance records',
    fields: [
      { id: 'date', name: 'Date', type: 'date' },
      { id: 'serviceType', name: 'Service Type', type: 'category' },
      { id: 'attendees', name: 'Number of Attendees', type: 'number' },
      { id: 'capacity', name: 'Capacity %', type: 'number' },
      { id: 'firstTimers', name: 'First Timers', type: 'number' },
    ]
  },
  {
    id: 'giving',
    name: 'Giving & Finance',
    description: 'Financial contributions and transactions',
    fields: [
      { id: 'date', name: 'Transaction Date', type: 'date' },
      { id: 'amount', name: 'Amount', type: 'number' },
      { id: 'type', name: 'Giving Type', type: 'category' },
      { id: 'method', name: 'Payment Method', type: 'category' },
      { id: 'category', name: 'Category', type: 'category' },
    ]
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Church events and activities',
    fields: [
      { id: 'name', name: 'Event Name', type: 'text' },
      { id: 'date', name: 'Event Date', type: 'date' },
      { id: 'attendees', name: 'Attendees', type: 'number' },
      { id: 'category', name: 'Category', type: 'category' },
      { id: 'cost', name: 'Event Cost', type: 'number' },
    ]
  },
  {
    id: 'groups',
    name: 'Groups & Departments',
    description: 'Small groups and ministry departments',
    fields: [
      { id: 'name', name: 'Group Name', type: 'text' },
      { id: 'members', name: 'Member Count', type: 'number' },
      { id: 'leader', name: 'Leader', type: 'text' },
      { id: 'category', name: 'Category', type: 'category' },
      { id: 'engagement', name: 'Engagement Rate', type: 'number' },
    ]
  },
];

// Visualization types
const visualizationTypes = [
  { id: 'table', name: 'Table', icon: '📊', description: 'Tabular data display' },
  { id: 'bar', name: 'Bar Chart', icon: '📊', description: 'Compare values across categories' },
  { id: 'line', name: 'Line Chart', icon: '📈', description: 'Show trends over time' },
  { id: 'pie', name: 'Pie Chart', icon: '🥧', description: 'Show proportions' },
  { id: 'area', name: 'Area Chart', icon: '📉', description: 'Filled line chart' },
  { id: 'scatter', name: 'Scatter Plot', icon: '⚫', description: 'Show relationships' },
  { id: 'gauge', name: 'Gauge', icon: '⏲️', description: 'Single metric display' },
  { id: 'number', name: 'Number Card', icon: '🔢', description: 'Large number display' },
];

// Aggregation functions
const aggregations = [
  { id: 'count', name: 'Count', appliesTo: ['all'] },
  { id: 'sum', name: 'Sum', appliesTo: ['number'] },
  { id: 'avg', name: 'Average', appliesTo: ['number'] },
  { id: 'min', name: 'Minimum', appliesTo: ['number', 'date'] },
  { id: 'max', name: 'Maximum', appliesTo: ['number', 'date'] },
  { id: 'distinct', name: 'Distinct Count', appliesTo: ['all'] },
];

export default function ReportBuilderPage() {
  const router = useRouter();
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedDataSource, setSelectedDataSource] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState('table');
  const [dateRange, setDateRange] = useState('last_30_days');
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource);

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleRunReport = async () => {
    if (!selectedDataSource) {
      toast.error('Please select a data source');
      return;
    }
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    setIsRunning(true);
    try {
      // TODO: Implement actual report execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveReport = async () => {
    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }
    if (!selectedDataSource) {
      toast.error('Please select a data source');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement actual save logic
      console.log('Saving report:', {
        name: reportName,
        description: reportDescription,
        dataSource: selectedDataSource,
        fields: selectedFields,
        visualization: selectedVisualization,
        dateRange,
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Report saved successfully');
      router.push('/dashboard/analytics/reports');
    } catch (error) {
      toast.error('Failed to save report');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.push('/dashboard/analytics')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FileBarChart className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Custom Report Builder</h1>
            <p className="text-muted-foreground">Create custom reports with advanced analytics</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRunReport}
            disabled={isRunning || !selectedDataSource || selectedFields.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Report'}
          </Button>
          <Button
            onClick={handleSaveReport}
            disabled={isSaving}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Report Information</CardTitle>
              <CardDescription>Basic details about your custom report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name *</Label>
                <Input
                  id="reportName"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Monthly Attendance Summary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription">Description</Label>
                <Textarea
                  id="reportDescription"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe the purpose of this report"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Data Source</CardTitle>
              <CardDescription>Select the primary data to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {dataSources.map((source) => (
                  <Card
                    key={source.id}
                    className={`cursor-pointer transition-all ${
                      selectedDataSource === source.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'hover:border-brand-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedDataSource(source.id);
                      setSelectedFields([]);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {source.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="secondary">{source.fields.length} fields</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          {currentDataSource && (
            <Card>
              <CardHeader>
                <CardTitle>Select Fields</CardTitle>
                <CardDescription>
                  Choose the data fields to include ({selectedFields.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFields(currentDataSource.fields.map(f => f.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFields([])}
                    >
                      Clear All
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    {currentDataSource.fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => handleFieldToggle(field.id)}
                        />
                        <Label htmlFor={field.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{field.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Type: {field.type}
                          </div>
                        </Label>
                        <Badge variant="outline">{field.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualization Type */}
          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
              <CardDescription>Choose how to display your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {visualizationTypes.map((viz) => (
                  <Card
                    key={viz.id}
                    className={`cursor-pointer transition-all ${
                      selectedVisualization === viz.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'hover:border-brand-primary/50'
                    }`}
                    onClick={() => setSelectedVisualization(viz.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{viz.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium">{viz.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {viz.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                    <SelectItem value="last_year">Last Year</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Quick Stats</Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Source:</span>
                    <span className="font-medium">
                      {currentDataSource?.name || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fields:</span>
                    <span className="font-medium">{selectedFields.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visualization:</span>
                    <span className="font-medium">
                      {visualizationTypes.find(v => v.id === selectedVisualization)?.name}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Preview Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Saved Reports</CardTitle>
              <CardDescription>Quick access to your reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/analytics/reports')}
              >
                <FileBarChart className="mr-2 h-4 w-4" />
                View All Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
