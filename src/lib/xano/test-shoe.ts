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
