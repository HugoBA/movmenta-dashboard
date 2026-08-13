import { xanoFetch, XanoApiError, xanoErrorMessage } from "./client";

// Matches the "sensor_ref" query group (see /apispec:query:4011136:FwZiaBAf) —
// the sensor reference lookup used when configuring a shoe for a test.
export interface SensorRefRecord {
  id: number;
  created_at: number;
  name: string;
}

export async function listSensorRefs(token: string) {
  return xanoFetch<SensorRefRecord[]>("/admin/sensor_ref", { token });
}

export async function safeListSensorRefs(
  token: string,
): Promise<{ sensorRefs: SensorRefRecord[]; error: string | null }> {
  try {
    return { sensorRefs: await listSensorRefs(token), error: null };
  } catch (err) {
    return {
      sensorRefs: [],
      error: err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.",
    };
  }
}

export async function createSensorRef(token: string, input: { name: string }) {
  return xanoFetch<SensorRefRecord>("/admin/sensor_ref", { method: "POST", token, body: input });
}

export async function updateSensorRef(token: string, id: number, input: { name: string }) {
  return xanoFetch<SensorRefRecord>(`/admin/sensor_ref/${id}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export async function deleteSensorRef(token: string, id: number) {
  return xanoFetch<null>(`/admin/sensor_ref/${id}`, { method: "DELETE", token });
}
