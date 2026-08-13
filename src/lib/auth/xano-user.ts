import type { AuthUser, UserRole } from "@/types/auth";

// Shape returned by GET /auth/me (see /apispec:FwZiaBAf?type=json).
export interface XanoUserRecord {
  id: number;
  username: string;
  role: UserRole;
  active: boolean;
  organization_name?: string | null;
}

export function mapXanoUser(record: XanoUserRecord): AuthUser {
  return {
    id: record.id,
    username: record.username,
    role: record.role,
    active: record.active,
    organizationName: record.organization_name ?? null,
  };
}
