"use client";

import { useState } from "react";
import { Cloud, CloudRain, Sun, Wind, Mountain, Route as RouteIcon } from "lucide-react";
import { Panel } from "@/components/layout/panel";
import { StatTile } from "@/components/charts/stat-tile";
import { RouteChart } from "@/components/charts/route-chart";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { categorical } from "@/components/charts/palette";
import { formatShortDate } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import { cn } from "@/lib/utils";
import type { WearSession } from "./wear-sessions";
import type { RunDetails, RunWeather, WeatherCondition } from "./run-details";

const weatherIcon: Record<WeatherCondition, typeof Sun> = {
  Sunny: Sun,
  Clear: Sun,
  Cloudy: Cloud,
  Windy: Wind,
  Rainy: CloudRain,
};

function WeatherTile({ weather, index }: { weather: RunWeather; index: number }) {
  const Icon = weatherIcon[weather.condition];
  return (
    <div
      className="animate-rise relative overflow-hidden rounded-2xl border border-border-soft bg-card p-5"
      style={{ animationDelay: `${0.05 + index * 0.1}s` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)" }}
      />
      <p className="text-sm font-medium text-muted-foreground">Weather</p>
      <div className="mt-3 flex items-center gap-4">
        <Icon className="size-7 shrink-0 text-primary" />
        <p className="font-heading text-[34px] font-semibold tracking-tight">
          {weather.tempC}
          <span className="ml-1 text-base font-medium text-text-faint">°C</span>
        </p>
      </div>
    </div>
  );
}

// Tailwind needs the full class names to appear literally for the compiler
// to keep them — can't interpolate `sm:grid-cols-${n}`.
const statGridCols: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
};

export function RunsPanel({
  sessions,
  runDetailsByPostId,
}: {
  sessions: WearSession[];
  runDetailsByPostId: Map<number, RunDetails>;
}) {
  // A run only needs its pre+post pair to show up — GPS route, elevation and
  // weather are extra and simply omitted when the underlying data isn't there.
  const runs = [...sessions]
    .sort((a, b) => b.date - a.date)
    .map((session) => ({ session, details: runDetailsByPostId.get(session.post.id) }));

  const [selectedId, setSelectedId] = useState<number | null>(runs[0]?.session.post.id ?? null);
  const selected = runs.find((r) => r.session.post.id === selectedId) ?? runs[0] ?? null;

  if (runs.length === 0) {
    return (
      <Panel title="Runs">
        <p className="text-sm text-text-faint">No wear sessions recorded yet.</p>
      </Panel>
    );
  }

  const hasElevationGain = selected?.details?.elevationGainM != null;
  const hasWeather = !!selected?.details?.weather;
  const hasElevationProfile = !!selected?.details?.elevationProfile?.length;
  const hasRoute = !!selected?.details?.routePoints?.length;
  const statTileCount = 2 + (hasElevationGain ? 1 : 0) + (hasWeather ? 1 : 0);

  return (
    <Panel title="Runs" subtitle={`${runs.length} run${runs.length === 1 ? "" : "s"} recorded`}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <div className="flex max-h-[440px] flex-col gap-1 overflow-y-auto pr-1">
          {runs.map(({ session, details }) => {
            const Icon = details?.weather ? weatherIcon[details.weather.condition] : null;
            const isActive = session.post.id === selected?.session.post.id;
            return (
              <button
                key={session.post.id}
                type="button"
                onClick={() => setSelectedId(session.post.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  isActive ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-card",
                )}
              >
                <div className="min-w-0">
                  <div className="font-medium">{formatShortDate(session.date)}</div>
                  <div className="truncate text-xs text-text-faint">
                    {session.post.km.toFixed(1)} km · {formatDurationMinutes(session.post.duration)}
                  </div>
                </div>
                {Icon && <Icon className="size-4 shrink-0 opacity-70" />}
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="flex flex-col gap-4">
            <div className={cn("grid grid-cols-2 gap-3", statGridCols[statTileCount])}>
              <StatTile label="Distance" value={selected.session.post.km.toFixed(1)} unit="km" index={0} />
              <StatTile
                label="Duration"
                value={formatDurationMinutes(selected.session.post.duration)}
                index={1}
              />
              {hasElevationGain && (
                <StatTile
                  label="Elevation gain"
                  value={String(selected.details!.elevationGainM)}
                  unit="m"
                  index={2}
                />
              )}
              {selected.details?.weather && <WeatherTile weather={selected.details.weather} index={3} />}
            </div>

            {(hasElevationProfile || hasRoute) && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {hasElevationProfile && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <Mountain className="size-3.5 opacity-70" />
                      Elevation profile
                    </div>
                    <TrendLineChart
                      categories={selected.details!.elevationProfile!.map((p) => p.distanceKm.toFixed(2))}
                      values={selected.details!.elevationProfile!.map((p) => p.elevationM)}
                      unit=" m"
                      color={categorical[2]}
                      height={220}
                      smooth
                    />
                  </div>
                )}

                {hasRoute && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                      <RouteIcon className="size-3.5 opacity-70" />
                      Route
                    </div>
                    <RouteChart points={selected.details!.routePoints!} />
                    <div className="mt-1.5 flex justify-end">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Strava's brand
                          guidelines require this exact asset file, not a re-optimized copy */}
                      <img
                        src="/strava/powered-by-strava-white.svg"
                        alt="Powered by Strava"
                        className="h-4 w-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}
