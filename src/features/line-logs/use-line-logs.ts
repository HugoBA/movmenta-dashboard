"use client";

import { useEffect, useState } from "react";
import type { Line, LineLog } from "@/lib/xano/line-logs";

const POLL_MS = 10_000;
const RETRY_MS = 15_000; // after an error

export type LiveStatus = "loading" | "live" | "paused" | "error";

export interface LineLogsState {
  rows: LineLog[]; // newest first
  status: LiveStatus;
  error: string | null;
  lastUpdated: number | null;
  // Highest id from the first load: anything above it arrived live.
  initialMaxId: number | null;
}

// Loads every entry for the day once, then polls for entries newer than the
// newest one held (after_id), so each poll is tiny. Polling pauses while the
// tab is hidden and resumes with an immediate catch-up when it's shown again.
export function useLineLogs(line: Line, from: number | undefined, to: number | undefined): LineLogsState {
  const [state, setState] = useState<LineLogsState>({
    rows: [],
    status: "loading",
    error: null,
    lastUpdated: null,
    initialMaxId: null,
  });

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let maxId = 0;
    let loaded = false;
    let inflight = false;

    setState({ rows: [], status: "loading", error: null, lastUpdated: null, initialMaxId: null });

    const schedule = (ms: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    async function tick() {
      if (cancelled || inflight) return;
      if (loaded && document.hidden) {
        setState((s) => ({ ...s, status: "paused" }));
        return; // visibilitychange restarts the loop
      }
      inflight = true;
      try {
        const params = new URLSearchParams();
        if (from !== undefined) params.set("from", String(from));
        if (to !== undefined) params.set("to", String(to));
        if (maxId) params.set("after_id", String(maxId));
        const res = await fetch(`/api/prod/${line}?${params.toString()}`, { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => undefined);
          throw new Error(body?.error ?? `Request failed (${res.status})`);
        }
        const incoming: LineLog[] = await res.json();
        if (cancelled) return;

        const firstLoad = !loaded;
        loaded = true;
        if (incoming.length) maxId = Math.max(maxId, ...incoming.map((r) => r.id));
        setState((s) => {
          const known = new Set(s.rows.map((r) => r.id));
          const fresh = incoming.filter((r) => !known.has(r.id));
          return {
            rows: fresh.length ? [...fresh, ...s.rows].sort((a, b) => b.id - a.id) : s.rows,
            status: "live",
            error: null,
            lastUpdated: Date.now(),
            initialMaxId: firstLoad ? maxId : s.initialMaxId,
          };
        });
        schedule(POLL_MS);
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : "Unexpected error.",
        }));
        schedule(RETRY_MS);
      } finally {
        inflight = false;
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        if (loaded) setState((s) => ({ ...s, status: "paused" }));
      } else {
        schedule(0);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    schedule(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [line, from, to]);

  return state;
}
