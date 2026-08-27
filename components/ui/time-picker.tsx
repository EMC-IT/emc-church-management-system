'use client';

import * as React from 'react';
import { Clock, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatTime, toTimeInputValue } from '@/lib/date-utils';

export interface TimePickerProps {
  id?: string;
  name?: string;
  value?: string | Date | null;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  size?: 'sm' | 'default' | 'lg';
  stepMinutes?: number;
  'aria-label'?: string;
}

// Generate common time presets for quick selection
const QUICK_TIMES = [
  '06:00', '07:00', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '21:00',
];

const HOURS_12 = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export function TimePicker({
  id,
  name,
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  error = false,
  size = 'default',
  'aria-label': ariaLabel,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Normalize current value to "HH:mm" (24h)
  const time24 = React.useMemo(() => {
    return toTimeInputValue(value);
  }, [value]);

  // Derive 12h parts
  const { hour12, minute, period } = React.useMemo(() => {
    if (!time24) {
      return { hour12: '09', minute: '00', period: 'AM' as const };
    }
    const [hStr, mStr] = time24.split(':');
    const h = parseInt(hStr || '9', 10);
    const m = mStr || '00';
    const p = h >= 12 ? ('PM' as const) : ('AM' as const);
    let h12 = h % 12;
    if (h12 === 0) h12 = 12;
    const h12Str = h12 < 10 ? `0${h12}` : `${h12}`;
    return { hour12: h12Str, minute: m, period: p };
  }, [time24]);

  const updateTime = (newHour12: string, newMinute: string, newPeriod: 'AM' | 'PM') => {
    let h = parseInt(newHour12, 10);
    if (newPeriod === 'PM' && h < 12) h += 12;
    if (newPeriod === 'AM' && h === 12) h = 0;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const formatted24 = `${hStr}:${newMinute}`;
    if (onChange) {
      onChange(formatted24);
    }
  };

  const handleQuickSelect = (preset: string) => {
    if (onChange) {
      onChange(preset);
    }
    setOpen(false);
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs',
    default: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          name={name}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          className={cn(
            'w-full justify-between text-left font-normal transition-colors',
            sizeClasses[size],
            !time24 && 'text-muted-foreground',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
        >
          <div className="flex items-center truncate">
            <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {time24 ? formatTime(time24) : placeholder}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 opacity-50 ml-1 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Custom Time
          </div>
          <div className="flex items-center gap-1.5 justify-center bg-muted/30 p-2 rounded-md border border-border/50">
            {/* Hour Select */}
            <Select
              value={hour12}
              onValueChange={(val) => updateTime(val, minute, period)}
            >
              <SelectTrigger className="w-[60px] h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {HOURS_12.map((h) => (
                  <SelectItem key={h} value={h} className="text-xs">
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="font-bold text-muted-foreground text-sm">:</span>

            {/* Minute Select */}
            <Select
              value={minute}
              onValueChange={(val) => updateTime(hour12, val, period)}
            >
              <SelectTrigger className="w-[60px] h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={m} className="text-xs">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Select */}
            <Select
              value={period}
              onValueChange={(val: 'AM' | 'PM') => updateTime(hour12, minute, val)}
            >
              <SelectTrigger className="w-[64px] h-8 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM" className="text-xs">
                  AM
                </SelectItem>
                <SelectItem value="PM" className="text-xs">
                  PM
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Common Times
            </div>
            <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto pr-1">
              {QUICK_TIMES.map((preset) => {
                const isSelected = time24 === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickSelect(preset)}
                    className={cn(
                      'text-xs py-1 px-1.5 rounded text-center transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-semibold'
                        : 'hover:bg-accent text-foreground/80'
                    )}
                  >
                    {formatTime(preset)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
