import type { TestRecord } from "@/lib/xano/tests";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { ResultRecord } from "@/lib/xano/results";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import { formatShortDate } from "@/lib/formatting/date";

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

function shoeLabel(shoe: ShoeRecord): string {
  const name = [shoe.firstname, shoe.lastname].filter(Boolean).join(" ");
  return name || shoe.id_nfc || shoe.serial_number || `Shoe #${shoe.id}`;
}

export interface OverviewStats {
  testsCount: number;
  shoesAssignedCount: number;
  scansLast30d: number;
  activeTestersLast30d: number;
  brandAccountsCount: number;
}

export function computeOverviewStats(
  tests: TestRecord[],
  testShoes: TestShoeRecord[],
  results: ResultRecord[],
  brandAccountsCount: number,
): OverviewStats {
  const windowStart = Date.now() - WINDOW_DAYS * DAY_MS;
  const recentResults = results.filter((row) => row.created_at >= windowStart);

  return {
    testsCount: tests.length,
    shoesAssignedCount: new Set(testShoes.map((row) => row.shoe_id)).size,
    scansLast30d: recentResults.length,
    activeTestersLast30d: new Set(recentResults.map((row) => row.id_nfc).filter(Boolean)).size,
    brandAccountsCount,
  };
}

export interface DailyScanPoint {
  label: string;
  count: number;
}

// One bucket per calendar day over the trailing window, zero-filled so the
// trend line doesn't just skip quiet days.
export function computeDailyScans(results: ResultRecord[], days = WINDOW_DAYS): DailyScanPoint[] {
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const buckets = new Map<number, number>();
  for (let i = days - 1; i >= 0; i--) {
    buckets.set(startOfToday - i * DAY_MS, 0);
  }

  for (const row of results) {
    const dayStart = new Date(row.created_at).setHours(0, 0, 0, 0);
    if (buckets.has(dayStart)) {
      buckets.set(dayStart, (buckets.get(dayStart) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([ts, count]) => ({ label: formatShortDate(ts), count }));
}

export interface TestSummary {
  id: number;
  name: string;
  brandName: string;
  shoesCount: number;
  testersCount: number;
  createdAt: number;
}

// Most active first (by shoes assigned) — this is an "at a glance" list, not
// the full management table (that's /admin/tests).
export function summarizeTests(
  tests: TestRecord[],
  testShoes: TestShoeRecord[],
  shoes: ShoeRecord[],
  brands: ShoeBrandRecord[],
): TestSummary[] {
  const brandNameById = new Map(brands.map((brand) => [brand.id, brand.brand_name]));
  const shoeById = new Map(shoes.map((shoe) => [shoe.id, shoe]));

  return tests
    .map((test) => {
      const assignedRows = testShoes.filter((row) => row.test_id === test.id);
      const testerIds = new Set(
        assignedRows
          .map((row) => shoeById.get(row.shoe_id)?.id_nfc)
          .filter((id): id is string => !!id),
      );
      return {
        id: test.id,
        name: test.name,
        brandName: brandNameById.get(test.brand_id) ?? "—",
        shoesCount: assignedRows.length,
        testersCount: testerIds.size,
        createdAt: test.created_at,
      };
    })
    .sort((a, b) => b.shoesCount - a.shoesCount);
}

export interface TesterKm {
  idNfc: string;
  label: string;
  km: number;
}

// Total km per id_nfc across every scan (pre + post), matching the same
// convention used on the user profile page — km isn't exclusive to post
// rows in practice.
export function topTestersByKm(shoes: ShoeRecord[], results: ResultRecord[], limit = 8): TesterKm[] {
  const shoeByIdNfc = new Map<string, ShoeRecord>();
  for (const shoe of shoes) {
    if (shoe.id_nfc && !shoeByIdNfc.has(shoe.id_nfc)) shoeByIdNfc.set(shoe.id_nfc, shoe);
  }

  const kmByIdNfc = new Map<string, number>();
  for (const row of results) {
    if (!row.id_nfc) continue;
    kmByIdNfc.set(row.id_nfc, (kmByIdNfc.get(row.id_nfc) ?? 0) + (row.km || 0));
  }

  return [...kmByIdNfc.entries()]
    .map(([idNfc, km]) => {
      const shoe = shoeByIdNfc.get(idNfc);
      return { idNfc, label: shoe ? shoeLabel(shoe) : idNfc, km };
    })
    .filter((row) => row.km > 0)
    .sort((a, b) => b.km - a.km)
    .slice(0, limit);
}
