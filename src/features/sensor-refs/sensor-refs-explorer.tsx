"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { Pill } from "@/components/layout/pill";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import { SensorRefsTable, type SensorRefsTableHandle } from "./sensor-refs-table";
import { SensorRefFormDialog } from "./sensor-ref-form-dialog";
import { deleteSensorRefs } from "./actions";

export function SensorRefsExplorer({ data }: { data: SensorRefRecord[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<SensorRefsTableHandle>(null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <ExportCsvButton
          filename="sensor-refs.csv"
          data={() => ({
            headers: tableRef.current?.exportHeaders ?? [],
            rows: tableRef.current?.getExportRows() ?? [],
          })}
        />
        {selectedIds.size > 0 && (
          <DeleteRowsDialog
            count={selectedIds.size}
            entityLabel="sensor ref"
            onConfirm={() => deleteSensorRefs([...selectedIds])}
            onDeleted={() => setSelectedIds(new Set())}
          />
        )}
        <SensorRefFormDialog
          trigger={
            <Pill type="button" tone="invert">
              <Plus />
              New sensor ref
            </Pill>
          }
        />
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {data.length.toLocaleString("en-GB")} sensor ref{data.length === 1 ? "" : "s"}
      </p>

      <SensorRefsTable
        ref={tableRef}
        data={data}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
