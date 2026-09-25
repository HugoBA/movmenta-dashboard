import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "results" query group (see /apispec:query:4006736:FwZiaBAf?type=json).
// Raw sensor/insole readings submitted by the mobile apps and lab test rigs.
export interface ResultRecord {
  id: number;
  created_at: number;
  id_nfc: string;
  percent: number;
  value: number;
  value_raw: string;
  temp: number;
  mm: number;
  period: string;
  km: number;
  duration: number; // minutes, not seconds
  platform: string;
  phone_model: string;
  phone_brand: string;
  bol_test: number;
  profile_email: string | null;
  // GPS/elevation, synced from Strava via the mobile app — only populated
  // on "Post" rows, and only once that sync integration is live. `temp`
  // above is NOT ambient temperature (confirmed) — these are separate.
  activity_source?: string | null;
  start_date?: number | null;
  start_lat?: number | null;
  start_lng?: number | null;
  end_lat?: number | null;
  end_lng?: number | null;
  polyline?: string | null;
  elevation_profile?: { distance_km: number; elevation_m: number }[] | null;
}

export interface ResultsFilters {
  from?: number;
  to?: number;
  platform?: string;
  idNfc?: string;
}

export async function listResults(token: string, filters: ResultsFilters) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", String(filters.from));
  if (filters.to) params.set("to", String(filters.to));
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.idNfc) params.set("idNfc", filters.idNfc);

  const qs = params.toString();
  return xanoFetch<ResultRecord[]>(`/admin/result${qs ? `?${qs}` : ""}`, { token });
}

export async function safeListResults(
  token: string,
  filters: ResultsFilters,
): Promise<{ results: ResultRecord[]; error: string | null }> {
  try {
    return { results: await listResults(token, filters), error: null };
  } catch (err) {
    return {
      results: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

// NOTE: DELETE /admin/results/{id} does not exist in Xano yet (only GET is
// exposed as of /apispec:query:4006736:FwZiaBAf) — add it the same way
// dashboard_user's delete endpoint was set up before this will work.
export async function deleteResult(token: string, id: number) {
  return xanoFetch<null>(`/admin/result/${id}`, { method: "DELETE", token });
}

export async function updateResult(
  token: string,
  id: number,
  patch: Partial<Pick<ResultRecord, "value" | "mm" | "km" | "duration" | "percent">>,
) {
  return xanoFetch<ResultRecord>(`/admin/result/${id}`, { method: "PATCH", token, body: patch });
}

// Enterprise-account equivalent — /client prefix, scoped to the caller's
// org server-side from the token.
export async function listClientResults(token: string, filters: ResultsFilters) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", String(filters.from));
  if (filters.to) params.set("to", String(filters.to));
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.idNfc) params.set("idNfc", filters.idNfc);

  const qs = params.toString();
  return xanoFetch<ResultRecord[]>(`/client/result${qs ? `?${qs}` : ""}`, { token });
}

export async function safeListClientResults(
  token: string,
  filters: ResultsFilters,
): Promise<{ results: ResultRecord[]; error: string | null }> {
  try {
    return { results: await listClientResults(token, filters), error: null };
  } catch (err) {
    return {
      results: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}
