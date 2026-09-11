import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListShoes } from "@/lib/xano/shoes";
import { safeListSensorRefs, type SensorRefRecord } from "@/lib/xano/sensor-refs";
import { safeListShoeModels } from "@/lib/xano/shoe-models";
import { safeListShoeBrands, type ShoeBrandRecord } from "@/lib/xano/shoe-brands";
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
  const [
    { shoes, error },
    { sensorRefs, error: sensorRefsError },
    { shoeModels, error: shoeModelsError },
    { brands: shoeBrands, error: shoeBrandsError },
  ] = session
    ? await Promise.all([
        safeListShoes(session.token),
        safeListSensorRefs(session.token),
        safeListShoeModels(session.token),
        safeListShoeBrands(session.token),
      ])
    : [
        { shoes: [], error: null },
        { sensorRefs: [] as SensorRefRecord[], error: null as string | null },
        { shoeModels: [], error: null as string | null },
        { brands: [] as ShoeBrandRecord[], error: null as string | null },
      ];

  const loadError = error ?? sensorRefsError ?? shoeModelsError ?? shoeBrandsError;

  if (loadError) {
    return (
      <Panel title="Shoes">
        <p className="text-sm text-destructive">Couldn&apos;t load shoes from Xano: {loadError}</p>
      </Panel>
    );
  }

  const modelNames = [...new Set(shoeModels.map((shoeModel) => shoeModel.model))].sort();

  return (
    <ShoesExplorer
      data={shoes}
      initialIdNfc={idNfc}
      sensorRefs={sensorRefs}
      modelNames={modelNames}
      shoeBrands={shoeBrands}
    />
  );
}
