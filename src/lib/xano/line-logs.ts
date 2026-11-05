import { xanoFetch } from "./client";

// Production-line test logs, written by the line's test benches straight into
// Xano. Two tables:
// - bol_logs: Beginning Of Line — sensor read on its sheet before assembly.
// - eol_logs: End Of Line — sensor paired with the finished shoe's EPC.
//
// Xano endpoints (role "prod" or "admin"):
//   GET /prod/bol_log?from=&to=&after_id=&sensor_ids=
//   GET /prod/eol_log?from=&to=&after_id=&sensor_ids=
// from/to: created_at bounds in ms (inclusive, optional).
// after_id: only rows with id > after_id (optional, 0 = everything).
// sensor_ids: comma-separated id_nfc list, only rows for those sensors
//   (optional) — used to trace a sensor to its other stage on any date.
// Response: array of rows, newest first.

export type Line = "bol" | "eol";

export interface BolSensorReading {
  id_nfc: string;
  source: string;
  counter: number;
  std_dev: number;
  hard_rev: number;
  soft_rev: string;
  variance: number;
  raw_value: number;
  sheet_pos: number;
}

export interface BolLogRecord {
  id: number;
  created_at: number;
  success: boolean | null;
  status: string; // "success" | "error" | "hall_fail"
  error_message: string | null;
  sheet: number | null;
  sensor_count: number | null;
  id_nfc: string;
  payload: { sensors: BolSensorReading[] } | string | null;
  hall_result: string | null; // "PASS" | "FAIL" | null (older rows)
}

export interface EolLogRecord {
  id: number;
  created_at: number;
  success: boolean | null;
  status: string; // "success" | "error"
  error_message: string | null;
  id_nfc: string;
  epc: string | null;
  payload:
    | { epc: string; id_nfc: string; counter: number; std_dev: number; variance: number; factory_value: number }
    | string
    | null;
  shoe_id: number | null;
}

// What the dashboard actually displays: one shape for both lines.
export interface LineLog {
  id: number;
  createdAt: number;
  sensorId: string;
  epc: string | null;
  // EOL: payload.factory_value. BOL: the sensor's raw_value on the sheet.
  value: number | null;
  ok: boolean;
  // Why the entry failed; null when ok.
  cause: string | null;
}

export interface LineLogsQuery {
  from?: number;
  to?: number;
  afterId?: number;
  sensorIds?: string[];
}

function parsePayload<T>(payload: T | string | null): T | null {
  if (typeof payload !== "string") return payload;
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

function failureCause(status: string, errorMessage: string | null): string | null {
  if (status === "success") return null;
  if (errorMessage) return errorMessage;
  if (status === "hall_fail") return "Hall test failed";
  return status || "Unknown error";
}

function normalizeBolLog(row: BolLogRecord): LineLog {
  const payload = parsePayload(row.payload);
  const sensor = payload?.sensors?.find((s) => s.id_nfc === row.id_nfc) ?? payload?.sensors?.[0];
  return {
    id: row.id,
    createdAt: row.created_at,
    sensorId: row.id_nfc,
    epc: null,
    value: sensor?.raw_value ?? null,
    ok: row.status === "success",
    cause: failureCause(row.status, row.error_message),
  };
}

function normalizeEolLog(row: EolLogRecord): LineLog {
  const payload = parsePayload(row.payload);
  return {
    id: row.id,
    createdAt: row.created_at,
    sensorId: row.id_nfc,
    epc: row.epc ?? payload?.epc ?? null,
    value: payload?.factory_value ?? null,
    ok: row.status === "success",
    cause: failureCause(row.status, row.error_message),
  };
}

export async function listLineLogs(token: string, line: Line, query: LineLogsQuery): Promise<LineLog[]> {
  const params = new URLSearchParams();
  if (query.from !== undefined) params.set("from", String(query.from));
  if (query.to !== undefined) params.set("to", String(query.to));
  if (query.afterId) params.set("after_id", String(query.afterId));
  if (query.sensorIds?.length) params.set("sensor_ids", query.sensorIds.join(","));
  const qs = params.toString();

  if (line === "bol") {
    const rows = await xanoFetch<BolLogRecord[]>(`/prod/bol_log${qs ? `?${qs}` : ""}`, { token });
    return rows.map(normalizeBolLog);
  }
  const rows = await xanoFetch<EolLogRecord[]>(`/prod/eol_log${qs ? `?${qs}` : ""}`, { token });
  return rows.map(normalizeEolLog);
}
