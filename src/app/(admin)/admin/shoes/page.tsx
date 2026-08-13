import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getSession } from "@/lib/auth/session";
import { safeListShoes } from "@/lib/xano/shoes";
import { ShoesExplorer } from "@/features/shoes/shoes-explorer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const session = await getSession();
  const { shoes, error } = session
    ? await safeListShoes(session.token)
    : { shoes: [], error: null };
  const { idNfc } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SHOES"
        eyebrowTone="cyan"
        title="Shoes"
        subtitle="Every registered shoe and the sensor fitted to it"
      />

      {error ? (
        <Panel title="Shoes">
          <p className="text-sm text-destructive">Couldn&apos;t load shoes from Xano: {error}</p>
        </Panel>
      ) : (
        <ShoesExplorer data={shoes} initialIdNfc={idNfc} />
      )}
    </div>
  );
}
