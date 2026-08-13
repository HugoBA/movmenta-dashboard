import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/layout/panel";
import { ContentLoader } from "@/components/layout/content-loader";
import { getSession } from "@/lib/auth/session";
import { safeListSensorRefs } from "@/lib/xano/sensor-refs";
import { SensorRefsExplorer } from "@/features/sensor-refs/sensor-refs-explorer";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / SENSOR REFS"
        eyebrowTone="cyan"
        title="Sensor refs"
        subtitle="Manage the sensor references selectable when configuring a shoe"
      />

      <Suspense fallback={<ContentLoader />}>
        <SensorRefsContent />
      </Suspense>
    </div>
  );
}

async function SensorRefsContent() {
  const session = await getSession();
  const { sensorRefs, error } = session
    ? await safeListSensorRefs(session.token)
    : { sensorRefs: [], error: null };

  if (error) {
    return (
      <Panel title="Sensor refs">
        <p className="text-sm text-destructive">Couldn&apos;t load sensor refs from Xano: {error}</p>
      </Panel>
    );
  }

  return <SensorRefsExplorer data={sensorRefs} />;
}
