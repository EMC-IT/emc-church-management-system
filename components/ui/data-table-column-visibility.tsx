"use client";

import * as React from "react";
import type { Table, VisibilityState } from "@tanstack/react-table";
import { Columns3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type ColumnVisibilityProps<TData> = {
  table: Table<TData>;
};

const humanizeColumnId = (columnId: string): string => {
  return columnId
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
};

export const DataTableColumnVisibility = <TData,>({
  table,
}: ColumnVisibilityProps<TData>) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [draftVisibility, setDraftVisibility] = React.useState<VisibilityState>(
    {}
  );
  const hideableColumns = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide());

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftVisibility(
        Object.fromEntries(
          hideableColumns.map((column) => [column.id, column.getIsVisible()])
        )
      );
    }

    setIsOpen(open);
  };

  const handleReset = () => {
    setDraftVisibility(
      Object.fromEntries(hideableColumns.map((column) => [column.id, true]))
    );
  };

  const handleApply = () => {
    table.setColumnVisibility(draftVisibility);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10">
          <Columns3 className="mr-2 h-4 w-4" aria-hidden="true" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-72 p-0">
        <div className="px-4 pb-3 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Columns
          </p>
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto px-4 pb-4">
          {hideableColumns.map((column) => {
            const label =
              typeof column.columnDef.header === "string"
                ? column.columnDef.header
                : humanizeColumnId(column.id);
            const isChecked = draftVisibility[column.id] ?? true;

            return (
              <div key={column.id} className="flex items-center gap-3 py-2">
                <Checkbox
                  id={`column-visibility-${column.id}`}
                  checked={isChecked}
                  onCheckedChange={(checked) =>
                    setDraftVisibility((current) => ({
                      ...current,
                      [column.id]: checked === true,
                    }))
                  }
                  className="h-5 w-5 rounded-md shadow-sm"
                />
                <Label
                  htmlFor={`column-visibility-${column.id}`}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  {label}
                </Label>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
