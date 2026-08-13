import type { ReactNode } from "react";
import Link from "next/link";
import { EntityAvatar } from "@/components/ui/entity-avatar";
import { initials } from "@/lib/formatting/initials";
import { cn } from "@/lib/utils";
import type { TesterHighlight } from "./compute";

export function LeaderCard({
  icon,
  label,
  highlight,
  index = 0,
}: {
  icon: ReactNode;
  label: string;
  highlight: TesterHighlight | null;
  index?: number;
}) {
  return (
    <div
      className={cn(
        "animate-rise relative overflow-hidden rounded-2xl border p-5",
        highlight ? "border-primary/30 bg-primary/[0.06]" : "border-border-soft bg-card",
      )}
      style={{ animationDelay: `${0.05 + index * 0.1}s` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.05), transparent 70%)" }}
      />
      <div className="mb-4 flex items-center gap-2 text-primary [&_svg]:size-4">
        {icon}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      {highlight ? (
        <Link
          href={`/admin/user?nfcId=${encodeURIComponent(highlight.idNfc)}`}
          className="group flex items-center gap-3"
        >
          <EntityAvatar initials={initials(highlight.label) || "?"} tone="accent" />
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-semibold tracking-tight group-hover:underline">
              {highlight.label}
            </p>
            <p className="mt-1 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
              {highlight.km.toFixed(1)} km
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <EntityAvatar initials="—" />
          <p className="text-sm text-text-faint">No session this week</p>
        </div>
      )}
    </div>
  );
}
