"use client";

import { useRef, useState } from "react";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import type { ShoeModelRecord } from "@/lib/xano/shoe-models";
import { ShoeModelsTable, type ShoeModelsTableHandle } from "./shoe-models-table";
import { deleteShoeModels } from "./actions";

export function ShoeModelsExplorer({ data }: { data: ShoeModelRecord[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<ShoeModelsTableHandle>(null);

  return (
    <div className="animate-rise">
      <div className="mb-4 flex items-center justify-end gap-2">
        <ExportCsvButton
          filename="shoe-models.csv"
          data={() => ({
            headers: tableRef.current?.exportHeaders ?? [],
            rows: tableRef.current?.getExportRows() ?? [],
          })}
        />
        {selectedIds.size > 0 && (
          <DeleteRowsDialog
            count={selectedIds.size}
            entityLabel="model"
            onConfirm={() => deleteShoeModels([...selectedIds])}
            onDeleted={() => setSelectedIds(new Set())}
          />
        )}
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {data.length.toLocaleString("en-GB")} model{data.length === 1 ? "" : "s"}
      </p>

      <ShoeModelsTable
        ref={tableRef}
        data={data}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
