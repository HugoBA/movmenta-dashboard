import type { AuthUser, UserRole } from "@/types/auth";

// Shape returned by GET /auth/me (see /apispec:FwZiaBAf?type=json) — this is
// the caller's own dashboard_user record, surfaced via $auth.extras. logo is
// the account's own uploaded logo (see lib/xano/dashboard-user.ts). There's
// no resolved shoe_brand.brand_name here — the display name falls back to
// the account's own username, capitalized.
export interface XanoUserRecord {
  id: number;
  username: string;
  role: UserRole;
  active: boolean;
  brand_id?: number | null;
  logo?: { url: string } | null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function mapXanoUser(record: XanoUserRecord): AuthUser {
  return {
    id: record.id,
    username: record.username,
    role: record.role,
    active: record.active,
    brandId: record.brand_id ?? null,
    brandName: capitalize(record.username),
    brandLogoUrl: record.logo?.url ?? null,
  };
}
