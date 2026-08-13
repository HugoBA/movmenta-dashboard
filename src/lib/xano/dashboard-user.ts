import { cache } from "react";
import { XanoApiError, xanoErrorMessage, xanoFetch } from "./client";

// Matches Xano's dashboard_user table (see /apispec:FwZiaBAf?type=json).
export interface DashboardUserRecord {
  id: number;
  created_at: number;
  username: string;
  role: "admin" | "user";
  organization_name?: string;
  active: boolean;
}

// Deduped per request — the admin layout and each page both need the list.
export const listDashboardUsers = cache(async (token: string) => {
  return xanoFetch<DashboardUserRecord[]>("/admin/dashboard_user", { token });
});

// Xano occasionally hiccups (auth misconfig, downtime) — callers rendering
// UI should show an error state instead of crashing the whole page.
export async function safeListDashboardUsers(
  token: string,
): Promise<{ users: DashboardUserRecord[]; error: string | null }> {
  try {
    return { users: await listDashboardUsers(token), error: null };
  } catch (err) {
    return {
      users: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function createDashboardUser(
  token: string,
  input: {
    username: string;
    role: "admin" | "user";
    organization_name?: string;
    active: boolean;
    password: string;
  },
) {
  return xanoFetch<DashboardUserRecord>("/admin/dashboard_user", {
    method: "POST",
    token,
    body: input,
  });
}

export async function updateDashboardUserActive(token: string, id: number, active: boolean) {
  return xanoFetch<DashboardUserRecord>(`/admin/dashboard_user/${id}`, {
    method: "PATCH",
    token,
    body: { active },
  });
}

export async function updateDashboardUser(
  token: string,
  id: number,
  patch: { username?: string; organization_name?: string; password?: string },
) {
  return xanoFetch<DashboardUserRecord>(`/admin/dashboard_user/${id}`, {
    method: "PATCH",
    token,
    body: patch,
  });
}

export async function deleteDashboardUser(token: string, id: number) {
  return xanoFetch<null>(`/admin/dashboard_user/${id}`, {
    method: "DELETE",
    token,
  });
}
