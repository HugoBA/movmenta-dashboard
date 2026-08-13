"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { Pill } from "@/components/layout/pill";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { ShoeBrandsTable, type ShoeBrandsTableHandle } from "./shoe-brands-table";
import { ShoeBrandFormDialog } from "./shoe-brand-form-dialog";
import { deleteShoeBrands } from "./actions";

export function ShoeBrandsExplorer({ data }: { data: ShoeBrandRecord[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<ShoeBrandsTableHandle>(null);

  return (
    <div className="animate-rise">
      <div className="mb-4 flex items-center justify-end gap-2">
        <ExportCsvButton
          filename="shoe-brands.csv"
          data={() => ({
            headers: tableRef.current?.exportHeaders ?? [],
            rows: tableRef.current?.getExportRows() ?? [],
          })}
        />
        {selectedIds.size > 0 && (
          <DeleteRowsDialog
            count={selectedIds.size}
            entityLabel="brand"
            onConfirm={() => deleteShoeBrands([...selectedIds])}
            onDeleted={() => setSelectedIds(new Set())}
          />
        )}
        <ShoeBrandFormDialog
          trigger={
            <Pill type="button" tone="invert">
              <Plus />
              New brand
            </Pill>
          }
        />
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {data.length.toLocaleString("en-GB")} brand{data.length === 1 ? "" : "s"}
      </p>

      <ShoeBrandsTable
        ref={tableRef}
        data={data}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
