'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Filter, 
  X, 
  CalendarIcon,
  Save,
  RotateCcw,
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterRule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SavedFilter {
  id: string;
  name: string;
  description: string;
  rules: FilterRule[];
  createdAt: Date;
}

export default function AdvancedFiltersPage() {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { id: '1', field: '', operator: '', value: '' }
  ]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([
    {
      id: '1',
      name: 'Active Members - Last 90 Days',
      description: 'Members who attended at least once in the last 90 days',
      rules: [
        { id: '1', field: 'attendance', operator: 'greater_than', value: '0' },
        { id: '2', field: 'date_range', operator: 'within', value: '90_days' }
      ],
      createdAt: new Date('2024-11-01')
    },
    {
      id: '2',
      name: 'High Givers - This Year',
      description: 'Members with giving above $5000 this year',
      rules: [
        { id: '1', field: 'giving_total', operator: 'greater_than', value: '5000' },
        { id: '2', field: 'year', operator: 'equals', value: '2024' }
      ],
      createdAt: new Date('2024-10-15')
    },
    {
      id: '3',
      name: 'Youth Ministry Participants',
      description: 'Members aged 13-25 in youth groups',
      rules: [
        { id: '1', field: 'age', operator: 'between', value: '13-25' },
        { id: '2', field: 'group', operator: 'contains', value: 'Youth' }
      ],
      createdAt: new Date('2024-09-20')
    }
  ]);
  
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  const dataSources = [
    'Members',
    'Attendance',
    'Giving',
    'Events',
    'Groups',
    'Communications',
    'Sunday School'
  ];

  const fields = {
    Members: ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Status', 'Join Date', 'Group'],
    Attendance: ['Date', 'Service Type', 'Count', 'Member Name', 'Status'],
    Giving: ['Amount', 'Date', 'Type', 'Member Name', 'Payment Method'],
    Events: ['Event Name', 'Date', 'Type', 'Attendance', 'Location'],
    Groups: ['Group Name', 'Type', 'Member Count', 'Leader', 'Active'],
    Communications: ['Type', 'Date', 'Recipients', 'Status', 'Subject'],
    'Sunday School': ['Class Name', 'Age Group', 'Teacher', 'Students', 'Attendance']
  };

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'within', label: 'Within' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  const addFilterRule = () => {
    setFilterRules([
      ...filterRules,
      { id: Date.now().toString(), field: '', operator: '', value: '' }
    ]);
  };

  const removeFilterRule = (id: string) => {
    if (filterRules.length > 1) {
      setFilterRules(filterRules.filter(rule => rule.id !== id));
    }
  };

  const updateFilterRule = (id: string, field: keyof FilterRule, value: string) => {
    setFilterRules(filterRules.map(rule => 
      rule.id === id ? { ...rule, [field]: value } : rule
    ));
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a filter name');
      return;
    }

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName,
      description: filterDescription,
      rules: filterRules,
      createdAt: new Date()
    };

    setSavedFilters([newFilter, ...savedFilters]);
    toast.success('Filter saved successfully');
    
    // Reset form
    setFilterName('');
    setFilterDescription('');
    setFilterRules([{ id: '1', field: '', operator: '', value: '' }]);
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setFilterName(filter.name);
    setFilterDescription(filter.description);
    setFilterRules(filter.rules);
    toast.success('Filter loaded successfully');
  };

  const handleDeleteFilter = (id: string) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id));
    toast.success('Filter deleted successfully');
  };

  const handleResetFilters = () => {
    setFilterRules([{ id: '1', field: '', operator: '', value: '' }]);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSelectedDataSources([]);
    setFilterName('');
    setFilterDescription('');
    toast.success('Filters reset successfully');
  };

  const handleApplyFilters = () => {
    toast.success('Filters applied successfully');
    // TODO: Implement actual filter application logic
  };

  const toggleDataSource = (source: string) => {
    setSelectedDataSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source)
        : [...prev, source]
    );
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
            <h1 className="text-3xl font-bold tracking-tight">Advanced Filters</h1>
            <p className="text-muted-foreground">Create and manage complex data filters</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleApplyFilters} className="bg-brand-primary hover:bg-brand-primary/90">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Filter Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle>Date Range</CardTitle>
              <CardDescription>Filter data by date range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateFrom && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
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
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateTo && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
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

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  const today = new Date();
                  setDateFrom(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7));
                  setDateTo(today);
                }}>
                  Last 7 Days
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const today = new Date();
                  setDateFrom(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30));
                  setDateTo(today);
                }}>
                  Last 30 Days
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const today = new Date();
                  setDateFrom(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90));
                  setDateTo(today);
                }}>
                  Last 90 Days
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  const today = new Date();
                  setDateFrom(new Date(today.getFullYear(), 0, 1));
                  setDateTo(today);
                }}>
                  This Year
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Sources</CardTitle>
              <CardDescription>Select which data sources to include</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dataSources.map((source) => (
                  <Button
                    key={source}
                    variant={selectedDataSources.includes(source) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDataSource(source)}
                    className={selectedDataSources.includes(source) ? 'bg-brand-primary hover:bg-brand-primary/90' : ''}
                  >
                    {source}
                    {selectedDataSources.includes(source) && (
                      <X className="ml-2 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filter Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Rules</CardTitle>
              <CardDescription>Define custom filter conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filterRules.map((rule, index) => (
                <div key={rule.id} className="space-y-3">
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <Separator className="flex-1" />
                      <Badge variant="secondary">AND</Badge>
                      <Separator className="flex-1" />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={rule.field}
                        onValueChange={(value) => updateFilterRule(rule.id, 'field', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(fields).map(([source, sourceFields]) => (
                            <div key={source}>
                              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {source}
                              </div>
                              {sourceFields.map((field) => (
                                <SelectItem key={`${source}-${field}`} value={`${source}.${field}`}>
                                  {field}
                                </SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={rule.operator}
                        onValueChange={(value) => updateFilterRule(rule.id, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Value</Label>
                      <Input
                        placeholder="Enter value"
                        value={rule.value}
                        onChange={(e) => updateFilterRule(rule.id, 'value', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs invisible">Delete</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFilterRule(rule.id)}
                        disabled={filterRules.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={addFilterRule}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Filter Rule
              </Button>
            </CardContent>
          </Card>

          {/* Save Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Save Filter</CardTitle>
              <CardDescription>Save this filter configuration for future use</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Filter Name</Label>
                <Input
                  placeholder="e.g., Active Members - Last 90 Days"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Brief description of this filter"
                  value={filterDescription}
                  onChange={(e) => setFilterDescription(e.target.value)}
                />
              </div>

              <Button onClick={handleSaveFilter} className="w-full bg-brand-primary hover:bg-brand-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Filter
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Filters Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Filters</CardTitle>
              <CardDescription>{savedFilters.length} saved filters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search filters..."
                  className="pl-8"
                />
              </div>

              <Separator />

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {savedFilters.map((filter) => (
                  <Card key={filter.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{filter.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {filter.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteFilter(filter.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {filter.rules.length} rules
                        </Badge>
                        <span>•</span>
                        <span>{format(filter.createdAt, 'MMM d, yyyy')}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleLoadFilter(filter)}
                      >
                        Load Filter
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Active Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date Range:</span>
                <span className="font-medium">
                  {dateFrom && dateTo ? 'Custom' : 'All Time'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data Sources:</span>
                <span className="font-medium">{selectedDataSources.length || 'All'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rules:</span>
                <span className="font-medium">{filterRules.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
