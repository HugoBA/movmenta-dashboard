import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getSession } from "@/lib/auth/session";
import { safeListShoeBrands } from "@/lib/xano/shoe-brands";
import { ShoeBrandsExplorer } from "@/features/shoe-brands/shoe-brands-explorer";

export default async function Page() {
  const session = await getSession();
  const { brands, error } = session
    ? await safeListShoeBrands(session.token)
    : { brands: [], error: null };

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SHOE BRANDS"
        eyebrowTone="cyan"
        title="Shoe brands"
        subtitle="Manage the brands tests can be associated with"
      />

      {error ? (
        <Panel title="Shoe brands">
          <p className="text-sm text-destructive">Couldn&apos;t load shoe brands from Xano: {error}</p>
        </Panel>
      ) : (
        <ShoeBrandsExplorer data={brands} />
      )}
    </div>
  );
}
