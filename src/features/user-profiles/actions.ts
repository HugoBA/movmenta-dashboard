"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { deleteUserProfile } from "@/lib/xano/user-profiles";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";

const DELETE_PACING_MS = 1200;

export async function deleteUserProfiles(
  ids: number[],
): Promise<{ deletedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { deletedCount: 0, error: "Unauthorized." };
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteUserProfile(session.token, ids[i]);
      deletedCount++;
    } catch (err) {
      if (err instanceof XanoApiError && err.status === 404) {
        return {
          deletedCount,
          error: "Delete isn't available yet — add DELETE /user_profile/{id} in Xano first.",
        };
      }
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return { deletedCount, error: `Stopped after ${deletedCount} of ${ids.length} — ${message}` };
    }

    if (i < ids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELETE_PACING_MS));
    }
  }

  revalidatePath("/admin/user-profiles");
  return { deletedCount };
}
