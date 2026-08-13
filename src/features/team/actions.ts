"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  createDashboardUser,
  deleteDashboardUser,
  updateDashboardUser,
  updateDashboardUserActive,
} from "@/lib/xano/dashboard-user";
import type { CreateAdminInput, UpdateAdminInput } from "@/schemas/admin";

export async function createAdmin(
  input: CreateAdminInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await createDashboardUser(session.token, {
      username: input.username,
      role: "admin",
      active: true,
      password: input.password,
    });
  } catch {
    return { error: "Could not create the admin account — the username may already be taken." };
  }

  revalidatePath("/admin/users");
}

export async function toggleAdminActive(id: number, active: boolean) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") return;

  await updateDashboardUserActive(session.token, id, active);
  revalidatePath("/admin/users");
}

export async function updateAdmin(
  id: number,
  input: UpdateAdminInput,
): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await updateDashboardUser(session.token, id, { username: input.username });
  } catch {
    return { error: "Could not update this account — the username may already be taken." };
  }

  revalidatePath("/admin/users");
}

export async function deleteAdmin(id: number): Promise<{ error: string } | undefined> {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized." };
  }

  try {
    await deleteDashboardUser(session.token, id);
  } catch {
    return { error: "Could not delete this account." };
  }

  revalidatePath("/admin/users");
}
