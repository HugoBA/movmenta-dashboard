import { Panel } from "@/components/layout/panel";
import { SearchInput } from "@/components/layout/search-input";
import { ExportCsvButton } from "@/components/layout/export-csv-button";
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
import { toggleAdminActive } from "./actions";
import { AdminRowActions } from "./admin-row-actions";

export async function AdminsTable() {
  const session = await getSession();
  const { users, error } = session
    ? await safeListDashboardUsers(session.token)
    : { users: [], error: null };
  const admins = users.filter((user) => user.role === "admin");

  if (error) {
    return (
      <Panel title="Administrators" delay={0.2}>
        <p className="text-sm text-destructive">
          Couldn&apos;t load administrators from Xano: {error}
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      title="Administrators"
      subtitle={`${admins.length} account${admins.length === 1 ? "" : "s"}`}
      delay={0.2}
      right={
        <div className="flex items-center gap-2">
          <SearchInput placeholder="Search an admin…" />
          <ExportCsvButton
            filename="admins.csv"
            data={{
              headers: ["User", "Role", "Created", "Active"],
              rows: admins.map((admin) => ({
                User: admin.username,
                Role: "admin",
                Created: formatDate(admin.created_at),
                Active: admin.active ? "Yes" : "No",
              })),
            }}
          />
        </div>
      }
    >
      <DataTable>
        <DataTableHeadRow headers={["User", "Role", "Created", "Active", ""]} />
        <tbody>
          {admins.map((admin) => (
            <DataTableRow key={admin.id}>
              <DataTableCell>
                <div className="flex items-center gap-3">
                  <EntityAvatar initials={initials(admin.username)} />
                  <div>
                    <div className="font-semibold">{admin.username}</div>
                    <div className="text-xs text-text-faint">id: {admin.id}</div>
                  </div>
                </div>
              </DataTableCell>
              <DataTableCell>
                <AccentTag>admin</AccentTag>
              </DataTableCell>
              <DataTableCell>{formatDate(admin.created_at)}</DataTableCell>
              <DataTableCell>
                <ActiveToggle
                  defaultChecked={admin.active}
                  onToggle={toggleAdminActive.bind(null, admin.id)}
                />
              </DataTableCell>
              <DataTableCell className="pr-0">
                <AdminRowActions admin={{ id: admin.id, username: admin.username }} />
              </DataTableCell>
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>

      <TablePagination from={admins.length ? 1 : 0} to={admins.length} total={admins.length} />
    </Panel>
  );
}
