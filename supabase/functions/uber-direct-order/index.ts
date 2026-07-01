// uber-direct-order
// ---------------------------------------------------------------------------
// Uber Direct · Hearth (Kai + Helm) · Auckland-first same-hour delivery.
//
// SCAFFOLD ONLY. Per the Woolworths Kai pack (03-uber-direct-spec) and Kate's
// 2026-06-29 sign-off, this function NEVER dispatches a real delivery. It
// exposes the four endpoint stubs the product will use — quote / create /
// status / cancel — with the real Auckland geofence and NZD cost model wired,
// but `create` is hard-disabled until Kate signs off a supervised live-fire.
//
// Live dispatch (future) needs UBER_DIRECT_API_KEY in Supabase secrets AND the
// UBER_DIRECT_LIVE env flag set true AND an explicit confirmLiveDispatch in the
// request. Missing any one → the scaffold response, never a silent real order.
//
// 3-tier fallback (spec §Fallback): Uber Direct → alternative courier (logged
// for now) → drive-yourself notification. Never a silent failure.
//
// Privacy Act 2020 (IPP 1 / IPP 3A): only coarse coverage (region / metro
// bounds) and a package *description* string are handled here. No addresses,
// phone numbers, itemised carts or family-member profiles are persisted.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Coverage + cost model (kept in step with lib/hapai/uber-direct.ts) ───────
const UBER_DIRECT_REGIONS = ["auckland"] as const;

const AUCKLAND_METRO_BOUNDS = {
  minLat: -37.05, // ~Papakura / Drury (south)
  maxLat: -36.72, // ~Silverdale / Albany (north)
  minLng: 174.6, // ~Henderson / Titirangi (west)
  maxLng: 174.95, // ~Howick / Botany (east) — excludes Waiheke
};

const COST_BANDS = [
  { label: "0–3 km", maxKm: 3, baseFare: 12.5, etaMinLabel: "25–45 min" },
  { label: "3–8 km", maxKm: 8, baseFare: 18.0, etaMinLabel: "35–60 min" },
  { label: "8–15 km", maxKm: 15, baseFare: 29.0, etaMinLabel: "45–75 min" },
];

const ASSEMBL_HANDLING_FEE = 1.5;

interface LatLng { lat: number; lng: number }

function isWithinAuckland(p: LatLng): boolean {
  const b = AUCKLAND_METRO_BOUNDS;
  return p.lat >= b.minLat && p.lat <= b.maxLat && p.lng >= b.minLng && p.lng <= b.maxLng;
}

function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function clampSurge(m: unknown): number {
  const n = typeof m === "number" && Number.isFinite(m) ? m : 1;
  return Math.min(1.8, Math.max(1, n));
}

interface QuoteBody {
  region?: string;
  pickup?: LatLng;
  dropoff?: LatLng;
  distanceKm?: number;
  surgeMultiplier?: number;
}

function buildQuote(body: QuoteBody) {
  const region = (body.region ?? "auckland").toLowerCase();
  const surge = clampSurge(body.surgeMultiplier);
  const regionOffered = (UBER_DIRECT_REGIONS as readonly string[]).includes(region);

  let distanceKm: number | null = null;
  let insideGeofence = regionOffered;
  if (body.pickup && body.dropoff) {
    insideGeofence = isWithinAuckland(body.pickup) && isWithinAuckland(body.dropoff);
    distanceKm = Math.round(haversineKm(body.pickup, body.dropoff) * 10) / 10;
  } else if (typeof body.distanceKm === "number" && body.distanceKm >= 0) {
    distanceKm = Math.round(body.distanceKm * 10) / 10;
  }

  if (!regionOffered || !insideGeofence) {
    return {
      eligible: false,
      tier: "drive_yourself",
      region: "out_of_area",
      distanceKm,
      band: null,
      estimatedTotalNzd: null,
      etaLabel: null,
      surgeMultiplier: surge,
      message:
        "Uber Direct only runs in metro Auckland for now. Try an alternative courier where available, or drive it yourself.",
      draftOnly: true,
    };
  }

  const band = distanceKm == null ? COST_BANDS[0] : COST_BANDS.find((b) => distanceKm! <= b.maxKm);
  if (!band) {
    return {
      eligible: false,
      tier: "alt_courier",
      region: "auckland",
      distanceKm,
      band: ">15 km",
      estimatedTotalNzd: null,
      etaLabel: "60–120 min",
      surgeMultiplier: surge,
      message:
        "Beyond Uber Direct's usual range — a driver often won't accept. Try an alternative courier (~$28–$40, 60–120 min), or drive it yourself.",
      draftOnly: true,
    };
  }

  const total = Math.round((band.baseFare * surge + ASSEMBL_HANDLING_FEE) * 100) / 100;
  return {
    eligible: true,
    tier: "uber_direct",
    region: "auckland",
    distanceKm,
    band: band.label,
    estimatedTotalNzd: total,
    etaLabel: band.etaMinLabel,
    surgeMultiplier: surge,
    message: `About $${total.toFixed(2)}, usually ${band.etaMinLabel} to the door. You confirm before anything is dispatched.`,
    draftOnly: true,
  };
}

// ── Endpoint stubs ───────────────────────────────────────────────────────────
type Action = "quote" | "create" | "status" | "cancel";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  let body: (QuoteBody & { action?: Action; deliveryId?: string; confirmLiveDispatch?: boolean; packageDescription?: string }) = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const action: Action = body.action ?? "quote";
  const hasKey = Boolean(Deno.env.get("UBER_DIRECT_API_KEY"));
  const liveEnabled = Deno.env.get("UBER_DIRECT_LIVE") === "true";

  switch (action) {
    // POST /v1/customers/{id}/delivery_quotes — coverage + price. Local only.
    case "quote":
      return json({ ok: true, action, quote: buildQuote(body) });

    // POST /v1/customers/{id}/deliveries — HARD-DISABLED in this scaffold.
    case "create": {
      const quote = buildQuote(body);
      if (!liveEnabled || !hasKey || !body.confirmLiveDispatch) {
        return json({
          ok: true,
          action,
          dispatched: false,
          status: "scaffold_disabled",
          quote,
          note:
            "Live Uber Direct dispatch is not enabled. Scaffold only — a real delivery is fired after Kate signs off a supervised live-fire test. No courier was dispatched and no personal information left assembl.",
          // What a live call WOULD need (documented, not executed):
          wouldRequire: ["UBER_DIRECT_LIVE=true", "UBER_DIRECT_API_KEY set", "confirmLiveDispatch:true", "signed Uber NZ data-processor agreement"],
        });
      }
      // Live path intentionally NOT implemented in this PR.
      return json({
        ok: true,
        action,
        dispatched: false,
        status: "live_path_not_implemented",
        note: "Live dispatch is gated to a supervised test post Kate sign-off; the real Uber Direct call is not wired in this scaffold PR.",
      });
    }

    // GET /v1/customers/{id}/deliveries/{id} — status polling stub.
    case "status":
      return json({
        ok: true,
        action,
        deliveryId: body.deliveryId ?? null,
        status: "scaffold_disabled",
        note: "No live deliveries exist in the scaffold, so there is no status to poll yet.",
      });

    // POST /v1/customers/{id}/deliveries/{id}/cancel — cancel stub.
    case "cancel":
      return json({
        ok: true,
        action,
        deliveryId: body.deliveryId ?? null,
        cancelled: false,
        status: "scaffold_disabled",
        note: "No live delivery to cancel in the scaffold.",
      });

    default:
      return json({ error: `Unknown action "${action}". Use quote | create | status | cancel.` }, 400);
  }
});
