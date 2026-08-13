"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatting/date";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import type { CsvRow } from "@/lib/csv";
import { SensorRefFormDialog } from "./sensor-ref-form-dialog";

interface Column {
  key: string;
  label: string;
  align?: "right";
  render: (row: SensorRefRecord) => React.ReactNode;
  sortValue: (row: SensorRefRecord) => string | number;
  csv: (row: SensorRefRecord) => string | number;
}

type SortDirection = "asc" | "desc";

export interface SensorRefsTableHandle {
  getExportRows: () => CsvRow[];
  exportHeaders: string[];
}

export const SensorRefsTable = forwardRef<
  SensorRefsTableHandle,
  {
    data: SensorRefRecord[];
    selectedIds: Set<number>;
    onSelectedIdsChange: (ids: Set<number>) => void;
  }
>(function SensorRefsTable({ data, selectedIds, onSelectedIdsChange }, ref) {
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => <span className="font-semibold">{row.name}</span>,
      sortValue: (row) => row.name,
      csv: (row) => row.name,
    },
    {
      key: "created_at",
      label: "Created",
      align: "right",
      render: (row) => formatDate(row.created_at),
      sortValue: (row) => row.created_at,
      csv: (row) => formatDate(row.created_at),
    },
  ];

  useImperativeHandle(ref, () => ({
    exportHeaders: columns.map((col) => col.label),
    getExportRows: () =>
      sorted.map((row) => Object.fromEntries(columns.map((col) => [col.label, col.csv(row)]))),
  }));

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sortKey);
    if (!column) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = column.sortValue(a);
      const bv = column.sortValue(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sortKey, sortDirection]);

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const toggleRow = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedIdsChange(next);
  };

  const allSelected = sorted.length > 0 && sorted.every((row) => selectedIds.has(row.id));
  const someSelected = sorted.some((row) => selectedIds.has(row.id));

  const toggleAll = (checked: boolean) => {
    onSelectedIdsChange(checked ? new Set(sorted.map((row) => row.id)) : new Set());
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-soft bg-card">
      <table className="w-full min-w-[400px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <th style={{ width: "36px" }} className="border-b border-border-soft px-3 py-3">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={(checked) => toggleAll(checked === true)}
                aria-label="Select all rows"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "border-b border-border-soft px-3 py-3 text-xs font-medium tracking-wide text-text-faint uppercase",
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "inline-flex items-center gap-1 hover:text-foreground",
                    col.align === "right" && "flex-row-reverse",
                  )}
                >
                  {col.label}
                  {sortKey === col.key ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="size-3" />
                    ) : (
                      <ArrowDown className="size-3" />
                    )
                  ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                  )}
                </button>
              </th>
            ))}
            <th className="border-b border-border-soft px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const isSelected = selectedIds.has(row.id);
            return (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border-soft last:border-none hover:bg-white/[0.03]",
                  isSelected && "bg-primary/[0.06]",
                )}
              >
                <td className="px-3 py-2.5">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => toggleRow(row.id, checked === true)}
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 whitespace-nowrap",
                      col.align === "right" ? "text-right tabular-nums" : "text-left",
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right">
                  <SensorRefFormDialog
                    sensorRef={row}
                    trigger={
                      <button
                        type="button"
                        title="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-foreground [&_svg]:size-4"
                      >
                        <Pencil />
                      </button>
                    }
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
