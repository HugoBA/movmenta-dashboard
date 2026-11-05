"use client";

import dynamic from "next/dynamic";

// Rendered in the browser only: the default day ("today"), the time zone and
// every timestamp depend on the viewer's clock and time zone, which the
// server doesn't know.
const loading = () => <p className="py-10 text-center text-sm text-text-faint">Loading entries…</p>;

export const LineLogsClient = dynamic(() => import("./line-logs-view").then((m) => m.LineLogsView), {
  ssr: false,
  loading,
});

export const TraceClient = dynamic(() => import("./trace-view").then((m) => m.TraceView), {
  ssr: false,
  loading,
});
