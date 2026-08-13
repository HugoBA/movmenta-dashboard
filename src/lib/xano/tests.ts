import { cache } from "react";
import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "test" query group (see /apispec:query:4011060:FwZiaBAf) —
// a shoe-test phase, associated to a shoe brand via brand_id.
export interface TestRecord {
  id: number;
  created_at: number;
  brand_id: number;
  name: string;
}

// Deduped per request — the admin layout and each page both need the list.
export const listTests = cache(async (token: string) => {
  return xanoFetch<TestRecord[]>("/admin/test", { token });
});

export async function safeListTests(
  token: string,
): Promise<{ tests: TestRecord[]; error: string | null }> {
  try {
    return { tests: await listTests(token), error: null };
  } catch (err) {
    return {
      tests: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function createTest(token: string, input: { brand_id: number; name: string }) {
  return xanoFetch<TestRecord>("/admin/test", { method: "POST", token, body: input });
}

export async function updateTest(
  token: string,
  id: number,
  input: { brand_id: number; name: string },
) {
  return xanoFetch<TestRecord>(`/admin/test/${id}`, { method: "PATCH", token, body: input });
}

// NOTE: DELETE /admin/test/{id} may not be live in Xano yet — see the 404
// handling in features/tests/actions.ts, which surfaces a clear message
// instead of failing silently until it's added.
export async function deleteTest(token: string, id: number) {
  return xanoFetch<null>(`/admin/test/${id}`, { method: "DELETE", token });
}
