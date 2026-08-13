import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "shoe_model" query group (see /apispec:query:4007205:FwZiaBAf?type=json).
// Reference table: one row per (model, gender) combo with its wear threshold.
export interface ShoeModelRecord {
  id: number;
  created_at: number;
  model: string;
  gender: string;
  max_delta: number;
}

export async function listShoeModels(token: string) {
  return xanoFetch<ShoeModelRecord[]>("/admin/shoe_model", { token });
}

export async function safeListShoeModels(
  token: string,
): Promise<{ shoeModels: ShoeModelRecord[]; error: string | null }> {
  try {
    return { shoeModels: await listShoeModels(token), error: null };
  } catch (err) {
    return {
      shoeModels: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

// NOTE: DELETE /admin/shoe_model/{id} does not exist in Xano yet (only GET is
// exposed as of /apispec:query:4007205:FwZiaBAf) — add it the same way
// dashboard_user's delete endpoint was set up before this will work.
export async function deleteShoeModel(token: string, id: number) {
  return xanoFetch<null>(`/admin/shoe_model/${id}`, { method: "DELETE", token });
}
