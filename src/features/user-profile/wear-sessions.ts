import type { ResultRecord } from "@/lib/xano/results";

export interface WearSession {
  date: number;
  pre: ResultRecord;
  post: ResultRecord;
}

// A "complete session" pairs the most recent unpaired pre-scan with the next
// post-scan — mirrors how the app records a wear-test (pre, run, post).
// `results` does not need to be pre-sorted.
export function computeWearSessions(results: ResultRecord[]): WearSession[] {
  const chronological = [...results].sort((a, b) => a.created_at - b.created_at);
  const sessions: WearSession[] = [];
  let pendingPre: ResultRecord | null = null;
  for (const row of chronological) {
    const period = row.period?.toLowerCase();
    if (period === "pre") {
      pendingPre = row;
    } else if (period === "post" && pendingPre) {
      sessions.push({ date: row.created_at, pre: pendingPre, post: row });
      pendingPre = null;
    }
  }
  return sessions;
}
