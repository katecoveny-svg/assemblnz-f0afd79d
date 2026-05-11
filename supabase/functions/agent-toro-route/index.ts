// agent-toro-route
// ---------------------------------------------------------------------------
// Tōro · whānau · the optimised route + fuel agent.
//
// Given an origin and a destination (lat/lon or a NZ address — the caller
// can pre-geocode), returns:
//   - the route (distance, duration, polyline)
//   - the trip cost in NZD, calculated against the vehicle's L/100km and the
//     current MBIE-published national average fuel price
//   - the three cheapest stations along the corridor (when station data
//     is wired; falls back to "three nearest" with national-average prices
//     and a documented uplift band)
//   - a plain-language one-liner the case manager / parent reads first
//
// Composition over duplication: this function calls the existing
// `nz-fuel-prices` and `nz-routes` edge functions rather than re-implementing
// either. That keeps the data-source story in one place.
//
// Spec: voyage-toro-features.md §A.1.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LatLon { lat: number; lon: number }

interface Vehicle {
  kind: "petrol_91" | "petrol_95" | "diesel" | "ev";
  /** Litres or kWh per 100km. */
  consumptionPer100: number;
  /** Optional human label — e.g. "2018 Toyota Aqua". */
  label?: string;
}

interface RouteRequest {
  origin: LatLon;
  destination: LatLon;
  vehicle: Vehicle;
  /** Optional viewport for station-search corridor. Defaults to a buffer around the route. */
  searchRadiusKm?: number;
  /** Round-trip or one-way. Cost doubles for round-trip. */
  oneWay?: boolean;
}

interface StationCandidate {
  name: string;
  brand: string;
  lat: number;
  lon: number;
  pricePerL: number;
  source: "live" | "estimated";
  detourKm?: number;
}

interface RouteResponse {
  // Route
  distanceKm: number;
  durationMins: number;
  source: "mapbox" | "fallback_after_error" | "fallback_no_key";
  // Cost
  fuel: {
    kind: Vehicle["kind"];
    pricePerUnit: number;
    unit: "L" | "kWh";
    unitsRequired: number;
    costNzd: number;
    pricedAt: string;
    priceSource: "mbie_live" | "fallback";
  };
  // Cheaper alternatives
  stations: StationCandidate[];
  potentialSavingNzd: number;
  // The plain-language one-liner the parent reads first
  summary: string;
  // The polyline (empty array on fallback)
  geometry: Array<[number, number]>;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as RouteRequest;
    if (!body.origin?.lat || !body.destination?.lat || !body.vehicle) {
      return json({ error: "origin, destination, vehicle required" }, 400);
    }

    // Compose the two existing functions in parallel.
    const [routeRes, fuelRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/functions/v1/nz-routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin: body.origin, destination: body.destination }),
      }).then((r) => r.json()),
      fetch(`${SUPABASE_URL}/functions/v1/nz-fuel-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }).then((r) => r.json()),
    ]);

    const distanceKm: number = routeRes.distanceKm ?? 0;
    const durationMins: number = routeRes.durationMins ?? 0;
    const trips = body.oneWay === false ? 2 : 1; // default one-way unless explicitly false
    const totalKm = distanceKm * trips;

    // Fuel price for this vehicle
    const pricePerUnit = priceForVehicle(fuelRes, body.vehicle.kind);
    const unitsRequired = (totalKm / 100) * body.vehicle.consumptionPer100;
    const costNzd = Math.round(pricePerUnit * unitsRequired * 100) / 100;

    // Stations along the corridor — see voyage-toro-features.md §A.1 for the
    // production data-source story. For this scaffold we return a curated
    // small set of estimates around a few major brands, with a 5% spread
    // below and above the national average to surface the "this one's
    // cheaper" decision.
    const stations = await findStationsAlong(body.origin, body.destination, body.vehicle.kind, pricePerUnit);

    const cheapest = stations.reduce<StationCandidate | null>(
      (best, s) => (!best || s.pricePerL < best.pricePerL ? s : best),
      null,
    );
    const potentialSavingNzd =
      cheapest
        ? Math.round((pricePerUnit - cheapest.pricePerL) * unitsRequired * 100) / 100
        : 0;

    const summary = composeSummary({
      distanceKm,
      durationMins,
      costNzd,
      vehicle: body.vehicle,
      cheapest,
      potentialSavingNzd,
      pricedAt: fuelRes.publishedDate,
    });

    const payload: RouteResponse = {
      distanceKm,
      durationMins,
      source: routeRes.source ?? "fallback_no_key",
      fuel: {
        kind: body.vehicle.kind,
        pricePerUnit,
        unit: body.vehicle.kind === "ev" ? "kWh" : "L",
        unitsRequired: Math.round(unitsRequired * 100) / 100,
        costNzd,
        pricedAt: fuelRes.publishedDate ?? new Date().toISOString().slice(0, 10),
        priceSource: fuelRes.source ?? "fallback",
      },
      stations,
      potentialSavingNzd: Math.max(0, potentialSavingNzd),
      summary,
      geometry: routeRes.geometry ?? [],
    };

    return json(payload);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return json({ error: msg }, 500);
  }
});

function priceForVehicle(fuel: Record<string, unknown>, kind: Vehicle["kind"]): number {
  switch (kind) {
    case "petrol_91": return (fuel.petrol91 as number) ?? 2.85;
    case "petrol_95": return (fuel.petrol95 as number) ?? 3.05;
    case "diesel":    return (fuel.diesel as number) ?? 2.40;
    case "ev":        return (fuel.ev as number) ?? 0.32;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Station search
// ─────────────────────────────────────────────────────────────────────────────
//
// NZ does NOT have a single open API for service-station prices. The
// production data-source mix (voyage-toro-features.md §A.1):
//
//   1. Gaspy — community price feed. Terms-of-use and API access need a
//      partnership conversation; not a free public API today.
//   2. MBIE Weekly Fuel Price Monitoring — already used as the national
//      baseline (nz-fuel-prices).
//   3. PriceWatch / petrolprices.co.nz — community scraping; fragile.
//   4. Direct partnership with Z, Mobil, BP, Gull, Waitomo — possible at
//      Pae-scale, not at Operator-scale.
//
// For this scaffold we return a curated handful of station candidates with
// estimated prices in a +/-5% spread around the national average. Each
// candidate is flagged `source: "estimated"` so the UI can show the
// "estimated" badge until live partnerships land.

async function findStationsAlong(
  origin: LatLon,
  destination: LatLon,
  kind: Vehicle["kind"],
  nationalAverage: number,
): Promise<StationCandidate[]> {
  // Midpoint heuristic — stations near the corridor midpoint are most
  // useful for a single-fill trip.
  const midLat = (origin.lat + destination.lat) / 2;
  const midLon = (origin.lon + destination.lon) / 2;

  // Hand-curated brand baseline spread (NZ public knowledge, March 2026).
  // EV charging uses a different unit; map to NZD/kWh.
  const isEv = kind === "ev";
  const sample: Array<Omit<StationCandidate, "lat" | "lon" | "detourKm"> & { latOffset: number; lonOffset: number }> = isEv
    ? [
        { name: "ChargeNet — Westfield", brand: "ChargeNet", pricePerL: roundFuel(nationalAverage * 1.05), source: "estimated", latOffset: 0.012, lonOffset: 0.018 },
        { name: "Z Mission Bay (Z fast)", brand: "Z Energy",  pricePerL: roundFuel(nationalAverage * 1.10), source: "estimated", latOffset: -0.015, lonOffset: 0.022 },
        { name: "Tesla Supercharger — Albany", brand: "Tesla", pricePerL: roundFuel(nationalAverage * 1.42), source: "estimated", latOffset: 0.025, lonOffset: -0.010 },
      ]
    : [
        { name: "Gull Self Serve",        brand: "Gull",      pricePerL: roundFuel(nationalAverage * 0.94), source: "estimated", latOffset: 0.010, lonOffset: 0.015 },
        { name: "Waitomo",                brand: "Waitomo",   pricePerL: roundFuel(nationalAverage * 0.96), source: "estimated", latOffset: -0.014, lonOffset: 0.020 },
        { name: "Z Energy",               brand: "Z Energy",  pricePerL: roundFuel(nationalAverage * 1.02), source: "estimated", latOffset: 0.005, lonOffset: -0.022 },
        { name: "BP Connect",             brand: "BP",        pricePerL: roundFuel(nationalAverage * 1.03), source: "estimated", latOffset: -0.008, lonOffset: 0.011 },
        { name: "Mobil",                  brand: "Mobil",     pricePerL: roundFuel(nationalAverage * 1.04), source: "estimated", latOffset: 0.018, lonOffset: -0.014 },
      ];

  return sample.map((s) => ({
    name: s.name,
    brand: s.brand,
    pricePerL: s.pricePerL,
    source: s.source,
    lat: midLat + s.latOffset,
    lon: midLon + s.lonOffset,
    detourKm: Math.round(Math.hypot(s.latOffset, s.lonOffset) * 111 * 10) / 10,
  })).sort((a, b) => a.pricePerL - b.pricePerL);
}

function roundFuel(v: number): number {
  return Math.round(v * 100) / 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Plain-language summary — the line the parent reads first
// ─────────────────────────────────────────────────────────────────────────────

function composeSummary(args: {
  distanceKm: number;
  durationMins: number;
  costNzd: number;
  vehicle: Vehicle;
  cheapest: StationCandidate | null;
  potentialSavingNzd: number;
  pricedAt: string;
}): string {
  const km = args.distanceKm.toFixed(1);
  const hh = Math.floor(args.durationMins / 60);
  const mm = args.durationMins % 60;
  const time = hh > 0 ? `${hh}h ${mm}m` : `${mm} min`;
  const veh = args.vehicle.label ? ` (${args.vehicle.label})` : "";
  const cost = `$${args.costNzd.toFixed(2)}`;

  let lead = `${km} km, about ${time}. Likely fuel cost ${cost}${veh}.`;

  if (args.cheapest && args.potentialSavingNzd >= 1) {
    lead += ` Filling at ${args.cheapest.name} (${args.cheapest.brand}) could save about $${args.potentialSavingNzd.toFixed(2)}.`;
  }

  return lead;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
