'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { type DateRange } from 'react-day-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { EventCategoryBadge } from '@/components/ui/category-badges';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Filter,
  Eye,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const exportFormats = [
  { id: 'csv', name: 'CSV', icon: FileSpreadsheet, description: 'Comma-separated values' },
  { id: 'excel', name: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format' },
  { id: 'pdf', name: 'PDF', icon: FileText, description: 'Portable document format' }
];

const eventCategories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Social', 'Training'];

const mockEvents = [
  {
    id: '1',
    title: 'Sunday Service',
    date: '2024-01-21',
    category: 'Worship',
    attendees: 450,
    status: 'Upcoming'
  },
  {
    id: '2',
    title: 'Bible Study',
    date: '2024-01-22',
    category: 'Study',
    attendees: 85,
    status: 'Upcoming'
  },
  {
    id: '3',
    title: 'Youth Conference',
    date: '2024-02-15',
    category: 'Conference',
    attendees: 0,
    status: 'Planning'
  }
];

export default function ExportEventsPage() {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedFields, setSelectedFields] = useState([
    'title', 'date', 'category', 'attendees', 'status'
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const availableFields = [
    { id: 'title', label: 'Event Title' },
    { id: 'date', label: 'Date' },
    { id: 'time', label: 'Time' },
    { id: 'location', label: 'Location' },
    { id: 'category', label: 'Category' },
    { id: 'organizer', label: 'Organizer' },
    { id: 'attendees', label: 'Attendees' },
    { id: 'maxAttendees', label: 'Max Attendees' },
    { id: 'status', label: 'Status' },
    { id: 'description', label: 'Description' }
  ];

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    toast.success(`Export completed: events_export_${format(new Date(), 'yyyy-MM-dd')}.${selectedFormat}`);
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const eventDate = new Date(event.date);
    const matchesDateFrom = !dateRange?.from || eventDate >= dateRange.from;
    const matchesDateTo = !dateRange?.to || eventDate <= dateRange.to;
    
    return matchesCategory && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href="/dashboard/events" aria-label="Back to Events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Export Events</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Format</CardTitle>
              <CardDescription className="text-xs">Choose the file format for your export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <div
                      key={format.id}
                      className={`p-3.5 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormat === format.id
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:border-foreground/20'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-sm text-foreground">{format.name}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Data Filters
              </CardTitle>
              <CardDescription className="text-xs">Narrow down the events included in the export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Date Range</label>
                <DateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                  placeholder="Pick a date range"
                  showPresets
                  clearable
                />
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Fields to Export</CardTitle>
              <CardDescription className="text-xs">Select data columns to include</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2.5">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <label htmlFor={field.id} className="text-xs font-medium text-foreground cursor-pointer">
                      {field.label}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Export */}
        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Summary</CardTitle>
              <CardDescription className="text-xs">Review before downloading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{exportFormats.find(f => f.id === selectedFormat)?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Events:</span>
                  <span className="font-medium">{filteredEvents.length}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="font-medium">{selectedFields.length}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-1.5 h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleExport}
                  disabled={isExporting || filteredEvents.length === 0}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-1.5 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription className="text-xs">Sample records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {filteredEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-2.5 border rounded-lg space-y-1">
                      <div className="font-medium text-xs truncate">{event.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {format(new Date(event.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="pt-0.5">
                        <EventCategoryBadge category={event.category} />
                      </div>
                    </div>
                  ))}
                  {filteredEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{filteredEvents.length - 3} more events
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}