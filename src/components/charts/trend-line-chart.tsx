"use client";

import ReactECharts from "echarts-for-react";
import { categorical, chartChrome, ink } from "./palette";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function TrendLineChart({
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
        grid: { left: 8, right: 48, top: 16, bottom: 8, containLabel: true },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "line", lineStyle: { color: chartChrome.baseline } },
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
            type: "line",
            data: values,
            color,
            lineStyle: { width: 2, color },
            showSymbol: false,
            emphasis: { focus: "series" },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: hexToRgba(color, 0.32) },
                  { offset: 1, color: hexToRgba(color, 0) },
                ],
              },
            },
            endLabel: {
              show: true,
              formatter: (p: { value: number }) => format(p.value),
              color: ink.secondary,
            },
          },
        ],
      }}
    />
  );
}
