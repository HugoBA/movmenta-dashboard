import { Pencil, MoreHorizontal } from "lucide-react";
import { Panel } from "@/components/layout/panel";
import { SearchInput } from "@/components/layout/search-input";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { RowActions } from "@/components/layout/row-actions";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  DataTable,
  DataTableCell,
  DataTableHeadRow,
  DataTableRow,
} from "@/components/layout/data-table";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { AccentTag } from "@/components/ui/accent-tag";
import { ActiveToggle } from "@/components/ui/active-toggle";
import { getSession } from "@/lib/auth/session";
import { safeListDashboardUsers } from "@/lib/xano/dashboard-user";
import { initials } from "@/lib/formatting/initials";
import { formatDate } from "@/lib/formatting/date";
import { toggleBrandActive } from "./actions";

export async function BrandsTable() {
  const session = await getSession();
  const { users, error } = session
    ? await safeListDashboardUsers(session.token)
    : { users: [], error: null };
  const brands = users.filter((user) => user.role === "user");

  if (error) {
    return (
      <Panel title="Brands" delay={0.2}>
        <p className="text-sm text-destructive">Couldn&apos;t load brands from Xano: {error}</p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Brands"
      subtitle={`${brands.length} account${brands.length === 1 ? "" : "s"} — one account per brand`}
      delay={0.2}
      right={
        <div className="flex items-center gap-2">
          <SearchInput placeholder="Search a brand…" />
          <ExportCsvButton
            filename="brands.csv"
            data={{
              headers: ["Brand", "Account", "Created", "Active"],
              rows: brands.map((brand) => ({
                Brand: brand.organization_name || brand.username,
                Account: brand.username,
                Created: formatDate(brand.created_at),
                Active: brand.active ? "Yes" : "No",
              })),
            }}
          />
        </div>
      }
    >
      <DataTable>
        <DataTableHeadRow headers={["Brand", "Account", "Created", "Active", ""]} />
        <tbody>
          {brands.map((brand) => {
            const name = brand.organization_name || brand.username;
            return (
              <DataTableRow key={brand.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <EntityAvatar initials={initials(name)} />
                    <div>
                      <div className="font-semibold">{name}</div>
                      <div className="text-xs text-text-faint">id: {brand.id}</div>
                    </div>
                  </div>
                </DataTableCell>
                <DataTableCell>
                  <AccentTag>{brand.username}</AccentTag>
                </DataTableCell>
                <DataTableCell>{formatDate(brand.created_at)}</DataTableCell>
                <DataTableCell>
                  <ActiveToggle
                    defaultChecked={brand.active}
                    onToggle={toggleBrandActive.bind(null, brand.id)}
                  />
                </DataTableCell>
                <DataTableCell className="pr-0">
                  <RowActions
                    actions={[
                      { label: "Edit", icon: <Pencil /> },
                      { label: "More options", icon: <MoreHorizontal /> },
                    ]}
                  />
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </tbody>
      </DataTable>

      <TablePagination from={brands.length ? 1 : 0} to={brands.length} total={brands.length} />
    </Panel>
  );
}
