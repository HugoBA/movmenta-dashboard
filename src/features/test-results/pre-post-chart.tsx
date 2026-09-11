"use client";

import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { categorical, chartChrome, ink } from "@/components/charts/palette";
import { cn } from "@/lib/utils";
import { computeWearAttempts } from "./compute";
import type { Tester } from "./compute";
import type { ResultRecord } from "@/lib/xano/results";

type Metric = "percent" | "mm";

function colorForIndex(index: number): string {
  return categorical[index % categorical.length];
}

function valueOf(row: ResultRecord, metric: Metric): number {
  return metric === "percent" ? row.percent : row.mm;
}

interface TooltipParam {
  value: [number, number];
  seriesName: string;
  seriesType: string;
}

export function PrePostChart({ testers }: { testers: Tester[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("percent");
  const unit = metric === "percent" ? "%" : " mm";

  const testersWithAttempts = useMemo(
    () =>
      testers
        .map((tester) => ({ tester, attempts: computeWearAttempts(tester.rawResults) }))
        .filter((entry) => entry.attempts.length > 0),
    [testers],
  );
  const selectedIndex = testersWithAttempts.findIndex((entry) => entry.tester.idNfc === selectedId);
  const selected = selectedIndex >= 0 ? testersWithAttempts[selectedIndex] : null;

  const option = useMemo(() => {
    // Isolated: only that tester's series exist at all — nothing else to
    // fade, the chart (and its y-axis scale) belongs entirely to them.
    const shown = selected ? [{ entry: selected, index: selectedIndex }] : testersWithAttempts.map((entry, index) => ({ entry, index }));

    const lineSeries = shown.flatMap(({ entry, index }) => {
      const color = colorForIndex(index);
      const data = entry.attempts.map((a) => [a.kmPre, valueOf(a.pre, metric)]);
      const visible = {
        id: entry.tester.idNfc,
        name: entry.tester.label,
        type: "line",
        data,
        color,
        lineStyle: { width: selected ? 2.5 : 2, color },
        itemStyle: { color, borderColor: chartChrome.surface, borderWidth: 1 },
        showSymbol: true,
        symbolSize: selected ? 8 : 6,
        emphasis: { lineStyle: { width: 3 }, scale: 1.4 },
        cursor: "pointer",
        z: 1,
      };

      // A near-invisible, much thicker twin of the same line, purely to
      // widen the click hit area — ECharts only registers clicks within a
      // couple pixels of the thin visible stroke otherwise. Same `name` so
      // it doesn't add its own legend/tooltip entry.
      const hitArea = {
        id: `${entry.tester.idNfc}-hit`,
        name: entry.tester.label,
        type: "line",
        data,
        lineStyle: { width: 20, opacity: 0 },
        itemStyle: { opacity: 0 },
        showSymbol: false,
        tooltip: { show: false },
        cursor: "pointer",
        z: 0,
      };

      return [hitArea, visible];
    });

    const postSeries = selected
      ? [
          {
            id: `${selected.tester.idNfc}-post`,
            name: `${selected.tester.label} — post`,
            type: "line",
            data: selected.attempts
              .filter((a) => a.post && a.kmPost !== null)
              .map((a) => [a.kmPost, valueOf(a.post!, metric)]),
            color: colorForIndex(selectedIndex),
            lineStyle: { width: 2.5, type: "dashed" as const, color: colorForIndex(selectedIndex) },
            itemStyle: { color: colorForIndex(selectedIndex), borderColor: chartChrome.surface, borderWidth: 1.5 },
            showSymbol: true,
            symbolSize: 8,
            z: 10,
          },
        ]
      : [];

    return {
      backgroundColor: "transparent",
      grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
      tooltip: {
        trigger: selected ? "axis" : "item",
        axisPointer: { type: "line", lineStyle: { color: chartChrome.baseline } },
        backgroundColor: chartChrome.surface,
        borderColor: chartChrome.grid,
        textStyle: { color: ink.primary },
        formatter: (paramsOrParam: TooltipParam | TooltipParam[]) => {
          const params = Array.isArray(paramsOrParam) ? paramsOrParam : [paramsOrParam];
          if (params.length === 0) return "";
          const km = params[0].value[0];
          const name = params[0].seriesName.replace(" — post", "");
          const lines = params.map((p) => {
            const phase = p.seriesName.endsWith(" — post") ? "Post" : "Pre";
            return `${phase}: ${p.value[1]}${unit}`;
          });
          return `<b>${name}</b><br/>${Number(km).toFixed(1)} km<br/>${lines.join("<br/>")}`;
        },
      },
      xAxis: {
        type: "value",
        name: "Distance covered (km)",
        nameLocation: "middle",
        nameGap: 28,
        nameTextStyle: { color: ink.muted },
        axisLine: { lineStyle: { color: chartChrome.baseline } },
        axisTick: { show: false },
        axisLabel: { color: ink.muted, formatter: (v: number) => `${v}` },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: true,
        name: metric === "percent" ? "Wear %" : "Thickness (mm)",
        nameTextStyle: { color: ink.muted },
        axisLabel: { color: ink.muted, formatter: (v: number) => `${v}${unit}` },
        splitLine: { lineStyle: { color: chartChrome.grid } },
      },
      series: [...lineSeries, ...postSeries],
    };
  }, [selected, selectedIndex, testersWithAttempts, metric, unit]);

  const onEvents = useMemo(
    () => ({
      click: (params: { componentType: string; seriesType?: string; seriesName?: string }) => {
        if (params.componentType !== "series" || params.seriesType !== "line") return;
        const entry = testersWithAttempts.find((e) => e.tester.label === params.seriesName);
        if (entry) setSelectedId(entry.tester.idNfc === selectedId ? null : entry.tester.idNfc);
      },
    }),
    [testersWithAttempts, selectedId],
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-faint">
          Showing <span className="font-medium text-foreground">pre-run</span> values by default — click a
          name below or a line to isolate a tester and reveal its post-run trend.
        </p>
        <div className="flex items-center gap-2 text-xs text-text-faint">
          <span className={cn(metric === "percent" && "font-medium text-foreground")}>%</span>
          <Switch
            checked={metric === "mm"}
            onCheckedChange={(checked) => setMetric(checked ? "mm" : "percent")}
            size="sm"
          />
          <span className={cn(metric === "mm" && "font-medium text-foreground")}>mm</span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {testersWithAttempts.map((entry, index) => {
          const isSelected = selected?.tester.idNfc === entry.tester.idNfc;
          return (
            <button
              key={entry.tester.idNfc}
              type="button"
              onClick={() => setSelectedId(isSelected ? null : entry.tester.idNfc)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs transition-colors",
                isSelected ? "bg-card font-medium text-foreground" : "text-text-faint hover:text-foreground",
              )}
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: colorForIndex(index) }}
              />
              {entry.tester.label}
            </button>
          );
        })}
        {selected && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setSelectedId(null)}
          >
            Reset
          </Button>
        )}
      </div>

      {selected && (
        <p className="mb-2 text-sm text-text-faint">
          Showing <span className="font-medium text-foreground">{selected.tester.label}</span> —{" "}
          <span className="font-medium text-foreground">pre</span> (solid) and{" "}
          <span className="font-medium text-foreground">post</span> (dashed)
        </p>
      )}

      {testersWithAttempts.length === 0 ? (
        <p className="text-sm text-text-faint">No scan recorded yet for this test.</p>
      ) : (
        <ReactECharts
          style={{ height: 460 }}
          opts={{ renderer: "svg" }}
          option={option}
          onEvents={onEvents}
          notMerge
        />
      )}
    </div>
  );
}
