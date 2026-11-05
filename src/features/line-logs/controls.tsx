"use client";

import { useState } from "react";
import { ArrowUp, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LineLog } from "@/lib/xano/line-logs";
import type { LiveStatus } from "./use-line-logs";
import { formatDay, formatTimestamp, startOfDay } from "./format";

export function DayFilter({ day, onChange }: { day: Date | undefined; onChange: (day: Date | undefined) => void }) {
  const [open, setOpen] = useState(false);
  const pick = (d: Date | undefined) => {
    onChange(d ? startOfDay(d) : undefined);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start font-normal">
          <CalendarIcon className="size-4" />
          {day ? formatDay(day) : "All days"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={day} onSelect={(d) => d && pick(d)} disabled={{ after: new Date() }} />
        <div className="flex justify-between gap-2 border-t border-border-soft p-2">
          <Button variant="ghost" size="sm" onClick={() => pick(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={() => pick(undefined)}>
            All days
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const LIVE_LABEL: Record<LiveStatus, string> = {
  loading: "Loading…",
  live: "Live",
  paused: "Paused while this tab is hidden",
  error: "Connection problem, retrying",
};

const LIVE_DOT: Record<LiveStatus, string> = {
  loading: "bg-text-faint",
  live: "bg-brand-good animate-pulse",
  paused: "bg-text-faint",
  error: "bg-destructive",
};

export function LiveIndicator({ status, lastUpdated }: { status: LiveStatus; lastUpdated: number | null }) {
  // Browser-only component tree (see line-logs-client.tsx), so this is the viewer's zone.
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-faint">
      <span className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", LIVE_DOT[status])} />
        <span className={cn(status === "error" && "text-destructive")}>{LIVE_LABEL[status]}</span>
      </span>
      {lastUpdated && <span>Updated {formatTimestamp(lastUpdated).slice(11)}</span>}
      <span>Times shown in your time zone ({timeZone})</span>
    </div>
  );
}

export function NewEntriesBanner({ count, onClick }: { count: number; onClick: () => void }) {
  if (count <= 0) return null;
  return (
    <div className="pointer-events-none sticky top-4 z-10 -mb-9 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-md"
      >
        <ArrowUp className="size-3.5" />
        {count} new {count === 1 ? "update" : "updates"}
      </button>
    </div>
  );
}

// Green "Success" or the red failure cause, per the line's spec.
export function ResultBadge({ log }: { log: LineLog }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-1 text-xs font-semibold",
        log.ok ? "bg-brand-good/15 text-brand-good" : "bg-destructive/15 text-destructive",
      )}
    >
      {log.ok ? "Success" : log.cause}
    </span>
  );
}

export function ScansCount({ scans }: { scans: number }) {
  if (scans <= 1) return null;
  return (
    <span className="ml-1.5 rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground" title={`Scanned ${scans} times — latest shown`}>
      ×{scans}
    </span>
  );
}

export function ShowMore({ remaining, onClick, pageSize }: { remaining: number; onClick: () => void; pageSize: number }) {
  if (remaining <= 0) return null;
  return (
    <div className="flex justify-center pt-4">
      <Button variant="outline" size="sm" onClick={onClick}>
        Show {Math.min(pageSize, remaining)} more ({remaining.toLocaleString("en-GB")} remaining)
      </Button>
    </div>
  );
}

// Lighter variant for dense tables: a colored dot and plain text.
export function ResultText({ log }: { log: LineLog }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm whitespace-nowrap", log.ok ? "text-foreground" : "text-destructive")}>
      <span className={cn("size-1.5 shrink-0 rounded-full", log.ok ? "bg-brand-good" : "bg-destructive")} />
      {log.ok ? "Success" : log.cause}
    </span>
  );
}
