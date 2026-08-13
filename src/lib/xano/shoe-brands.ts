import { cache } from "react";
import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "brand" query group (see /apispec:query:4011064:FwZiaBAf) — the
// shoe-brand lookup table referenced by test.brand_id. Not to be confused with
// dashboard_user "brand" client accounts (see lib/xano/dashboard-user.ts).
export interface ShoeBrandRecord {
  id: number;
  created_at: number;
  brand_name: string;
}

// Deduped per request — the admin layout and each page both need the list.
export const listShoeBrands = cache(async (token: string) => {
  return xanoFetch<ShoeBrandRecord[]>("/admin/brand", { token });
});

export async function safeListShoeBrands(
  token: string,
): Promise<{ brands: ShoeBrandRecord[]; error: string | null }> {
  try {
    return { brands: await listShoeBrands(token), error: null };
  } catch (err) {
    return {
      brands: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function createShoeBrand(token: string, input: { brand_name: string }) {
  return xanoFetch<ShoeBrandRecord>("/admin/brand", { method: "POST", token, body: input });
}

export async function updateShoeBrand(
  token: string,
  id: number,
  input: { brand_name: string },
) {
  return xanoFetch<ShoeBrandRecord>(`/admin/brand/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export async function deleteShoeBrand(token: string, id: number) {
  return xanoFetch<null>(`/admin/brand/${id}`, { method: "DELETE", token });
}
