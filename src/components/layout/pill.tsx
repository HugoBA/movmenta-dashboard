import { cn } from "@/lib/utils";

export function Pill({
  children,
  tone = "default",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  tone?: "default" | "accent" | "invert";
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-medium transition-colors [&_svg]:size-4",
        tone === "default" &&
          "border-border bg-card text-muted-foreground hover:border-white/16 hover:text-foreground",
        tone === "accent" &&
          "border-primary bg-primary text-primary-foreground font-semibold hover:brightness-110",
        tone === "invert" &&
          "border-foreground bg-foreground text-background font-semibold hover:brightness-90",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
