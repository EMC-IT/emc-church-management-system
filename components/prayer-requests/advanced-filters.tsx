"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  categories?: Array<{ id: string; name: string; }>;
  prayerTeams?: Array<{ id: string; name: string; }>;
}

export interface FilterState {
  status: string[];
  priority: string[];
  category: string[];
  assignedTo: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  confidential: string;
  anonymous: string;
}

const initialFilters: FilterState = {
  status: [],
  priority: [],
  category: [],
  assignedTo: [],
  dateRange: {
    from: undefined,
    to: undefined,
  },
  confidential: 'all',
  anonymous: 'all',
};

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'answered', label: 'Answered' },
  { value: 'closed', label: 'Closed' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export function AdvancedFilters({ onFilterChange, categories = [], prayerTeams = [] }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'category' | 'assignedTo', value: string) => {
    const currentValues = filters[key];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    updateFilters(key, newValues);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  const activeFilterCount = 
    filters.status.length +
    filters.priority.length +
    filters.category.length +
    filters.assignedTo.length +
    (filters.dateRange.from ? 1 : 0) +
    (filters.confidential !== 'all' ? 1 : 0) +
    (filters.anonymous !== 'all' ? 1 : 0);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <Badge 
              variant="neutral" 
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-brand-primary text-white"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Filter Prayer Requests</h4>
            {activeFilterCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Status</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filters.status.includes(option.value) ? "primary" : "neutral"}
                  className={cn(
                    "cursor-pointer hover:opacity-80",
                    filters.status.includes(option.value) && "bg-brand-primary text-white hover:bg-brand-primary/90"
                  )}
                  onClick={() => toggleArrayFilter('status', option.value)}
                >
                  {option.label}
                  {filters.status.includes(option.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Priority</Label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(option => (
                <Badge
                  key={option.value}
                  variant={filters.priority.includes(option.value) ? "primary" : "neutral"}
                  className={cn(
                    "cursor-pointer hover:opacity-80",
                    filters.priority.includes(option.value) && "bg-brand-primary text-white hover:bg-brand-primary/90"
                  )}
                  onClick={() => toggleArrayFilter('priority', option.value)}
                >
                  {option.label}
                  {filters.priority.includes(option.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Category</Label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    variant={filters.category.includes(category.id) ? "primary" : "neutral"}
                    className={cn(
                      "cursor-pointer hover:opacity-80",
                      filters.category.includes(category.id) && "bg-brand-primary text-white hover:bg-brand-primary/90"
                    )}
                    onClick={() => toggleArrayFilter('category', category.id)}
                  >
                    {category.name}
                    {filters.category.includes(category.id) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prayer Team Filter */}
          {prayerTeams.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Assigned To</Label>
              <Select 
                value={filters.assignedTo[0] || 'all'}
                onValueChange={(value) => updateFilters('assignedTo', value === 'all' ? [] : [value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {prayerTeams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Date Range</Label>
            <DateRangePicker
              date={filters.dateRange}
              onDateChange={(range) =>
                updateFilters('dateRange', {
                  from: range?.from,
                  to: range?.to,
                })
              }
              placeholder="Pick a date range"
              size="sm"
              clearable
              showPresets
            />
          </div>

          {/* Confidential Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Confidentiality</Label>
            <Select 
              value={filters.confidential}
              onValueChange={(value) => updateFilters('confidential', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="public">Public Only</SelectItem>
                <SelectItem value="confidential">Confidential Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Anonymous Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Anonymous Status</Label>
            <Select 
              value={filters.anonymous}
              onValueChange={(value) => updateFilters('anonymous', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="named">Named Only</SelectItem>
                <SelectItem value="anonymous">Anonymous Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
