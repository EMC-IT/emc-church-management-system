"use client";

import * as React from "react";
import type { Column, Table } from "@tanstack/react-table";
import { Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdvancedFiltersProps<TData> = {
  table: Table<TData>;
  columns: Column<TData, unknown>[];
  resultCount: number;
  recordLabelPlural: string;
};

const humanizeColumnId = (columnId: string): string => {
  return columnId
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
};

const getFilterOptions = <TData,>(column: Column<TData, unknown>): string[] => {
  const values = Array.from(column.getFacetedUniqueValues().keys());
  const arePrimitiveValues = values.every(
    (value) => ["string", "number", "boolean"].includes(typeof value)
  );

  if (!arePrimitiveValues || values.length < 2 || values.length > 12) return [];

  return values
    .map(String)
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));
};

const AdvancedFilterField = <TData,>({
  column,
}: {
  column: Column<TData, unknown>;
}) => {
  const label =
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : humanizeColumnId(column.id);
  const options = getFilterOptions(column);
  const filterValue = String(column.getFilterValue() ?? "");

  return (
    <div className="space-y-2">
      <Label htmlFor={`advanced-filter-${column.id}`} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {options.length > 0 ? (
        <select
          id={`advanced-filter-${column.id}`}
          value={filterValue}
          onChange={(event) => column.setFilterValue(event.target.value || undefined)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Any</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={`advanced-filter-${column.id}`}
          value={filterValue}
          onChange={(event) => column.setFilterValue(event.target.value || undefined)}
          placeholder={`Filter by ${label.toLowerCase()}...`}
        />
      )}
    </div>
  );
};

export const DataTableAdvancedFilters = <TData,>({
  table,
  columns,
  resultCount,
  recordLabelPlural,
}: AdvancedFiltersProps<TData>) => {
  const activeFilterCount = table.getState().columnFilters.length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-10">
          <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
          Advanced filters
          {activeFilterCount > 0 ? (
            <Badge className="ml-2 min-w-5 justify-center rounded-full bg-primary px-1.5 text-primary-foreground">
              {activeFilterCount}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-6 pr-12">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
            Advanced filters
          </SheetTitle>
          <SheetDescription>
            Combine attributes to narrow this table.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {columns.map((column) => (
            <AdvancedFilterField key={column.id} column={column} />
          ))}
        </div>

        <SheetFooter className="border-t bg-muted/20 p-4 sm:justify-between sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            disabled={activeFilterCount === 0}
          >
            Clear all
          </Button>
          <SheetClose asChild>
            <Button type="button">
              Show {resultCount} {recordLabelPlural}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
