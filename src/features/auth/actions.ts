"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { xanoFetch, XanoApiError } from "@/lib/xano/client";
import { mapXanoUser, type XanoUserRecord } from "@/lib/auth/xano-user";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { homeRouteForRole } from "@/lib/permissions";
import type { LoginInput } from "@/schemas/auth";
import type { Session } from "@/types/auth";

export async function login(
  input: LoginInput,
): Promise<{ error: string } | undefined> {
  let token: string;
  try {
    const { authToken } = await xanoFetch<{ authToken: string }>("/auth/login", {
      method: "POST",
      body: input,
    });
    token = authToken;
  } catch (err) {
    // Xano's login function throws a generic error (observed as a 500,
    // not 401) for bad credentials, so any failure from this call means
    // the username/password pair was rejected.
    if (err instanceof XanoApiError) {
      return { error: "Invalid credentials." };
    }
    throw err;
  }

  const record = await xanoFetch<XanoUserRecord>("/auth/me", { token });
  const session: Session = { user: mapXanoUser(record), token };

  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect(homeRouteForRole(session.user.role));
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
