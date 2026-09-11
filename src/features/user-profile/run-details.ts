import type { ResultRecord } from "@/lib/xano/results";
import { decodePolyline, projectToLocalXY } from "@/lib/polyline";

// Per-run detail attached to a wear session, keyed by the "post"
// ResultRecord.id that closes it (see computeWearSessions). Weather isn't
// tracked on real results yet, so it stays optional — present on the
// MYBRAND demo, absent on real accounts until that data exists.
export type WeatherCondition = "Sunny" | "Clear" | "Cloudy" | "Windy" | "Rainy";

export interface RunWeather {
  condition: WeatherCondition;
  tempC: number;
  windKmh: number;
}

export interface RunDetails {
  elevationGainM?: number;
  routePoints?: { x: number; y: number }[]; // for RouteChart
  elevationProfile?: { distanceKm: number; elevationM: number }[]; // for the altitude chart
  weather?: RunWeather;
}

// Real `result` rows carry GPS/elevation straight from Strava (via the
// mobile app's sync): `polyline` is a Google Encoded Polyline string,
// `elevation_profile` an already-resampled distance/elevation curve. A run
// only needs a pre+post pair to show up at all (see computeWearSessions) —
// GPS/elevation is extra, shown when present and simply omitted otherwise.
export function buildRunDetailsFromResults(results: ResultRecord[]): Map<number, RunDetails> {
  const map = new Map<number, RunDetails>();

  for (const row of results) {
    if (row.period?.toLowerCase() !== "post") continue;
    if (!row.polyline || !row.elevation_profile || row.elevation_profile.length === 0) continue;

    const routePoints = projectToLocalXY(decodePolyline(row.polyline));
    const elevationProfile = row.elevation_profile.map((p) => ({
      distanceKm: p.distance_km,
      elevationM: p.elevation_m,
    }));

    let elevationGainM = 0;
    for (let i = 1; i < elevationProfile.length; i++) {
      const delta = elevationProfile[i].elevationM - elevationProfile[i - 1].elevationM;
      if (delta > 0) elevationGainM += delta;
    }

    map.set(row.id, {
      elevationGainM: Math.round(elevationGainM),
      routePoints,
      elevationProfile,
    });
  }

  return map;
}
