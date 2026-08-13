import { cn } from "@/lib/utils";

export function EntityAvatar({
  initials,
  tone = "neutral",
}: {
  initials: string;
  tone?: "neutral" | "accent";
}) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-heading text-xs font-bold",
        tone === "neutral" &&
          "border-border bg-gradient-to-br from-[#2b3040] to-[#1a1d26] text-brand-cyan",
        tone === "accent" &&
          "border-transparent bg-gradient-to-br from-primary to-[#c73f10] text-[#1a0a04]",
      )}
    >
      {initials}
    </div>
  );
}
