"use client";

import { useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import type { ShoeRecord } from "@/lib/xano/shoes";
import { ShoesFilters } from "./shoes-filters";
import { ShoesTable, type ShoesTableHandle } from "./shoes-table";
import { deleteShoes } from "./actions";

export function ShoesExplorer({
  data,
  initialIdNfc,
}: {
  data: ShoeRecord[];
  initialIdNfc?: string;
}) {
  const [gender, setGender] = useState("");
  const [idNfc, setIdNfc] = useState(initialIdNfc ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<ShoesTableHandle>(null);

  const debouncedIdNfc = useDebouncedValue(idNfc, 300);

  const filtered = useMemo(() => {
    return data.filter(
      (shoe) =>
        (!gender || shoe.gender === gender) &&
        (!debouncedIdNfc || shoe.id_nfc.toLowerCase().includes(debouncedIdNfc.toLowerCase())),
    );
  }, [data, gender, debouncedIdNfc]);

  return (
    <div className="animate-rise">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <ShoesFilters
          gender={gender}
          onGenderChange={setGender}
          idNfc={idNfc}
          onIdNfcChange={setIdNfc}
        />

        <div className="flex items-center gap-2">
          <ExportCsvButton
            filename="shoes.csv"
            data={() => ({
              headers: tableRef.current?.exportHeaders ?? [],
              rows: tableRef.current?.getExportRows() ?? [],
            })}
          />
          {selectedIds.size > 0 && (
            <DeleteRowsDialog
              count={selectedIds.size}
              entityLabel="shoe"
              onConfirm={() => deleteShoes([...selectedIds])}
              onDeleted={() => setSelectedIds(new Set())}
            />
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {filtered.length.toLocaleString("en-GB")} shoe{filtered.length === 1 ? "" : "s"}
      </p>

      <ShoesTable
        ref={tableRef}
        data={filtered}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
