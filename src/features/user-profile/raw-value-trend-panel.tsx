"use client";

import { useMemo, useState } from "react";
import { Panel } from "@/components/layout/panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendLineChart,
  type TrendPoint,
} from "@/components/charts/trend-line-chart";
import { categorical, status } from "@/components/charts/palette";
import { formatDate, formatShortDate } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import type { ResultRecord } from "@/lib/xano/results";

type ScanFilter = "post" | "pre" | "both";
type Metric = "value" | "percent" | "mm";
type XAxis = "km" | "time" | "date";

const SCAN_OPTIONS: { value: ScanFilter; label: string }[] = [
  { value: "post", label: "Post-run scans" },
  { value: "pre", label: "Pre-run scans" },
  { value: "both", label: "Pre / post-run scans" },
];

const METRIC_OPTIONS: {
  value: Metric;
  label: string;
  unit: string;
  decimals: number;
}[] = [
  { value: "value", label: "Raw value", unit: "", decimals: 0 },
  { value: "percent", label: "%", unit: "%", decimals: 1 },
  { value: "mm", label: "mm", unit: " mm", decimals: 2 },
];

const X_AXIS_OPTIONS: { value: XAxis; label: string }[] = [
  { value: "km", label: "Distance" },
  { value: "time", label: "Time" },
  { value: "date", label: "Date" },
];

const TITLES: Record<Metric, string> = {
  value: "Raw sensor value",
  percent: "Wear",
  mm: "Wear depth",
};

function periodOf(row: ResultRecord): "pre" | "post" | null {
  const period = row.period?.toLowerCase();
  return period === "pre" || period === "post" ? period : null;
}

export function RawValueTrendPanel({
  chronological,
  percentOnly = false,
  factoryValue,
}: {
  chronological: ResultRecord[];
  percentOnly?: boolean;
  // Shoe's factory reading — plotted at 0 km / 0 min on the raw value chart.
  factoryValue?: number;
}) {
  const [scans, setScans] = useState<ScanFilter>("post");
  const [metric, setMetric] = useState<Metric>(
    percentOnly ? "percent" : "value",
  );
  const [xAxis, setXAxis] = useState<XAxis>("km");
  const metricOption = METRIC_OPTIONS.find((m) => m.value === metric)!;

  const { points, prePoints } = useMemo(() => {
    // Cumulative distance/time is computed over every row (post rows carry the
    // run's km/duration), so a pre-scan sits where the previous run ended.
    let km = 0;
    let minutes = 0;
    const out: TrendPoint[] = [];
    // "both" mode: post scans are the main line, pre scans a dashed one.
    const pre: TrendPoint[] = [];
    for (const row of chronological) {
      km += row.km || 0;
      minutes += row.duration || 0;
      const period = periodOf(row);
      if (scans !== "both" && period !== scans) continue;
      const target = scans === "both" && period !== "post" ? pre : out;
      const x =
        xAxis === "km" ? km : xAxis === "time" ? minutes : row.created_at;
      const periodLabel =
        period === "pre"
          ? "Pre-run"
          : period === "post"
            ? "Post-run"
            : row.period;
      target.push({
        x: xAxis === "km" ? Number(km.toFixed(1)) : x,
        y: row[metric],
        label: [
          formatShortDate(row.created_at),
          periodLabel,
          `${km.toFixed(1)} km`,
          formatDurationMinutes(minutes),
        ]
          .filter(Boolean)
          .join(" · "),
      });
    }
    if (
      metric === "value" &&
      factoryValue !== undefined &&
      xAxis !== "date" &&
      out.length > 0
    ) {
      out.unshift({
        x: 0,
        y: factoryValue,
        label: `Factory value · 0 ${xAxis === "km" ? "km" : "min"}`,
        highlight: { text: "Factory", color: status.warning },
      });
    }
    return { points: out, prePoints: scans === "both" ? pre : undefined };
  }, [chronological, scans, metric, xAxis, factoryValue]);

  const filtered = chronological.filter(
    (row) => scans === "both" || periodOf(row) === scans,
  );
  const hasResults = filtered.length > 0;

  const formatX =
    xAxis === "km"
      ? (v: number) => `${v} km`
      : xAxis === "time"
        ? (v: number) => formatDurationMinutes(v)
        : (v: number) => formatShortDate(v);

  return (
    <Panel
      title={`${TITLES[metric]} — across scans`}
      subtitle={
        hasResults
          ? `${filtered.length} scans, from ${formatDate(filtered[0].created_at)} to ${formatDate(filtered[filtered.length - 1].created_at)}`
          : "No scans recorded"
      }
      right={
        chronological.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={scans}
              onValueChange={(v) => setScans(v as ScanFilter)}
            >
              <SelectTrigger size="sm" className="w-[175px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCAN_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!percentOnly && (
              <Select
                value={metric}
                onValueChange={(v) => setMetric(v as Metric)}
              >
                <SelectTrigger size="sm" className="w-[115px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METRIC_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ) : undefined
      }
    >
      {hasResults ? (
        <>
          <TrendLineChart
            points={points}
            pointsName="Post-run"
            secondaryPoints={prePoints}
            secondaryName="Pre-run"
            xAxisType={xAxis === "date" ? "time" : "value"}
            formatX={formatX}
            unit={metricOption.unit}
            decimals={metricOption.decimals}
            fitY
            color={categorical[1]}
          />
          <div className="mt-4 flex justify-end">
            <Select value={xAxis} onValueChange={(v) => setXAxis(v as XAxis)}>
              <SelectTrigger
                size="sm"
                className="w-[135px]"
                aria-label="X axis"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {X_AXIS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        <p className="py-10 text-center text-[13px] text-text-faint">
          {chronological.length > 0
            ? "No scans match this filter."
            : "No scans for this sensor yet."}
        </p>
      )}
    </Panel>
  );
}
