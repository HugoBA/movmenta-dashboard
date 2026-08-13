import { Pill } from "@/components/layout/pill";

function Callout({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`absolute flex flex-col gap-0.5 rounded-lg border border-border bg-background/85 px-2.5 py-1.5 font-mono backdrop-blur-sm ${className}`}
    >
      <span className="text-base font-semibold text-foreground">{value}</span>
      <span className="text-[11px] uppercase tracking-wide text-text-faint">
        {label}
      </span>
    </div>
  );
}

export function HeroDataStory() {
  return (
    <div
      className="animate-rise relative grid grid-cols-1 items-center gap-5 overflow-hidden rounded-[20px] border border-border-soft p-8 lg:grid-cols-[1.1fr_1fr]"
      style={{
        animationDelay: "0.4s",
        background:
          "linear-gradient(160deg, rgba(255,106,61,0.06), rgba(79,209,232,0.03) 60%, transparent)",
      }}
    >
      <div className="bg-grid-fade pointer-events-none absolute inset-0" />

      <div className="relative z-10">
        <div className="mb-3 font-mono text-xs tracking-wide text-brand-cyan">
          {"// HERO DATA STORY"}
        </div>
        <h2 className="mb-3 font-heading text-2xl font-semibold leading-snug">
          Every sole tells a wear story — read it before it becomes a return.
        </h2>
        <p className="mb-5 max-w-[380px] text-[15px] leading-relaxed text-muted-foreground">
          Real-time compression, distance and material fatigue signals, mapped
          directly onto the product, from lab validation to real-world usage.
        </p>
        <Pill type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          Open live scan feed
        </Pill>
      </div>

      <div className="relative z-10 flex justify-center py-6">
        <svg width="300" height="200" viewBox="0 0 340 230" fill="none">
          <path
            d="M60 190 C40 160 45 120 65 90 C80 65 95 40 130 30 C170 18 220 25 250 45 C275 62 285 90 280 120 C275 150 255 175 220 190 C180 208 110 210 60 190 Z"
            stroke="#4fd1e8"
            strokeWidth="1.6"
            fill="rgba(79,209,232,0.05)"
          />
          <path
            d="M75 175 C60 150 65 115 82 92"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3 4"
          />
          <path
            d="M120 40 C160 32 205 38 235 55"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="3 4"
          />
          <circle cx="90" cy="150" r="4" fill="#ff6a3d" />
          <circle cx="210" cy="60" r="4" fill="#4fd1e8" />
          <circle cx="230" cy="140" r="4" fill="#ffb84f" />
        </svg>
        <Callout value="1 240 km" label="Heel strike zone" className="left-0 top-[6%]" />
        <Callout value="68%" label="Midsole compression" className="right-0 top-[42%]" />
        <Callout value="Stage 3" label="Material fatigue" className="bottom-0 left-[18%]" />
      </div>
    </div>
  );
}
