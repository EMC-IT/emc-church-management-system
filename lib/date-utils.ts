import {
  format,
  parse,
  isValid,
  isToday,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
} from 'date-fns';

/**
 * Standard user-facing date format throughout ChurchMS for card/table views
 * Example: Aug 27, 2026
 */
export const STANDARD_DATE_FORMAT = 'MMM d, yyyy';

/**
 * Standard input date format for typing and form inputs
 * Example: 15/03/1987
 */
export const DISPLAY_DATE_FORMAT = 'dd/MM/yyyy';

/**
 * Standard user-facing time format throughout ChurchMS
 * Example: 09:00 AM
 */
export const STANDARD_TIME_FORMAT = 'hh:mm a';

/**
 * Standard user-facing datetime format throughout ChurchMS
 * Example: Aug 27, 2026, 09:00 AM
 */
export const STANDARD_DATETIME_FORMAT = 'MMM d, yyyy, hh:mm a';

export interface DateValidationResult {
  valid: boolean;
  date?: Date;
  error?: string;
}

/**
 * Strictly parse and validate user-typed DD/MM/YYYY dates.
 * Handles impossible dates (e.g. 31/02/1987), leap years, invalid day/month/year, and optional min/max bounds.
 */
export function parseDisplayDate(
  input: string,
  options?: { minDate?: Date; maxDate?: Date; isDateOfBirth?: boolean }
): DateValidationResult {
  if (!input || !input.trim()) {
    return { valid: true, date: undefined };
  }

  const trimmed = input.trim();

  // Support DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, and 8 continuous digits DDMMYYYY
  let day: number;
  let month: number;
  let year: number;

  const separatorMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  const continuousMatch = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/);
  const isoMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);

  if (separatorMatch) {
    day = parseInt(separatorMatch[1], 10);
    month = parseInt(separatorMatch[2], 10);
    year = parseInt(separatorMatch[3], 10);
    // Expand 2-digit year to 4-digit (e.g. 87 -> 1987, 25 -> 2025)
    if (year < 100) {
      const currentYearTwoDigit = new Date().getFullYear() % 100;
      year += year > currentYearTwoDigit ? 1900 : 2000;
    }
  } else if (continuousMatch) {
    day = parseInt(continuousMatch[1], 10);
    month = parseInt(continuousMatch[2], 10);
    year = parseInt(continuousMatch[3], 10);
  } else if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  } else {
    return {
      valid: false,
      error: 'Please enter date in DD/MM/YYYY format (e.g. 15/03/1987)',
    };
  }

  // Validate year range
  if (year < 1900 || year > 2100) {
    return { valid: false, error: 'Year must be between 1900 and 2100' };
  }

  // Validate month range
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 01 and 12' };
  }

  // Validate days in the specific month of that year (accounting for leap years)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const maxDaysInMonth = new Date(year, month, 0).getDate();

  if (day < 1 || day > maxDaysInMonth) {
    if (month === 2) {
      const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      return {
        valid: false,
        error: isLeap
          ? `February ${year} has 29 days`
          : `February ${year} only has 28 days`,
      };
    }
    return {
      valid: false,
      error: `${monthNames[month - 1]} only has ${maxDaysInMonth} days`,
    };
  }

  // Create date at local noon to avoid timezone boundary shifts
  const parsedDate = new Date(year, month - 1, day, 12, 0, 0);

  if (!isValid(parsedDate)) {
    return { valid: false, error: 'Invalid date entered' };
  }

  // Validate minDate
  if (options?.minDate) {
    const min = startOfDay(options.minDate);
    if (startOfDay(parsedDate) < min) {
      return {
        valid: false,
        error: `Date cannot be earlier than ${format(min, DISPLAY_DATE_FORMAT)}`,
      };
    }
  }

  // Validate maxDate or Date of Birth in the future
  if (options?.isDateOfBirth || options?.maxDate) {
    const max = options?.maxDate ? endOfDay(options.maxDate) : endOfDay(new Date());
    if (parsedDate > max) {
      return {
        valid: false,
        error: options?.isDateOfBirth
          ? 'Date of birth cannot be in the future'
          : `Date cannot be later than ${format(max, DISPLAY_DATE_FORMAT)}`,
      };
    }
  }

  return { valid: true, date: parsedDate };
}

/**
 * Format a date to user-facing input format: "15/03/1987"
 */
export function formatDisplayDate(
  date: string | number | Date | null | undefined,
  fallback = ''
): string {
  const parsed = parseDateValue(date);
  if (!parsed) return fallback;
  try {
    return format(parsed, DISPLAY_DATE_FORMAT);
  } catch {
    return fallback;
  }
}

/**
 * Safely parse a date-like value (ISO string, yyyy-MM-dd string, dd/MM/yyyy string, timestamp, or Date)
 * into a valid local Date object without timezone drift.
 */
export function parseDateValue(value: string | number | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  if (typeof value === 'number') {
    const d = new Date(value);
    return isValid(d) ? d : undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    // Check if it's in yyyy-MM-dd format (date-only)
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      const parsed = new Date(year, month - 1, day, 12, 0, 0);
      return isValid(parsed) ? parsed : undefined;
    }

    // Check if it's in DD/MM/YYYY format
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(trimmed)) {
      const result = parseDisplayDate(trimmed);
      if (result.valid && result.date) return result.date;
    }

    // Try standard ISO or string parse
    const parsed = new Date(trimmed);
    if (isValid(parsed)) return parsed;

    // Fallback: try parsing with date-fns for standard patterns
    const parsedWithFormat = parse(trimmed, STANDARD_DATE_FORMAT, new Date());
    if (isValid(parsedWithFormat)) return parsedWithFormat;
  }

  return undefined;
}

/**
 * Format a date to standard ChurchMS format: "Aug 27, 2026"
 */
export function formatDate(
  date: string | number | Date | null | undefined,
  fallback = '—'
): string {
  const parsed = parseDateValue(date);
  if (!parsed) return fallback;
  try {
    return format(parsed, STANDARD_DATE_FORMAT);
  } catch {
    return fallback;
  }
}

/**
 * Format a time (HH:mm string, ISO string, or Date) to standard ChurchMS format: "09:00 AM"
 */
export function formatTime(
  timeOrDate: string | number | Date | null | undefined,
  fallback = '—'
): string {
  if (!timeOrDate) return fallback;

  // If time string in "HH:mm" or "HH:mm:ss" format
  if (typeof timeOrDate === 'string') {
    const timeMatch = timeOrDate.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        const dummyDate = new Date(2000, 0, 1, hours, minutes);
        return format(dummyDate, STANDARD_TIME_FORMAT);
      }
    }
  }

  const parsed = parseDateValue(timeOrDate);
  if (!parsed) return fallback;
  try {
    return format(parsed, STANDARD_TIME_FORMAT);
  } catch {
    return fallback;
  }
}

/**
 * Format a datetime to standard ChurchMS format: "Aug 27, 2026, 09:00 AM"
 */
export function formatDateTime(
  date: string | number | Date | null | undefined,
  fallback = '—'
): string {
  const parsed = parseDateValue(date);
  if (!parsed) return fallback;
  try {
    return format(parsed, STANDARD_DATETIME_FORMAT);
  } catch {
    return fallback;
  }
}

/**
 * Format a timestamp with smart relative context:
 * - "Today, 09:00 AM"
 * - "Yesterday, 02:30 PM"
 * - "Aug 27, 2026, 09:00 AM"
 */
export function formatRelativeDateTime(
  date: string | number | Date | null | undefined,
  fallback = '—'
): string {
  const parsed = parseDateValue(date);
  if (!parsed) return fallback;

  try {
    const timeStr = format(parsed, STANDARD_TIME_FORMAT);
    if (isToday(parsed)) {
      return `Today, ${timeStr}`;
    }
    if (isYesterday(parsed)) {
      return `Yesterday, ${timeStr}`;
    }
    return format(parsed, STANDARD_DATETIME_FORMAT);
  } catch {
    return fallback;
  }
}

/**
 * Format a date range: "Aug 1, 2026 – Aug 31, 2026"
 */
export function formatDateRange(
  from: string | number | Date | null | undefined,
  to: string | number | Date | null | undefined,
  fallback = 'Select date range'
): string {
  const parsedFrom = parseDateValue(from);
  const parsedTo = parseDateValue(to);

  if (!parsedFrom && !parsedTo) return fallback;
  if (parsedFrom && !parsedTo) return formatDate(parsedFrom);
  if (!parsedFrom && parsedTo) return formatDate(parsedTo);

  if (parsedFrom && parsedTo) {
    const fromYear = parsedFrom.getFullYear();
    const toYear = parsedTo.getFullYear();

    if (fromYear === toYear) {
      return `${format(parsedFrom, 'MMM d')} – ${format(parsedTo, STANDARD_DATE_FORMAT)}`;
    }
    return `${format(parsedFrom, STANDARD_DATE_FORMAT)} – ${format(parsedTo, STANDARD_DATE_FORMAT)}`;
  }

  return fallback;
}

/**
 * Format date to machine-readable standard "yyyy-MM-dd" for HTML form state / DB
 */
export function toDateInputValue(date: string | number | Date | null | undefined): string {
  const parsed = parseDateValue(date);
  if (!parsed) return '';
  return format(parsed, 'yyyy-MM-dd');
}

/**
 * Format time to machine-readable standard "HH:mm" (24h) for form state / DB
 */
export function toTimeInputValue(timeOrDate: string | number | Date | null | undefined): string {
  if (!timeOrDate) return '';
  if (typeof timeOrDate === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(timeOrDate.trim())) {
    return timeOrDate.trim();
  }
  const parsed = parseDateValue(timeOrDate);
  if (!parsed) return '';
  return format(parsed, 'HH:mm');
}

/**
 * Date range presets for analytics, finance, and reporting filters
 */
export function getDateRangePresets(): Array<{
  label: string;
  getValue: () => { from: Date; to: Date };
}> {
  const now = new Date();
  return [
    {
      label: 'Today',
      getValue: () => ({ from: startOfDay(now), to: endOfDay(now) }),
    },
    {
      label: 'This Week',
      getValue: () => ({ from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) }),
    },
    {
      label: 'This Month',
      getValue: () => ({ from: startOfMonth(now), to: endOfMonth(now) }),
    },
    {
      label: 'Last Month',
      getValue: () => {
        const prevMonth = subMonths(now, 1);
        return { from: startOfMonth(prevMonth), to: endOfMonth(prevMonth) };
      },
    },
    {
      label: 'This Quarter',
      getValue: () => ({ from: startOfQuarter(now), to: endOfQuarter(now) }),
    },
    {
      label: 'This Year',
      getValue: () => ({ from: startOfYear(now), to: endOfYear(now) }),
    },
  ];
}
