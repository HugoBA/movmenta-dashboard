import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { getSession } from "@/lib/auth/session";
import { safeListShoeModels } from "@/lib/xano/shoe-models";
import { ShoeModelsExplorer } from "@/features/shoe-models/shoe-models-explorer";

export default async function Page() {
  const session = await getSession();
  const { shoeModels, error } = session
    ? await safeListShoeModels(session.token)
    : { shoeModels: [], error: null };

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SHOE MODELS"
        eyebrowTone="cyan"
        title="Shoe models"
        subtitle="Reference wear thresholds per model and gender"
      />

      {error ? (
        <Panel title="Shoe models">
          <p className="text-sm text-destructive">Couldn&apos;t load shoe models from Xano: {error}</p>
        </Panel>
      ) : (
        <ShoeModelsExplorer data={shoeModels} />
      )}
    </div>
  );
}
