import { cn } from "@/lib/utils";

const deltaToneClass = {
  up: "text-brand-good",
  down: "text-primary",
  warn: "text-brand-warn",
  neutral: "text-text-faint font-normal",
} as const;

const deltaIcon = { up: "↑", down: "↓", warn: "⚠", neutral: "" } as const;

export function StatTile({
  label,
  value,
  unit,
  delta,
  index = 0,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: {
    tone: "up" | "down" | "warn" | "neutral";
    value: string;
    context?: string;
  };
  index?: number;
}) {
  return (
    <div
      className="animate-rise relative overflow-hidden rounded-2xl border border-border-soft bg-card p-5"
      style={{ animationDelay: `${0.05 + index * 0.1}s` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)",
        }}
      />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-3 font-heading text-[34px] font-semibold tracking-tight">
        {value}
        {unit && (
          <span className="ml-1 text-base font-medium text-text-faint">
            {unit}
          </span>
        )}
      </p>
      {delta && (
        <p
          className={cn(
            "mt-2.5 flex items-center gap-1 font-mono text-sm font-semibold",
            deltaToneClass[delta.tone],
          )}
        >
          {deltaIcon[delta.tone]} {delta.value}
          {delta.context && (
            <span className="font-sans font-normal text-text-faint">
              {" "}
              {delta.context}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
