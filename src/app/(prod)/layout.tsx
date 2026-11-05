import { redirect } from "next/navigation";
import { ScanLine, PackageCheck, Route } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSession } from "@/lib/auth/session";
import { homeRouteForRole, roleLabel } from "@/lib/permissions";
import { initials } from "@/lib/formatting/initials";
import type { NavGroup } from "@/components/layout/nav-item";

export default async function ProdLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  // Admins have the same screens inside their own space (/admin/production).
  if (session.user.role === "admin") redirect("/admin/production/line");
  if (session.user.role !== "prod") redirect(homeRouteForRole(session.user.role));

  const navGroups: NavGroup[] = [
    {
      label: "Production line",
      items: [
        { title: "Line overview", href: "/prod/line", icon: <Route /> },
        { title: "BOL entries", href: "/prod/bol", icon: <ScanLine /> },
        { title: "EOL entries", href: "/prod/eol", icon: <PackageCheck /> },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        variant="client"
        groups={navGroups}
        org={{
          name: session.user.username,
          role: roleLabel(session.user.role),
          initials: initials(session.user.username),
        }}
      />
      <main className="min-w-0 flex-1 px-6 py-7 sm:px-10">{children}</main>
    </div>
  );
}
