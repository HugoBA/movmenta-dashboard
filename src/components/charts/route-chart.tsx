"use client";

import ReactECharts from "echarts-for-react";
import { categorical } from "./palette";

export interface RoutePoint {
  x: number;
  y: number;
}

// A stylized, aspect-locked path — not a real georeferenced map. Plain
// line, no start/finish markers, gently smoothed to match the organic
// (not grid-square) route shape.
export function RouteChart({
  points,
  height = 220,
  color = categorical[1],
}: {
  points: RoutePoint[];
  height?: number;
  color?: string;
}) {
  const data = points.map((p) => [p.x, p.y]);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs) || 1;
  const spanY = Math.max(...ys) - Math.min(...ys) || 1;
  const padX = spanX * 0.15;
  const padY = spanY * 0.15;

  return (
    <ReactECharts
      style={{ height }}
      opts={{ renderer: "svg" }}
      option={{
        backgroundColor: "transparent",
        grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: false },
        xAxis: {
          type: "value",
          show: false,
          min: Math.min(...xs) - padX,
          max: Math.max(...xs) + padX,
        },
        yAxis: {
          type: "value",
          show: false,
          min: Math.min(...ys) - padY,
          max: Math.max(...ys) + padY,
        },
        tooltip: { show: false },
        series: [
          {
            type: "line",
            data,
            showSymbol: false,
            smooth: 0.3,
            lineStyle: { color, width: 3, join: "round" },
            silent: true,
            z: 1,
          },
        ],
      }}
    />
  );
}
