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
  date: number;
  value: number;
  post: ResultRecord | null;
}

// Looser than computeWearSessions: keeps every scan instead of dropping the
// unpaired ones. A pre without a matching post still plots (post stays
// null — no post dot for it); a post with no pending pre plots using its
// own value as the curve point instead (no post dot either, since that
// value already *is* the point).
export function computeWearAttempts(results: ResultRecord[]): WearAttempt[] {
  const chronological = [...results].sort((a, b) => a.created_at - b.created_at);
  const attempts: WearAttempt[] = [];
  let pending: WearAttempt | null = null;

  for (const row of chronological) {
    const period = row.period?.toLowerCase();
    if (period === "pre") {
      pending = { date: row.created_at, value: row.value, post: null };
      attempts.push(pending);
    } else if (period === "post") {
      if (pending && !pending.post) {
        pending.post = row;
        pending = null;
      } else {
        attempts.push({ date: row.created_at, value: row.value, post: null });
      }
    }
  }

  return attempts;
}

export function testerTotalKm(tester: Tester): number {
  return tester.sessions.reduce((sum, session) => sum + (session.post.km || 0), 0);
}

export function testerAvgDelta(tester: Tester): number | null {
  if (tester.sessions.length === 0) return null;
  const total = tester.sessions.reduce((sum, s) => sum + (s.post.value - s.pre.value), 0);
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
  avgDeltaValue: number | null;
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

  const deltas = allSessions.map(({ session }) => session.post.value - session.pre.value);
  const avgDeltaValue = deltas.length ? deltas.reduce((a, b) => a + b, 0) / deltas.length : null;

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
    avgDeltaValue,
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
