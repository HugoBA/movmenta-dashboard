import { PageHeader } from "@/components/layout/page-header";
import { Pill } from "@/components/layout/pill";
import { StatTile } from "@/components/charts/stat-tile";
import { HeroDataStory } from "@/features/analytics/hero-data-story";
import { DegradationChart } from "@/features/analytics/degradation-chart";
import { WearDistributionDonut } from "@/features/analytics/wear-distribution-donut";
import { ProductsTable } from "@/features/analytics/products-table";
import { AnomaliesList } from "@/features/analytics/anomalies-list";
import { overviewStats } from "@/features/analytics/mock-data";
import { getSession } from "@/lib/auth/session";

export default async function Page() {
  const session = await getSession();
  const displayName = session?.user.organizationName ?? session?.user.username ?? "there";

  return (
    <div>
      <PageHeader
        eyebrow="LAST SYNC — 04 AUG 2026, 08:42"
        title="Footwear Intelligence Overview"
        subtitle={`Welcome back, ${displayName} — 6 active product lines, 12 840 connected units`}
        controls={
          <>
            <Pill type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="4" width="18" height="17" rx="2" />
                <path d="M3 9h18M8 3v3M16 3v3" />
              </svg>
              Last 90 days
            </Pill>
            <Pill type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              All products
            </Pill>
            <Pill type="button" tone="accent">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v13m0 0l-4-4m4 4l4-4M4 21h16" />
              </svg>
              Export
            </Pill>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active sensors" {...overviewStats.activeSensors} index={0} />
        <StatTile label="Distance measured" {...overviewStats.distanceMeasured} index={1} />
        <StatTile label="Avg. compression level" {...overviewStats.avgCompression} index={2} />
        <StatTile
          label="Products needing attention"
          {...overviewStats.productsNeedingAttention}
          index={3}
        />
      </div>

      <div className="my-4">
        <HeroDataStory />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <DegradationChart />
        <WearDistributionDonut />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProductsTable />
        <AnomaliesList />
      </div>
    </div>
  );
}
