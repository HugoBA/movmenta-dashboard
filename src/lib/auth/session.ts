import { cookies } from "next/headers";
import type { Session } from "@/types/auth";

const SESSION_COOKIE = "sollo_session";

// Reads the session written at login (features/auth/actions.ts). Every Xano
// endpoint must derive the caller's organization from the bearer token
// server-side — never trust an organization name/id sent by the client.
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
