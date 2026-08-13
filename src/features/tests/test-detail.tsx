import { ArrowLeft, LineChart, Pencil } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/layout/panel";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatting/date";
import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import type { SensorRefRecord } from "@/lib/xano/sensor-refs";
import { TestFormDialog } from "./test-form-dialog";
import { AddShoesDialog } from "./add-shoes-dialog";
import { AssignedShoesTable, type AssignedShoeRow } from "./assigned-shoes-table";
import type { ShoeRecord } from "@/lib/xano/shoes";

export function TestDetail({
  test,
  brands,
  assignedShoes,
  availableShoes,
  sensorRefs,
  modelNames,
}: {
  test: TestRecord;
  brands: ShoeBrandRecord[];
  assignedShoes: AssignedShoeRow[];
  availableShoes: ShoeRecord[];
  sensorRefs: SensorRefRecord[];
  modelNames: string[];
}) {
  const brandName = brands.find((brand) => brand.id === test.brand_id)?.brand_name ?? "—";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/tests"
        className="inline-flex items-center gap-1.5 text-sm text-text-faint hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to tests
      </Link>

      <Panel
        title={test.name}
        subtitle={`${brandName} — created ${formatDate(test.created_at)}`}
        right={
          <div className="flex items-center gap-2">
            <Link href={`/admin/test-results?testId=${test.id}`}>
              <Button type="button" variant="outline">
                <LineChart />
                View results
              </Button>
            </Link>
            <TestFormDialog
              test={test}
              brands={brands}
              trigger={
                <Button type="button" variant="outline">
                  <Pencil />
                  Edit
                </Button>
              }
            />
          </div>
        }
      >
        <p className="text-sm text-text-faint">
          {assignedShoes.length} shoe{assignedShoes.length === 1 ? "" : "s"} assigned to this test.
        </p>
      </Panel>

      <Panel
        title="Assigned shoes"
        subtitle="Find and add shoes to this test by NFC id, name or email"
        right={
          <AddShoesDialog testId={test.id} availableShoes={availableShoes} sensorRefs={sensorRefs} />
        }
      >
        <AssignedShoesTable rows={assignedShoes} sensorRefs={sensorRefs} modelNames={modelNames} />
      </Panel>
    </div>
  );
}
