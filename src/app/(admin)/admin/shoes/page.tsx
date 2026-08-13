import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListShoes } from "@/lib/xano/shoes";
import { ShoesExplorer } from "@/features/shoes/shoes-explorer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const { idNfc } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SHOES"
        eyebrowTone="cyan"
        title="Shoes"
        subtitle="Every registered shoe and the sensor fitted to it"
      />

      <Suspense fallback={<ContentLoader />}>
        <ShoesContent idNfc={idNfc} />
      </Suspense>
    </div>
  );
}

async function ShoesContent({ idNfc }: { idNfc?: string }) {
  const session = await getSession();
  const { shoes, error } = session
    ? await safeListShoes(session.token)
    : { shoes: [], error: null };

  if (error) {
    return (
      <Panel title="Shoes">
        <p className="text-sm text-destructive">Couldn&apos;t load shoes from Xano: {error}</p>
      </Panel>
    );
  }

  return <ShoesExplorer data={shoes} initialIdNfc={idNfc} />;
}
