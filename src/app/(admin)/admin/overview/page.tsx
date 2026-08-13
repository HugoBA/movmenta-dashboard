import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getSession } from "@/lib/auth/session";
import { safeListTests, type TestRecord } from "@/lib/xano/tests";
import { safeListTestShoes, type TestShoeRecord } from "@/lib/xano/test-shoe";
import { safeListShoes, type ShoeRecord } from "@/lib/xano/shoes";
import { safeListShoeBrands, type ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { safeListResults } from "@/lib/xano/results";
import type { ResultRecord } from "@/lib/xano/results";
import { safeListDashboardUsers, type DashboardUserRecord } from "@/lib/xano/dashboard-user";
import { OverviewView } from "@/features/overview/overview-view";

export default async function Page() {
  const session = await getSession();

  const [
    { tests, error: testsError },
    { testShoes, error: testShoesError },
    { shoes, error: shoesError },
    { brands, error: brandsError },
    { results, error: resultsError },
    { users, error: usersError },
  ] = session
    ? await Promise.all([
        safeListTests(session.token),
        safeListTestShoes(session.token),
        safeListShoes(session.token),
        safeListShoeBrands(session.token),
        safeListResults(session.token, {}),
        safeListDashboardUsers(session.token),
      ])
    : [
        { tests: [] as TestRecord[], error: null as string | null },
        { testShoes: [] as TestShoeRecord[], error: null as string | null },
        { shoes: [] as ShoeRecord[], error: null as string | null },
        { brands: [] as ShoeBrandRecord[], error: null as string | null },
        { results: [] as ResultRecord[], error: null as string | null },
        { users: [] as DashboardUserRecord[], error: null as string | null },
      ];

  const error = testsError ?? testShoesError ?? shoesError ?? brandsError ?? resultsError ?? usersError;

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="ADMIN CONSOLE" eyebrowTone="cyan" title="Platform overview" />
        <Panel title="Platform overview">
          <p className="text-sm text-destructive">Couldn&apos;t load data from Xano: {error}</p>
        </Panel>
      </div>
    );
  }

  const brandAccounts = users.filter((user) => user.role === "user");

  return (
    <OverviewView
      tests={tests}
      testShoes={testShoes}
      shoes={shoes}
      brands={brands}
      results={results}
      brandAccounts={brandAccounts}
    />
  );
}
