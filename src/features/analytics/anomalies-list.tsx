import { Panel } from "@/components/layout/panel";
import { anomalies } from "./mock-data";

const iconClass = {
  warn: "bg-brand-warn/14 text-brand-warn",
  critical: "bg-primary/14 text-primary",
} as const;

const iconGlyph = { warn: "⚠", critical: "!" } as const;

export function AnomaliesList() {
  return (
    <Panel title="Anomalies detected" subtitle="Requires review" delay={0.7}>
      <div className="flex flex-col gap-3">
        {anomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="flex items-start gap-3 rounded-lg border border-border-soft bg-white/[0.02] p-3"
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${iconClass[anomaly.tone]}`}
            >
              {iconGlyph[anomaly.tone]}
            </div>
            <div className="text-sm">
              <div className="mb-0.5 font-semibold">{anomaly.title}</div>
              <div className="text-xs text-text-faint">{anomaly.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
