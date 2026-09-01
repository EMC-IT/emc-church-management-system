'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { parseDateValue, toDateInputValue, toTimeInputValue } from '@/lib/date-utils';

export interface DateTimePickerProps {
  id?: string;
  name?: string;
  value?: Date | string | null;
  onChange?: (date: Date | undefined, isoString: string) => void;
  datePlaceholder?: string;
  timePlaceholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function DateTimePicker({
  id,
  name,
  value,
  onChange,
  datePlaceholder = 'Pick a date',
  timePlaceholder = 'Select time',
  disabled = false,
  className,
  error = false,
  size = 'default',
}: DateTimePickerProps) {
  const currentDate = React.useMemo(() => parseDateValue(value), [value]);

  const dateValue = React.useMemo(() => {
    return currentDate ? toDateInputValue(currentDate) : '';
  }, [currentDate]);

  const timeValue = React.useMemo(() => {
    return currentDate ? toTimeInputValue(currentDate) : '09:00';
  }, [currentDate]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      if (onChange) onChange(undefined, '');
      return;
    }

    const [h, m] = (timeValue || '09:00').split(':').map(Number);
    const combined = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      h || 9,
      m || 0
    );
    if (onChange) {
      onChange(combined, combined.toISOString());
    }
  };

  const handleTimeChange = (newTime: string) => {
    const baseDate = currentDate || new Date();
    const [h, m] = (newTime || '09:00').split(':').map(Number);
    const combined = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      h || 0,
      m || 0
    );
    if (onChange) {
      onChange(combined, combined.toISOString());
    }
  };

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2.5', className)}>
      <DatePicker
        id={id ? `${id}-date` : undefined}
        name={name ? `${name}_date` : undefined}
        value={dateValue}
        onChange={handleDateChange}
        placeholder={datePlaceholder}
        disabled={disabled}
        error={error}
        size={size}
      />
      <TimePicker
        id={id ? `${id}-time` : undefined}
        name={name ? `${name}_time` : undefined}
        value={timeValue}
        onChange={handleTimeChange}
        placeholder={timePlaceholder}
        disabled={disabled}
        error={error}
        size={size}
      />
    </div>
  );
}
