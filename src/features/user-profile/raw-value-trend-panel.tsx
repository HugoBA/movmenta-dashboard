"use client";

import { useState } from "react";
import { Panel } from "@/components/layout/panel";
import { Switch } from "@/components/ui/switch";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { categorical } from "@/components/charts/palette";
import { formatDate, formatShortDate } from "@/lib/formatting/date";
import { cn } from "@/lib/utils";
import type { ResultRecord } from "@/lib/xano/results";

export function RawValueTrendPanel({ chronological }: { chronological: ResultRecord[] }) {
  const [showPercent, setShowPercent] = useState(false);
  const hasResults = chronological.length > 0;

  return (
    <Panel
      title="Raw sensor value — across scans"
      subtitle={
        hasResults
          ? `${chronological.length} scans, from ${formatDate(chronological[0].created_at)} to ${formatDate(chronological[chronological.length - 1].created_at)}`
          : "No scans recorded"
      }
      right={
        hasResults ? (
          <div className="flex items-center gap-2 text-xs text-text-faint">
            <span className={cn(!showPercent && "font-medium text-foreground")}>Value</span>
            <Switch checked={showPercent} onCheckedChange={setShowPercent} size="sm" />
            <span className={cn(showPercent && "font-medium text-foreground")}>%</span>
          </div>
        ) : undefined
      }
    >
      {hasResults ? (
        <TrendLineChart
          categories={chronological.map((row) => formatShortDate(row.created_at))}
          values={chronological.map((row) => (showPercent ? row.percent : row.value))}
          unit={showPercent ? "%" : ""}
          color={categorical[1]}
        />
      ) : (
        <p className="py-10 text-center text-[13px] text-text-faint">
          No scans for this sensor yet.
        </p>
      )}
    </Panel>
  );
}
