import type { ShoeRecord } from "@/lib/xano/shoes";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ResultRecord } from "@/lib/xano/results";
import { computeWearSessions, type WearSession } from "@/features/user-profile/wear-sessions";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface Tester {
  idNfc: string;
  label: string;
  shoe: ShoeRecord;
  sessions: WearSession[];
  scanCount: number;
  rawResults: ResultRecord[];
}

function testerLabel(shoe: ShoeRecord): string {
  const name = [shoe.firstname, shoe.lastname].filter(Boolean).join(" ");
  return name || shoe.id_nfc || shoe.serial_number || `Shoe #${shoe.id}`;
}

// One tester per distinct id_nfc among the shoes assigned to this test — the
// NFC id identifies the wearer, not the physical shoe unit. Matches on
// id_nfc alone (no date bound) — a tester's history can predate when their
// shoe was formally assigned in this dashboard, and that's expected: it
// still counts toward the test retroactively.
export function buildTestersForTest(
  testId: number,
  testShoes: TestShoeRecord[],
  shoes: ShoeRecord[],
  results: ResultRecord[],
): Tester[] {
  const shoeById = new Map(shoes.map((shoe) => [shoe.id, shoe]));
  const assignedShoes = testShoes
    .filter((row) => row.test_id === testId)
    .map((row) => shoeById.get(row.shoe_id))
    .filter((shoe): shoe is ShoeRecord => !!shoe?.id_nfc);

  const shoeByIdNfc = new Map<string, ShoeRecord>();
  for (const shoe of assignedShoes) {
    if (!shoeByIdNfc.has(shoe.id_nfc)) shoeByIdNfc.set(shoe.id_nfc, shoe);
  }

  const resultsByIdNfc = new Map<string, ResultRecord[]>();
  for (const row of results) {
    if (!shoeByIdNfc.has(row.id_nfc)) continue;
    const list = resultsByIdNfc.get(row.id_nfc);
    if (list) list.push(row);
    else resultsByIdNfc.set(row.id_nfc, [row]);
  }

  return [...shoeByIdNfc.entries()].map(([idNfc, shoe]) => {
    const testerResults = resultsByIdNfc.get(idNfc) ?? [];
    return {
      idNfc,
      label: testerLabel(shoe),
      shoe,
      sessions: computeWearSessions(testerResults),
      scanCount: testerResults.length,
      rawResults: testerResults,
    };
  });
}

export interface WearAttempt {
  // Cumulative distance for this tester at the pre scan (before the run)
  // and, once the post scan lands, after it — so a session plots as two
  // x-positions on a distance axis rather than one.
  kmPre: number;
  kmPost: number | null;
  pre: ResultRecord;
  post: ResultRecord | null;
}

// One entry per pre/post session, carrying the raw records (not a single
// pre-picked metric) so callers can plot % or mm without recomputing.
// Unpaired scans (a pre with no post yet, or a stray post) are dropped —
// they can't be placed on a distance axis without a session to anchor them.
export function computeWearAttempts(results: ResultRecord[]): WearAttempt[] {
  const chronological = [...results].sort((a, b) => a.created_at - b.created_at);
  const attempts: WearAttempt[] = [];
  let pendingPre: ResultRecord | null = null;
  let cumulativeKm = 0;

  for (const row of chronological) {
    const period = row.period?.toLowerCase();
    if (period === "pre") {
      pendingPre = row;
    } else if (period === "post" && pendingPre) {
      const kmPre = cumulativeKm;
      cumulativeKm += row.km || 0;
      attempts.push({ kmPre, kmPost: cumulativeKm, pre: pendingPre, post: row });
      pendingPre = null;
    }
  }

  return attempts;
}

export function testerTotalKm(tester: Tester): number {
  return tester.sessions.reduce((sum, session) => sum + (session.post.km || 0), 0);
}

export interface WeightWearPoint {
  idNfc: string;
  label: string;
  weight: number;
  gender: string;
  wearRatePer100km: number;
}

// Cushioning-loss rate normalized by distance (% condition lost per 100km),
// so it isolates "how fast does this shoe wear" from "how far did this
// tester run" — the thing worth plotting against bodyweight.
export function computeWeightWearPoints(
  testers: Tester[],
  profileByIdNfc: Map<string, { weight: number; gender: string }>,
): WeightWearPoint[] {
  const points: WeightWearPoint[] = [];
  for (const tester of testers) {
    const profile = profileByIdNfc.get(tester.idNfc);
    if (!profile || !profile.weight) continue;
    const totalKm = testerTotalKm(tester);
    if (totalKm < 20) continue; // not enough distance for a stable rate yet

    const latest = [...tester.rawResults].sort((a, b) => b.created_at - a.created_at)[0];
    if (!latest) continue;

    points.push({
      idNfc: tester.idNfc,
      label: tester.label,
      weight: profile.weight,
      gender: profile.gender,
      wearRatePer100km: Number((((100 - latest.percent) / totalKm) * 100).toFixed(2)),
    });
  }
  return points;
}

export interface TesterWearRate {
  idNfc: string;
  label: string;
  weight: number;
  wearLostPer10km: number; // negative — % of condition lost per 10km covered
}

// Same normalized wear rate as computeWeightWearPoints, rescaled per 10km
// and expressed as a loss (negative) to plot on the existing diverging bar
// chart. Sorted heaviest-to-lightest tester so the weight/wear-rate link
// reads directly off the bar order, not just a hover tooltip.
export function computeWearRatePerTester(
  testers: Tester[],
  profileByIdNfc: Map<string, { weight: number }>,
): TesterWearRate[] {
  const rows: TesterWearRate[] = [];
  for (const tester of testers) {
    const profile = profileByIdNfc.get(tester.idNfc);
    if (!profile || !profile.weight) continue;
    const totalKm = testerTotalKm(tester);
    if (totalKm < 20) continue; // not enough distance for a stable rate yet

    const latest = [...tester.rawResults].sort((a, b) => b.created_at - a.created_at)[0];
    if (!latest) continue;

    rows.push({
      idNfc: tester.idNfc,
      label: tester.label,
      weight: profile.weight,
      wearLostPer10km: Number((-((100 - latest.percent) / totalKm) * 10).toFixed(2)),
    });
  }
  return rows.sort((a, b) => b.weight - a.weight);
}

export interface SessionTempPoint {
  x: number; // ambient temperature (°C), averaged pre/post
  y: number; // % lost per 10km, this single session
  label: string;
}

// Unlike weight (one value per tester, ~a dozen points), temperature is
// logged per session — every run gives its own point, so across a whole
// test this has real statistical weight and a trend line is warranted.
export function computeSessionTempPoints(testers: Tester[]): SessionTempPoint[] {
  const points: SessionTempPoint[] = [];
  for (const tester of testers) {
    for (const session of tester.sessions) {
      const km = session.post.km;
      // The sensor's own ~1% measurement noise is roughly constant per
      // scan regardless of distance — normalizing it by a very short run
      // blows it up into an outlier rate (or even a bogus negative one).
      // Require enough distance for that noise floor to be small relative
      // to the per-10km rate we're computing.
      if (!km || km < 5) continue;
      const lost = session.pre.percent - session.post.percent;
      const temp = (session.pre.temp + session.post.temp) / 2;
      points.push({
        x: Number(temp.toFixed(1)),
        y: Number(((lost / km) * 10).toFixed(2)),
        label: tester.label,
      });
    }
  }
  return points;
}

export function testerAvgDelta(tester: Tester, metric: "value" | "percent" = "value"): number | null {
  if (tester.sessions.length === 0) return null;
  const total = tester.sessions.reduce((sum, s) => sum + (s.post[metric] - s.pre[metric]), 0);
  return total / tester.sessions.length;
}

export interface TesterHighlight {
  idNfc: string;
  label: string;
  km: number;
}

export interface TestResultsStats {
  totalScans: number;
  totalSessions: number;
  totalKm: number;
  activeTesters: number;
  totalTesters: number;
  biggestSessionLastWeek: TesterHighlight | null;
  mostKmLastWeek: TesterHighlight | null;
}

export function computeTestResultsStats(testers: Tester[]): TestResultsStats {
  const totalTesters = testers.length;
  const activeTesters = testers.filter((t) => t.sessions.length > 0).length;
  const totalScans = testers.reduce((sum, tester) => sum + tester.scanCount, 0);

  const allSessions = testers.flatMap((tester) =>
    tester.sessions.map((session) => ({ tester, session })),
  );
  const totalSessions = allSessions.length;
  const totalKm = allSessions.reduce((sum, { session }) => sum + (session.post.km || 0), 0);

  const now = Date.now();
  const lastWeek = allSessions.filter(({ session }) => now - session.date <= WEEK_MS);

  const biggestSession = lastWeek.length
    ? lastWeek.reduce((max, cur) => (cur.session.post.km > max.session.post.km ? cur : max))
    : null;

  const kmByTesterLastWeek = new Map<string, TesterHighlight>();
  for (const { tester, session } of lastWeek) {
    const entry = kmByTesterLastWeek.get(tester.idNfc) ?? {
      idNfc: tester.idNfc,
      label: tester.label,
      km: 0,
    };
    entry.km += session.post.km || 0;
    kmByTesterLastWeek.set(tester.idNfc, entry);
  }
  const mostKmLastWeek = [...kmByTesterLastWeek.values()].sort((a, b) => b.km - a.km)[0] ?? null;

  return {
    totalScans,
    totalSessions,
    totalKm,
    activeTesters,
    totalTesters,
    biggestSessionLastWeek: biggestSession
      ? {
          idNfc: biggestSession.tester.idNfc,
          label: biggestSession.tester.label,
          km: biggestSession.session.post.km,
        }
      : null,
    mostKmLastWeek,
  };
}
