"use client";

import ReactECharts from "echarts-for-react";
import { categorical, chartChrome, ink } from "./palette";

export function RankedBarChart({
  categories,
  values,
  unit = "",
  color = categorical[0],
  height = 260,
}: {
  categories: string[];
  values: number[];
  unit?: string;
  color?: string;
  height?: number;
}) {
  const format = (v: number) => `${v}${unit}`;

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
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
            data: values,
            color,
            barMaxWidth: 24,
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            label: {
              show: true,
              position: "top",
              color: ink.secondary,
              formatter: (p: { value: number }) => format(p.value),
            },
          },
        ],
      }}
    />
  );
}
