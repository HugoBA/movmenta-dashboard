"use client";

import ReactECharts from "echarts-for-react";
import { categorical, chartChrome, ink } from "./palette";

export interface ScatterGroupPoint {
  x: number;
  y: number;
  label: string;
}

export interface ScatterGroup {
  key: string;
  color?: string;
  points: ScatterGroupPoint[];
}

function linearRegression(points: ScatterGroupPoint[]): { slope: number; intercept: number } | null {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

interface TooltipItemParam {
  value: [number, number, string];
  seriesType: string;
}

// Scatter plot with a per-group least-squares trend line — used to show a
// correlation between two continuous variables (e.g. bodyweight vs wear
// rate), optionally split into a couple of comparison groups.
export function ScatterTrendChart({
  groups,
  xLabel,
  yLabel,
  xUnit = "",
  yUnit = "",
  height = 340,
}: {
  groups: ScatterGroup[];
  xLabel: string;
  yLabel: string;
  xUnit?: string;
  yUnit?: string;
  height?: number;
}) {
  const series = groups.flatMap((group, index) => {
    const color = group.color ?? categorical[index % categorical.length];
    const scatter = {
      name: group.key,
      type: "scatter",
      data: group.points.map((p) => [p.x, p.y, p.label]),
      symbolSize: 10,
      itemStyle: { color, opacity: 0.85, borderColor: chartChrome.surface, borderWidth: 1 },
      emphasis: { scale: 1.3 },
    };

    const trend = linearRegression(group.points);
    if (!trend) return [scatter];

    const xs = group.points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const trendLine = {
      name: group.key,
      type: "line",
      data: [
        [minX, trend.slope * minX + trend.intercept],
        [maxX, trend.slope * maxX + trend.intercept],
      ],
      showSymbol: false,
      lineStyle: { color, width: 2, type: "dashed" as const, opacity: 0.55 },
      itemStyle: { color },
      tooltip: { show: false },
      silent: true,
      z: 0,
    };

    return [trendLine, scatter];
  });

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
        legend: {
          top: 0,
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: ink.secondary, fontSize: 11 },
        },
        tooltip: {
          trigger: "item",
          backgroundColor: chartChrome.surface,
          borderColor: chartChrome.grid,
          textStyle: { color: ink.primary },
          formatter: (param: TooltipItemParam) => {
            if (param.seriesType !== "scatter") return "";
            const [x, y, label] = param.value;
            return `<b>${label}</b><br/>${xLabel}: ${x}${xUnit}<br/>${yLabel}: ${y}${yUnit}`;
          },
        },
        xAxis: {
          type: "value",
          scale: true,
          name: xLabel,
          nameLocation: "middle",
          nameGap: 28,
          nameTextStyle: { color: ink.muted },
          axisLabel: { color: ink.muted, formatter: (v: number) => `${v}${xUnit}` },
          axisLine: { lineStyle: { color: chartChrome.baseline } },
          splitLine: { lineStyle: { color: chartChrome.grid } },
        },
        yAxis: {
          type: "value",
          scale: true,
          name: yLabel,
          nameLocation: "middle",
          nameGap: 70,
          nameTextStyle: { color: ink.muted },
          axisLabel: { color: ink.muted, formatter: (v: number) => `${v}${yUnit}` },
          axisLine: { lineStyle: { color: chartChrome.baseline } },
          splitLine: { lineStyle: { color: chartChrome.grid } },
        },
        series,
      }}
    />
  );
}
