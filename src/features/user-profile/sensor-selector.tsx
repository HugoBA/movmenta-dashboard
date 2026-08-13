"use client";

import Link from "next/link";
import { ChevronDown, Nfc } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDate } from "@/lib/formatting/date";
import { cn } from "@/lib/utils";

export interface SensorOption {
  idNfc: string;
  createdAt: number;
  resultCount?: number;
}

export function SensorSelector({
  sensors,
  activeIdNfc,
}: {
  sensors: SensorOption[];
  activeIdNfc: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[10px] border border-border bg-card px-4 py-2.5 font-mono text-xs text-muted-foreground transition-colors hover:border-white/16 hover:text-foreground"
        >
          <Nfc className="size-3.5" />
          {activeIdNfc}
          {sensors.length > 1 && <ChevronDown className="size-3.5" />}
        </button>
      </PopoverTrigger>
      {sensors.length > 1 && (
        <PopoverContent align="end" className="w-72 gap-0 p-0 overflow-hidden">
          {sensors.map((sensor) => {
            const isActive = sensor.idNfc === activeIdNfc;
            return (
              <Link
                key={sensor.idNfc}
                href={`/admin/user?nfcId=${encodeURIComponent(sensor.idNfc)}`}
                className={cn(
                  "flex items-center justify-between gap-3 border-b border-border-soft px-3.5 py-2.5 last:border-none hover:bg-white/[0.03]",
                  isActive && "bg-brand-cyan/12",
                )}
              >
                <div>
                  <div className="font-mono text-[11.5px] font-semibold">{sensor.idNfc}</div>
                  <div className="mt-0.5 text-[10.5px] text-text-faint">
                    Created {formatDate(sensor.createdAt)}
                    {sensor.resultCount !== undefined ? ` · ${sensor.resultCount} scans` : ""}
                  </div>
                </div>
                {isActive && <span className="size-1.5 shrink-0 rounded-full bg-brand-cyan" />}
              </Link>
            );
          })}
        </PopoverContent>
      )}
    </Popover>
  );
}
