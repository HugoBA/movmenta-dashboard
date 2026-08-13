import { Panel } from "@/components/layout/panel";
import { Pill } from "@/components/layout/pill";
import {
  DataTable,
  DataTableCell,
  DataTableHeadRow,
  DataTableRow,
} from "@/components/layout/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { recentProducts } from "./mock-data";

const barColor = { ok: "#4fd18f", watch: "#ffb84f", critical: "#ff6a3d" } as const;
const statusLabel = { ok: "Nominal", watch: "Watch", critical: "Critical" } as const;

export function ProductsTable() {
  return (
    <Panel
      title="Recently analysed products"
      subtitle="Latest scan results"
      delay={0.65}
      right={<Pill type="button">View all</Pill>}
    >
      <DataTable>
        <DataTableHeadRow headers={["Product", "Model", "Distance", "Wear", "Status"]} />
        <tbody>
          {recentProducts.map((product) => (
            <DataTableRow key={product.id}>
              <DataTableCell>
                <div className="font-semibold">{product.id}</div>
                <div className="text-xs text-text-faint">
                  {product.model} · {product.line}
                </div>
              </DataTableCell>
              <DataTableCell>{product.model}</DataTableCell>
              <DataTableCell>{product.distanceKm.toLocaleString("fr-FR")} km</DataTableCell>
              <DataTableCell>
                <div className="h-1.5 w-[70px] overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${product.wearPct}%`,
                      backgroundColor: barColor[product.status],
                    }}
                  />
                </div>
              </DataTableCell>
              <DataTableCell className="pr-0">
                <StatusBadge tone={product.status}>{statusLabel[product.status]}</StatusBadge>
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>
    </Panel>
  );
}
