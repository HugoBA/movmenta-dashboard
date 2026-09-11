import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "test_shoe" query group (see /apispec:query:4011089:FwZiaBAf) —
// the join table assigning a shoe to a test.
export interface TestShoeRecord {
  id: number;
  created_at: number;
  shoe_id: number;
  test_id: number;
}

export async function listTestShoes(token: string) {
  return xanoFetch<TestShoeRecord[]>("/admin/test_shoe", { token });
}

export async function safeListTestShoes(
  token: string,
): Promise<{ testShoes: TestShoeRecord[]; error: string | null }> {
  try {
    return { testShoes: await listTestShoes(token), error: null };
  } catch (err) {
    return {
      testShoes: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function createTestShoe(
  token: string,
  input: { shoe_id: number; test_id: number },
) {
  return xanoFetch<TestShoeRecord>("/admin/test_shoe", { method: "POST", token, body: input });
}

export async function deleteTestShoe(token: string, id: number) {
  return xanoFetch<null>(`/admin/test_shoe/${id}`, { method: "DELETE", token });
}

export interface ClientTestShoeFilters {
  testId?: number;
}

// Enterprise-account equivalent — /client prefix, scoped to the caller's
// org server-side from the token. Optional test_id narrows to one test's
// assigned shoes instead of the whole brand.
export async function listClientTestShoes(token: string, filters: ClientTestShoeFilters = {}) {
  const params = new URLSearchParams();
  if (filters.testId) params.set("test_id", String(filters.testId));

  const qs = params.toString();
  return xanoFetch<TestShoeRecord[]>(`/client/test_shoe${qs ? `?${qs}` : ""}`, { token });
}

export async function safeListClientTestShoes(
  token: string,
  filters: ClientTestShoeFilters = {},
): Promise<{ testShoes: TestShoeRecord[]; error: string | null }> {
  try {
    return { testShoes: await listClientTestShoes(token, filters), error: null };
  } catch (err) {
    return {
      testShoes: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}
