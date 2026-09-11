"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createDashboardUser,
  deleteDashboardUser,
  updateDashboardUser,
  updateDashboardUserActive,
  updateDashboardUserLogo,
} from "@/lib/xano/dashboard-user";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";
import type { CreateBrandInput, UpdateBrandInput } from "@/schemas/admin";

export async function createBrand(
  input: CreateBrandInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await createDashboardUser(session.token, {
      username: input.username,
      role: "brand",
      brand_id: input.brandId,
      active: true,
      password: input.password,
    });
  } catch {
    return { error: "Could not create the brand account — the username may already be taken." };
  }

  revalidatePath("/admin/clients");
}

export async function toggleBrandActive(id: number, active: boolean) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return;

  await updateDashboardUserActive(session.token, id, active);
  revalidatePath("/admin/clients");
}

export async function updateBrand(
  id: number,
  input: UpdateBrandInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateDashboardUser(session.token, id, {
      username: input.username,
      brand_id: input.brandId,
      ...(input.password ? { password: input.password } : {}),
    });
  } catch {
    return { error: "Could not update this account — the username may already be taken." };
  }

  revalidatePath("/admin/clients");
}

export async function uploadBrandLogoAction(
  id: number,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." };
  }

  try {
    await updateDashboardUserLogo(session.token, id, file);
  } catch (err) {
    return { error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error." };
  }

  revalidatePath("/admin/clients");
}

export async function deleteBrand(id: number): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await deleteDashboardUser(session.token, id);
  } catch {
    return { error: "Could not delete this account." };
  }

  revalidatePath("/admin/clients");
}
