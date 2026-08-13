"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createTest, updateTest, deleteTest } from "@/lib/xano/tests";
import { createTestShoe, deleteTestShoe } from "@/lib/xano/test-shoe";
import { updateShoe } from "@/lib/xano/shoes";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";
import type { TestInput } from "@/schemas/tests";

const DELETE_PACING_MS = 1200;
const ASSIGN_PACING_MS = 500;

export async function createTestAction(
  input: TestInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await createTest(session.token, { brand_id: input.brandId, name: input.name });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/tests");
  return undefined;
}

export async function updateTestAction(
  id: number,
  input: TestInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateTest(session.token, id, { brand_id: input.brandId, name: input.name });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/tests");
  return undefined;
}

export async function deleteTests(
  ids: number[],
): Promise<{ deletedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { deletedCount: 0, error: "Unauthorized." };
  }

  let deletedCount = 0;
  for (let i = 0; i < ids.length; i++) {
    try {
      await deleteTest(session.token, ids[i]);
      deletedCount++;
    } catch (err) {
      if (err instanceof XanoApiError && err.status === 404) {
        return {
          deletedCount,
          error: "Delete isn't available yet — add DELETE /admin/test/{id} in Xano first.",
        };
      }
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return { deletedCount, error: `Stopped after ${deletedCount} of ${ids.length} — ${message}` };
    }

    if (i < ids.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELETE_PACING_MS));
    }
  }

  revalidatePath("/admin/tests");
  return { deletedCount };
}

export async function assignShoesToTest(
  testId: number,
  shoeIds: number[],
  config: { refMagnet: string; refSensor: string },
): Promise<{ assignedCount: number; error?: string }> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { assignedCount: 0, error: "Unauthorized." };
  }

  let assignedCount = 0;
  for (let i = 0; i < shoeIds.length; i++) {
    try {
      // The magnet/sensor installed in the shoe are properties of the shoe
      // itself (test_shoe has no room for them), set at the moment it's
      // configured for a test — same magnet/sensor applied to every shoe
      // in this batch.
      await updateShoe(session.token, shoeIds[i], {
        ref_magnet: config.refMagnet,
        ref_sensor: config.refSensor,
      });
      await createTestShoe(session.token, { shoe_id: shoeIds[i], test_id: testId });
      assignedCount++;
    } catch (err) {
      const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
      return {
        assignedCount,
        error: `Stopped after ${assignedCount} of ${shoeIds.length} — ${message}`,
      };
    }

    if (i < shoeIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, ASSIGN_PACING_MS));
    }
  }

  revalidatePath("/admin/tests");
  return { assignedCount };
}

export async function updateAssignedShoeConfig(
  shoeId: number,
  config: { model: string; refMagnet: string; refSensor: string },
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateShoe(session.token, shoeId, {
      model: config.model,
      ref_magnet: config.refMagnet,
      ref_sensor: config.refSensor,
    });
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/tests");
  return undefined;
}

export async function unassignShoeFromTest(
  testShoeId: number,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await deleteTestShoe(session.token, testShoeId);
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/tests");
  return undefined;
}
