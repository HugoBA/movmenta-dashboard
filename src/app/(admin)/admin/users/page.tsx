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
        title="Team & partners"
        subtitle="Login access for the Sollo team (admin) and production-line partners (prod)"
        controls={<CreateAdminDialog />}
      />
      <Suspense fallback={<ContentLoader />}>
        <AdminsTable />
      </Suspense>
    </div>
  );
}
