// e.g. 52 -> "52 min", 64 -> "1 h 04", 90 -> "1 h 30" — "h" already marks the
// unit once hours are shown, so "min" would be redundant there.
export function formatDurationMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  return `${hours} h ${String(minutes).padStart(2, "0")}`;
}
