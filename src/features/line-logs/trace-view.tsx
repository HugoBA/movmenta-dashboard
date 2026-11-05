"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatTile } from "@/components/charts/stat-tile";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { cn } from "@/lib/utils";
import { latestBySensor, type SensorLatest } from "@/lib/line-logs/latest";
import type { LineLog } from "@/lib/xano/line-logs";
import { useLineLogs, type LiveStatus } from "./use-line-logs";
import { useSensorLookup } from "./use-sensor-lookup";
import { useFrozenRows } from "./use-frozen-rows";
import {
  dayBounds,
  formatDay,
  formatTimestamp,
  formatWhen,
  isoDay,
  startOfDay,
} from "./format";
import {
  DayFilter,
  LiveIndicator,
  NewEntriesBanner,
  ResultText,
  ScansCount,
  ShowMore,
} from "./controls";

const PAGE_SIZE = 300;

// Column groups (shoe / BOL / EOL) are split by an empty gutter column; the
// row rules stop at the gutters, so each stage reads as its own block.
const GUTTER = "w-8 min-w-8 p-0 border-b-0!";

type Stage =
  "passed" | "eol_failed" | "bol_failed" | "awaiting_eol" | "missing_bol";

type StageFilter = "all" | "errors" | Stage;

const STAGE_LABEL: Record<Stage, string> = {
  passed: "Passed",
  eol_failed: "EOL failed",
  bol_failed: "BOL failed",
  awaiting_eol: "Awaiting EOL",
  missing_bol: "No BOL record",
};

const STAGE_TONE: Record<Stage, string> = {
  passed: "bg-brand-good/15 text-brand-good",
  eol_failed: "bg-destructive/15 text-destructive",
  bol_failed: "bg-destructive/15 text-destructive",
  awaiting_eol: "bg-foreground/[0.06] text-muted-foreground",
  missing_bol: "bg-brand-warn/15 text-brand-warn",
};

interface TraceRow {
  sensorId: string;
  bol: SensorLatest | undefined;
  eol: SensorLatest | undefined;
  bolChecked: boolean; // false while the any-date BOL lookup is pending
  stage: Stage;
  activityAt: number;
}

// Where a shoe stands, from each stage's latest scan. An EOL failure wins
// (it's what the line needs to act on), then a BOL failure with no EOL yet.
function stageOf(
  bol: SensorLatest | undefined,
  eol: SensorLatest | undefined,
): Stage {
  if (eol && !eol.latest.ok) return "eol_failed";
  if (eol) return bol ? "passed" : "missing_bol";
  if (bol && !bol.latest.ok) return "bol_failed";
  return "awaiting_eol";
}

function unionById(a: LineLog[], b: LineLog[]): LineLog[] {
  if (b.length === 0) return a;
  const seen = new Set(a.map((r) => r.id));
  return [...a, ...b.filter((r) => !seen.has(r.id))];
}

function combinedStatus(a: LiveStatus, b: LiveStatus): LiveStatus {
  for (const s of ["error", "loading", "paused"] as const)
    if (a === s || b === s) return s;
  return "live";
}

// BOL and EOL merged per shoe (sensor ID): a break at the end of the line can
// be traced back to the same sensor's beginning-of-line record, even when the
// two scans happened on different days.
export function TraceView({ initialSensor }: { initialSensor?: string }) {
  // Coming from a "trace this shoe" link: search every day for that sensor.
  const [day, setDay] = useState<Date | undefined>(() =>
    initialSensor ? undefined : startOfDay(new Date()),
  );
  const [sensorQuery, setSensorQuery] = useState(initialSensor ?? "");
  const [epcQuery, setEpcQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { from, to } = dayBounds(day);
  const bolDay = useLineLogs("bol", from, to);
  const eolDay = useLineLogs("eol", from, to);

  // For a single day, shoes active that day may have their other stage on
  // another day: look those sensors up across all dates.
  const bolDaySensors = useMemo(
    () => new Set(bolDay.rows.map((r) => r.sensorId)),
    [bolDay.rows],
  );
  const eolDaySensors = useMemo(
    () => new Set(eolDay.rows.map((r) => r.sensorId)),
    [eolDay.rows],
  );
  const needBol = useMemo(
    () => [...eolDaySensors].filter((id) => !bolDaySensors.has(id)),
    [eolDaySensors, bolDaySensors],
  );
  const needEol = useMemo(
    () => [...bolDaySensors].filter((id) => !eolDaySensors.has(id)),
    [eolDaySensors, bolDaySensors],
  );
  const bolLookup = useSensorLookup("bol", needBol, day !== undefined);
  const eolLookup = useSensorLookup("eol", needEol, day !== undefined);

  const rows = useMemo<TraceRow[]>(() => {
    const bolLatest = latestBySensor(
      day ? unionById(bolDay.rows, bolLookup.rows) : bolDay.rows,
    );
    const eolLatest = latestBySensor(
      day ? unionById(eolDay.rows, eolLookup.rows) : eolDay.rows,
    );
    const sensorIds = new Set([...bolDaySensors, ...eolDaySensors]);
    return [...sensorIds]
      .map((sensorId) => {
        const bol = bolLatest.get(sensorId);
        const eol = eolLatest.get(sensorId);
        return {
          sensorId,
          bol,
          eol,
          bolChecked:
            !day ||
            bolDaySensors.has(sensorId) ||
            bolLookup.checked.has(sensorId),
          stage: stageOf(bol, eol),
          activityAt: Math.max(
            bol?.latest.createdAt ?? 0,
            eol?.latest.createdAt ?? 0,
          ),
        };
      })
      .sort((a, b) => b.activityAt - a.activityAt);
  }, [
    day,
    bolDay.rows,
    eolDay.rows,
    bolLookup,
    eolLookup.rows,
    bolDaySensors,
    eolDaySensors,
  ]);

  const filtered = useMemo(() => {
    const sensor = sensorQuery.trim().toLowerCase();
    const epc = epcQuery.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!sensor || r.sensorId.toLowerCase().includes(sensor)) &&
        (!epc || (r.eol?.latest.epc ?? "").toLowerCase().includes(epc)) &&
        (stageFilter === "all" ||
          (stageFilter === "errors"
            ? r.stage === "eol_failed" || r.stage === "bol_failed"
            : r.stage === stageFilter)),
    );
  }, [rows, sensorQuery, epcQuery, stageFilter]);

  const counts = useMemo(() => {
    const by = (stage: Stage) =>
      filtered.filter((r) => r.stage === stage).length;
    const atEol = filtered.filter((r) => r.eol).length;
    const passed = filtered.filter((r) => r.eol?.latest.ok).length;
    return {
      shoes: filtered.length,
      passed,
      awaiting: by("awaiting_eol"),
      bolFailed: by("bol_failed"),
      eolFailed: by("eol_failed"),
      eolRate: atEol ? (passed / atEol) * 100 : null,
    };
  }, [filtered]);

  const { tableTopRef, shown, pendingCount, release } = useFrozenRows(filtered);

  const status = combinedStatus(bolDay.status, eolDay.status);
  const lastUpdated =
    bolDay.lastUpdated && eolDay.lastUpdated
      ? Math.min(bolDay.lastUpdated, eolDay.lastUpdated)
      : null;
  const error = bolDay.error ?? eolDay.error;

  const exportData = () => ({
    headers: [
      "Sensor ID",
      "Stage",
      "BOL entry",
      "BOL date",
      "BOL raw value",
      "BOL status",
      "BOL error cause",
      "BOL scans",
      "EOL entry",
      "EOL date",
      "EPC",
      "Factory value",
      "EOL status",
      "EOL error cause",
      "EOL scans",
    ],
    rows: filtered.map((r) => ({
      "Sensor ID": r.sensorId,
      Stage: STAGE_LABEL[r.stage],
      "BOL entry": r.bol?.latest.id ?? "",
      "BOL date": r.bol ? formatTimestamp(r.bol.latest.createdAt) : "",
      "BOL raw value": r.bol?.latest.value ?? "",
      "BOL status": r.bol ? (r.bol.latest.ok ? "Success" : "Error") : "",
      "BOL error cause": r.bol?.latest.cause ?? "",
      "BOL scans": r.bol?.scans ?? 0,
      "EOL entry": r.eol?.latest.id ?? "",
      "EOL date": r.eol ? formatTimestamp(r.eol.latest.createdAt) : "",
      EPC: r.eol?.latest.epc ?? "",
      "Factory value": r.eol?.latest.value ?? "",
      "EOL status": r.eol ? (r.eol.latest.ok ? "Success" : "Error") : "",
      "EOL error cause": r.eol?.latest.cause ?? "",
      "EOL scans": r.eol?.scans ?? 0,
    })),
  });

  const filtersActive =
    sensorQuery !== "" || epcQuery !== "" || stageFilter !== "all";
  const bolInitialMax = bolDay.initialMaxId;
  const eolInitialMax = eolDay.initialMaxId;

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
          <Input
            aria-label="EPC number"
            placeholder="EPC number"
            value={epcQuery}
            onChange={(e) => setEpcQuery(e.target.value)}
            className="w-[190px] font-mono"
          />
          <Select
            value={stageFilter}
            onValueChange={(v) => setStageFilter(v as StageFilter)}
          >
            <SelectTrigger className="w-[160px]" aria-label="Stage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shoes</SelectItem>
              <SelectItem value="errors">Any error</SelectItem>
              <SelectItem value="eol_failed">EOL failed</SelectItem>
              <SelectItem value="bol_failed">BOL failed</SelectItem>
              <SelectItem value="awaiting_eol">Awaiting EOL</SelectItem>
              <SelectItem value="missing_bol">No BOL record</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSensorQuery("");
                setEpcQuery("");
                setStageFilter("all");
              }}
            >
              <X className="size-3.5" />
              Clear filters
            </Button>
          )}
        </div>
        <ExportCsvButton
          filename={`line-trace${day ? `-${isoDay(day)}` : ""}.csv`}
          data={exportData}
        />
      </div>

      <LiveIndicator status={status} lastUpdated={lastUpdated} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Shoes"
          value={counts.shoes.toLocaleString("en-GB")}
          delta={{ tone: "neutral", value: `${counts.awaiting} awaiting EOL` }}
          index={0}
        />
        <StatTile
          label="Passed EOL"
          value={counts.passed.toLocaleString("en-GB")}
          delta={{ tone: "neutral", value: day ? formatDay(day) : "all days" }}
          index={1}
        />
        <StatTile
          label="Errors"
          value={(counts.bolFailed + counts.eolFailed).toLocaleString("en-GB")}
          delta={{
            tone: counts.bolFailed + counts.eolFailed > 0 ? "down" : "up",
            value: `BOL ${counts.bolFailed} · EOL ${counts.eolFailed}`,
          }}
          index={2}
        />
        <StatTile
          label="EOL success rate"
          value={counts.eolRate === null ? "—" : counts.eolRate.toFixed(1)}
          unit={counts.eolRate === null ? undefined : "%"}
          delta={
            counts.eolRate === null
              ? { tone: "neutral", value: "no EOL scans" }
              : {
                  tone:
                    counts.eolRate >= 95
                      ? "up"
                      : counts.eolRate >= 80
                        ? "warn"
                        : "down",
                  value: "of shoes at EOL",
                }
          }
          index={3}
        />
      </div>

      {error && status === "error" && rows.length === 0 && (
        <p className="text-sm text-destructive">
          Couldn&apos;t load entries: {error}
        </p>
      )}

      <div
        ref={tableTopRef}
        className="relative rounded-2xl border border-border-soft bg-card px-5 py-4"
      >
        <NewEntriesBanner count={pendingCount} onClick={release} />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="text-xs font-medium tracking-wide text-text-faint uppercase">
                <th colSpan={2} />
                <th aria-hidden className={GUTTER} />
                <th
                  className="border-b-2 border-foreground/25 pb-2 text-left text-foreground/80"
                  colSpan={3}
                >
                  Beginning of line
                </th>
                <th aria-hidden className={GUTTER} />
                <th
                  className="border-b-2 border-foreground/25 pb-2 text-left text-foreground/80"
                  colSpan={4}
                >
                  End of line
                </th>
              </tr>
              <tr>
                {[
                  "Sensor ID",
                  "Stage",
                  null,
                  "BOL date",
                  "Value",
                  "Result",
                  null,
                  "EOL date",
                  "EPC",
                  "Value",
                  "Result",
                ].map((head, i) =>
                  head === null ? (
                    <th key={i} aria-hidden className={GUTTER} />
                  ) : (
                    <th
                      key={i}
                      className="border-b border-border-soft pt-2.5 pb-3 pr-3 text-left text-xs font-medium tracking-wide text-text-faint uppercase"
                    >
                      {head}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {shown.slice(0, limit).map((r) => {
                const isNew =
                  (bolInitialMax !== null &&
                    (r.bol?.latest.id ?? 0) > bolInitialMax) ||
                  (eolInitialMax !== null &&
                    (r.eol?.latest.id ?? 0) > eolInitialMax);
                return (
                  <tr
                    key={`${r.sensorId}-${r.bol?.latest.id ?? 0}-${r.eol?.latest.id ?? 0}`}
                    className={cn(
                      "[&>td]:border-b [&>td]:border-border-soft hover:bg-foreground/[0.03]",
                      isNew &&
                        "animate-in fade-in-0 slide-in-from-top-1 duration-500",
                    )}
                  >
                    <td className="py-2.5 pr-3 font-mono text-xs whitespace-nowrap">
                      {r.sensorId}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-1 text-xs font-semibold whitespace-nowrap",
                          STAGE_TONE[r.stage],
                        )}
                      >
                        {STAGE_LABEL[r.stage]}
                      </span>
                    </td>
                    <td aria-hidden className={GUTTER} />
                    <StageCells
                      log={r.bol?.latest}
                      scans={r.bol?.scans ?? 0}
                      day={day}
                      empty={r.bolChecked ? "—" : "Looking up…"}
                      cols={2}
                    />
                    <td aria-hidden className={GUTTER} />
                    {r.eol ? (
                      <>
                        <td
                          className={
                            "py-2.5 pr-3 whitespace-nowrap tabular-nums"
                          }
                        >
                          {formatWhen(r.eol.latest.createdAt, day)}
                          <ScansCount scans={r.eol.scans} />
                        </td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">
                          {r.eol.latest.epc ?? "—"}
                        </td>
                        <td className="py-2.5 pr-3 tabular-nums">
                          {r.eol.latest.value ?? "—"}
                        </td>
                        <td className="py-2.5 pr-0">
                          <ResultText log={r.eol.latest} />
                        </td>
                      </>
                    ) : (
                      <td colSpan={4} className={"py-2.5 text-text-faint"}>
                        —
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {status !== "loading" && shown.length === 0 && (
          <p className="py-10 text-center text-sm text-text-faint">
            {rows.length === 0
              ? `No line activity ${day ? `on ${formatDay(day)}` : "yet"}.`
              : "No shoes match these filters."}
          </p>
        )}
        {status === "loading" && (
          <p className="py-10 text-center text-sm text-text-faint">
            Loading entries…
          </p>
        )}
        <ShowMore
          remaining={shown.length - limit}
          pageSize={PAGE_SIZE}
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
        />
      </div>
    </div>
  );
}

// BOL cells: date (+ scan count), raw value, result — or one empty cell.
function StageCells({
  log,
  scans,
  day,
  empty,
  cols,
}: {
  log: LineLog | undefined;
  scans: number;
  day: Date | undefined;
  empty: string;
  cols: number;
}) {
  if (!log) {
    return (
      <td colSpan={cols + 1} className={"py-2.5 text-text-faint"}>
        {empty}
      </td>
    );
  }
  return (
    <>
      <td className={"py-2.5 pr-3 whitespace-nowrap tabular-nums"}>
        {formatWhen(log.createdAt, day)}
        <ScansCount scans={scans} />
      </td>
      <td className={"py-2.5 pr-3 tabular-nums"}>{log.value ?? "—"}</td>
      <td className={"py-2.5 pr-3"}>
        <ResultText log={log} />
      </td>
    </>
  );
}
