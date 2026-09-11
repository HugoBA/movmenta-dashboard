import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ShoesExplorer } from "@/features/shoes/shoes-explorer";
import { getSession } from "@/lib/auth/session";
import { loadClientData } from "@/lib/client-data";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const { idNfc } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");

  const orgName = session.user.brandName ?? "Enterprise";
  const { shoes, brands, error } = await loadClientData(session);

  return (
    <div>
      <PageHeader
        eyebrow={orgName}
        eyebrowTone="cyan"
        title="Shoes"
        subtitle={`Every ${orgName} shoe and the sensor fitted to it`}
      />
      {error ? (
        <Panel title="Shoes">
          <p className="text-sm text-destructive">Couldn&apos;t load shoes from Xano: {error}</p>
        </Panel>
      ) : (
        <ShoesExplorer
          data={shoes}
          initialIdNfc={idNfc}
          basePath="/client"
          isAdmin={false}
          shoeBrands={brands}
        />
      )}
    </div>
  );
}
