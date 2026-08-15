import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Table2,
  IdCard,
  Footprints,
  Tag,
  Tags,
  UserRoundSearch,
  FlaskConical,
  Cpu,
  LineChart,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSession } from "@/lib/auth/session";
import { canAccessAdmin, homeRouteForRole, roleLabel } from "@/lib/permissions";
import { initials } from "@/lib/formatting/initials";
import type { NavGroup } from "@/components/layout/nav-item";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!canAccessAdmin(session.user.role)) {
    redirect(homeRouteForRole(session.user.role));
  }

  // Nav item counts are disabled for now — they each required a full-table
  // GET on every admin navigation just to display a badge. Re-enable by
  // fetching safeListDashboardUsers/safeListTests/safeListShoeBrands here
  // and passing `count` back to the items below if that tradeoff is worth it.
  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          title: "Overview",
          href: "/admin/overview",
          icon: <LayoutDashboard />,
        },
        {
          title: "User detail",
          href: "/admin/user",
          icon: <UserRoundSearch />,
        },
      ],
    },
    {
      label: "Testing",
      items: [
        {
          title: "Tests",
          href: "/admin/tests",
          icon: <FlaskConical />,
        },
        {
          title: "Test results",
          href: "/admin/test-results",
          icon: <LineChart />,
        },
      ],
    },
    {
      label: "Data",
      items: [
        { title: "Raw results", href: "/admin/raw-data", icon: <Table2 /> },
        {
          title: "User profiles",
          href: "/admin/user-profiles",
          icon: <IdCard />,
        },
        { title: "Shoes", href: "/admin/shoes", icon: <Footprints /> },
        { title: "Shoe models", href: "/admin/shoe-models", icon: <Tag /> },
        {
          title: "Shoe brands",
          href: "/admin/shoe-brands",
          icon: <Tags />,
        },
        {
          title: "Sensor refs",
          href: "/admin/sensor-refs",
          icon: <Cpu />,
        },
      ],
    },
    {
      label: "Access",
      items: [
        {
          title: "Brands",
          href: "/admin/clients",
          icon: <User />,
        },
        {
          title: "Team",
          href: "/admin/users",
          icon: <Users />,
        },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        variant="admin"
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
