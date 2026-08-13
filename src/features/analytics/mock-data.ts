// Dummy data shaped like what the Xano analytics endpoints will return
// (pre-aggregated, day/week granularity) — see brief: précalcul dès la v1.

export const overviewStats = {
  activeSensors: { value: "12 840", delta: { tone: "up" as const, value: "4.2%", context: "vs last period" } },
  distanceMeasured: {
    value: "184 302",
    unit: "km",
    delta: { tone: "up" as const, value: "11.8%", context: "vs last period" },
  },
  avgCompression: {
    value: "72",
    unit: "%",
    delta: { tone: "down" as const, value: "2.1%", context: "degradation trend" },
  },
  productsNeedingAttention: {
    value: "18",
    delta: { tone: "warn" as const, value: "5 critical", context: "this week" },
  },
};

export const wearDistribution = {
  total: 642,
  segments: [
    { label: "Nominal", tone: "ok" as const, color: "#4fd18f", value: 376 },
    { label: "Watch", tone: "watch" as const, color: "#ffb84f", value: 152 },
    { label: "Critical", tone: "critical" as const, color: "#ff6a3d", value: 114 },
  ],
};

export interface RecentProduct {
  id: string;
  model: string;
  line: string;
  distanceKm: number;
  wearPct: number;
  status: "ok" | "watch" | "critical";
}

export const recentProducts: RecentProduct[] = [
  { id: "SN-3021", model: "Model X", line: "Road", distanceKm: 412, wearPct: 38, status: "ok" },
  { id: "SN-3088", model: "Model Y", line: "Trail", distanceKm: 780, wearPct: 71, status: "watch" },
  { id: "SN-2977", model: "Model X", line: "Road", distanceKm: 1240, wearPct: 92, status: "critical" },
  { id: "SN-3104", model: "Model Z", line: "Race", distanceKm: 96, wearPct: 12, status: "ok" },
];

export interface Anomaly {
  id: string;
  tone: "warn" | "critical";
  title: string;
  detail: string;
}

export const anomalies: Anomaly[] = [
  { id: "a1", tone: "critical", title: "SN-2977 — compression spike", detail: "+18% over 72h · Model X" },
  { id: "a2", tone: "warn", title: "Batch drift on Model Y", detail: "14 units above threshold" },
  { id: "a3", tone: "critical", title: "Sensor offline — SN-3055", detail: "No signal for 6 days" },
  { id: "a4", tone: "warn", title: "Unusual gait pattern", detail: "Flagged on 3 Model Z units" },
];
