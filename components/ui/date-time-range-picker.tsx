'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';

export interface DateTimeRangePickerProps {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  onStartChange?: (date: Date | undefined, isoString: string) => void;
  onEndChange?: (date: Date | undefined, isoString: string) => void;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function DateTimeRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startLabel = 'Start Date & Time',
  endLabel = 'End Date & Time',
  disabled = false,
  className,
  size = 'default',
}: DateTimeRangePickerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        {startLabel && <Label className="text-xs font-medium text-foreground/80">{startLabel}</Label>}
        <DateTimePicker
          value={startDate}
          onChange={onStartChange}
          datePlaceholder="Start date"
          timePlaceholder="Start time"
          disabled={disabled}
          size={size}
        />
      </div>

      <div className="space-y-2">
        {endLabel && <Label className="text-xs font-medium text-foreground/80">{endLabel}</Label>}
        <DateTimePicker
          value={endDate}
          onChange={onEndChange}
          datePlaceholder="End date"
          timePlaceholder="End time"
          disabled={disabled}
          size={size}
        />
      </div>
    </div>
  );
}
