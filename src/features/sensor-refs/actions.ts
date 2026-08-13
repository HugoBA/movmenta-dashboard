"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createSensorRef, updateSensorRef, deleteSensorRef } from "@/lib/xano/sensor-refs";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";
import type { SensorRefInput } from "@/schemas/sensor-refs";

const DELETE_PACING_MS = 1200;

export async function createSensorRefAction(
  input: SensorRefInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await createSensorRef(session.token, { name: input.name });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/sensor-refs");
  return undefined;
}

export async function updateSensorRefAction(
  id: number,
  input: SensorRefInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateSensorRef(session.token, id, { name: input.name });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/sensor-refs");
  return undefined;
}

export async function deleteSensorRefs(
  ids: number[],
): Promise<{ deletedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { deletedCount: 0, error: "Unauthorized." };
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteSensorRef(session.token, ids[i]);
      deletedCount++;
    } catch (err) {
      if (err instanceof XanoApiError && err.status === 404) {
        return {
          deletedCount,
          error: "Delete isn't available yet — add DELETE /admin/sensor_ref/{id} in Xano first.",
        };
      }
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return { deletedCount, error: `Stopped after ${deletedCount} of ${ids.length} — ${message}` };
    }

    if (i < ids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELETE_PACING_MS));
    }
  }

  revalidatePath("/admin/sensor-refs");
  return { deletedCount };
}
