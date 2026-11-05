import { PageHeader } from "@/components/layout/page-header";
import { LineLogsClient } from "@/features/line-logs/line-logs-client";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / PRODUCTION"
        eyebrowTone="cyan"
        title="BOL entries"
        subtitle="Beginning of line: each sensor read on its sheet before assembly"
      />
      <LineLogsClient line="bol" tracePath="/admin/production/line" />
    </div>
  );
}
