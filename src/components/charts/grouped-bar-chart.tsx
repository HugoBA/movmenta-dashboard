"use client";

import ReactECharts from "echarts-for-react";
import { categorical, chartChrome, ink } from "./palette";

export function GroupedBarChart({
  categories,
  series,
  unit = "",
  height = 220,
}: {
  categories: string[];
  series: { name: string; data: number[] }[];
  unit?: string;
  height?: number;
}) {
  const format = (v: number) => `${v}${unit}`;

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 16, top: 36, bottom: 8, containLabel: true },
        legend: {
          top: 0,
          right: 0,
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: ink.secondary, fontSize: 11 },
        },
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
        series: series.map((s, i) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          color: categorical[i],
          barMaxWidth: 20,
          itemStyle: { borderRadius: [3, 3, 0, 0] },
        })),
      }}
    />
  );
}
