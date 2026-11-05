"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatTile } from "@/components/charts/stat-tile";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { cn } from "@/lib/utils";
import { latestBySensor, type SensorLatest } from "@/lib/line-logs/latest";
import type { Line } from "@/lib/xano/line-logs";
import { useLineLogs } from "./use-line-logs";
import { useFrozenRows } from "./use-frozen-rows";
import { dayBounds, formatDay, formatTimestamp, formatWhen, isoDay, startOfDay } from "./format";
import { DayFilter, LiveIndicator, NewEntriesBanner, ResultBadge, ScansCount, ShowMore } from "./controls";

type StatusFilter = "all" | "success" | "error";

const PAGE_SIZE = 300;

type Row = SensorLatest & { activityAt: number };

// One stage of the line (BOL or EOL). Each sensor appears once, with its
// latest scan; earlier scans of the same sensor only show up as a count.
export function LineLogsView({
  line,
  tracePath = "/prod/line",
}: {
  line: Line;
  // Line overview page of the current space (/prod or /admin), for sensor links.
  tracePath?: string;
}) {
  const showEpc = line === "eol";
  const valueLabel = line === "eol" ? "Factory value" : "Raw value";

  const [day, setDay] = useState<Date | undefined>(() => startOfDay(new Date()));
  const [sensorQuery, setSensorQuery] = useState("");
  const [epcQuery, setEpcQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { from, to } = dayBounds(day);
  const { rows, status, error, lastUpdated, initialMaxId } = useLineLogs(line, from, to);

  const sensors = useMemo<Row[]>(
    () =>
      [...latestBySensor(rows).values()]
        .map((s) => ({ ...s, activityAt: s.latest.createdAt }))
        .sort((a, b) => b.latest.id - a.latest.id),
    [rows],
  );

  // Filters apply to each sensor's latest scan.
  const filtered = useMemo(() => {
    const sensor = sensorQuery.trim().toLowerCase();
    const epc = epcQuery.trim().toLowerCase();
    return sensors.filter(
      ({ latest }) =>
        (!sensor || latest.sensorId.toLowerCase().includes(sensor)) &&
        (!epc || (latest.epc ?? "").toLowerCase().includes(epc)) &&
        (statusFilter === "all" || (statusFilter === "success" ? latest.ok : !latest.ok)),
    );
  }, [sensors, sensorQuery, epcQuery, statusFilter]);

  const counts = useMemo(() => {
    const successes = filtered.filter((s) => s.latest.ok).length;
    return {
      scans: filtered.reduce((n, s) => n + s.scans, 0),
      shoes: filtered.length,
      successes,
      errors: filtered.length - successes,
      rate: filtered.length ? (successes / filtered.length) * 100 : null,
    };
  }, [filtered]);

  const { tableTopRef, shown, pendingCount, release } = useFrozenRows(filtered);

  const exportData = () => ({
    headers: ["Entry", "Date", "Sensor ID", ...(showEpc ? ["EPC"] : []), valueLabel, "Status", "Error cause", "Scans"],
    rows: filtered.map(({ latest: r, scans }) => ({
      Entry: r.id,
      Date: formatTimestamp(r.createdAt),
      "Sensor ID": r.sensorId,
      ...(showEpc ? { EPC: r.epc ?? "" } : {}),
      [valueLabel]: r.value ?? "",
      Status: r.ok ? "Success" : "Error",
      "Error cause": r.cause ?? "",
      Scans: scans,
    })),
  });

  const filtersActive = sensorQuery !== "" || epcQuery !== "" || statusFilter !== "all";

  return (
    <div className="animate-rise flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <DayFilter
            day={day}
            onChange={(d) => {
              setDay(d);
              setLimit(PAGE_SIZE);
            }}
          />
          <Input
            aria-label="Sensor ID"
            placeholder="Sensor ID"
            value={sensorQuery}
            onChange={(e) => setSensorQuery(e.target.value)}
            className="w-[190px] font-mono"
          />
          {showEpc && (
            <Input
              aria-label="EPC number"
              placeholder="EPC number"
              value={epcQuery}
              onChange={(e) => setEpcQuery(e.target.value)}
              className="w-[190px] font-mono"
            />
          )}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[140px]" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSensorQuery("");
                setEpcQuery("");
                setStatusFilter("all");
              }}
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>
        <ExportCsvButton filename={`${line}-entries${day ? `-${isoDay(day)}` : ""}.csv`} data={exportData} />
      </div>

      <LiveIndicator status={status} lastUpdated={lastUpdated} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Scans"
          value={counts.scans.toLocaleString("en-GB")}
          delta={{ tone: "neutral", value: day ? formatDay(day) : "all days" }}
          index={0}
        />
        <StatTile
          label="Unique shoes"
          value={counts.shoes.toLocaleString("en-GB")}
          delta={{ tone: "neutral", value: "by sensor ID, latest scan" }}
          index={1}
        />
        <StatTile
          label="Success / errors"
          value={`${counts.successes.toLocaleString("en-GB")} / ${counts.errors.toLocaleString("en-GB")}`}
          delta={
            counts.errors > 0
              ? { tone: "down", value: `${counts.errors} shoes in error` }
              : { tone: "up", value: "no errors" }
          }
          index={2}
        />
        <StatTile
          label="Success rate"
          value={counts.rate === null ? "—" : counts.rate.toFixed(1)}
          unit={counts.rate === null ? undefined : "%"}
          delta={
            counts.rate === null
              ? { tone: "neutral", value: "no entries" }
              : { tone: counts.rate >= 95 ? "up" : counts.rate >= 80 ? "warn" : "down", value: "of shoes" }
          }
          index={3}
        />
      </div>

      {error && status === "error" && rows.length === 0 && (
        <p className="text-sm text-destructive">Couldn&apos;t load entries: {error}</p>
      )}

      <div ref={tableTopRef} className="relative rounded-2xl border border-border-soft bg-card px-5 py-4">
        <NewEntriesBanner count={pendingCount} onClick={release} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                {["#", "Time", "Sensor ID", ...(showEpc ? ["EPC"] : []), valueLabel, "Result"].map((head) => (
                  <th
                    key={head}
                    className="border-b border-border-soft pb-3 pr-3 text-left text-xs font-medium tracking-wide text-text-faint uppercase"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, limit).map(({ latest: r, scans }) => (
                <tr
                  // Keyed on the scan, so a re-scanned sensor re-mounts (and animates) at the top.
                  key={`${r.sensorId}-${r.id}`}
                  className={cn(
                    "[&>td]:border-b [&>td]:border-border-soft hover:bg-foreground/[0.03]",
                    initialMaxId !== null && r.id > initialMaxId && "animate-in fade-in-0 slide-in-from-top-1 duration-500",
                  )}
                >
                  <td className="py-2.5 pr-3 font-mono text-xs text-text-faint tabular-nums">{r.id}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums">{formatWhen(r.createdAt, day)}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs whitespace-nowrap">
                    <Link
                      href={`${tracePath}?sensor=${encodeURIComponent(r.sensorId)}`}
                      className="underline-offset-2 hover:text-primary hover:underline"
                      title="Trace this shoe across BOL and EOL"
                    >
                      {r.sensorId}
                    </Link>
                    <ScansCount scans={scans} />
                  </td>
                  {showEpc && <td className="py-2.5 pr-3 font-mono text-xs">{r.epc ?? "—"}</td>}
                  <td className="py-2.5 pr-3 tabular-nums">{r.value ?? "—"}</td>
                  <td className="py-2 pr-0">
                    <ResultBadge log={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status !== "loading" && shown.length === 0 && (
          <p className="py-10 text-center text-sm text-text-faint">
            {rows.length === 0
              ? `No ${line.toUpperCase()} entries ${day ? `on ${formatDay(day)}` : "yet"}.`
              : "No entries match these filters."}
          </p>
        )}
        {status === "loading" && <p className="py-10 text-center text-sm text-text-faint">Loading entries…</p>}
        <ShowMore remaining={shown.length - limit} pageSize={PAGE_SIZE} onClick={() => setLimit((l) => l + PAGE_SIZE)} />
      </div>
    </div>
  );
}
