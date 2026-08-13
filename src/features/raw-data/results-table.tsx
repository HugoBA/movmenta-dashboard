"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TableLink } from "@/components/layout/table-link";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { ResultRecord } from "@/lib/xano/results";
import { formatDateTime } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import { SetColumnFilter } from "@/components/layout/column-filters";
import type { CsvRow } from "@/lib/csv";

function distinctValues(data: ResultRecord[], key: keyof ResultRecord): string[] {
  return [...new Set(data.map((row) => String(row[key] ?? "")))].sort();
}

interface Column {
  key: keyof ResultRecord;
  label: string;
  width: string;
  align?: "right";
  render?: (row: ResultRecord) => React.ReactNode;
  csv: (row: ResultRecord) => string | number;
  filter?: React.ReactNode;
}

type SortDirection = "asc" | "desc";

export interface ResultsTableHandle {
  getExportRows: () => CsvRow[];
  exportHeaders: string[];
}

export const ResultsTable = forwardRef<
  ResultsTableHandle,
  {
    data: ResultRecord[];
    selectedIds: Set<number>;
    onSelectedIdsChange: (ids: Set<number>) => void;
  }
>(function ResultsTable({ data, selectedIds, onSelectedIdsChange }, ref) {
  const [sortKey, setSortKey] = useState<keyof ResultRecord>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [periodIncluded, setPeriodIncluded] = useState<Set<string> | null>(null);
  const [phoneBrandIncluded, setPhoneBrandIncluded] = useState<Set<string> | null>(null);
  const [phoneModelIncluded, setPhoneModelIncluded] = useState<Set<string> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(containerRef.current?.offsetTop ?? 0);
  }, []);

  const periodOptions = useMemo(() => distinctValues(data, "period"), [data]);
  const phoneBrandOptions = useMemo(() => distinctValues(data, "phone_brand"), [data]);
  const phoneModelOptions = useMemo(() => distinctValues(data, "phone_model"), [data]);

  // Period / phone brand / phone model have no Xano filter param, so they're
  // filtered client-side against whatever the date range already loaded.
  const filtered = useMemo(() => {
    return data.filter(
      (row) =>
        (periodIncluded === null || periodIncluded.has(row.period)) &&
        (phoneBrandIncluded === null || phoneBrandIncluded.has(row.phone_brand)) &&
        (phoneModelIncluded === null || phoneModelIncluded.has(row.phone_model)),
    );
  }, [data, periodIncluded, phoneBrandIncluded, phoneModelIncluded]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av ?? "").localeCompare(String(bv ?? ""));
      return sortDirection === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDirection]);

  const columns: Column[] = [
    {
      key: "created_at",
      label: "Date",
      width: "125px",
      render: (row) => formatDateTime(row.created_at),
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
      csv: (row) => row.id_nfc || "—",
    },
    { key: "platform", label: "Platform", width: "110px", csv: (row) => row.platform || "—" },
    {
      key: "percent",
      label: "Wear",
      width: "80px",
      align: "right",
      render: (row) => `${row.percent}%`,
      csv: (row) => `${row.percent}%`,
    },
    { key: "value", label: "Value", width: "90px", align: "right", csv: (row) => row.value },
    {
      key: "mm",
      label: "mm",
      width: "80px",
      align: "right",
      render: (row) => row.mm.toFixed(1),
      csv: (row) => row.mm.toFixed(1),
    },
    {
      key: "km",
      label: "km",
      width: "80px",
      align: "right",
      render: (row) => row.km.toFixed(1),
      csv: (row) => row.km.toFixed(1),
    },
    {
      key: "duration",
      label: "Duration",
      width: "90px",
      align: "right",
      render: (row) => formatDurationMinutes(row.duration),
      csv: (row) => formatDurationMinutes(row.duration),
    },
    {
      key: "period",
      label: "Period",
      width: "100px",
      filter: (
        <SetColumnFilter options={periodOptions} included={periodIncluded} onChange={setPeriodIncluded} />
      ),
      csv: (row) => row.period || "—",
    },
    {
      key: "phone_brand",
      label: "Phone brand",
      width: "130px",
      filter: (
        <SetColumnFilter
          options={phoneBrandOptions}
          included={phoneBrandIncluded}
          onChange={setPhoneBrandIncluded}
        />
      ),
      csv: (row) => row.phone_brand || "—",
    },
    {
      key: "phone_model",
      label: "Phone model",
      width: "150px",
      filter: (
        <SetColumnFilter
          options={phoneModelOptions}
          included={phoneModelIncluded}
          onChange={setPhoneModelIncluded}
        />
      ),
      csv: (row) => row.phone_model || "—",
    },
  ];

  useImperativeHandle(ref, () => ({
    exportHeaders: columns.map((col) => col.label),
    getExportRows: () =>
      sorted.map((row) => Object.fromEntries(columns.map((col) => [col.label, col.csv(row)]))),
  }));

  const rowVirtualizer = useWindowVirtualizer({
    count: sorted.length,
    estimateSize: () => 40,
    overscan: 12,
    scrollMargin,
  });

  const toggleSort = (key: keyof ResultRecord) => {
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

  const allSelected = sorted.length > 0 && sorted.every((row) => selectedIds.has(row.id));
  const someSelected = sorted.some((row) => selectedIds.has(row.id));

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(new Set([...selectedIds, ...sorted.map((row) => row.id)]));
    } else {
      const sortedIds = new Set(sorted.map((row) => row.id));
      onSelectedIdsChange(new Set([...selectedIds].filter((id) => !sortedIds.has(id))));
    }
  };

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalHeight - (virtualRows[virtualRows.length - 1].end - scrollMargin) : 0;

  return (
    <div ref={containerRef} className="overflow-x-auto rounded-2xl border border-border-soft bg-card">
      <table className="w-full min-w-[1400px] border-collapse text-sm">
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
                    {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom }} colSpan={columns.length + 1} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});
