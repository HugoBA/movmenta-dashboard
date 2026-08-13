export const DATE_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "365d", label: "Last 12 months" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
] as const;

export type DateRangeValue = (typeof DATE_RANGE_OPTIONS)[number]["value"];

const PRESET_DAYS: Partial<Record<DateRangeValue, number>> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "365d": 365,
};

// "custom" is resolved by the caller (needs the picked start/end dates), and
// "all" intentionally omits from/to. Both return {} here.
export function resolveDateRange(range: DateRangeValue): { from?: number; to?: number } {
  const now = Date.now();

  const days = PRESET_DAYS[range];
  if (days) return { from: now - days * 24 * 60 * 60 * 1000, to: now };

  return {};
}
