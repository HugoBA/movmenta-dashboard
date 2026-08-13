"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createShoeBrand, updateShoeBrand, deleteShoeBrand } from "@/lib/xano/shoe-brands";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";
import type { ShoeBrandInput } from "@/schemas/shoe-brands";

const DELETE_PACING_MS = 1200;

export async function createShoeBrandAction(
  input: ShoeBrandInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await createShoeBrand(session.token, { brand_name: input.brandName });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/shoe-brands");
  return undefined;
}

export async function updateShoeBrandAction(
  id: number,
  input: ShoeBrandInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateShoeBrand(session.token, id, { brand_name: input.brandName });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/shoe-brands");
  return undefined;
}

export async function deleteShoeBrands(
  ids: number[],
): Promise<{ deletedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { deletedCount: 0, error: "Unauthorized." };
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteShoeBrand(session.token, ids[i]);
      deletedCount++;
    } catch (err) {
      if (err instanceof XanoApiError && err.status === 404) {
        return {
          deletedCount,
          error: "Delete isn't available yet — add DELETE /admin/brand/{id} in Xano first.",
        };
      }
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return { deletedCount, error: `Stopped after ${deletedCount} of ${ids.length} — ${message}` };
    }

    if (i < ids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELETE_PACING_MS));
    }
  }

  revalidatePath("/admin/shoe-brands");
  return { deletedCount };
}
