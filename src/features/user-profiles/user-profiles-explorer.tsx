"use client";

import { useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { Input } from "@/components/ui/input";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";
import { UserProfilesTable, type UserProfilesTableHandle } from "./user-profiles-table";
import { deleteUserProfiles } from "./actions";

export function UserProfilesExplorer({
  data,
  initialIdNfc,
}: {
  data: UserProfileRecord[];
  initialIdNfc?: string;
}) {
  const [idNfc, setIdNfc] = useState(initialIdNfc ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const tableRef = useRef<UserProfilesTableHandle>(null);

  const debouncedIdNfc = useDebouncedValue(idNfc, 300);

  const filtered = useMemo(() => {
    return data.filter(
      (row) => !debouncedIdNfc || row.id_nfc.toLowerCase().includes(debouncedIdNfc.toLowerCase()),
    );
  }, [data, debouncedIdNfc]);

  return (
    <div className="animate-rise">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <Input
          placeholder="Search by NFC ID"
          value={idNfc}
          onChange={(e) => setIdNfc(e.target.value)}
          className="w-[200px]"
        />

        <div className="flex items-center gap-2">
          <ExportCsvButton
            filename="user-profiles.csv"
            data={() => ({
              headers: tableRef.current?.exportHeaders ?? [],
              rows: tableRef.current?.getExportRows() ?? [],
            })}
          />
          {selectedIds.size > 0 && (
            <DeleteRowsDialog
              count={selectedIds.size}
              entityLabel="profile"
              onConfirm={() => deleteUserProfiles([...selectedIds])}
              onDeleted={() => setSelectedIds(new Set())}
            />
          )}
        </div>
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {filtered.length.toLocaleString("en-GB")} profile{filtered.length === 1 ? "" : "s"}
      </p>

      <UserProfilesTable
        ref={tableRef}
        data={filtered}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
