import { redirect } from "next/navigation";
import { LayoutDashboard, UserRoundSearch, FlaskConical, LineChart, Footprints } from "lucide-react";
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
      { title: "User detail", href: "/client/user", icon: <UserRoundSearch /> },
    ],
  },
  {
    label: "Testing",
    items: [
      { title: "Tests", href: "/client/tests", icon: <FlaskConical /> },
      { title: "Test results", href: "/client/test-results", icon: <LineChart /> },
      { title: "Shoes", href: "/client/shoes", icon: <Footprints /> },
    ],
  },
];

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const displayName = session.user.brandName ?? session.user.username;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        variant="client"
        groups={navGroups}
        org={{
          name: displayName,
          role: roleLabel(session.user.role),
          initials: initials(displayName),
          avatarUrl: session.user.brandLogoUrl,
        }}
      />
      <main className="min-w-0 flex-1 px-6 py-7 sm:px-10">{children}</main>
    </div>
  );
}
