import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  eyebrowTone = "orange",
  title,
  subtitle,
  controls,
}: {
  eyebrow?: string;
  eyebrowTone?: "orange" | "cyan";
  title: string;
  subtitle?: string;
  controls?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div
            className={cn(
              "mb-2 flex items-center gap-2 font-mono text-xs tracking-wide",
              eyebrowTone === "orange" ? "text-primary" : "text-brand-cyan",
            )}
          >
            {eyebrowTone === "orange" && (
              <span className="h-1.5 w-1.5 rounded-full bg-brand-good shadow-[0_0_0_3px_rgba(79,209,143,0.15)]" />
            )}
            {eyebrow}
          </div>
        )}
        <h1 className="flex items-center gap-3 font-heading text-[28px] font-semibold tracking-tight">
          <span className="font-normal text-primary">/</span> {title}
        </h1>
        {subtitle && <p className="mt-2 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {controls && <div className="flex flex-wrap items-center gap-2.5">{controls}</div>}
    </div>
  );
}
