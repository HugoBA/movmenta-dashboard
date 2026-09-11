import { Panel } from "@/components/layout/panel";
import { SearchInput } from "@/components/layout/search-input";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
import { TablePagination } from "@/components/layout/table-pagination";
import { BrandRowActions } from "./brand-row-actions";
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
import { safeListShoeBrands } from "@/lib/xano/shoe-brands";
import { initials } from "@/lib/formatting/initials";
import { formatDate } from "@/lib/formatting/date";
import { toggleBrandActive } from "./actions";

export async function BrandsTable() {
  const session = await getSession();
  const [{ users, error }, { brands: shoeBrands }] = session
    ? await Promise.all([safeListDashboardUsers(session.token), safeListShoeBrands(session.token)])
    : [{ users: [], error: null }, { brands: [] }];
  const brands = users.filter((user) => user.role === "brand");
  const brandNameById = new Map(shoeBrands.map((b) => [b.id, b.brand_name]));

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
                Brand: (brand.brand_id && brandNameById.get(brand.brand_id)) || brand.username,
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
            const name = (brand.brand_id && brandNameById.get(brand.brand_id)) || brand.username;
            return (
              <DataTableRow key={brand.id}>
                <DataTableCell>
                  <div className="flex items-center gap-3">
                    <EntityAvatar initials={initials(name)} src={brand.logo?.url} />
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
                  <BrandRowActions brand={brand} brands={shoeBrands} />
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
