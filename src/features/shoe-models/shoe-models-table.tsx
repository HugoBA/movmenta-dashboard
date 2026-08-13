"use client";

import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SetColumnFilter } from "@/components/layout/column-filters";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatting/date";
import type { ShoeModelRecord } from "@/lib/xano/shoe-models";
import type { CsvRow } from "@/lib/csv";

interface Column {
  key: string;
  label: string;
  align?: "right";
  render: (row: ShoeModelRecord) => React.ReactNode;
  sortValue: (row: ShoeModelRecord) => string | number;
  csv: (row: ShoeModelRecord) => string | number;
  filter?: React.ReactNode;
}

type SortDirection = "asc" | "desc";

function distinctValues(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export interface ShoeModelsTableHandle {
  getExportRows: () => CsvRow[];
  exportHeaders: string[];
}

export const ShoeModelsTable = forwardRef<
  ShoeModelsTableHandle,
  {
    data: ShoeModelRecord[];
    selectedIds: Set<number>;
    onSelectedIdsChange: (ids: Set<number>) => void;
  }
>(function ShoeModelsTable({ data, selectedIds, onSelectedIdsChange }, ref) {
  const [sortKey, setSortKey] = useState("model");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modelIncluded, setModelIncluded] = useState<Set<string> | null>(null);
  const [genderIncluded, setGenderIncluded] = useState<Set<string> | null>(null);

  const modelOptions = useMemo(() => distinctValues(data.map((row) => row.model)), [data]);
  const genderOptions = useMemo(() => distinctValues(data.map((row) => row.gender)), [data]);

  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        (modelIncluded === null || modelIncluded.has(row.model)) &&
        (genderIncluded === null || genderIncluded.has(row.gender)),
    );
  }, [data, modelIncluded, genderIncluded]);

  const columns: Column[] = [
    {
      key: "model",
      label: "Model",
      render: (row) => <span className="font-semibold">{row.model}</span>,
      sortValue: (row) => row.model,
      csv: (row) => row.model,
      filter: <SetColumnFilter options={modelOptions} included={modelIncluded} onChange={setModelIncluded} />,
    },
    {
      key: "gender",
      label: "Gender",
      render: (row) => row.gender || "—",
      sortValue: (row) => row.gender,
      csv: (row) => row.gender || "—",
      filter: <SetColumnFilter options={genderOptions} included={genderIncluded} onChange={setGenderIncluded} />,
    },
    {
      key: "max_delta",
      label: "Max delta",
      align: "right",
      render: (row) => row.max_delta,
      sortValue: (row) => row.max_delta,
      csv: (row) => row.max_delta,
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
    if (!column) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortValue(a);
      const bv = column.sortValue(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDirection]);

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
      <table className="w-full min-w-[600px] border-collapse text-sm">
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
                <div className={cn("flex items-center gap-1.5", col.align === "right" && "flex-row-reverse")}>
                  <button
                    type="button"
                    onClick={() => toggleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
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
                  {col.filter}
                </div>
              </th>
            ))}
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
