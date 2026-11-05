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

// A date filter: both ends at start of day, equal for a single date.
export interface DayRange {
  from: Date;
  to: Date;
}

export function singleDay(d: Date): DayRange {
  const day = startOfDay(d);
  return { from: day, to: day };
}

function isSingleDay(range: DayRange) {
  return range.from.getTime() === range.to.getTime();
}

export function formatDay(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatTimestamp(ms: number) {
  const d = new Date(ms);
  return `${formatDay(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatRange(range: DayRange) {
  if (isSingleDay(range)) return formatDay(range.from);
  return `${formatDay(range.from)} – ${formatDay(range.to)}`;
}

function isoDay(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isoRange(range: DayRange) {
  if (isSingleDay(range)) return isoDay(range.from);
  return `${isoDay(range.from)}_${isoDay(range.to)}`;
}

// The page shows days in the viewer's time zone; the API filters on UTC ms.
export function dayBounds(range: DayRange | undefined): { from?: number; to?: number } {
  return range ? { from: range.from.getTime(), to: endOfDay(range.to).getTime() } : {};
}

// Time only when the scan is on the single day picked in the filter (the date
// is already on screen); otherwise dd/mm hh:mm:ss (e.g. a date range,
// "All days", or a BOL record found on an earlier day).
export function formatWhen(ms: number, range: DayRange | undefined) {
  const d = new Date(ms);
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  if (range && isSingleDay(range) && startOfDay(d).getTime() === range.from.getTime()) return time;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${time}`;
}
