import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canAccessProd } from "@/lib/permissions";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";
import { listLineLogs, type Line } from "@/lib/xano/line-logs";

function optionalNumber(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

// Shared GET handler for /api/prod/bol and /api/prod/eol. The Xano token
// stays in the httpOnly session cookie; the browser only ever talks to us.
export async function handleLineLogsRequest(request: NextRequest, line: Line) {
  const session = await getSession();
  if (!session || !canAccessProd(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const rows = await listLineLogs(session.token, line, {
      from: optionalNumber(searchParams.get("from")),
      to: optionalNumber(searchParams.get("to")),
      afterId: optionalNumber(searchParams.get("after_id")),
      sensorIds: searchParams.get("sensor_ids")?.split(",").map((s) => s.trim()).filter(Boolean),
    });
    return NextResponse.json(rows);
  } catch (err) {
    const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
    const status = err instanceof XanoApiError ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
