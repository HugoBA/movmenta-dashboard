import Link from "next/link";
import { ArrowLeft, Award, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StatTile } from "@/components/charts/stat-tile";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import { BaselineDeviationChart } from "@/components/charts/baseline-deviation-chart";
import { ScatterTrendChart } from "@/components/charts/scatter-trend-chart";
import { categorical } from "@/components/charts/palette";
import { formatDate } from "@/lib/formatting/date";
import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import {
  buildTestersForTest,
  computeSessionTempPoints,
  computeTestResultsStats,
  computeWearRatePerTester,
  testerAvgDelta,
  testerTotalKm,
} from "./compute";
import { PrePostChart } from "./pre-post-chart";
import { LeaderCard } from "./leader-card";
import { TestRawResultsPanel } from "./test-raw-results-panel";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { ResultRecord } from "@/lib/xano/results";

const MAX_RANKED = 15;

export function TestResultsView({
  test,
  brands,
  testShoes,
  shoes,
  results,
  basePath = "/admin",
  profileByIdNfc,
  orgName = "MYBRAND",
  showTemperaturePanel = false,
}: {
  test: TestRecord;
  brands: ShoeBrandRecord[];
  testShoes: TestShoeRecord[];
  shoes: ShoeRecord[];
  results: ResultRecord[];
  basePath?: string;
  // Simulation-only insight (weight isn't tracked per real tester yet) —
  // omitted entirely when the caller has no way to compute it.
  profileByIdNfc?: Map<string, { weight: number; gender: string }>;
  orgName?: string;
  // `result.temp` isn't ambient temperature on real data (confirmed) — this
  // stays off by default everywhere until a real ambient-temp field exists,
  // and only the MYBRAND demo turns it on.
  showTemperaturePanel?: boolean;
}) {
  const percentOnly = basePath !== "/admin";
  const metric = percentOnly ? "percent" : "value";
  const brandName =
    brands.find((brand) => brand.id === test.brand_id)?.brand_name ?? "—";
  const testers = buildTestersForTest(test.id, testShoes, shoes, results);
  const shoesAssigned = testShoes.filter(
    (row) => row.test_id === test.id,
  ).length;
  const stats = computeTestResultsStats(testers);

  const rankedByKm = testers
    .map((tester) => ({ label: tester.label, km: testerTotalKm(tester) }))
    .filter((row) => row.km > 0)
    .sort((a, b) => b.km - a.km)
    .slice(0, MAX_RANKED);

  const wearRateByTester = profileByIdNfc
    ? computeWearRatePerTester(testers, profileByIdNfc)
    : null;
  const sessionTempPoints = showTemperaturePanel ? computeSessionTempPoints(testers) : [];

  const deviationByTester = testers
    .map((tester) => ({
      label: tester.label,
      delta: testerAvgDelta(tester, metric),
    }))
    .filter(
      (row): row is { label: string; delta: number } => row.delta !== null,
    )
    .sort((a, b) => b.delta - a.delta)
    .slice(0, MAX_RANKED);

  return (
    <div className="space-y-6">
      <Link
        href={`${basePath}/tests?testId=${test.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-faint hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to {test.name}
      </Link>

      <PageHeader
        eyebrow={
          basePath === "/admin"
            ? "ADMIN CONSOLE / TEST RESULTS"
            : `${orgName} / TEST RESULTS`
        }
        eyebrowTone="cyan"
        title={test.name}
        subtitle={`${brandName} — created ${formatDate(test.created_at)}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Shoes assigned"
          value={String(shoesAssigned)}
          index={0}
        />
        <StatTile
          label="Total scans"
          value={String(stats.totalScans)}
          index={1}
        />
        <StatTile
          label="Sessions logged"
          value={String(stats.totalSessions)}
          index={2}
        />
        <StatTile
          label="Total distance"
          value={stats.totalKm.toFixed(0)}
          unit="km"
          index={3}
        />
      </div>

      <Panel
        title="Wear by tester"
        subtitle="By distance covered — click a name to isolate a tester"
      >
        <PrePostChart testers={testers} />
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel
          title="Km level of testers"
          subtitle="Total distance covered, per tester"
        >
          {rankedByKm.length > 0 ? (
            <RankedBarChart
              categories={rankedByKm.map((row) => row.label)}
              values={rankedByKm.map((row) => Math.round(row.km))}
              unit=" km"
            />
          ) : (
            <p className="py-10 text-center text-sm text-text-faint">
              No distance logged yet.
            </p>
          )}
        </Panel>

        {showTemperaturePanel && (
          <Panel
            title="Wear rate vs temperature"
            subtitle="% lost per 10km, by session — against the ambient temperature during that run"
          >
            {sessionTempPoints.length > 5 ? (
              <ScatterTrendChart
                xLabel="Ambient temperature during run"
                xUnit="°C"
                yLabel="Wear rate"
                yUnit=" %/10km"
                groups={[
                  {
                    key: "Sessions",
                    color: categorical[1],
                    points: sessionTempPoints,
                  },
                ]}
              />
            ) : (
              <p className="py-10 text-center text-sm text-text-faint">
                Not enough sessions logged yet.
              </p>
            )}
          </Panel>
        )}

        <Panel
          title="Wear delta by tester"
          subtitle={
            wearRateByTester
              ? "Average % lost per 10km — heaviest tester first"
              : `Average post − pre ${percentOnly ? "wear %" : "value"} per tester`
          }
        >
          {wearRateByTester ? (
            wearRateByTester.length > 0 ? (
              <BaselineDeviationChart
                categories={wearRateByTester.map(
                  (row) => `${row.label}\n${row.weight} kg`,
                )}
                values={wearRateByTester.map((row) => row.wearLostPer10km)}
                baselineLabel="No change"
                unit=" %/10km"
              />
            ) : (
              <p className="py-10 text-center text-sm text-text-faint">
                Not enough distance logged yet for a stable rate.
              </p>
            )
          ) : deviationByTester.length > 0 ? (
            <BaselineDeviationChart
              categories={deviationByTester.map((row) => row.label)}
              values={deviationByTester.map(
                (row) => Math.round(row.delta * 10) / 10,
              )}
              baselineLabel="No change"
            />
          ) : (
            <p className="py-10 text-center text-sm text-text-faint">
              No complete pre/post session yet.
            </p>
          )}
        </Panel>
      </div>

      <Panel
        title="Tester performance"
        subtitle="Active testers and this week's top performances"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile
            label="Active testers"
            value={String(stats.activeTesters)}
            unit={`/ ${stats.totalTesters}`}
            delta={{ tone: "neutral", value: "at least 1 session logged" }}
          />
          <LeaderCard
            icon={<Trophy />}
            label="Biggest session — last 7 days"
            highlight={stats.biggestSessionLastWeek}
            index={0}
            basePath={basePath}
          />
          <LeaderCard
            icon={<Award />}
            label="Most km — last 7 days"
            highlight={stats.mostKmLastWeek}
            index={1}
            basePath={basePath}
          />
        </div>
      </Panel>

      <TestRawResultsPanel
        testers={testers}
        basePath={basePath}
        percentOnly={percentOnly}
      />
    </div>
  );
}
