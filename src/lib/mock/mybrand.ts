import type { TestRecord } from "@/lib/xano/tests";
import type { ShoeBrandRecord } from "@/lib/xano/shoe-brands";
import type { TestShoeRecord } from "@/lib/xano/test-shoe";
import type { ShoeRecord } from "@/lib/xano/shoes";
import type { ResultRecord } from "@/lib/xano/results";
import type { UserProfileRecord } from "@/lib/xano/user-profiles";
import type { RunDetails, RunWeather, WeatherCondition } from "@/features/user-profile/run-details";

// Deterministic sales-demo dataset for the fictional "MYBRAND" enterprise
// account. No Xano involved — everything below is generated once at module
// load, seeded so the numbers stay stable across requests/reloads. Only the
// generation "now" anchor moves (so tests always look "1-3 months old").

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTH_MS = 30.44 * DAY_MS;

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260901);

function randRange(min: number, max: number): number {
  return min + rand() * (max - min);
}

function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

// --- Per-run detail (weather, elevation, route) ---------------------------
// No real geography here: the route is an abstract stylized path, not GPS
// coordinates on an actual map — but it's produced in the same RunDetails
// shape (src/features/user-profile/run-details.ts) that real Strava-synced
// results use, so RunsPanel doesn't need to know which source it's looking
// at. Weather has no real-data equivalent yet, so it's mock-only for now.

interface RoutePoint {
  x: number;
  y: number;
  elevation: number;
}

const WEATHER_CONDITIONS: { condition: WeatherCondition; weight: number }[] = [
  { condition: "Sunny", weight: 4 },
  { condition: "Clear", weight: 3 },
  { condition: "Cloudy", weight: 3 },
  { condition: "Windy", weight: 1.5 },
  { condition: "Rainy", weight: 1.5 },
];

function pickWeighted<T>(options: { condition: T; weight: number }[]): T {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let r = rand() * total;
  for (const option of options) {
    r -= option.weight;
    if (r <= 0) return option.condition;
  }
  return options[options.length - 1].condition;
}

function generateRunWeather(tempC: number): RunWeather {
  return {
    condition: pickWeighted(WEATHER_CONDITIONS),
    tempC: Math.round(tempC),
    windKmh: Math.round(randRange(2, 26)),
  };
}

// A gently looping, organic route (real runs often wander and loop back
// near their start) with a rolling elevation profile. One consistent
// style throughout — smooth drifting curve, no straight grid segments
// mixed in. elevationGainM is derived from the profile itself (sum of
// uphill segments), not assumed up front, so the stat always matches
// what the chart shows.
function generateRoute(
  km: number,
): Pick<RunDetails, "routePoints" | "elevationProfile" | "elevationGainM"> {
  const nPoints = Math.round(clamp(km * 6, 12, 80));
  const stepDist = km / nPoints;
  let bearing = randRange(0, 2 * Math.PI);

  let x = 0;
  let y = 0;
  let elevation = 0;
  let gain = 0;
  const polyline: RoutePoint[] = [{ x, y, elevation }];

  for (let i = 1; i < nPoints; i++) {
    let turn = randRange(-0.28, 0.28);
    if (i > nPoints / 2) {
      // Gently curve back toward the start, like a loop heading home.
      const angleHome = Math.atan2(-y, -x);
      const diff = Math.atan2(Math.sin(angleHome - bearing), Math.cos(angleHome - bearing));
      turn += clamp(diff, -0.3, 0.3) * 0.35;
    }
    bearing += turn;
    x += Math.cos(bearing) * stepDist;
    y += Math.sin(bearing) * stepDist;

    const delta = randRange(-1.2, 1.2) + (rand() < 0.15 ? randRange(0, 3) : 0);
    elevation += delta;
    if (delta > 0) gain += delta;
    polyline.push({ x, y, elevation });
  }

  // Force an exact closed loop — start and finish at the same spot, same
  // elevation — by linearly detrending the drift across the route (0
  // correction at the start, full correction at the end). Keeps the
  // organic wandering shape (and the true total climbed, tracked in `gain`
  // before this correction) while guaranteeing it lands back home level.
  const driftX = polyline[polyline.length - 1].x;
  const driftY = polyline[polyline.length - 1].y;
  const driftElevation = polyline[polyline.length - 1].elevation;
  const last = polyline.length - 1;
  for (let i = 0; i <= last; i++) {
    const t = i / last;
    polyline[i].x = Number((polyline[i].x - driftX * t).toFixed(3));
    polyline[i].y = Number((polyline[i].y - driftY * t).toFixed(3));
    polyline[i].elevation = Math.round(polyline[i].elevation - driftElevation * t);
  }

  return {
    routePoints: polyline.map((p) => ({ x: p.x, y: p.y })),
    elevationProfile: polyline.map((p, i) => ({ distanceKm: i * stepDist, elevationM: p.elevation })),
    elevationGainM: Math.round(gain),
  };
}

// Real sensor calibration curve (provided by the team): raw sensor reading
// <-> midsole compression in mm. mm decreases as the shoe wears; the raw
// sensor value moves the opposite way. Calibrated over ~[486, 34mm] (new)
// to ~[1944, 10mm] (end of life) — used so the mock's raw values/percent
// are derived the same way the real sensor would report them, not guessed.
function sensorValueToMm(sensorValue: number): number {
  const x = sensorValue;
  return (
    -2.92033143e-14 * x ** 5 +
    1.80359411e-10 * x ** 4 -
    4.45707379e-7 * x ** 3 +
    0.00055810254 * x ** 2 -
    0.366701956 * x +
    123.336611
  );
}

function mmToSensorValue(targetMm: number): number {
  let minSensor = 400;
  let maxSensor = 2000;
  const tolerance = 0.01;

  for (let i = 0; i < 50; i++) {
    const midSensor = (minSensor + maxSensor) / 2;
    const midMm = sensorValueToMm(midSensor);
    if (Math.abs(midMm - targetMm) < tolerance) return midSensor;
    // sensorValueToMm is decreasing: too much mm means too little sensor value.
    if (midMm > targetMm) minSensor = midSensor;
    else maxSensor = midSensor;
  }
  return (minSensor + maxSensor) / 2;
}

const MM_NEW = 34; // calibration endpoint: unworn midsole
const MM_END_OF_LIFE = 10; // calibration endpoint: fully worn midsole
const MIN_WEAR_PERCENT = 35; // shoes in an active test never read below this — anything worse would already be pulled

const MALE_FIRST_NAMES = [
  "Hugo", "Nathan", "Louis", "Gabriel", "Adam", "Théo", "Jules", "Arthur",
  "Noah", "Mathis", "Liam", "Oscar", "Ethan", "Léo", "Raphaël",
] as const;

const FEMALE_FIRST_NAMES = [
  "Léa", "Emma", "Chloé", "Manon", "Camille", "Sarah", "Inès", "Zoé",
  "Lucie", "Clara", "Julia", "Alice", "Nora", "Anna", "Maya",
] as const;

const LAST_NAMES = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Petit", "Durand",
  "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia",
  "David", "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard",
  "André", "Mercier", "Dupont", "Lambert", "Bonnet", "François", "Martinez",
  "Legrand", "Garnier",
] as const;

const usedNames = new Set<string>();
function uniqueName(gender: "Male" | "Female"): { firstName: string; lastName: string } {
  const pool = gender === "Male" ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES;
  for (let attempt = 0; attempt < 200; attempt++) {
    const firstName = pick(pool);
    const lastName = pick(LAST_NAMES);
    const key = `${firstName} ${lastName}`;
    if (!usedNames.has(key)) {
      usedNames.add(key);
      return { firstName, lastName };
    }
  }
  const suffix = usedNames.size;
  return { firstName: pick(pool), lastName: `${pick(LAST_NAMES)}-${suffix}` };
}

export const MYBRAND_BRAND: ShoeBrandRecord = {
  id: 9001,
  created_at: Date.now() - 6 * MONTH_MS,
  brand_name: "MYBRAND",
};

interface TestPlan {
  id: number;
  name: string;
  monthsAgo: number;
  testerCount: number;
  model: string;
  variant: string;
  weeklyKmRange: [number, number];
  // Total distance a shoe of this model is expected to last before reaching
  // MM_END_OF_LIFE — a few months of testing only consumes a slice of it.
  fullLifeKmRange: [number, number];
}

const TEST_PLANS: TestPlan[] = [
  {
    id: 9001,
    name: "Trailblazer Pro — Durability Trial",
    monthsAgo: 3,
    testerCount: 22,
    model: "Trailblazer Pro",
    variant: "Trail",
    weeklyKmRange: [15, 35],
    fullLifeKmRange: [520, 650],
  },
  {
    id: 9002,
    name: "Urban Runner — Everyday Wear",
    monthsAgo: 2,
    testerCount: 20,
    model: "Urban Runner",
    variant: "Street",
    weeklyKmRange: [8, 20],
    fullLifeKmRange: [600, 750],
  },
  {
    id: 9003,
    name: "Marathon Elite — Race Prep",
    monthsAgo: 1,
    testerCount: 18,
    model: "Marathon Elite",
    variant: "Race",
    weeklyKmRange: [20, 45],
    fullLifeKmRange: [500, 620],
  },
];

const PHONE_POOL = {
  ios: [
    { phone_brand: "Apple", phone_model: "iPhone 13" },
    { phone_brand: "Apple", phone_model: "iPhone 14" },
    { phone_brand: "Apple", phone_model: "iPhone 15" },
  ],
  android: [
    { phone_brand: "Samsung", phone_model: "Galaxy S22" },
    { phone_brand: "Samsung", phone_model: "Galaxy S23" },
    { phone_brand: "Google", phone_model: "Pixel 8" },
  ],
};

const now = Date.now();

const tests: TestRecord[] = [];
const shoes: ShoeRecord[] = [];
const testShoes: TestShoeRecord[] = [];
const results: ResultRecord[] = [];
const profiles: UserProfileRecord[] = [];
const runDetailsByPostId = new Map<number, RunDetails>();

let shoeIdCounter = 9101;
let testShoeIdCounter = 9201;
let resultIdCounter = 9301;
let profileIdCounter = 9401;

for (const plan of TEST_PLANS) {
  const testStart = now - plan.monthsAgo * MONTH_MS;
  tests.push({
    id: plan.id,
    created_at: testStart,
    brand_id: MYBRAND_BRAND.id,
    name: plan.name,
  });

  for (let t = 0; t < plan.testerCount; t++) {
    const gender = rand() < 0.5 ? "Male" : "Female";
    const { firstName, lastName } = uniqueName(gender);
    const idNfc = `MB-${plan.id}-${String(t + 1).padStart(2, "0")}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`.replace(/[éèêë]/g, "e");
    const size = randInt(38, 45);
    const weight = randInt(55, 95); // kg — drives cushioning-loss rate below
    const factoryMm = randRange(MM_NEW - 0.5, MM_NEW + 0.5); // manufacturing tolerance
    const factoryValue = Math.round(mmToSensorValue(factoryMm));
    const mmFloor = MM_END_OF_LIFE + (MIN_WEAR_PERCENT / 100) * (factoryMm - MM_END_OF_LIFE);
    const shoeId = shoeIdCounter++;

    const shoe: ShoeRecord = {
      id: shoeId,
      created_at: testStart - randInt(0, 5) * DAY_MS,
      id_nfc: idNfc,
      serial_number: `SN-${plan.id}${String(t + 1).padStart(3, "0")}`,
      size_code: String(size),
      brand: MYBRAND_BRAND.brand_name,
      model: plan.model,
      variant: plan.variant,
      gender,
      size: String(size),
      ref_magnet: `MAG-${randInt(100, 199)}`,
      ref_sensor: `SNS-${randInt(20, 40)}A`,
      factory_value: factoryValue,
      factory_value_deviation: Number(randRange(2, 5).toFixed(1)),
      factory_read_count: randInt(3, 6),
      factory_temp: Number(randRange(20, 23).toFixed(1)),
      brand_id: MYBRAND_BRAND.id,
      firstname: firstName,
      lastname: lastName,
      email,
    };
    shoes.push(shoe);
    testShoes.push({
      id: testShoeIdCounter++,
      created_at: shoe.created_at,
      shoe_id: shoeId,
      test_id: plan.id,
    });

    // --- plan every wear session first, THEN sort chronologically. Sessions
    // are picked with a random day-in-week offset, so generation order isn't
    // necessarily date order — we must process them in true date order for
    // the monotonic-wear clamp below to mean anything. ---
    const weeklyKmTarget = randRange(...plan.weeklyKmRange);
    // Heavier runners generate higher ground-reaction forces per stride, so
    // the midsole reaches end-of-life sooner relative to distance covered.
    // Reference bodyweight ~70kg; exponent + per-tester noise keep this a
    // visible-but-noisy trend rather than a suspiciously perfect line.
    const REFERENCE_WEIGHT_KG = 70;
    const weightWearExponent = 1.2;
    const baseFullLifeKm = randRange(...plan.fullLifeKmRange);
    const fullLifeKm =
      baseFullLifeKm * (REFERENCE_WEIGHT_KG / weight) ** weightWearExponent * randRange(0.85, 1.15);
    const platform = rand() < 0.6 ? "ios" : "android";
    const phone = pick(PHONE_POOL[platform]);
    const paceMinPerKm = randRange(5.3, 7.2);

    const weeks = Math.max(1, Math.round((now - testStart) / (7 * DAY_MS)));
    const sessionPlans: { date: number; km: number }[] = [];
    for (let week = 0; week < weeks; week++) {
      if (rand() < 0.15) continue; // a quiet week now and then, like real testers
      const sessionsThisWeek = randInt(1, 3);
      for (let s = 0; s < sessionsThisWeek; s++) {
        const weekStart = testStart + week * 7 * DAY_MS;
        const sessionDate = weekStart + randInt(0, 6) * DAY_MS + randInt(7, 21) * 60 * 60 * 1000;
        if (sessionDate > now) continue;
        const sessionKm = Math.max(1, (weeklyKmTarget / sessionsThisWeek) * randRange(0.7, 1.3));
        sessionPlans.push({ date: sessionDate, km: sessionKm });
      }
    }
    sessionPlans.sort((a, b) => a.date - b.date);

    let cumulativeKm = 0;
    let resultCount = 0;

    // Sensor is precise: mm only ever decreases (wear accumulates), with a
    // tiny measurement wobble — percent and raw value are both derived from
    // this same clamped mm reading, so they inherit the same guarantee: a
    // shoe already at 60% condition can never read above ~61% again.
    let lastMm: number | null = null;
    const MAX_MM_RECOVERY = 0.1;

    function readMm(kmSoFar: number): number {
      const target = clamp(
        factoryMm - (kmSoFar / fullLifeKm) * (factoryMm - MM_END_OF_LIFE),
        mmFloor,
        factoryMm,
      );
      const raw = target + randRange(-0.08, 0.08);
      const recovered = lastMm === null ? raw : Math.min(raw, lastMm + MAX_MM_RECOVERY);
      lastMm = Number(clamp(recovered, mmFloor, factoryMm).toFixed(2));
      return lastMm;
    }

    function percentFromMm(mmValue: number): number {
      return Number(clamp(((mmValue - MM_END_OF_LIFE) / (factoryMm - MM_END_OF_LIFE)) * 100, 0, 100).toFixed(1));
    }

    function valueFromMm(mmValue: number): number {
      return Math.round(mmToSensorValue(mmValue));
    }

    for (const { date: sessionDate, km: sessionKm } of sessionPlans) {
      const durationMin = Math.round(sessionKm * paceMinPerKm);

      // Warmer runs wear the midsole faster per km covered — EVA/PU foam's
      // compression set worsens with heat. Reference ~19°C = neutral;
      // ±2.5%/°C nudges the internal wear-driving distance without
      // touching the km actually reported (that stays the true distance).
      const sessionTemp = randRange(8, 30);
      const tempMultiplier = 1 + (sessionTemp - 19) * 0.025;
      const wearKm = sessionKm * tempMultiplier;

      const preMm = readMm(cumulativeKm);
      cumulativeKm += wearKm;

      const preValue = valueFromMm(preMm);
      results.push({
        id: resultIdCounter++,
        created_at: sessionDate,
        id_nfc: idNfc,
        percent: percentFromMm(preMm),
        value: preValue,
        value_raw: String(preValue),
        temp: Number((sessionTemp + randRange(-0.3, 0.3)).toFixed(1)),
        mm: preMm,
        period: "Pre",
        km: 0,
        duration: 0,
        platform,
        phone_model: phone.phone_model,
        phone_brand: phone.phone_brand,
        bol_test: 0,
        profile_email: email,
      });

      const postMm = readMm(cumulativeKm);
      const postValue = valueFromMm(postMm);
      const postId = resultIdCounter++;
      results.push({
        id: postId,
        created_at: sessionDate + durationMin * 60 * 1000,
        id_nfc: idNfc,
        percent: percentFromMm(postMm),
        value: postValue,
        value_raw: String(postValue),
        temp: Number((sessionTemp + randRange(-0.3, 0.3)).toFixed(1)),
        mm: postMm,
        period: "Post",
        km: Number(sessionKm.toFixed(1)),
        duration: durationMin,
        platform,
        phone_model: phone.phone_model,
        phone_brand: phone.phone_brand,
        bol_test: 0,
        profile_email: email,
      });
      resultCount += 2;

      const { routePoints, elevationProfile, elevationGainM } = generateRoute(sessionKm);
      runDetailsByPostId.set(postId, {
        weather: generateRunWeather(sessionTemp),
        elevationGainM,
        routePoints,
        elevationProfile,
      });
    }

    profiles.push({
      id: profileIdCounter++,
      created_at: shoe.created_at,
      id_nfc: idNfc,
      age: randInt(22, 48),
      gender,
      shoeSize: size,
      weight,
      height: randInt(158, 195),
      firstName,
      lastName,
      email,
      phone: `+336${randInt(10000000, 99999999)}`,
      result_count: resultCount,
    });
  }
}

export const MYBRAND_TESTS: TestRecord[] = tests;
export const MYBRAND_SHOES: ShoeRecord[] = shoes;
export const MYBRAND_TEST_SHOES: TestShoeRecord[] = testShoes;
export const MYBRAND_RESULTS: ResultRecord[] = results;
export const MYBRAND_PROFILES: UserProfileRecord[] = profiles;
export const MYBRAND_RUN_DETAILS: Map<number, RunDetails> = runDetailsByPostId;
