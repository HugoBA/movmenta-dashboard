import { PageHeader } from "@/components/layout/page-header";
import { CreateAdminDialog } from "@/features/team/create-admin-dialog";
import { AdminsTable } from "@/features/team/admins-table";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / TEAM"
        eyebrowTone="cyan"
        title="SOLLO administrators"
        subtitle="Manage login access for the internal Sollo team"
        controls={<CreateAdminDialog />}
      />
      <AdminsTable />
    </div>
  );
}
