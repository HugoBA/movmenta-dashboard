"use client";

import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { Button } from "@/components/ui/button";
import { categorical, chartChrome, ink } from "@/components/charts/palette";
import { computeWearAttempts } from "./compute";
import type { Tester } from "./compute";

const DIMMED_OPACITY = 0.15;

function colorForIndex(index: number): string {
  return categorical[index % categorical.length];
}

interface ClickParams {
  componentType: string;
  seriesType?: string;
  seriesName?: string;
}

interface TooltipParam {
  value: [number, number];
  seriesName: string;
  seriesType: string;
}

export function PrePostChart({ testers }: { testers: Tester[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const testersWithAttempts = useMemo(
    () =>
      testers
        .map((tester) => ({ tester, attempts: computeWearAttempts(tester.rawResults) }))
        .filter((entry) => entry.attempts.length > 0),
    [testers],
  );
  const selected = testersWithAttempts.find((entry) => entry.tester.idNfc === selectedId) ?? null;

  const option = useMemo(() => {
    const lineSeries = testersWithAttempts.flatMap((entry, index) => {
      const color = colorForIndex(index);
      const isSelected = selected?.tester.idNfc === entry.tester.idNfc;
      const dimmed = selected !== null && !isSelected;
      const data = entry.attempts.map((a, i) => [i + 1, a.value]);

      const visible = {
        id: entry.tester.idNfc,
        name: entry.tester.label,
        type: "line",
        data,
        color,
        lineStyle: { width: isSelected ? 2.5 : 2, color, opacity: dimmed ? DIMMED_OPACITY : 1 },
        itemStyle: {
          color,
          borderColor: chartChrome.surface,
          borderWidth: 1,
          opacity: dimmed ? DIMMED_OPACITY : 1,
        },
        showSymbol: true,
        symbolSize: isSelected ? 8 : 6,
        emphasis: dimmed ? {} : { lineStyle: { width: 3 }, scale: 1.4 },
        tooltip: { show: !dimmed },
        cursor: "pointer",
        z: isSelected ? 10 : 1,
      };

      // A near-invisible, much thicker twin of the same line, purely to
      // widen the click hit area — ECharts only registers clicks within a
      // couple pixels of the thin visible stroke otherwise, so isolating a
      // tester only worked when clicking exactly on a point. Same `name` as
      // the visible line so it merges into the same legend entry and never
      // shows its own tooltip.
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
        z: isSelected ? 9 : 0,
      };

      return [hitArea, visible];
    });

    const postSeries = selected
      ? [
          {
            id: `${selected.tester.idNfc}-post`,
            name: `${selected.tester.label} — post`,
            type: "scatter",
            data: selected.attempts
              .map((a, i) => ({ a, i }))
              .filter(({ a }) => a.post)
              .map(({ a, i }) => [i + 1, a.post!.value]),
            symbolSize: 11,
            itemStyle: {
              color: colorForIndex(testersWithAttempts.indexOf(selected)),
              borderColor: chartChrome.surface,
              borderWidth: 1.5,
            },
            z: 10,
          },
        ]
      : [];

    return {
      backgroundColor: "transparent",
      grid: { left: 8, right: 16, top: 44, bottom: 8, containLabel: true },
      legend: {
        type: "scroll",
        top: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: ink.secondary, fontSize: 11 },
        pageIconColor: ink.secondary,
        pageTextStyle: { color: ink.muted },
      },
      tooltip: {
        trigger: selected ? "axis" : "item",
        axisPointer: { type: "line", lineStyle: { color: chartChrome.baseline } },
        backgroundColor: chartChrome.surface,
        borderColor: chartChrome.grid,
        textStyle: { color: ink.primary },
        formatter: (paramsOrParam: TooltipParam | TooltipParam[]) => {
          const params = Array.isArray(paramsOrParam) ? paramsOrParam : [paramsOrParam];
          if (params.length === 0) return "";
          const scanNumber = params[0].value[0];
          const name = params[0].seriesName.replace(" — post", "");
          const lines = params.map((p) => {
            const phase = p.seriesType === "scatter" ? "Post" : "Pre";
            return `${phase}: ${p.value[1]}`;
          });
          return `<b>${name}</b><br/>Scan #${scanNumber}<br/>${lines.join("<br/>")}`;
        },
      },
      xAxis: {
        type: "value",
        name: "Scan #",
        nameLocation: "middle",
        nameGap: 26,
        nameTextStyle: { color: ink.muted },
        min: 1,
        minInterval: 1,
        axisLine: { lineStyle: { color: chartChrome.baseline } },
        axisTick: { show: false },
        axisLabel: { color: ink.muted },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLabel: { color: ink.muted },
        splitLine: { lineStyle: { color: chartChrome.grid } },
      },
      series: [...lineSeries, ...postSeries],
    };
  }, [selected, testersWithAttempts]);

  const onEvents = useMemo(
    () => ({
      click: (params: ClickParams) => {
        if (params.componentType !== "series" || params.seriesType !== "line") return;
        const entry = testersWithAttempts.find((e) => e.tester.label === params.seriesName);
        if (entry) setSelectedId(entry.tester.idNfc);
      },
    }),
    [testersWithAttempts],
  );

  return (
    <div>
      {selected && (
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-text-faint">
            Showing <span className="font-medium text-foreground">{selected.tester.label}</span> —
            pre (line) and post (dots)
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(null)}>
            Reset
          </Button>
        </div>
      )}
      {testersWithAttempts.length === 0 ? (
        <p className="text-sm text-text-faint">No scan recorded yet for this test.</p>
      ) : (
        <ReactECharts
          style={{ height: 360 }}
          opts={{ renderer: "svg" }}
          option={option}
          onEvents={onEvents}
          notMerge
        />
      )}
    </div>
  );
}
