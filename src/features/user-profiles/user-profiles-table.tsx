"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TableLink } from "@/components/layout/table-link";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SetColumnFilter } from "@/components/layout/column-filters";
import { cn } from "@/lib/utils";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";
import { formatDateTime } from "@/lib/formatting/date";
import type { CsvRow } from "@/lib/csv";

function distinctValues(values: string[]): string[] {
  return [...new Set(values)].sort();
}

interface Column {
  key: string;
  label: string;
  width: string;
  align?: "right";
  render: (row: UserProfileRecord) => React.ReactNode;
  sortValue: (row: UserProfileRecord) => string | number;
  csv: (row: UserProfileRecord) => string | number;
  filter?: React.ReactNode;
}

type SortDirection = "asc" | "desc";

export interface UserProfilesTableHandle {
  getExportRows: () => CsvRow[];
  exportHeaders: string[];
}

export const UserProfilesTable = forwardRef<
  UserProfilesTableHandle,
  {
    data: UserProfileRecord[];
    selectedIds: Set<number>;
    onSelectedIdsChange: (ids: Set<number>) => void;
  }
>(function UserProfilesTable({ data, selectedIds, onSelectedIdsChange }, ref) {
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [genderIncluded, setGenderIncluded] = useState<Set<string> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    setScrollMargin(containerRef.current?.offsetTop ?? 0);
  }, []);

  const genderOptions = useMemo(() => distinctValues(data.map((row) => row.gender)), [data]);

  const filtered = useMemo(() => {
    return data.filter((row) => genderIncluded === null || genderIncluded.has(row.gender));
  }, [data, genderIncluded]);

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
      key: "firstName",
      label: "First name",
      width: "130px",
      render: (row) => row.firstName || "—",
      sortValue: (row) => row.firstName,
      csv: (row) => row.firstName || "—",
    },
    {
      key: "lastName",
      label: "Last name",
      width: "130px",
      render: (row) => row.lastName || "—",
      sortValue: (row) => row.lastName,
      csv: (row) => row.lastName || "—",
    },
    {
      key: "email",
      label: "Email",
      width: "200px",
      render: (row) => row.email || "—",
      sortValue: (row) => row.email,
      csv: (row) => row.email || "—",
    },
    {
      key: "age",
      label: "Age",
      width: "70px",
      align: "right",
      render: (row) => row.age || "—",
      sortValue: (row) => row.age,
      csv: (row) => row.age || "—",
    },
    {
      key: "gender",
      label: "Gender",
      width: "90px",
      render: (row) => row.gender || "—",
      sortValue: (row) => row.gender,
      csv: (row) => row.gender || "—",
      filter: <SetColumnFilter options={genderOptions} included={genderIncluded} onChange={setGenderIncluded} />,
    },
    {
      key: "shoeSize",
      label: "Shoe size",
      width: "90px",
      align: "right",
      render: (row) => row.shoeSize || "—",
      sortValue: (row) => row.shoeSize,
      csv: (row) => row.shoeSize || "—",
    },
    {
      key: "weight",
      label: "Weight",
      width: "90px",
      align: "right",
      render: (row) => (row.weight ? `${row.weight} kg` : "—"),
      sortValue: (row) => row.weight,
      csv: (row) => (row.weight ? `${row.weight} kg` : "—"),
    },
    {
      key: "height",
      label: "Height",
      width: "90px",
      align: "right",
      render: (row) => (row.height ? `${row.height} cm` : "—"),
      sortValue: (row) => row.height,
      csv: (row) => (row.height ? `${row.height} cm` : "—"),
    },
    {
      key: "phone",
      label: "Phone",
      width: "130px",
      render: (row) => row.phone || "—",
      sortValue: (row) => row.phone,
      csv: (row) => row.phone || "—",
    },
    {
      key: "result_count",
      label: "Scans",
      width: "80px",
      align: "right",
      render: (row) =>
        row.id_nfc ? (
          <TableLink href={`/admin/raw-data?idNfc=${encodeURIComponent(row.id_nfc)}`} tooltip="Go to raw results">
            {row.result_count ?? 0}
          </TableLink>
        ) : (
          (row.result_count ?? 0)
        ),
      sortValue: (row) => row.result_count ?? 0,
      csv: (row) => row.result_count ?? 0,
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
      <table className="w-full min-w-[1450px] border-collapse text-sm">
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
                    {col.render(row)}
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
