import { Panel } from "@/components/layout/panel";
import { wearDistribution } from "./mock-data";

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function WearDistributionDonut() {
  const arcs = wearDistribution.segments.map((segment, i) => {
    const priorValue = wearDistribution.segments
      .slice(0, i)
      .reduce((sum, s) => sum + s.value, 0);
    const length = (segment.value / wearDistribution.total) * CIRCUMFERENCE;
    const offset = (priorValue / wearDistribution.total) * CIRCUMFERENCE;
    return { ...segment, length, offset };
  });

  return (
    <Panel title="Wear level distribution" subtitle="All active products" delay={0.6}>
      <svg width="100%" height="180" viewBox="0 0 200 180">
        <g transform="translate(100,80)">
          <circle r={RADIUS} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
          {arcs.map((arc) => (
            <circle
              key={arc.label}
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth="16"
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={-arc.offset}
              transform="rotate(-90)"
            />
          ))}
          <text
            x="0"
            y="-2"
            textAnchor="middle"
            fontFamily="var(--font-heading)"
            fontSize="22"
            fill="#eef0f3"
            fontWeight="600"
          >
            {wearDistribution.total}
          </text>
          <text x="0" y="16" textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10" fill="#565d6c">
            products
          </text>
        </g>
      </svg>
      <div className="mt-1.5 flex justify-center gap-3.5">
        {wearDistribution.segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: segment.color }} />
            {segment.label}
          </div>
        ))}
      </div>
    </Panel>
  );
}
