import { cn } from "@/lib/utils";

const toneClass = {
  ok: "bg-brand-good/12 text-brand-good",
  watch: "bg-brand-warn/12 text-brand-warn",
  critical: "bg-primary/14 text-primary",
  off: "bg-white/5 text-text-faint",
} as const;

export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof toneClass;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 font-mono text-xs font-semibold",
        toneClass[tone],
      )}
    >
      {children}
    </span>
  );
}
