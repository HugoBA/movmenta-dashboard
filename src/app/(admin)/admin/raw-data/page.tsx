import { PageHeader } from "@/components/layout/page-header";
import { RawDataExplorer } from "@/features/raw-data/raw-data-explorer";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ idNfc?: string }>;
}) {
  const { idNfc } = await searchParams;

  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / RAW RESULTS"
        eyebrowTone="cyan"
        title="Raw results"
        subtitle="Every sensor reading submitted by the apps and lab test rigs"
      />
      <RawDataExplorer initialIdNfc={idNfc} />
    </div>
  );
}
