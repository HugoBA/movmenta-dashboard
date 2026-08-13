import { CircleCheck } from "lucide-react";
import { Panel } from "@/components/layout/panel";

// Placeholder — error reporting isn't tracked per-profile yet. Swap for a
// real Xano-backed list once that endpoint exists.
export function ErrorsPanel() {
  return (
    <Panel
      title="Reported errors"
      subtitle="Blabla"
    >
      <div className="flex flex-col items-center gap-2 py-6 text-center text-text-faint">
        <CircleCheck className="size-6 text-brand-good/70" />
        <p className="text-[13px]">No errors recorded for this profile.</p>
      </div>
    </Panel>
  );
}
