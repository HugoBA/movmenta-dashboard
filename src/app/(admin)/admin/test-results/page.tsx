import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListTests, type TestRecord } from "@/lib/xano/tests";
import { safeListShoeBrands, type ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { safeListTestShoes, type TestShoeRecord } from "@/lib/xano/test-shoe";
import { safeListShoes, type ShoeRecord } from "@/lib/xano/shoes";
import { safeListResults } from "@/lib/xano/results";
import type { ResultRecord } from "@/lib/xano/results";
import { TestResultsView } from "@/features/test-results/test-results-view";
import { TestResultsEmptyState } from "@/features/test-results/test-results-empty-state";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string }>;
}) {
  const { testId } = await searchParams;

  return (
    <div>
      {!testId && (
        <PageHeader eyebrow="ADMIN CONSOLE / TEST RESULTS" eyebrowTone="cyan" title="Test results" />
      )}
      <Suspense fallback={<ContentLoader />}>
        <TestResultsContent testId={testId} />
      </Suspense>
    </div>
  );
}

async function TestResultsContent({ testId }: { testId?: string }) {
  const session = await getSession();

  const [
    { tests, error: testsError },
    { brands, error: brandsError },
    { testShoes, error: testShoesError },
    { shoes, error: shoesError },
    { results, error: resultsError },
  ] = session
    ? await Promise.all([
        safeListTests(session.token),
        safeListShoeBrands(session.token),
        safeListTestShoes(session.token),
        safeListShoes(session.token),
        safeListResults(session.token, {}),
      ])
    : [
        { tests: [] as TestRecord[], error: null as string | null },
        { brands: [] as ShoeBrandRecord[], error: null as string | null },
        { testShoes: [] as TestShoeRecord[], error: null as string | null },
        { shoes: [] as ShoeRecord[], error: null as string | null },
        { results: [] as ResultRecord[], error: null as string | null },
      ];

  const error = testsError ?? brandsError ?? testShoesError ?? shoesError ?? resultsError;

  if (!testId) {
    const brandNameById = new Map(brands.map((brand) => [brand.id, brand.brand_name]));
    const searchableTests = tests.map((test) => ({
      id: test.id,
      name: test.name,
      brandName: brandNameById.get(test.brand_id) ?? "—",
    }));

    return <TestResultsEmptyState tests={searchableTests} error={error} />;
  }

  if (error) {
    return (
      <div>
        <PageHeader eyebrow="ADMIN CONSOLE / TEST RESULTS" eyebrowTone="cyan" title="Test results" />
        <Panel title="Test results">
          <p className="text-sm text-destructive">Couldn&apos;t load results from Xano: {error}</p>
        </Panel>
      </div>
    );
  }

  const test = tests.find((t) => t.id === Number(testId));
  if (!test) {
    return (
      <div>
        <PageHeader eyebrow="ADMIN CONSOLE / TEST RESULTS" eyebrowTone="cyan" title="Test not found" />
        <Panel title="Test not found">
          <p className="text-sm text-text-faint">No test with id {testId}. It may have been deleted.</p>
        </Panel>
      </div>
    );
  }

  return (
    <TestResultsView test={test} brands={brands} testShoes={testShoes} shoes={shoes} results={results} />
  );
}
