import { Panel } from "@/components/layout/panel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import { cn } from "@/lib/utils";
import type { ResultRecord } from "@/lib/xano/results";

function PeriodBadge({ period }: { period: string }) {
  const isPre = period?.toLowerCase() === "pre";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
        isPre ? "bg-[#3987e5]/15 text-[#7ab4f2]" : "bg-[#d95926]/15 text-[#f0935f]",
      )}
    >
      {period || "—"}
    </span>
  );
}

export function RawResultsPanel({ results, idNfc }: { results: ResultRecord[]; idNfc: string }) {
  const sorted = [...results].sort((a, b) => b.created_at - a.created_at);

  return (
    <Panel title="Raw results" subtitle={`Full history for sensor ${idNfc}`}>
      {sorted.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-text-faint">
          No results recorded for this sensor.
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Wear</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">mm</TableHead>
                <TableHead className="text-right">km</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-text-faint">{formatDateTime(row.created_at)}</TableCell>
                  <TableCell>
                    <PeriodBadge period={row.period} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.percent}%</TableCell>
                  <TableCell className="text-right tabular-nums">{row.value}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.mm.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{row.km.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatDurationMinutes(row.duration)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  );
}
