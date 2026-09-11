import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { TestResultsView } from "@/features/test-results/test-results-view";
import { TestResultsEmptyState } from "@/features/test-results/test-results-empty-state";
import { getSession } from "@/lib/auth/session";
import { loadClientData, type ClientData } from "@/lib/client-data";

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
      {!testId && <PageHeader eyebrow={`${orgName} / TEST RESULTS`} eyebrowTone="cyan" title="Test results" />}
      <TestResultsContent data={data} testId={testId} orgName={orgName} />
    </div>
  );
}

function TestResultsContent({
  data,
  testId,
  orgName,
}: {
  data: ClientData;
  testId?: string;
  orgName: string;
}) {
  const { tests, shoes, testShoes, results, profiles, brands, error, isDemo } = data;

  if (!testId) {
    const brandNameById = new Map(brands.map((brand) => [brand.id, brand.brand_name]));
    const searchableTests = tests.map((test) => ({
      id: test.id,
      name: test.name,
      brandName: brandNameById.get(test.brand_id) ?? "—",
    }));

    return <TestResultsEmptyState tests={searchableTests} error={error} basePath="/client" />;
  }

  if (error) {
    return (
      <div>
        <PageHeader eyebrow={`${orgName} / TEST RESULTS`} eyebrowTone="cyan" title="Test results" />
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
        <PageHeader eyebrow={`${orgName} / TEST RESULTS`} eyebrowTone="cyan" title="Test not found" />
        <Panel title="Test not found">
          <p className="text-sm text-text-faint">No test with id {testId}. It may have been deleted.</p>
        </Panel>
      </div>
    );
  }

  const profileByIdNfc = new Map(profiles.map((p) => [p.id_nfc, { weight: p.weight, gender: p.gender }]));

  return (
    <TestResultsView
      test={test}
      brands={brands}
      testShoes={testShoes}
      shoes={shoes}
      results={results}
      basePath="/client"
      profileByIdNfc={profileByIdNfc}
      orgName={orgName}
      showTemperaturePanel={isDemo}
    />
  );
}
