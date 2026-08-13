"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TableLink } from "@/components/layout/table-link";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SetColumnFilter } from "@/components/layout/column-filters";
import { cn } from "@/lib/utils";
import type { ShoeRecord } from "@/lib/xano/shoes";
import { formatDateTime } from "@/lib/formatting/date";
import type { CsvRow } from "@/lib/csv";

function shoeUserLabel(row: ShoeRecord): string {
  const name = [row.firstname, row.lastname].filter(Boolean).join(" ").trim();
  return name || "—";
}

function distinctValues(values: string[]): string[] {
  return [...new Set(values)].sort();
}

interface Column {
  key: string;
  label: string;
  width: string;
  align?: "right";
  render: (row: ShoeRecord) => React.ReactNode;
  sortValue: (row: ShoeRecord) => string | number;
  csv: (row: ShoeRecord) => string | number;
  filter?: React.ReactNode;
}

type SortDirection = "asc" | "desc";

export interface ShoesTableHandle {
  getExportRows: () => CsvRow[];
  exportHeaders: string[];
}

export const ShoesTable = forwardRef<
  ShoesTableHandle,
  {
    data: ShoeRecord[];
    selectedIds: Set<number>;
    onSelectedIdsChange: (ids: Set<number>) => void;
  }
>(function ShoesTable({ data, selectedIds, onSelectedIdsChange }, ref) {
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [brandIncluded, setBrandIncluded] = useState<Set<string> | null>(null);
  const [modelIncluded, setModelIncluded] = useState<Set<string> | null>(null);
  const [sizeIncluded, setSizeIncluded] = useState<Set<string> | null>(null);
  const [userIncluded, setUserIncluded] = useState<Set<string> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(containerRef.current?.offsetTop ?? 0);
  }, []);

  const brandOptions = useMemo(
    () => distinctValues(data.map((row) => row.brand)),
    [data],
  );
  const modelOptions = useMemo(
    () => distinctValues(data.map((row) => row.model)),
    [data],
  );
  const sizeOptions = useMemo(
    () => distinctValues(data.map((row) => row.size)),
    [data],
  );
  const userOptions = useMemo(
    () => distinctValues(data.map(shoeUserLabel)),
    [data],
  );

  // None of these have a Xano filter param, so they're filtered client-side.
  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        (brandIncluded === null || brandIncluded.has(row.brand)) &&
        (modelIncluded === null || modelIncluded.has(row.model)) &&
        (sizeIncluded === null || sizeIncluded.has(row.size)) &&
        (userIncluded === null || userIncluded.has(shoeUserLabel(row))),
    );
  }, [data, brandIncluded, modelIncluded, sizeIncluded, userIncluded]);

  const columns: Column[] = [
    {
      key: "created_at",
      label: "Date",
      width: "125px",
      render: (row) => formatDateTime(row.created_at),
      sortValue: (row) => row.created_at,
      csv: (row) => formatDateTime(row.created_at),
    },
    {
      key: "id_nfc",
      label: "NFC id",
      width: "160px",
      render: (row) =>
        row.id_nfc ? (
          <TableLink href={`/admin/user?nfcId=${encodeURIComponent(row.id_nfc)}`} newTab>
            {row.id_nfc}
          </TableLink>
        ) : (
          "—"
        ),
      sortValue: (row) => row.id_nfc,
      csv: (row) => row.id_nfc || "—",
    },
    {
      key: "brand",
      label: "Brand",
      width: "120px",
      render: (row) => row.brand || "—",
      sortValue: (row) => row.brand,
      csv: (row) => row.brand || "—",
      filter: (
        <SetColumnFilter
          options={brandOptions}
          included={brandIncluded}
          onChange={setBrandIncluded}
        />
      ),
    },
    {
      key: "model",
      label: "Model",
      width: "130px",
      render: (row) => row.model || "—",
      sortValue: (row) => row.model,
      csv: (row) => row.model || "—",
      filter: (
        <SetColumnFilter
          options={modelOptions}
          included={modelIncluded}
          onChange={setModelIncluded}
        />
      ),
    },
    {
      key: "variant",
      label: "Variant",
      width: "110px",
      render: (row) => row.variant || "—",
      sortValue: (row) => row.variant,
      csv: (row) => row.variant || "—",
    },
    {
      key: "gender",
      label: "Gender",
      width: "90px",
      render: (row) => row.gender || "—",
      sortValue: (row) => row.gender,
      csv: (row) => row.gender || "—",
    },
    {
      key: "size",
      label: "Size",
      width: "80px",
      align: "right",
      render: (row) => row.size || "—",
      sortValue: (row) => row.size,
      csv: (row) => row.size || "—",
      filter: (
        <SetColumnFilter
          options={sizeOptions}
          included={sizeIncluded}
          onChange={setSizeIncluded}
        />
      ),
    },
    {
      key: "factory_value",
      label: "Factory value",
      width: "110px",
      align: "right",
      render: (row) => row.factory_value,
      sortValue: (row) => row.factory_value,
      csv: (row) => row.factory_value,
    },
    {
      key: "user",
      label: "User",
      width: "170px",
      render: (row) =>
        row.id_nfc ? (
          <TableLink
            href={`/admin/user-profiles?idNfc=${encodeURIComponent(row.id_nfc)}`}
            tooltip="Go to user profile"
          >
            {shoeUserLabel(row)}
          </TableLink>
        ) : (
          shoeUserLabel(row)
        ),
      sortValue: (row) => shoeUserLabel(row),
      csv: (row) => shoeUserLabel(row),
      filter: (
        <SetColumnFilter
          options={userOptions}
          included={userIncluded}
          onChange={setUserIncluded}
        />
      ),
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
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDirection]);

  const rowVirtualizer = useWindowVirtualizer({
    count: sorted.length,
    estimateSize: () => 40,
    overscan: 12,
    scrollMargin,
  });

  const toggleSort = (key: string) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const toggleRow = (id: number, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedIdsChange(next);
  };

  const allSelected =
    sorted.length > 0 && sorted.every((row) => selectedIds.has(row.id));
  const someSelected = sorted.some((row) => selectedIds.has(row.id));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(
        new Set([...selectedIds, ...sorted.map((row) => row.id)]),
      );
    } else {
      const sortedIds = new Set(sorted.map((row) => row.id));
      onSelectedIdsChange(
        new Set([...selectedIds].filter((id) => !sortedIds.has(id))),
      );
    }
  };

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const paddingTop =
    virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1].end - scrollMargin)
      : 0;

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-2xl border border-border-soft bg-card"
    >
      <table className="w-full min-w-[1200px] border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            <th
              style={{ width: "36px" }}
              className="border-b border-border-soft px-3 py-3"
            >
              <Checkbox
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={(checked) => toggleAll(checked === true)}
                aria-label="Select all rows"
              />
            </th>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={cn(
                  "border-b border-border-soft px-3 py-3 text-xs font-medium tracking-wide text-text-faint uppercase",
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-1.5",
                    col.align === "right" && "flex-row-reverse",
                  )}
                >
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
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop }} colSpan={columns.length + 1} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = sorted[virtualRow.index];
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
                    onCheckedChange={(checked) =>
                      toggleRow(row.id, checked === true)
                    }
                    aria-label={`Select row ${row.id}`}
                  />
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "px-3 py-2.5 whitespace-nowrap",
                      col.align === "right"
                        ? "text-right tabular-nums"
                        : "text-left",
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td
                style={{ height: paddingBottom }}
                colSpan={columns.length + 1}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
