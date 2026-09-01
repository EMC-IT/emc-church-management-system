'use client';

import * as React from 'react';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { formatDateRange, getDateRangePresets } from '@/lib/date-utils';

export interface DatePickerWithRangeProps {
  id?: string;
  name?: string;
  date?: DateRange;
  onDateChange?: (date: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showPresets?: boolean;
  align?: 'start' | 'center' | 'end';
  size?: 'sm' | 'default' | 'lg';
  clearable?: boolean;
}

export function DatePickerWithRange({
  id,
  name,
  date,
  onDateChange,
  placeholder = 'Pick a date range',
  className,
  disabled = false,
  showPresets = false,
  align = 'start',
  size = 'default',
  clearable = false,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);

  const presets = React.useMemo(() => getDateRangePresets(), []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDateChange) {
      onDateChange(undefined);
    }
  };

  const handleApplyPreset = (presetValue: { from: Date; to: Date }) => {
    if (onDateChange) {
      onDateChange(presetValue);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs',
    default: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const displayText = React.useMemo(() => {
    if (!date?.from) return placeholder;
    return formatDateRange(date.from, date.to, placeholder);
  }, [date, placeholder]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id || 'date'}
            name={name}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal transition-colors relative',
              sizeClasses[size],
              !date?.from && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate flex-1">{displayText}</span>
            {clearable && date?.from && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClear(e as any);
                  }
                }}
                className="ml-auto p-0.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Clear date range"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="flex flex-col sm:flex-row">
            {showPresets && (
              <div className="border-b sm:border-b-0 sm:border-r border-border p-3 flex flex-row sm:flex-col gap-1 overflow-x-auto sm:w-36">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 hidden sm:block">
                  Presets
                </div>
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start text-xs h-8 whitespace-nowrap"
                    onClick={() => handleApplyPreset(preset.getValue())}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}
            <div className="p-1">
              <Calendar
                mode="range"
                defaultMonth={date?.from || new Date()}
                selected={date}
                onSelect={onDateChange}
                numberOfMonths={2}
                initialFocus
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export const DateRangePicker = DatePickerWithRange;