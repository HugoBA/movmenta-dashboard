"use client";

import { useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { ResultsFilters } from "./results-filters";
import { ResultsTable, type ResultsTableHandle } from "./results-table";
import { deleteResults } from "./actions";
import { useResultsQuery } from "./use-results-query";
import { resolveDateRange, type DateRangeValue } from "./date-range";

function endOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function RawDataExplorer({ initialIdNfc }: { initialIdNfc?: string }) {
  const [range, setRange] = useState<DateRangeValue>("30d");
  const [platform, setPlatform] = useState("");
  const [idNfc, setIdNfc] = useState(initialIdNfc ?? "");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<ResultsTableHandle>(null);

  const debouncedIdNfc = useDebouncedValue(idNfc, 500);
  // resolveDateRange reads Date.now() — memoize on its real inputs so it
  // doesn't produce a new {from,to} (and thus a new query key) every render.
  const { from, to } = useMemo(() => {
    if (range === "custom") {
      return {
        from: customFrom?.getTime(),
        to: customTo ? endOfDay(customTo).getTime() : undefined,
      };
    }
    return resolveDateRange(range);
  }, [range, customFrom, customTo]);

  const customRangeIncomplete = range === "custom" && (!customFrom || !customTo);

  const { data, isLoading, isError, error, isFetching, refetch } = useResultsQuery(
    { from, to, platform, idNfc: debouncedIdNfc },
    !customRangeIncomplete,
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <ResultsFilters
          range={range}
          onRangeChange={setRange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomRangeChange={({ from, to }) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
          platform={platform}
          onPlatformChange={setPlatform}
          idNfc={idNfc}
          onIdNfcChange={setIdNfc}
        />

        <div className="flex items-center gap-2">
          <ExportCsvButton
            filename="raw-results.csv"
            data={() => ({
              headers: tableRef.current?.exportHeaders ?? [],
              rows: tableRef.current?.getExportRows() ?? [],
            })}
          />
          {selectedIds.size > 0 && (
            <DeleteRowsDialog
              count={selectedIds.size}
              entityLabel="result"
              onConfirm={() => deleteResults([...selectedIds])}
              onDeleted={() => {
                setSelectedIds(new Set());
                refetch();
              }}
            />
          )}
        </div>
      </div>

      {!customRangeIncomplete && (
        <p className="mb-3 text-sm text-text-faint">
          {isLoading
            ? "Loading…"
            : `${data?.length.toLocaleString("en-GB") ?? 0} result${data?.length === 1 ? "" : "s"}${isFetching ? " · refreshing…" : ""}`}
        </p>
      )}

      {customRangeIncomplete && (
        <p className="mb-3 text-sm text-text-faint">Pick a start and end date to load results.</p>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load results from Xano: {error instanceof Error ? error.message : "Unexpected error."}
        </p>
      )}

      {!isError && !customRangeIncomplete && (
        <ResultsTable
          ref={tableRef}
          data={data ?? []}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      )}
    </div>
  );
}
