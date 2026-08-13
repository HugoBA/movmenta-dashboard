import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "shoe" query group (see /apispec:query:4007196:FwZiaBAf?type=json).
export interface ShoeRecord {
  id: number;
  created_at: number;
  id_nfc: string;
  serial_number: string;
  size_code: string;
  brand: string;
  model: string;
  variant: string;
  gender: string;
  size: string;
  ref_magnet: string;
  ref_sensor: string;
  factory_value: number;
  factory_value_deviation: number;
  factory_read_count: number;
  factory_temp: number;
  brand_id: number;
  firstname: string | null;
  lastname: string | null;
  email: string | null;
}

// No query params supported by Xano here — it's a flat list (~500 rows),
// small enough to fetch whole and filter/sort client-side.
export async function listShoes(token: string) {
  return xanoFetch<ShoeRecord[]>("/admin/shoe", { token });
}

export async function safeListShoes(
  token: string,
): Promise<{ shoes: ShoeRecord[]; error: string | null }> {
  try {
    return { shoes: await listShoes(token), error: null };
  } catch (err) {
    return {
      shoes: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function updateShoe(
  token: string,
  id: number,
  input: Partial<Pick<ShoeRecord, "model" | "ref_magnet" | "ref_sensor">>,
) {
  return xanoFetch<ShoeRecord>(`/admin/shoe/${id}`, { method: "PATCH", token, body: input });
}

export async function deleteShoe(token: string, id: number) {
  return xanoFetch<null>(`/admin/shoe/${id}`, { method: "DELETE", token });
}
