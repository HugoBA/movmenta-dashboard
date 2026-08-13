"use client";

import ReactECharts from "echarts-for-react";
import { categorical, chartChrome, ink } from "./palette";

const belowColor = categorical[0]; // blue — reads below the baseline
const aboveColor = categorical[7]; // red — reads above the baseline

export function BaselineDeviationChart({
  categories,
  values,
  baselineLabel,
  unit = "",
  height = 220,
}: {
  categories: string[];
  values: number[];
  baselineLabel: string;
  unit?: string;
  height?: number;
}) {
  const format = (v: number) => `${v > 0 ? "+" : ""}${v}${unit}`;

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 16, top: 28, bottom: 8, containLabel: true },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          backgroundColor: chartChrome.surface,
          borderColor: chartChrome.grid,
          textStyle: { color: ink.primary },
          valueFormatter: (v: number) => format(v),
        },
        xAxis: {
          type: "category",
          data: categories,
          axisLine: { lineStyle: { color: chartChrome.baseline } },
          axisTick: { show: false },
          axisLabel: { color: ink.muted },
        },
        yAxis: {
          type: "value",
          axisLabel: { color: ink.muted, formatter: format },
          splitLine: { lineStyle: { color: chartChrome.grid } },
        },
        series: [
          {
            type: "bar",
            data: values.map((v) => ({
              value: v,
              itemStyle: { color: v >= 0 ? aboveColor : belowColor },
            })),
            barMaxWidth: 18,
            itemStyle: { borderRadius: [3, 3, 3, 3] },
            markLine: {
              symbol: "none",
              silent: true,
              label: { formatter: baselineLabel, color: ink.secondary, position: "insideEndTop" },
              lineStyle: { color: ink.muted, type: "dashed", width: 1.2 },
              data: [{ yAxis: 0 }],
            },
          },
        ],
      }}
    />
  );
}
