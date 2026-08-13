"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DeleteRowsDialog } from "@/components/layout/delete-rows-dialog";
import { Pill } from "@/components/layout/pill";
import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { TestsTable } from "./tests-table";
import { TestFormDialog } from "./test-form-dialog";
import { deleteTests } from "./actions";

export function TestsExplorer({
  data,
  brands,
  shoeCounts,
}: {
  data: TestRecord[];
  brands: ShoeBrandRecord[];
  shoeCounts: Record<number, number>;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  return (
    <div className="animate-rise">
      <div className="mb-4 flex items-center justify-end gap-2">
        {selectedIds.size > 0 && (
          <DeleteRowsDialog
            count={selectedIds.size}
            entityLabel="test"
            onConfirm={() => deleteTests([...selectedIds])}
            onDeleted={() => setSelectedIds(new Set())}
          />
        )}
        <TestFormDialog
          brands={brands}
          trigger={
            <Pill type="button" tone="invert">
              <Plus />
              New test
            </Pill>
          }
        />
      </div>

      <p className="mb-3 text-sm text-text-faint">
        {data.length.toLocaleString("en-GB")} test{data.length === 1 ? "" : "s"}
      </p>

      <TestsTable
        data={data}
        brands={brands}
        shoeCounts={shoeCounts}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
      />
    </div>
  );
}
