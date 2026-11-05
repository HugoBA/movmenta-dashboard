"use client";

import ReactECharts from "echarts-for-react";
import { categorical, useChartColors } from "./palette";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = parseInt(full, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface TrendPoint {
  x: number;
  y: number;
  // Tooltip header for this point (e.g. "12/10 · Post-run").
  label: string;
  // Drawn as a larger, highlighted dot with a permanent label.
  highlight?: { text: string; color: string };
}

// Two modes:
// - `categories` + `values`: evenly spaced category x-axis (legacy usage).
// - `points`: numeric x-axis (`xAxisType` "value" or "time"), spaced by x.
//   `secondaryPoints` adds a discreet dashed line on the same axes.
export function TrendLineChart({
  categories = [],
  values = [],
  points,
  pointsName = "Primary",
  secondaryPoints,
  secondaryName = "Secondary",
  xAxisType = "value",
  formatX,
  unit = "",
  decimals,
  fitY = false,
  showSymbols,
  color = categorical[0],
  height = 260,
  smooth = false,
}: {
  categories?: string[];
  values?: number[];
  points?: TrendPoint[];
  pointsName?: string;
  secondaryPoints?: TrendPoint[];
  secondaryName?: string;
  xAxisType?: "value" | "time";
  formatX?: (v: number) => string;
  unit?: string;
  decimals?: number;
  // Fit the y-axis to the data range instead of always starting at 0.
  fitY?: boolean;
  showSymbols?: boolean;
  color?: string;
  height?: number;
  smooth?: boolean;
}) {
  const { ink, chartChrome } = useChartColors();
  const round = (v: number) =>
    decimals === undefined ? v : Number(v.toFixed(decimals));
  const format = (v: number) => `${round(v)}${unit}`;
  const numeric = points !== undefined;
  const symbols = showSymbols ?? (numeric && points.length <= 40);

  const toData = (pts: TrendPoint[]) =>
    pts.map((p) => ({
        value: [p.x, p.y],
        ...(p.highlight
          ? {
              symbol: "circle",
              symbolSize: 10,
              itemStyle: { color: p.highlight.color, borderColor: chartChrome.surface, borderWidth: 2 },
              label: {
                show: true,
                position: "bottom",
                formatter: p.highlight.text,
                color: p.highlight.color,
                fontSize: 11,
              },
            }
          : {}),
    }));
  const seriesData = numeric ? toData(points) : values;
  const secondaryColor = hexToRgba(color, 0.55);
  // Same order as `series` below: the dashed line is drawn first (underneath).
  const seriesPoints = secondaryPoints ? [secondaryPoints, points ?? []] : [points ?? []];

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 48, top: secondaryPoints ? 36 : 16, bottom: 8, containLabel: true },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "line", lineStyle: { color: chartChrome.baseline } },
          backgroundColor: chartChrome.surface,
          borderColor: chartChrome.grid,
          textStyle: { color: ink.primary },
          ...(numeric
            ? {
                formatter: (
                  params: { dataIndex: number; seriesIndex: number; seriesName: string; marker: string }[],
                ) =>
                  params
                    .map((param) => {
                      const p = seriesPoints[param.seriesIndex]?.[param.dataIndex];
                      if (!p) return "";
                      const name = secondaryPoints ? `${param.seriesName} · ` : "";
                      return `${p.label}<br/>${param.marker} ${name}<b>${format(p.y)}</b>`;
                    })
                    .filter(Boolean)
                    .join("<br/>"),
              }
            : { valueFormatter: (v: number) => format(v) }),
        },
        xAxis: numeric
          ? {
              type: xAxisType,
              min: "dataMin",
              max: "dataMax",
              axisLine: { lineStyle: { color: chartChrome.baseline } },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: {
                color: ink.muted,
                hideOverlap: true,
                ...(formatX ? { formatter: formatX } : {}),
              },
            }
          : {
              type: "category",
              data: categories,
              axisLine: { lineStyle: { color: chartChrome.baseline } },
              axisTick: { show: false },
              axisLabel: { color: ink.muted },
            },
        yAxis: {
          type: "value",
          scale: fitY,
          axisLabel: { color: ink.muted, formatter: format },
          splitLine: { lineStyle: { color: chartChrome.grid } },
        },
        ...(secondaryPoints
          ? {
              legend: {
                top: 0,
                right: 48,
                itemWidth: 18,
                itemHeight: 2,
                textStyle: { color: ink.muted, fontSize: 11 },
                data: [pointsName, secondaryName],
              },
            }
          : {}),
        series: [
          ...(secondaryPoints
            ? [
                {
                  type: "line",
                  name: secondaryName,
                  data: toData(secondaryPoints),
                  color: secondaryColor,
                  lineStyle: { width: 1.5, type: "dashed", color: secondaryColor },
                  showSymbol: false,
                  smooth: smooth ? 0.35 : false,
                  z: 1,
                },
              ]
            : []),
          {
            type: "line",
            name: pointsName,
            z: 2,
            data: seriesData,
            color,
            lineStyle: { width: 2, color },
            showSymbol: symbols,
            symbolSize: 6,
            smooth: smooth ? 0.35 : false,
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
              formatter: (p: { value: number | [number, number] }) =>
                format(Array.isArray(p.value) ? p.value[1] : p.value),
              color: ink.secondary,
            },
          },
        ],
      }}
    />
  );
}
