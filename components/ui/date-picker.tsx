'use client';

import * as React from 'react';
import { Calendar as CalendarIcon, X, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Matcher } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
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
import {
  parseDateValue,
  parseDisplayDate,
  formatDisplayDate,
  toDateInputValue,
} from '@/lib/date-utils';

export interface DatePickerProps {
  id?: string;
  name?: string;
  value?: Date | string | null;
  onChange?: (date: Date | undefined, dateString: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledDays?: Matcher | Matcher[];
  minDate?: Date;
  maxDate?: Date;
  fromYear?: number;
  toYear?: number;
  isDateOfBirth?: boolean;
  className?: string;
  error?: boolean;
  errorMessage?: string;
  size?: 'sm' | 'default' | 'lg';
  clearable?: boolean;
  required?: boolean;
  'aria-label'?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DatePicker({
  id,
  name,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled = false,
  disabledDays,
  minDate,
  maxDate: customMaxDate,
  fromYear: customFromYear,
  toYear: customToYear,
  isDateOfBirth = false,
  className,
  error = false,
  errorMessage,
  size = 'default',
  clearable = true,
  required = false,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [typedText, setTypedText] = React.useState<string>('');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  // Effective max date (DOB cannot be in the future)
  const maxDate = React.useMemo(() => {
    if (isDateOfBirth) {
      return customMaxDate || new Date();
    }
    return customMaxDate;
  }, [isDateOfBirth, customMaxDate]);

  // Derived selected date from controlled value
  const selectedDate = React.useMemo(() => parseDateValue(value), [value]);

  // Sync internal text state with external value changes
  React.useEffect(() => {
    if (selectedDate) {
      setTypedText(formatDisplayDate(selectedDate));
      setValidationError(null);
    } else if (!value) {
      setTypedText('');
      setValidationError(null);
    }
  }, [selectedDate, value]);

  // Track the month currently visible in the calendar popover
  const currentYear = new Date().getFullYear();
  const [viewMonth, setViewMonth] = React.useState<Date>(() => {
    if (selectedDate) return selectedDate;
    if (isDateOfBirth) return new Date(currentYear - 25, 0, 1);
    return new Date();
  });

  // When popover opens or selected date changes, sync viewMonth
  React.useEffect(() => {
    if (open) {
      if (selectedDate) {
        setViewMonth(selectedDate);
      } else if (isDateOfBirth) {
        setViewMonth(new Date(currentYear - 25, 0, 1));
      } else {
        setViewMonth(new Date());
      }
    }
  }, [open, selectedDate, isDateOfBirth, currentYear]);

  // Year range generation
  const fromYear = customFromYear ?? (isDateOfBirth ? 1920 : 1930);
  const toYear = customToYear ?? (isDateOfBirth ? currentYear : currentYear + 25);

  const yearOptions = React.useMemo(() => {
    const years: number[] = [];
    if (isDateOfBirth) {
      // Descending for DOB so user can find birth year quickly
      for (let y = toYear; y >= fromYear; y--) {
        years.push(y);
      }
    } else {
      // Ascending for regular events/dates
      for (let y = fromYear; y <= toYear; y++) {
        years.push(y);
      }
    }
    return years;
  }, [fromYear, toYear, isDateOfBirth]);

  // Handle typing in the input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setTypedText(rawVal);

    if (!rawVal.trim()) {
      setValidationError(null);
      if (onChange) {
        onChange(undefined, '');
      }
      return;
    }

    // Attempt parsing when typing looks complete (e.g. 10 chars DD/MM/YYYY or 8 digits)
    const cleaned = rawVal.trim();
    if (cleaned.length >= 8) {
      const result = parseDisplayDate(cleaned, { minDate, maxDate, isDateOfBirth });
      if (result.valid && result.date) {
        setValidationError(null);
        setViewMonth(result.date);
        if (onChange) {
          onChange(result.date, toDateInputValue(result.date));
        }
      }
    }
  };

  // Validate on blur
  const handleInputBlur = () => {
    if (!typedText.trim()) {
      setValidationError(null);
      if (onChange && selectedDate) {
        onChange(undefined, '');
      }
      return;
    }

    const result = parseDisplayDate(typedText, { minDate, maxDate, isDateOfBirth });
    if (result.valid && result.date) {
      setValidationError(null);
      setTypedText(formatDisplayDate(result.date));
      setViewMonth(result.date);
      if (onChange) {
        onChange(result.date, toDateInputValue(result.date));
      }
    } else {
      setValidationError(result.error || 'Invalid date entered');
    }
  };

  // Allow pressing Enter to validate and commit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInputBlur();
    }
  };

  // Calendar date selection
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setValidationError(null);
      setTypedText(formatDisplayDate(date));
      setViewMonth(date);
      setOpen(false);
      if (onChange) {
        onChange(date, toDateInputValue(date));
      }
    }
  };

  // Clear date
  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTypedText('');
    setValidationError(null);
    if (onChange) {
      onChange(undefined, '');
    }
  };

  // Month select change in popover header
  const handleMonthChange = (monthIdxStr: string) => {
    const monthIdx = parseInt(monthIdxStr, 10);
    const newDate = new Date(viewMonth.getFullYear(), monthIdx, 1);
    setViewMonth(newDate);
  };

  // Year select change in popover header
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = new Date(year, viewMonth.getMonth(), 1);
    setViewMonth(newDate);
  };

  // Combine disabled matcher constraints
  const matcherList: Matcher[] = [];
  if (disabledDays) {
    if (Array.isArray(disabledDays)) {
      matcherList.push(...disabledDays);
    } else {
      matcherList.push(disabledDays);
    }
  }
  if (minDate) {
    matcherList.push({ before: minDate });
  }
  if (maxDate) {
    matcherList.push({ after: maxDate });
  }

  const goToPreviousMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    default: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const hasError = error || !!validationError || !!errorMessage;

  return (
    <div className={cn('relative w-full space-y-1', className)}>
      <div className="relative flex items-center w-full">
        <Input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          value={typedText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-label={ariaLabel || placeholder}
          aria-invalid={hasError}
          className={cn(
            'pr-16 font-mono tracking-normal bg-background transition-colors',
            sizeClasses[size],
            hasError && 'border-destructive focus-visible:ring-destructive text-destructive'
          )}
        />

        <div className="absolute right-1 flex items-center gap-0.5">
          {clearable && typedText && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Clear date"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                aria-label="Open calendar picker"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-3 shadow-lg border border-border rounded-xl bg-popover"
              align="end"
            >
              {/* Header Navigation: [ < ] [ Month v ] [ Year v ] [ > ] */}
              <div className="flex items-center justify-between gap-1.5 pb-2">
                {/* Previous Month Arrow */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-border bg-background hover:bg-muted text-foreground"
                  onClick={goToPreviousMonth}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Month Dropdown */}
                <Select
                  value={String(viewMonth.getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-8 text-xs font-medium px-2.5 flex-1 border border-border bg-background rounded-md justify-between">
                    <SelectValue>{MONTH_NAMES[viewMonth.getMonth()]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[240px]">
                    {MONTH_NAMES.map((name, idx) => (
                      <SelectItem key={idx} value={String(idx)} className="text-xs">
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Year Dropdown */}
                <Select
                  value={String(viewMonth.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-8 text-xs font-medium px-2.5 w-[85px] border border-border bg-background rounded-md justify-between font-mono">
                    <SelectValue>{viewMonth.getFullYear()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[240px]">
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs font-mono">
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Next Month Arrow */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-border bg-background hover:bg-muted text-foreground"
                  onClick={goToNextMonth}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* DayPicker Calendar Grid */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                month={viewMonth}
                onMonthChange={setViewMonth}
                disabled={matcherList.length > 0 ? matcherList : undefined}
                classNames={{
                  month_caption: 'hidden',
                  nav: 'hidden',
                  months: 'space-y-0',
                  month: 'space-y-1',
                }}
                initialFocus
              />

              {/* Quick Footer Shortcuts */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border text-xs">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    const today = new Date();
                    handleCalendarSelect(today);
                  }}
                  disabled={maxDate ? new Date() > maxDate : false}
                >
                  Today
                </Button>

                {selectedDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      handleClear();
                      setOpen(false);
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Validation Error Message */}
      {(validationError || errorMessage) && (
        <p className="flex items-center gap-1 text-xs text-destructive mt-1 font-medium">
          <AlertCircle className="h-3 w-3 shrink-0" />
          <span>{validationError || errorMessage}</span>
        </p>
      )}
    </div>
  );
}
