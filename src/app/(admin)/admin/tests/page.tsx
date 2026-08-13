import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListTests, type TestRecord } from "@/lib/xano/tests";
import { safeListShoeBrands, type ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { safeListTestShoes, type TestShoeRecord } from "@/lib/xano/test-shoe";
import { safeListShoes, type ShoeRecord } from "@/lib/xano/shoes";
import { safeListSensorRefs, type SensorRefRecord } from "@/lib/xano/sensor-refs";
import { safeListShoeModels, type ShoeModelRecord } from "@/lib/xano/shoe-models";
import { TestsExplorer } from "@/features/tests/tests-explorer";
import { TestDetail } from "@/features/tests/test-detail";
import type { AssignedShoeRow } from "@/features/tests/assigned-shoes-table";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string }>;
}) {
  const { testId } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / TESTS"
        eyebrowTone="cyan"
        title="Tests"
        subtitle="Manage shoe-test phases and their assigned shoes"
      />
      <Suspense fallback={<ContentLoader />}>
        <TestsContent testId={testId} />
      </Suspense>
    </div>
  );
}

async function TestsContent({ testId }: { testId?: string }) {
  const session = await getSession();

  const [
    { tests, error: testsError },
    { brands, error: brandsError },
    { testShoes, error: testShoesError },
    { shoes, error: shoesError },
    { sensorRefs, error: sensorRefsError },
    { shoeModels, error: shoeModelsError },
  ] = session
    ? await Promise.all([
        safeListTests(session.token),
        safeListShoeBrands(session.token),
        safeListTestShoes(session.token),
        safeListShoes(session.token),
        safeListSensorRefs(session.token),
        safeListShoeModels(session.token),
      ])
    : [
        { tests: [] as TestRecord[], error: null as string | null },
        { brands: [] as ShoeBrandRecord[], error: null as string | null },
        { testShoes: [] as TestShoeRecord[], error: null as string | null },
        { shoes: [] as ShoeRecord[], error: null as string | null },
        { sensorRefs: [] as SensorRefRecord[], error: null as string | null },
        { shoeModels: [] as ShoeModelRecord[], error: null as string | null },
      ];

  const error =
    testsError ?? brandsError ?? testShoesError ?? shoesError ?? sensorRefsError ?? shoeModelsError;
  const modelNames = [...new Set(shoeModels.map((shoeModel) => shoeModel.model))].sort();

  if (error) {
    return (
      <Panel title="Tests">
        <p className="text-sm text-destructive">Couldn&apos;t load tests from Xano: {error}</p>
      </Panel>
    );
  }

  if (testId) {
    const test = tests.find((t) => t.id === Number(testId));

    if (!test) {
      return (
        <Panel title="Test not found">
          <p className="text-sm text-text-faint">
            No test with id {testId}. It may have been deleted.
          </p>
        </Panel>
      );
    }

    const shoeById = new Map(shoes.map((shoe) => [shoe.id, shoe]));
    const assignedShoes: AssignedShoeRow[] = testShoes
      .filter((row) => row.test_id === test.id)
      .map((row) => {
        const shoe = shoeById.get(row.shoe_id);
        return shoe ? { testShoeId: row.id, shoe } : null;
      })
      .filter((row): row is AssignedShoeRow => row !== null);

    const assignedShoeIds = new Set(assignedShoes.map((row) => row.shoe.id));
    const availableShoes = shoes.filter((shoe) => !assignedShoeIds.has(shoe.id));

    return (
      <TestDetail
        test={test}
        brands={brands}
        assignedShoes={assignedShoes}
        availableShoes={availableShoes}
        sensorRefs={sensorRefs}
        modelNames={modelNames}
      />
    );
  }

  const shoeCounts: Record<number, number> = {};
  for (const row of testShoes) {
    shoeCounts[row.test_id] = (shoeCounts[row.test_id] ?? 0) + 1;
  }

  return <TestsExplorer data={tests} brands={brands} shoeCounts={shoeCounts} />;
}
