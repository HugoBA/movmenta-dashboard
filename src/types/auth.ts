// Matches Xano's dashboard_user table exactly (see /apispec:FwZiaBAf?type=json).
// "admin" = internal Sollo staff, full platform access.
// "user"  = one account per client brand; organizationName is that brand's identity.
export type UserRole = "admin" | "user";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  organizationName: string | null;
  active: boolean;
}

export interface Session {
  user: AuthUser;
  token: string;
}
