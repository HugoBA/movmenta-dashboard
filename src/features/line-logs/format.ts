export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function formatDay(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatTimestamp(ms: number) {
  const d = new Date(ms);
  return `${formatDay(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function isoDay(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// The page shows days in the viewer's time zone; the API filters on UTC ms.
export function dayBounds(day: Date | undefined): { from?: number; to?: number } {
  return day ? { from: day.getTime(), to: endOfDay(day).getTime() } : {};
}

// Time only when the scan is on the day picked in the filter (the date is
// already on screen); otherwise a short dd/mm hh:mm (e.g. "All days", or a
// BOL record found on an earlier day).
export function formatWhen(ms: number, day: Date | undefined) {
  const d = new Date(ms);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (day && startOfDay(d).getTime() === day.getTime()) return time;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
