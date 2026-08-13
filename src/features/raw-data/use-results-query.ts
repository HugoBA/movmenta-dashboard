"use client";

import { useQuery } from "@tanstack/react-query";
import type { ResultRecord } from "@/lib/xano/results";

export interface ResultsFilterState {
  from?: number;
  to?: number;
  platform: string;
  idNfc: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchResults(filters: ResultsFilterState): Promise<ResultRecord[]> {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", String(filters.from));
  if (filters.to) params.set("to", String(filters.to));
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.idNfc) params.set("idNfc", filters.idNfc);

  const res = await fetch(`/api/admin/results?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    throw new ApiError(body?.error ?? "Failed to load results", res.status);
  }
  return res.json();
}

// Xano's plan caps requests at 10 per 20s (shared across every endpoint we
// call). A 429 here isn't a real failure — wait out the window and retry;
// anything else fails fast like the rest of the app.
export function useResultsQuery(filters: ResultsFilterState, enabled = true) {
  return useQuery({
    queryKey: ["admin-results", filters],
    queryFn: () => fetchResults(filters),
    enabled,
    placeholderData: (previous) => previous,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 429) {
        return failureCount < 4;
      }
      return failureCount < 1;
    },
    retryDelay: (attemptIndex, error) =>
      error instanceof ApiError && error.status === 429 ? 8000 : Math.min(1000 * 2 ** attemptIndex, 5000),
  });
}
