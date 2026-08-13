import { Panel } from "@/components/layout/panel";
import { TableLink } from "@/components/layout/table-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import { cn } from "@/lib/utils";
import type { Tester } from "./compute";

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

export function TestRawResultsPanel({ testers }: { testers: Tester[] }) {
  const rows = testers
    .flatMap((tester) => tester.rawResults.map((result) => ({ tester, result })))
    .sort((a, b) => b.result.created_at - a.result.created_at);

  return (
    <Panel
      title="Raw results"
      subtitle={`${rows.length} scan${rows.length === 1 ? "" : "s"} across this test's runners`}
    >
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-faint">No scans recorded for this test yet.</p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tester</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Wear</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">mm</TableHead>
                <TableHead className="text-right">km</TableHead>
                <TableHead className="text-right">Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ tester, result }) => (
                <TableRow key={result.id}>
                  <TableCell className="text-text-faint">{formatDateTime(result.created_at)}</TableCell>
                  <TableCell>
                    <TableLink href={`/admin/user?nfcId=${encodeURIComponent(tester.idNfc)}`}>
                      {tester.label}
                    </TableLink>
                  </TableCell>
                  <TableCell>
                    <PeriodBadge period={result.period} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{result.percent}%</TableCell>
                  <TableCell className="text-right tabular-nums">{result.value}</TableCell>
                  <TableCell className="text-right tabular-nums">{result.mm.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{result.km.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDurationMinutes(result.duration)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Panel>
  );
}
