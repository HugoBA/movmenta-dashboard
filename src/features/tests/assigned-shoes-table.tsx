"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import {
  DataTable,
  DataTableCell,
  DataTableHeadRow,
  DataTableRow,
} from "@/components/layout/data-table";
import { TableLink } from "@/components/layout/table-link";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import { unassignShoeFromTest } from "./actions";
import { EditAssignedShoeDialog } from "./edit-assigned-shoe-dialog";

export interface AssignedShoeRow {
  testShoeId: number;
  shoe: ShoeRecord;
}

export function AssignedShoesTable({
  rows,
  sensorRefs,
  modelNames,
}: {
  rows: AssignedShoeRow[];
  sensorRefs: SensorRefRecord[];
  modelNames: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUnassign = (testShoeId: number) => {
    setError(null);
    startTransition(async () => {
      const result = await unassignShoeFromTest(testShoeId);
      if (result?.error) setError(result.error);
    });
  };

  if (rows.length === 0) {
    return <p className="text-sm text-text-faint">No shoe assigned to this test yet.</p>;
  }

  return (
    <div>
      {error && (
        <p className="mb-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <DataTable>
        <DataTableHeadRow headers={["NFC id / Serial", "Model", "Magnet", "Sensor", ""]} />
        <tbody>
          {rows.map(({ testShoeId, shoe }) => (
            <DataTableRow key={testShoeId}>
              <DataTableCell>
                {shoe.id_nfc ? (
                  <TableLink href={`/admin/user?nfcId=${encodeURIComponent(shoe.id_nfc)}`}>
                    <span className="font-semibold">{shoe.id_nfc}</span>
                  </TableLink>
                ) : (
                  <span className="font-semibold">{shoe.serial_number || "—"}</span>
                )}
              </DataTableCell>
              <DataTableCell>{shoe.model || "—"}</DataTableCell>
              <DataTableCell>{shoe.ref_magnet || "—"}</DataTableCell>
              <DataTableCell>{shoe.ref_sensor || "—"}</DataTableCell>
              <DataTableCell className="pr-0 text-right">
                <div className="flex justify-end gap-1.5">
                  <EditAssignedShoeDialog
                    shoe={shoe}
                    sensorRefs={sensorRefs}
                    modelNames={modelNames}
                    trigger={
                      <button
                        type="button"
                        title="Edit shoe"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-foreground [&_svg]:size-4"
                      >
                        <Pencil />
                      </button>
                    }
                  />
                  <button
                    type="button"
                    title="Remove from test"
                    disabled={isPending}
                    onClick={() => handleUnassign(testShoeId)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white/[0.015] text-muted-foreground hover:text-destructive disabled:opacity-50 [&_svg]:size-4"
                  >
                    <X />
                  </button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}
