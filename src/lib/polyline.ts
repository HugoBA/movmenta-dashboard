// Google Encoded Polyline Algorithm Format — the same encoding Strava (and
// most mapping APIs) use for `map.polyline`/`map.summary_polyline`. Decodes
// a string like "_hwiGq{lk@CA?CB@..." into an ordered list of coordinates.
// Reference: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
export interface LatLng {
  lat: number;
  lng: number;
}

export function decodePolyline(encoded: string): LatLng[] {
  const coordinates: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return coordinates;
}

const EARTH_RADIUS_KM = 6371;

// Flattens a short route (a run, not a continent) onto a local plane in km,
// centered on its first point — a simple equirectangular projection is
// indistinguishable from the truth at running distances, and it's all
// RouteChart needs (it just draws a shape, not a georeferenced map).
export function projectToLocalXY(points: LatLng[]): { x: number; y: number }[] {
  if (points.length === 0) return [];
  const lat0 = (points[0].lat * Math.PI) / 180;
  const lng0 = points[0].lng;

  return points.map((p) => ({
    x: (((p.lng - lng0) * Math.PI) / 180) * Math.cos(lat0) * EARTH_RADIUS_KM,
    y: (((p.lat * Math.PI) / 180) - lat0) * EARTH_RADIUS_KM,
  }));
}
