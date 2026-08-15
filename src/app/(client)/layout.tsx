import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  BarChart3,
  Table2,
  Package,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSession } from "@/lib/auth/session";
import { roleLabel } from "@/lib/permissions";
import { initials } from "@/lib/formatting/initials";
import type { NavGroup } from "@/components/layout/nav-item";

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Overview", href: "/client/overview", icon: <LayoutDashboard /> },
      { title: "Usage", href: "/client/usage", icon: <TrendingUp /> },
    ],
  },
  {
    label: "Analyse",
    items: [
      { title: "Products", href: "/client/products", icon: <Target /> },
      { title: "Material analysis", href: "/client/material-analysis", icon: <BarChart3 /> },
      { title: "Reports", href: "/client/reports", icon: <Table2 /> },
    ],
  },
  {
    label: "Data",
    items: [{ title: "Exports", href: "/client/exports", icon: <Package /> }],
  },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = session.user.organizationName ?? session.user.username;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        variant="client"
        groups={navGroups}
        org={{
          name: displayName,
          role: roleLabel(session.user.role),
          initials: initials(displayName),
        }}
      />
      <main className="min-w-0 flex-1 px-6 py-7 sm:px-10">{children}</main>
    </div>
  );
}
