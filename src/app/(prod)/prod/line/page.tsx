import { PageHeader } from "@/components/layout/page-header";
import { TraceClient } from "@/features/line-logs/line-logs-client";

export default async function Page({ searchParams }: { searchParams: Promise<{ sensor?: string }> }) {
  const { sensor } = await searchParams;
  return (
    <div>
      <PageHeader
        eyebrow="PRODUCTION LINE / OVERVIEW"
        eyebrowTone="orange"
        title="Line overview"
        subtitle="Each shoe's latest beginning- and end-of-line results, side by side"
      />
      {/* Keyed so following a "trace" link while already here resets the filters. */}
      <TraceClient key={sensor ?? ""} initialSensor={sensor} />
    </div>
  );
}
