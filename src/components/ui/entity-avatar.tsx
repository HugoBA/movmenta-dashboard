import { cn } from "@/lib/utils";

export function EntityAvatar({
  initials,
  tone = "neutral",
  src,
}: {
  initials: string;
  tone?: "neutral" | "accent";
  src?: string | null;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- logos are arbitrary uploaded Xano-hosted images, not build-time assets
      <img
        src={src}
        alt=""
        className="h-8 w-8 shrink-0 rounded-lg border border-border object-cover"
      />
    );
  }

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
