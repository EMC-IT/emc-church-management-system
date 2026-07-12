"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableAdvancedFilters } from "@/components/ui/data-table-advanced-filters";
import { DataTableColumnVisibility } from "@/components/ui/data-table-column-visibility";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  toolbarContent?: React.ReactNode;
  recordLabel?: string;
  recordLabelPlural?: string;
  searchKey?: string;
  showSearch?: boolean;
  showFilters?: boolean;
  showAdvancedFilters?: boolean;
  showColumnVisibility?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  pagination?: {
    pageSize?: number;
    pageSizeOptions?: number[];
  } | boolean;
  filters?: Array<{
    key: string;
    label: string;
    type: 'select' | 'date' | 'text';
    options?: Array<{ value: string; label: string }>;
  }>;
  onExport?: () => void;
  onRefresh?: () => void;
  onRowClick?: (row: TData) => void;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  toolbarContent,
  recordLabel = "record",
  recordLabelPlural,
  searchKey,
  showSearch = true,
  showFilters = true,
  showAdvancedFilters,
  showColumnVisibility = true,
  showExport = false,
  showRefresh = false,
  pagination = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  filters = [],
  onExport,
  onRefresh,
  onRowClick,
  className,
  emptyMessage = "No data available",
  loadingMessage = "Loading...",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: typeof pagination === "object" ? pagination.pageSize ?? 10 : 10,
      },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const searchColumn = searchKey
    ? table
        .getAllLeafColumns()
        .find(
          (column) =>
            column.id === searchKey ||
            column.id === searchKey.replaceAll(".", "_")
        )
    : undefined;

  const recordCount = table.getFilteredRowModel().rows.length;
  const pluralRecordLabel = recordLabelPlural ?? `${recordLabel}s`;
  const displayedRecordLabel = recordCount === 1 ? recordLabel : pluralRecordLabel;
  const tableLabel = `${pluralRecordLabel.charAt(0).toUpperCase()}${pluralRecordLabel.slice(1)} table`;
  const shouldShowAdvancedFilters = showAdvancedFilters ?? showFilters;
  const advancedFilterColumns = table
    .getAllLeafColumns()
    .filter(
      (column) =>
        column.getCanFilter() &&
        column.id !== "actions" &&
        column.id !== searchColumn?.id &&
        column.getFacetedUniqueValues().size > 0
    );

  // Handle search
  const handleSearch = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
      return;
    }

    if (searchColumn) {
      searchColumn.setFilterValue(value);
      return;
    }

    setGlobalFilter(value);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section
        className={cn("overflow-hidden rounded-lg border bg-card", className)}
        aria-busy="true"
        aria-label={loadingMessage}
      >
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-10 w-full max-w-sm" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
        </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={cn("overflow-hidden rounded-lg border bg-card", className)}>
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
          <p className="font-semibold text-destructive">Error loading data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
          </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "min-w-0 max-w-full overflow-hidden rounded-lg border bg-card text-card-foreground",
        className
      )}
      aria-label={tableLabel}
    >
      <div className="flex flex-col gap-3 border-b bg-card p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            {showSearch && (
              <div className="relative w-full sm:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  value={
                    searchValue !== undefined
                      ? searchValue
                      : searchColumn
                      ? (searchColumn.getFilterValue() as string) ?? ""
                      : globalFilter
                  }
                  onChange={(event) => handleSearch(event.target.value)}
                  className="h-10 border-border bg-background pl-10 focus-visible:border-primary"
                />
              </div>
            )}

            {toolbarContent}

            {shouldShowAdvancedFilters && advancedFilterColumns.length > 0 ? (
              <DataTableAdvancedFilters
                table={table}
                columns={advancedFilterColumns}
                resultCount={recordCount}
                recordLabelPlural={pluralRecordLabel}
              />
            ) : null}

            {showFilters && !shouldShowAdvancedFilters && filters.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-10 justify-start">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {filters.map((filter) => (
                    <div key={filter.key} className="p-2">
                      <label className="text-sm font-semibold">{filter.label}</label>
                      {filter.type === 'select' && filter.options && (
                        <select
                          className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          onChange={(e) => {
                            table.getColumn(filter.key)?.setFilterValue(e.target.value);
                          }}
                        >
                          <option value="">All</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="mr-auto whitespace-nowrap text-sm text-muted-foreground lg:mr-2">
              {recordCount} {displayedRecordLabel}
            </span>
            {showRefresh && onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh data"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            )}

            {showExport && onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            )}

            {showColumnVisibility && (
              <DataTableColumnVisibility table={table} />
            )}
          </div>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <Table className="min-w-full whitespace-nowrap">
            <TableHeader className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-12 px-3 font-semibold first:pl-4 last:pr-4">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "hover:bg-primary/5",
                      onRowClick && "cursor-pointer focus-within:bg-primary/5"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-3 py-4 first:pl-4 last:pr-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {pagination && (
          <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <select
                  aria-label="Rows per page"
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                  }}
                  className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {(typeof pagination === 'object' ? pagination.pageSizeOptions : [10, 20, 50, 100])?.map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <p className="whitespace-nowrap text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{table.getState().pagination.pageIndex + 1}</span> of {Math.max(table.getPageCount(), 1)}
                </p>
                <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:inline-flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="hidden h-8 w-8 sm:inline-flex"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
                </div>
              </div>
          </div>
        )}
    </section>
  );
}

// Status Badge Component
export function StatusBadge({ 
  status, 
  variant = "default" 
}: { 
  status: string; 
  variant?: "default" | "secondary" | "destructive" | "outline" 
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'success':
      case 'completed':
        return 'border-brand-success/40 bg-brand-success/15 text-foreground dark:text-brand-success';
      case 'inactive':
      case 'pending':
        return 'border-brand-accent/40 bg-brand-accent/15 text-foreground dark:text-brand-accent';
      case 'error':
      case 'failed':
      case 'cancelled':
        return 'border-destructive/40 bg-destructive/10 text-destructive';
      case 'processing':
      case 'in progress':
        return 'border-primary/40 bg-primary/10 text-primary';
      default:
        return 'border-border bg-muted text-muted-foreground';
    }
  };

  return (
    <Badge 
      variant={variant}
      className={cn(
        "rounded-full px-2.5 py-1 font-normal capitalize",
        variant === "default" && getStatusColor(status)
      )}
    >
      {status}
    </Badge>
  );
}

// Export the table components for convenience
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow };
