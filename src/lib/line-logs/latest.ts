import type { LineLog } from "@/lib/xano/line-logs";

// A sensor can be scanned several times at the same stage (retries after a
// failure, a re-scan). The dashboard only shows its latest record — the one
// with the highest id — and keeps the number of scans as context.
export interface SensorLatest {
  sensorId: string;
  latest: LineLog;
  scans: number;
}

export function latestBySensor(rows: LineLog[]): Map<string, SensorLatest> {
  const bySensor = new Map<string, SensorLatest>();
  for (const row of rows) {
    const current = bySensor.get(row.sensorId);
    if (!current) {
      bySensor.set(row.sensorId, { sensorId: row.sensorId, latest: row, scans: 1 });
    } else {
      current.scans += 1;
      if (row.id > current.latest.id) current.latest = row;
    }
  }
  return bySensor;
}
