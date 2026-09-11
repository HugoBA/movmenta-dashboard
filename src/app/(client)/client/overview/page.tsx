import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { OverviewView } from "@/features/overview/overview-view";
import { buildTestersForTest, computeWeightWearPoints } from "@/features/test-results/compute";
import { getSession } from "@/lib/auth/session";
import { loadClientData } from "@/lib/client-data";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/login");

  const { tests, shoes, testShoes, results, profiles, brands, error } = await loadClientData(session);
  const orgName = session.user.brandName ?? "Enterprise";

  if (error) {
    return (
      <div>
        <PageHeader eyebrow={orgName} eyebrowTone="cyan" title="Overview" />
        <Panel title="Overview">
          <p className="text-sm text-destructive">Couldn&apos;t load data from Xano: {error}</p>
        </Panel>
      </div>
    );
  }

  const profileByIdNfc = new Map(profiles.map((p) => [p.id_nfc, { weight: p.weight, gender: p.gender }]));
  const allTesters = tests.flatMap((test) => buildTestersForTest(test.id, testShoes, shoes, results));
  const weightWearPoints = computeWeightWearPoints(allTesters, profileByIdNfc);

  return (
    <div>
      <PageHeader eyebrow={orgName} eyebrowTone="cyan" title="Overview" />
      <OverviewView
        tests={tests}
        testShoes={testShoes}
        shoes={shoes}
        brands={brands}
        results={results}
        brandAccounts={[]}
        basePath="/client"
        weightWearPoints={weightWearPoints}
      />
    </div>
  );
}
