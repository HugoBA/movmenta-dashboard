import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ContentLoader } from "@/components/layout/content-loader";
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
      <Suspense fallback={<ContentLoader />}>
        <AdminsTable />
      </Suspense>
    </div>
  );
}
