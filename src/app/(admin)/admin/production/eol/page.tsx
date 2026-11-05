import { PageHeader } from "@/components/layout/page-header";
import { LineLogsClient } from "@/features/line-logs/line-logs-client";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="ADMIN CONSOLE / PRODUCTION"
        eyebrowTone="cyan"
        title="EOL entries"
        subtitle="End of line: each sensor paired with its shoe's EPC"
      />
      <LineLogsClient line="eol" tracePath="/admin/production/line" />
    </div>
  );
}
