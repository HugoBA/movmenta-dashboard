import { PageHeader } from "@/components/layout/page-header";
import { CreateBrandDialog } from "@/features/clients/create-brand-dialog";
import { BrandsTable } from "@/features/clients/brands-table";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / BRANDS"
        eyebrowTone="cyan"
        title="Brand access"
        subtitle="Manage the login each brand uses to access their dashboard"
        controls={<CreateBrandDialog />}
      />
      <BrandsTable />
    </div>
  );
}
