import type { UserRole } from "@/types/auth";

export function homeRouteForRole(role: UserRole): string {
  if (role === "admin") return "/admin/overview";
  if (role === "prod") return "/prod/line";
  return "/client/overview";
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "admin";
}

// Both can read the line logs: prod in /prod, admins in /admin/production.
export function canAccessProd(role: UserRole): boolean {
  return role === "prod" || role === "admin";
}

const roleLabels: Record<UserRole, string> = {
  admin: "Sollo admin",
  brand: "Brand",
  prod: "Production line",
};

export function roleLabel(role: UserRole): string {
  return roleLabels[role];
}
