"use server";

import { getSession } from "@/lib/auth/session";
import { deleteResult } from "@/lib/xano/results";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";

// Xano caps requests at 10 per 20s, shared across every call this token
// makes — space deletes out so a big selection doesn't immediately 429 or
// starve whatever else is loading (the results list, sidebar counts, etc).
const DELETE_PACING_MS = 1200;

export async function deleteResults(
  ids: number[],
): Promise<{ deletedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { deletedCount: 0, error: "Unauthorized." };
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteResult(session.token, ids[i]);
      deletedCount++;
    } catch (err) {
      if (err instanceof XanoApiError && err.status === 404) {
        return {
          deletedCount,
          error: "Delete isn't available yet — add DELETE /admin/results/{id} in Xano first.",
        };
      }
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return { deletedCount, error: `Stopped after ${deletedCount} of ${ids.length} — ${message}` };
    }

    if (i < ids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELETE_PACING_MS));
    }
  }

  return { deletedCount };
}
