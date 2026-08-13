import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListShoeBrands } from "@/lib/xano/shoe-brands";
import { ShoeBrandsExplorer } from "@/features/shoe-brands/shoe-brands-explorer";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SHOE BRANDS"
        eyebrowTone="cyan"
        title="Shoe brands"
        subtitle="Manage the brands tests can be associated with"
      />

      <Suspense fallback={<ContentLoader />}>
        <ShoeBrandsContent />
      </Suspense>
    </div>
  );
}

async function ShoeBrandsContent() {
  const session = await getSession();
  const { brands, error } = session
    ? await safeListShoeBrands(session.token)
    : { brands: [], error: null };

  if (error) {
    return (
      <Panel title="Shoe brands">
        <p className="text-sm text-destructive">Couldn&apos;t load shoe brands from Xano: {error}</p>
      </Panel>
    );
  }

  return <ShoeBrandsExplorer data={brands} />;
}
