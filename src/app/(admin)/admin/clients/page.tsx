import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ContentLoader } from "@/components/layout/content-loader";
import { CreateBrandDialog } from "@/features/clients/create-brand-dialog";
import { BrandsTable } from "@/features/clients/brands-table";
import { getSession } from "@/lib/auth/session";
import { safeListShoeBrands } from "@/lib/xano/shoe-brands";

export default async function Page() {
  const session = await getSession();
  const { brands } = session ? await safeListShoeBrands(session.token) : { brands: [] };

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / BRANDS"
        eyebrowTone="cyan"
        title="Brand access"
        subtitle="Manage the login each brand uses to access their dashboard"
        controls={<CreateBrandDialog brands={brands} />}
      />
      <Suspense fallback={<ContentLoader />}>
        <BrandsTable />
      </Suspense>
    </div>
  );
}
