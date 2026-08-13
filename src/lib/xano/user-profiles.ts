import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "user_profile" query group (see /apispec:query:4007206:FwZiaBAf?type=json).
// NOTE: this endpoint lives at the API root, not under /admin.
export interface UserProfileRecord {
  id: number;
  created_at: number;
  id_nfc: string;
  age: number;
  gender: string;
  shoeSize: number;
  weight: number;
  height: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  result_count?: number;
}

export async function listUserProfiles(token: string) {
  return xanoFetch<UserProfileRecord[]>("/user_profile", { token });
}

export async function safeListUserProfiles(
  token: string,
): Promise<{ profiles: UserProfileRecord[]; error: string | null }> {
  try {
    return { profiles: await listUserProfiles(token), error: null };
  } catch (err) {
    return {
      profiles: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

// NOTE: DELETE /user_profile/{id} does not exist in Xano yet (only GET is
// exposed as of /apispec:query:4007206:FwZiaBAf) — add it the same way
// dashboard_user's delete endpoint was set up before this will work.
export async function deleteUserProfile(token: string, id: number) {
  return xanoFetch<null>(`/user_profile/${id}`, { method: "DELETE", token });
}
