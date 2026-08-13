import { Panel } from "@/components/layout/panel";

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

export function DegradationChart() {
  return (
    <Panel
      title="Degradation over time"
      subtitle="Average compression index — last 90 days"
      delay={0.55}
      right={
        <div className="flex gap-3.5">
          <LegendDot color="#ff6a3d" label="Model X" />
          <LegendDot color="#4fd1e8" label="Model Y" />
        </div>
      }
    >
      <svg width="100%" height="180" viewBox="0 0 560 180" preserveAspectRatio="none">
        <defs>
          <linearGradient id="degradation-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff6a3d" stopOpacity="0.35" />
            <stop offset="1" stopColor="#ff6a3d" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.05)" strokeWidth="1">
          <line x1="0" y1="30" x2="560" y2="30" />
          <line x1="0" y1="75" x2="560" y2="75" />
          <line x1="0" y1="120" x2="560" y2="120" />
          <line x1="0" y1="165" x2="560" y2="165" />
        </g>
        <path
          d="M0 140 C60 130 90 110 140 105 C200 98 230 70 290 60 C340 52 380 40 440 35 C480 32 520 20 560 15"
          stroke="#ff6a3d"
          strokeWidth="2.2"
          fill="none"
        />
        <path
          d="M0 140 C60 130 90 110 140 105 C200 98 230 70 290 60 C340 52 380 40 440 35 C480 32 520 20 560 15 L560 180 L0 180 Z"
          fill="url(#degradation-fill)"
        />
        <path
          d="M0 165 C70 160 120 150 170 148 C230 145 270 130 320 120 C370 110 420 95 470 88 C500 84 530 78 560 72"
          stroke="#4fd1e8"
          strokeWidth="2"
          fill="none"
          opacity="0.85"
        />
      </svg>
    </Panel>
  );
}
