import type { UserRole } from "@/types/auth";

export function homeRouteForRole(role: UserRole): string {
  return role === "admin" ? "/admin/overview" : "/client/overview";
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin";
}

const roleLabels: Record<UserRole, string> = {
  admin: "Sollo admin",
  user: "Marque",
};

export function roleLabel(role: UserRole): string {
  return roleLabels[role];
}
