import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StatTile } from "@/components/charts/stat-tile";
import { BaselineDeviationChart } from "@/components/charts/baseline-deviation-chart";
import { GroupedBarChart } from "@/components/charts/grouped-bar-chart";
import { formatDate, formatShortDate, formatTime } from "@/lib/formatting/date";
import { formatDurationMinutes } from "@/lib/formatting/duration";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";
import type { ResultRecord } from "@/lib/xano/results";
import type { ShoeRecord } from "@/lib/xano/shoes";
import { SensorSelector, type SensorOption } from "./sensor-selector";
import { CharacteristicsPanel } from "./characteristics-panel";
import { ErrorsPanel } from "./errors-panel";
import { RawResultsPanel } from "./raw-results-panel";
import { RawValueTrendPanel } from "./raw-value-trend-panel";
import { computeWearSessions } from "./wear-sessions";

const conditionDeltaTone = { good: "up", ok: "neutral", warn: "warn", critical: "down" } as const;

export function UserProfileView({
  profile,
  results,
  shoe,
  siblings,
  nfcId,
}: {
  profile: UserProfileRecord;
  results: ResultRecord[];
  shoe: ShoeRecord | undefined;
  siblings: UserProfileRecord[];
  nfcId: string;
}) {
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || nfcId;
  const hasResults = results.length > 0;
  const chronological = [...results].sort((a, b) => a.created_at - b.created_at);
  const lastScan = hasResults ? chronological[chronological.length - 1] : null;
  const sessions = computeWearSessions(results);

  const totalDistanceKm = results.reduce((sum, row) => sum + row.km, 0);
  const totalDurationMin = results.reduce((sum, row) => sum + row.duration, 0);
  const avgKmPerSession = sessions.length > 0 ? totalDistanceKm / sessions.length : null;

  const condition = lastScan
    ? (() => {
        const pct = Math.round(lastScan.percent);
        const tone =
          pct >= 90
            ? ("good" as const)
            : pct >= 70
              ? ("ok" as const)
              : pct >= 40
                ? ("warn" as const)
                : ("critical" as const);
        const label = pct >= 90 ? "Like new" : pct >= 70 ? "Worn" : pct >= 40 ? "Heavily worn" : "Needs replacing";
        return { pct, tone, label };
      })()
    : null;

  const deviations = shoe
    ? chronological.map((row) => ({
        label: formatShortDate(row.created_at),
        delta: row.value - shoe.factory_value,
      }))
    : [];
  const minDelta = deviations.length ? Math.min(...deviations.map((d) => d.delta)) : null;
  const lastDelta = deviations.length ? deviations[deviations.length - 1].delta : null;

  const sensorOptions: SensorOption[] = [
    { idNfc: profile.id_nfc, createdAt: profile.created_at, resultCount: profile.result_count },
    ...siblings.map((s) => ({ idNfc: s.id_nfc, createdAt: s.created_at, resultCount: s.result_count })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / USERS"
        eyebrowTone="cyan"
        title={displayName}
        subtitle={`Profile created ${formatDate(profile.created_at)}${profile.email ? ` · ${profile.email}` : ""}`}
        controls={<SensorSelector sensors={sensorOptions} activeIdNfc={nfcId} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <StatTile
          label="Total scans"
          value={String(results.length)}
          delta={
            hasResults
              ? {
                  tone: "neutral",
                  value: `${formatShortDate(chronological[0].created_at)} → ${formatShortDate(chronological[chronological.length - 1].created_at)}`,
                }
              : undefined
          }
          index={0}
        />
        <StatTile
          label="Complete sessions"
          value={String(sessions.length)}
          delta={{ tone: "neutral", value: "pre+post paired" }}
          index={1}
        />
        <StatTile
          label="Total distance"
          value={totalDistanceKm.toFixed(0)}
          unit="km"
          delta={{ tone: "neutral", value: "cumulative" }}
          index={2}
        />
        <StatTile
          label="Total duration"
          value={formatDurationMinutes(totalDurationMin)}
          delta={{ tone: "neutral", value: "cumulative" }}
          index={3}
        />
        <StatTile
          label="Avg km / session"
          value={avgKmPerSession !== null ? avgKmPerSession.toFixed(1) : "—"}
          unit={avgKmPerSession !== null ? "km" : undefined}
          index={4}
        />
        <StatTile
          label="Current condition"
          value={condition ? `${condition.pct}%` : "—"}
          delta={
            condition
              ? { tone: conditionDeltaTone[condition.tone], value: condition.label }
              : { tone: "neutral", value: "No scans" }
          }
          index={5}
        />
        <StatTile
          label="Last scan"
          value={lastScan ? formatShortDate(lastScan.created_at) : "—"}
          delta={lastScan ? { tone: "neutral", value: formatTime(lastScan.created_at) } : undefined}
          index={6}
        />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-4">
          <RawValueTrendPanel chronological={chronological} />

          <RawResultsPanel results={results} idNfc={nfcId} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2fr]">
            <Panel
              title="Vs factory value"
              subtitle={shoe ? `Baseline = ${shoe.factory_value} (factory value)` : "No factory value on record"}
            >
              {shoe && deviations.length > 0 ? (
                <>
                  <BaselineDeviationChart
                    categories={deviations.map((d) => d.label)}
                    values={deviations.map((d) => d.delta)}
                    baselineLabel={`${shoe.factory_value} · factory`}
                    height={200}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-3.5 text-[11px] text-text-faint">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#3987e5]" />
                      Below factory value
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#e66767]" />
                      Above
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-text-faint">
                    Largest gap: {minDelta} · last scan: {lastDelta! > 0 ? `+${lastDelta}` : lastDelta}
                  </p>
                </>
              ) : (
                <p className="py-10 text-center text-[13px] text-text-faint">
                  {shoe
                    ? "No scans for this sensor."
                    : "This sensor has no shoe record (factory value) on file."}
                </p>
              )}
            </Panel>

            <Panel
              title="Pre / post comparison by session"
              subtitle={`${sessions.length} session${sessions.length === 1 ? "" : "s"} paired same-day`}
            >
              {sessions.length > 0 ? (
                <GroupedBarChart
                  categories={sessions.map((s) => formatShortDate(s.date))}
                  series={[
                    { name: "Pre", data: sessions.map((s) => s.pre.value) },
                    { name: "Post", data: sessions.map((s) => s.post.value) },
                  ]}
                  height={200}
                />
              ) : (
                <p className="py-10 text-center text-[13px] text-text-faint">
                  No complete pre/post session yet.
                </p>
              )}
            </Panel>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CharacteristicsPanel profile={profile} />
          <ErrorsPanel />
        </div>
      </div>
    </div>
  );
}
