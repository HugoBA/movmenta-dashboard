import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { TestsExplorer } from "@/features/tests/tests-explorer";
import { TestDetail } from "@/features/tests/test-detail";
import type { AssignedShoeRow } from "@/features/tests/assigned-shoes-table";
import { getSession } from "@/lib/auth/session";
import { loadClientData, type ClientData } from "@/lib/client-data";
import { safeListClientTestShoes } from "@/lib/xano/test-shoe";
import type { Session } from "@/types/auth";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string }>;
}) {
  const { testId } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const orgName = session.user.brandName ?? "Enterprise";
  const data = await loadClientData(session);

  return (
    <div>
      <PageHeader
        eyebrow={orgName}
        eyebrowTone="cyan"
        title="Tests"
        subtitle="Manage shoe-test phases and their assigned shoes"
      />
      <TestsContent session={session} data={data} testId={testId} />
    </div>
  );
}

async function TestsContent({
  session,
  data,
  testId,
}: {
  session: Session;
  data: ClientData;
  testId?: string;
}) {
  const { tests, shoes, testShoes, brands, error } = data;

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
          <p className="text-sm text-text-faint">No test with id {testId}. It may have been deleted.</p>
        </Panel>
      );
    }

    // The bulk (unfiltered) /client/test_shoe fetched in loadClientData is
    // only reliable for cross-test aggregates (the shoeCounts below) — this
    // endpoint needs an explicit test_id to actually scope/return a given
    // test's assigned shoes.
    const { testShoes: assignedTestShoes, error: testShoesError } = await safeListClientTestShoes(
      session.token,
      { testId: test.id },
    );

    if (testShoesError) {
      return (
        <Panel title="Test not found">
          <p className="text-sm text-destructive">
            Couldn&apos;t load assigned shoes from Xano: {testShoesError}
          </p>
        </Panel>
      );
    }

    const shoeById = new Map(shoes.map((shoe) => [shoe.id, shoe]));
    const assignedShoes: AssignedShoeRow[] = assignedTestShoes
      .map((row) => {
        const shoe = shoeById.get(row.shoe_id);
        return shoe ? { testShoeId: row.id, shoe } : null;
      })
      .filter((row): row is AssignedShoeRow => row !== null);

    return (
      <TestDetail
        test={test}
        brands={brands}
        assignedShoes={assignedShoes}
        availableShoes={[]}
        sensorRefs={[]}
        modelNames={[]}
        basePath="/client"
        isAdmin={false}
      />
    );
  }

  const shoeCounts: Record<number, number> = {};
  for (const row of testShoes) {
    shoeCounts[row.test_id] = (shoeCounts[row.test_id] ?? 0) + 1;
  }

  return <TestsExplorer data={tests} brands={brands} shoeCounts={shoeCounts} basePath="/client" isAdmin={false} />;
}
