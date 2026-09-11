// Matches Xano's dashboard_user table exactly (see /apispec:FwZiaBAf?type=json).
// "admin" = internal Sollo staff, full platform access.
// "brand" = one account per client brand, linked via brandId to a shoe_brand row.
export type UserRole = "admin" | "brand";

export interface AuthUser {
  id: number;
  username: string;
  role: UserRole;
  brandId: number | null;
  brandName: string | null;
  brandLogoUrl: string | null;
  active: boolean;
}

export interface Session {
  user: AuthUser;
  token: string;
}
