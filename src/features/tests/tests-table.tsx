"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, LineChart, Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SetColumnFilter } from "@/components/layout/column-filters";
import { TableLink } from "@/components/layout/table-link";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatting/date";
import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { TestFormDialog } from "./test-form-dialog";

interface Column {
  key: string;
  label: string;
  align?: "right";
  render: (row: TestRecord) => React.ReactNode;
  sortValue: (row: TestRecord) => string | number;
  filter?: React.ReactNode;
}

type SortDirection = "asc" | "desc";

function distinctValues(values: string[]): string[] {
  return [...new Set(values)].sort();
}

export function TestsTable({
  data,
  brands,
  shoeCounts,
  selectedIds,
  onSelectedIdsChange,
}: {
  data: TestRecord[];
  brands: ShoeBrandRecord[];
  shoeCounts: Record<number, number>;
  selectedIds: Set<number>;
  onSelectedIdsChange: (ids: Set<number>) => void;
}) {
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [brandIncluded, setBrandIncluded] = useState<Set<string> | null>(null);

  const brandNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const brand of brands) map.set(brand.id, brand.brand_name);
    return map;
  }, [brands]);

  const brandName = (row: TestRecord) => brandNameById.get(row.brand_id) ?? "—";
  const brandOptions = useMemo(
    () => distinctValues(data.map(brandName)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, brandNameById],
  );

  const filtered = useMemo(() => {
    return data.filter((row) => brandIncluded === null || brandIncluded.has(brandName(row)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, brandIncluded, brandNameById]);

  const columns: Column[] = [
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <TableLink href={`/admin/tests?testId=${row.id}`}>
          <span className="font-semibold">{row.name}</span>
        </TableLink>
      ),
      sortValue: (row) => row.name,
    },
    {
      key: "brand",
      label: "Brand",
      render: (row) => brandName(row),
      sortValue: (row) => brandName(row),
      filter: <SetColumnFilter options={brandOptions} included={brandIncluded} onChange={setBrandIncluded} />,
    },
    {
      key: "shoes",
      label: "Shoes",
      align: "right",
      render: (row) => shoeCounts[row.id] ?? 0,
      sortValue: (row) => shoeCounts[row.id] ?? 0,
    },
    {
      key: "created_at",
      label: "Created",
      align: "right",
      render: (row) => formatDate(row.created_at),
      sortValue: (row) => row.created_at,
    },
  ];

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
                  <div className="flex justify-end gap-1.5">
                    <Link
                      href={`/admin/test-results?testId=${row.id}`}
                      title="View results"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-foreground [&_svg]:size-4"
                    >
                      <LineChart />
                    </Link>
                    <TestFormDialog
                      test={row}
                      brands={brands}
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
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
