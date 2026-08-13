import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { TableLink } from "@/components/layout/table-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatTile } from "@/components/charts/stat-tile";
import { TrendLineChart } from "@/components/charts/trend-line-chart";
import { RankedBarChart } from "@/components/charts/ranked-bar-chart";
import { formatDate } from "@/lib/formatting/date";
import type { TestRecord } from "@/lib/xano/tests";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import type { ResultRecord } from "@/lib/xano/results";
import type { DashboardUserRecord } from "@/lib/xano/dashboard-user";
import {
  computeDailyScans,
  computeOverviewStats,
  summarizeTests,
  topTestersByKm,
} from "./compute";

const MAX_TESTS = 6;
const MAX_BRANDS = 5;

export function OverviewView({
  tests,
  testShoes,
  shoes,
  brands,
  results,
  brandAccounts,
}: {
  tests: TestRecord[];
  testShoes: TestShoeRecord[];
  shoes: ShoeRecord[];
  brands: ShoeBrandRecord[];
  results: ResultRecord[];
  brandAccounts: DashboardUserRecord[];
}) {
  const stats = computeOverviewStats(tests, testShoes, results, brandAccounts.length);
  const dailyScans = computeDailyScans(results);
  const testSummaries = summarizeTests(tests, testShoes, shoes, brands).slice(0, MAX_TESTS);
  const topTesters = topTestersByKm(shoes, results);
  const recentBrands = [...brandAccounts]
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, MAX_BRANDS);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="ADMIN CONSOLE"
        eyebrowTone="cyan"
        title="Platform overview"
        subtitle={`${stats.testsCount} test${stats.testsCount === 1 ? "" : "s"} · ${shoes.length} shoes tracked · ${stats.brandAccountsCount} brand accounts`}
      />

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Active tests" value={String(stats.testsCount)} index={0} />
        <StatTile label="Shoes assigned" value={String(stats.shoesAssignedCount)} index={1} />
        <StatTile label="Scans — last 30 days" value={String(stats.scansLast30d)} index={2} />
        <StatTile label="Active testers — last 30 days" value={String(stats.activeTestersLast30d)} index={3} />
        <StatTile label="Brand accounts" value={String(stats.brandAccountsCount)} index={4} />
      </div>

      <Panel title="Scan activity" subtitle="Scans recorded per day, last 30 days">
        <TrendLineChart
          categories={dailyScans.map((point) => point.label)}
          values={dailyScans.map((point) => point.count)}
        />
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="Tests" subtitle="Most active, by shoes assigned">
          {testSummaries.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-faint">No test created yet.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead className="text-right">Shoes</TableHead>
                    <TableHead className="text-right">Testers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testSummaries.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <TableLink href={`/admin/test-results?testId=${test.id}`}>
                          <span className="font-semibold">{test.name}</span>
                        </TableLink>
                      </TableCell>
                      <TableCell className="text-text-faint">{test.brandName}</TableCell>
                      <TableCell className="text-right tabular-nums">{test.shoesCount}</TableCell>
                      <TableCell className="text-right tabular-nums">{test.testersCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TableLink href="/admin/tests" tooltip="Manage tests">
                <span className="mt-3 inline-block text-xs">View all tests →</span>
              </TableLink>
            </>
          )}
        </Panel>

        <Panel title="Top testers" subtitle="Total distance covered, all-time">
          {topTesters.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-faint">No distance logged yet.</p>
          ) : (
            <RankedBarChart
              categories={topTesters.map((tester) => tester.label)}
              values={topTesters.map((tester) => Math.round(tester.km))}
              unit=" km"
            />
          )}
        </Panel>
      </div>

      <Panel title="Recent brand accounts" subtitle="Most recently created">
        {recentBrands.length === 0 ? (
          <p className="py-10 text-center text-sm text-text-faint">No brand account yet.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-semibold">
                      {brand.organization_name || brand.username}
                    </TableCell>
                    <TableCell className="text-text-faint">{brand.username}</TableCell>
                    <TableCell className="text-right text-text-faint">
                      {formatDate(brand.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TableLink href="/admin/clients" tooltip="Manage brand accounts">
              <span className="mt-3 inline-block text-xs">View all brands →</span>
            </TableLink>
          </>
        )}
      </Panel>
    </div>
  );
}
