'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  Filter,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

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
  const router = useRouter();
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
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
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    
    // In a real implementation, this would trigger the actual download
    const filename = `events_export_${format(new Date(), 'yyyy-MM-dd')}.${selectedFormat}`;
    console.log(`Exporting to ${filename}`);
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const eventDate = new Date(event.date);
    const matchesDateFrom = !dateFrom || eventDate >= dateFrom;
    const matchesDateTo = !dateTo || eventDate <= dateTo;
    
    return matchesCategory && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
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
            <Download className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Export Events</h1>
            <p className="text-muted-foreground">Export event data in various formats</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle>Export Format</CardTitle>
              <CardDescription>Choose the format for your export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <div
                      key={format.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedFormat === format.id
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-border hover:border-brand-primary/50'
                      }`}
                      onClick={() => setSelectedFormat(format.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-brand-primary" />
                        <div>
                          <div className="font-medium">{format.name}</div>
                          <div className="text-sm text-muted-foreground">{format.description}</div>
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
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter events to export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
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
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={setDateFrom}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={setDateTo}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Field Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Fields to Export</CardTitle>
              <CardDescription>Select which fields to include in the export</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {availableFields.map((field) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <label htmlFor={field.id} className="text-sm font-medium">
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
            <CardHeader>
              <CardTitle>Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Format:</span>
                  <span className="font-medium">{exportFormats.find(f => f.id === selectedFormat)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Events:</span>
                  <span className="font-medium">{filteredEvents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fields:</span>
                  <span className="font-medium">{selectedFields.length}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>

                <Button
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                  onClick={handleExport}
                  disabled={isExporting || filteredEvents.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>First 3 events that will be exported</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.date), 'MMM dd, yyyy')} • {event.category}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {event.attendees} attendees
                      </Badge>
                    </div>
                  ))}
                  {filteredEvents.length > 3 && (
                    <div className="text-sm text-muted-foreground text-center">
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