import type { ReactNode } from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  count?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
