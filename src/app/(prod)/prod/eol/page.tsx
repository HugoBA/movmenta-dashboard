import { PageHeader } from "@/components/layout/page-header";
import { LineLogsClient } from "@/features/line-logs/line-logs-client";

export default function Page() {
  return (
    <div>
      <PageHeader
        eyebrow="PRODUCTION LINE / EOL"
        eyebrowTone="orange"
        title="EOL entries"
        subtitle="End of line: each sensor paired with its shoe's EPC"
      />
      <LineLogsClient line="eol" />
    </div>
  );
}
