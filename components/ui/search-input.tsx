"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'checkbox' | 'range';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  multiple?: boolean;
}

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string, filters: Record<string, any>) => void;
  filters?: SearchFilter[];
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showFilters?: boolean;
  showAdvanced?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function SearchInput({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  filters = [],
  className,
  size = 'default',
  showFilters = true,
  showAdvanced = false,
  loading = false,
  disabled = false,
}: SearchInputProps) {
  const [searchValue, setSearchValue] = React.useState(value);
  const [activeFilters, setActiveFilters] = React.useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 text-sm',
    default: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  // Map component size to Button size
  const getButtonSize = (componentSize: 'sm' | 'default' | 'lg') => {
    switch (componentSize) {
      case 'sm': return 'sm';
      case 'default': return 'default';
      case 'lg': return 'lg';
      default: return 'default';
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue, activeFilters);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters };
    if (value === null || value === undefined || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key];
    setActiveFilters(newFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const getActiveFiltersCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderFilter = (filter: SearchFilter) => {
    switch (filter.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Input
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              value={activeFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="h-8"
            />
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Select
              value={activeFilters[filter.key] || ''}
              onValueChange={(value) => handleFilterChange(filter.key, value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={filter.placeholder || `Select ${filter.label.toLowerCase()}...`} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-8 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activeFilters[filter.key] ? (
                    format(new Date(activeFilters[filter.key]), 'PPP')
                  ) : (
                    <span className="text-muted-foreground">
                      {filter.placeholder || 'Pick a date'}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={activeFilters[filter.key] ? new Date(activeFilters[filter.key]) : undefined}
                  onSelect={(date) => handleFilterChange(filter.key, date ? format(date, 'yyyy-MM-dd') : null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{filter.label}</Label>
            <div className="space-y-2">
              {filter.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filter.key}-${option.value}`}
                    checked={activeFilters[filter.key]?.includes?.(option.value) || false}
                    onCheckedChange={(checked) => {
                      const currentValues = activeFilters[filter.key] || [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter((v: string) => v !== option.value);
                      handleFilterChange(filter.key, newValues.length > 0 ? newValues : null);
                    }}
                  />
                  <Label htmlFor={`${filter.key}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange?.(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className={cn(
              sizeClasses[size],
              "pl-10"
            )}
          />
        </div>
        
        <Button
          onClick={handleSearch}
          disabled={disabled || loading}
          size={getButtonSize(size)}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>

        {showFilters && filters.length > 0 && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={getButtonSize(size)}
                className={cn(
                  getActiveFiltersCount() > 0 && "bg-primary/10 border-primary"
                )}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="space-y-4">
                  {filters.map((filter) => renderFilter(filter))}
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSearch();
                      setIsFilterOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {showAdvanced && (
          <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size={getButtonSize(size)}
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Advanced
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Advanced Search</h4>
                <Separator />
                <div className="space-y-4">
                  {/* Advanced search options can be added here */}
                  <p className="text-sm text-muted-foreground">
                    Advanced search features coming soon...
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const displayValue = Array.isArray(value) ? value.join(', ') : value;
            
            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span className="text-xs">
                  {filter?.label}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1"
                  onClick={() => clearFilter(key)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

// Quick Search Component
export interface QuickSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function QuickSearch({
  placeholder = "Quick search...",
  onSearch,
  className,
  size = 'default',
}: QuickSearchProps) {
  const [value, setValue] = React.useState("");

  const handleSearch = () => {
    if (onSearch && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-sm',
    default: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={handleKeyPress}
        className={cn(
          sizeClasses[size],
          "pl-10"
        )}
      />
    </div>
  );
} 