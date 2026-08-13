"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createDashboardUser, updateDashboardUserActive } from "@/lib/xano/dashboard-user";
import type { CreateBrandInput } from "@/schemas/admin";

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
      role: "user",
      organization_name: input.organizationName,
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
