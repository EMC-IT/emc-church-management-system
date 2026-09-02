'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  MemberAttendanceRecord,
  MemberAttendanceFilter,
  AttendanceServiceType,
  MemberAttendanceStatus,
} from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AttendanceHistoryProps {
  records: MemberAttendanceRecord[];
  filter: MemberAttendanceFilter;
  onFilterChange: (filter: MemberAttendanceFilter) => void;
  className?: string;
}

export function AttendanceHistory({
  records,
  filter,
  onFilterChange,
  className,
}: AttendanceHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever filter parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, records.length);
  const paginatedRecords = records.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const hasActiveFilters =
    (filter.dateRange && filter.dateRange !== 'all') ||
    (filter.serviceType && filter.serviceType !== 'all') ||
    (filter.status && filter.status !== 'all') ||
    (filter.search && filter.search.trim().length > 0);

  const handleResetFilters = () => {
    onFilterChange({
      dateRange: 'all',
      serviceType: 'all',
      status: 'all',
      search: '',
    });
  };

  const getStatusDisplay = (status: MemberAttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'Present';
      case 'online':
        return 'Online';
      case 'excused':
        return 'Excused';
      case 'absent':
        return 'Absent';
      default:
        return status;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-border/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              Attendance History
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {records.length} recorded session{records.length === 1 ? '' : 's'}
            </p>
          </div>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 text-xs gap-1.5 self-start sm:self-auto text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search service or branch..."
              value={filter.search || ''}
              onChange={(e) =>
                onFilterChange({ ...filter, search: e.target.value })
              }
              className="pl-8 h-9 text-xs"
            />
          </div>

          {/* Date Range Filter */}
          <Select
            value={filter.dateRange || 'all'}
            onValueChange={(val) =>
              onFilterChange({
                ...filter,
                dateRange: val as MemberAttendanceFilter['dateRange'],
              })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="180d">Last 6 Months</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Service Type Filter */}
          <Select
            value={filter.serviceType || 'all'}
            onValueChange={(val) =>
              onFilterChange({
                ...filter,
                serviceType: val as AttendanceServiceType | 'all',
              })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="Sunday Service">Sunday Service</SelectItem>
              <SelectItem value="Midweek Service">Midweek Service</SelectItem>
              <SelectItem value="Prayer Meeting">Prayer Meeting</SelectItem>
              <SelectItem value="Youth Service">Youth Service</SelectItem>
              <SelectItem value="Special Event">Special Event</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filter.status || 'all'}
            onValueChange={(val) =>
              onFilterChange({
                ...filter,
                status: val as MemberAttendanceStatus | 'all',
              })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Attendance Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        {paginatedRecords.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead className="min-w-[200px]">Event / Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="min-w-[180px]">Branch</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-medium text-foreground text-xs whitespace-nowrap">
                    {formatDate(rec.date)}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground text-sm">
                      {rec.eventName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {rec.serviceType}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {rec.branch || rec.campus}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {rec.checkInTime ? (
                      <span>{rec.checkInTime}</span>
                    ) : (
                      <span className="text-muted-foreground/60">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={getStatusDisplay(rec.status)} size="sm" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No attendance records match your active filters.
          </div>
        )}
      </div>

      {/* Mobile Card List View (Visible on small screens) */}
      <div className="md:hidden divide-y divide-border/40">
        {paginatedRecords.length > 0 ? (
          paginatedRecords.map((rec) => (
            <div key={rec.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">
                    {rec.eventName}
                  </h4>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(rec.date)} • {rec.serviceType}
                  </div>
                </div>
                <StatusBadge status={getStatusDisplay(rec.status)} size="sm" />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
                <span className="truncate">{rec.branch || rec.campus}</span>
                <span>{rec.checkInTime || 'No check-in time'}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No attendance records match your active filters.
          </div>
        )}
      </div>

      {/* Pagination Footer matching Admin Data-Table design */}
      {records.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border/40 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground">Rows per page</p>
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
              Showing {startIndex + 1}–{endIndex} of {records.length}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <p className="whitespace-nowrap text-xs sm:text-sm text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{' '}
              {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 sm:inline-flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hidden h-8 w-8 sm:inline-flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
