import { LayoutDashboard, User, Users } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { NavGroup } from "@/components/layout/nav-item";

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Overview", href: "/admin/overview", icon: <LayoutDashboard /> },
      { title: "Team", href: "/admin/users", icon: <Users /> },
    ],
  },
];

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        variant="admin"
        groups={navGroups}
        org={{ name: "Test Org", role: "Admin", initials: "TO" }}
      />
      <main className="min-w-0 flex-1 px-6 py-7 sm:px-10">Content</main>
    </div>
  );
}
