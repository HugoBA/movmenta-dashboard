import Link from "next/link";
import { ArrowLeft, Award, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { StatTile } from "@/components/charts/stat-tile";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import { BaselineDeviationChart } from "@/components/charts/baseline-deviation-chart";
import { formatDate } from "@/lib/formatting/date";
import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import {
  buildTestersForTest,
  computeTestResultsStats,
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
}: {
  test: TestRecord;
  brands: ShoeBrandRecord[];
  testShoes: TestShoeRecord[];
  shoes: ShoeRecord[];
  results: ResultRecord[];
}) {
  const brandName = brands.find((brand) => brand.id === test.brand_id)?.brand_name ?? "—";
  const testers = buildTestersForTest(test.id, testShoes, shoes, results);
  const shoesAssigned = testShoes.filter((row) => row.test_id === test.id).length;
  const stats = computeTestResultsStats(testers);

  const rankedByKm = testers
    .map((tester) => ({ label: tester.label, km: testerTotalKm(tester) }))
    .filter((row) => row.km > 0)
    .sort((a, b) => b.km - a.km)
    .slice(0, MAX_RANKED);

  const deviationByTester = testers
    .map((tester) => ({ label: tester.label, delta: testerAvgDelta(tester) }))
    .filter((row): row is { label: string; delta: number } => row.delta !== null)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, MAX_RANKED);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/tests?testId=${test.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-faint hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to {test.name}
      </Link>

      <PageHeader
        eyebrow="ADMIN CONSOLE / TEST RESULTS"
        eyebrowTone="cyan"
        title={test.name}
        subtitle={`${brandName} — created ${formatDate(test.created_at)}`}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Shoes assigned" value={String(shoesAssigned)} index={0} />
        <StatTile label="Total scans" value={String(stats.totalScans)} index={1} />
        <StatTile label="Sessions logged" value={String(stats.totalSessions)} index={2} />
        <StatTile label="Total distance" value={stats.totalKm.toFixed(0)} unit="km" index={3} />
        <StatTile
          label="Avg Δ (post − pre)"
          value={
            stats.avgDeltaValue !== null
              ? `${stats.avgDeltaValue >= 0 ? "+" : ""}${stats.avgDeltaValue.toFixed(1)}`
              : "—"
          }
          index={4}
        />
      </div>

      <Panel title="Pre values by tester" subtitle="Click a line to isolate a tester, by scan number">
        <PrePostChart testers={testers} />
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Km level of testers" subtitle="Total distance covered, per tester">
          {rankedByKm.length > 0 ? (
            <RankedBarChart
              categories={rankedByKm.map((row) => row.label)}
              values={rankedByKm.map((row) => Math.round(row.km))}
              unit=" km"
            />
          ) : (
            <p className="py-10 text-center text-sm text-text-faint">No distance logged yet.</p>
          )}
        </Panel>

        <Panel title="Wear delta by tester" subtitle="Average post − pre value per tester">
          {deviationByTester.length > 0 ? (
            <BaselineDeviationChart
              categories={deviationByTester.map((row) => row.label)}
              values={deviationByTester.map((row) => Math.round(row.delta * 10) / 10)}
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
          />
          <LeaderCard
            icon={<Award />}
            label="Most km — last 7 days"
            highlight={stats.mostKmLastWeek}
            index={1}
          />
        </div>
      </Panel>

      <TestRawResultsPanel testers={testers} />
    </div>
  );
}
