import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listResults } from "@/lib/xano/results";
import { XanoApiError, xanoErrorMessage } from "@/lib/xano/client";

// Thin server-side proxy: the Xano bearer token lives in an httpOnly cookie
// and must never reach client JS, so the browser calls this route instead of
// Xano directly.
export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const platform = searchParams.get("platform");
  const idNfc = searchParams.get("idNfc");

  try {
    const results = await listResults(session.token, {
      from: from ? Number(from) : undefined,
      to: to ? Number(to) : undefined,
      platform: platform || undefined,
      idNfc: idNfc || undefined,
    });
    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof XanoApiError ? xanoErrorMessage(err) : "Unexpected error.";
    // Forward Xano's real status (429 in particular) so the client can tell
    // "rate limited, back off and retry" apart from a hard failure.
    const status = err instanceof XanoApiError ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
