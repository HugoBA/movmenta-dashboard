"use client";

import { useEffect, useRef, useState } from "react";
import type { Line, LineLog } from "@/lib/xano/line-logs";

const CHUNK = 100;

// Fetches every record (any date) of `line` for the given sensors, once per
// sensor: the traceability view uses it to find a shoe's BOL record when its
// EOL scan happened on another day, and vice versa. Newly appearing sensors
// trigger a fetch for just those sensors.
export function useSensorLookup(line: Line, sensorIds: string[], enabled: boolean) {
  const [rows, setRows] = useState<LineLog[]>([]);
  // Sensors whose lookup finished (found or not) — lets the UI tell
  // "no record" apart from "still looking".
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  // Sensors already fetched or in flight. `line` is fixed per hook instance.
  const requested = useRef(new Set<string>());

  const key = enabled ? [...sensorIds].sort().join(",") : "";

  useEffect(() => {
    if (!key) return;
    const missing = key.split(",").filter((id) => !requested.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => requested.current.add(id));

    // Not cancelled on re-render: a later render with more sensors must not
    // drop a fetch already under way for these ones.
    (async () => {
      for (let i = 0; i < missing.length; i += CHUNK) {
        const chunk = missing.slice(i, i + CHUNK);
        try {
          const res = await fetch(`/api/prod/${line}?sensor_ids=${encodeURIComponent(chunk.join(","))}`, {
            cache: "no-store",
          });
          if (!res.ok) throw new Error(String(res.status));
          const found: LineLog[] = await res.json();
          setRows((prev) => {
            const known = new Set(prev.map((r) => r.id));
            return [...prev, ...found.filter((r) => !known.has(r.id))];
          });
          setChecked((prev) => new Set([...prev, ...chunk]));
        } catch {
          // Let a later render retry these sensors.
          chunk.forEach((id) => requested.current.delete(id));
        }
      }
    })();
  }, [line, key]);

  return { rows, checked };
}
