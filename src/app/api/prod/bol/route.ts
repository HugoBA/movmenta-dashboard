import type { NextRequest } from "next/server";
import { handleLineLogsRequest } from "@/lib/line-logs/route-handler";

export function GET(request: NextRequest) {
  return handleLineLogsRequest(request, "bol");
}
