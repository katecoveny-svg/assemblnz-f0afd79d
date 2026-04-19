// ═══════════════════════════════════════════════════════════════
// live-travel — single endpoint that returns live travel data.
// Powered by Duffel (flights + stays) + Frankfurter (FX, free).
//
//   action: "fx"            → Frankfurter (ECB) currency conversion
//   action: "flights"       → Duffel /air/offer_requests
//   action: "hotels"        → Duffel /stays/search
//   action: "airport"       → Duffel /air/airports keyword search
//
// Browser-safe: requires JWT. Returns JSON.
// Set DUFFEL_API_TOKEN to enable flights/hotels/airport actions.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DUFFEL_BASE = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

function duffelHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Duffel-Version": DUFFEL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function duffelGet(path: string, params: Record<string, string>, token: string) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${DUFFEL_BASE}${path}${qs ? `?${qs}` : ""}`, { headers: duffelHeaders(token) });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Duffel GET ${path} ${r.status}: ${body.slice(0, 300)}`);
  }
  return r.json();
}

async function duffelPost(path: string, body: unknown, token: string) {
  const r = await fetch(`${DUFFEL_BASE}${path}`, {
    method: "POST",
    headers: duffelHeaders(token),
    body: JSON.stringify({ data: body }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`Duffel POST ${path} ${r.status}: ${txt.slice(0, 400)}`);
  }
  return r.json();
}

// ── Action handlers ────────────────────────────────────────────
async function fxRate(from: string, to: string, amount?: number) {
  const r = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!r.ok) throw new Error(`fx ${r.status}`);
  const j = await r.json();
  const rate = j.rates?.[to] ?? null;
  return { from, to, rate, date: j.date, converted: amount && rate ? +(amount * rate).toFixed(2) : null };
}

async function flightOffers(args: Record<string, unknown>, token: string) {
  const slices: Array<Record<string, string>> = [
    { origin: String(args.from ?? "AKL"), destination: String(args.to ?? "ROM"), departure_date: String(args.depart) },
  ];
  if (args.return_date) {
    slices.push({ origin: String(args.to ?? "ROM"), destination: String(args.from ?? "AKL"), departure_date: String(args.return_date) });
  }
  const passengers: Array<{ type: string }> = [];
  for (let i = 0; i < Number(args.adults ?? 2); i++) passengers.push({ type: "adult" });
  for (let i = 0; i < Number(args.children ?? 0); i++) passengers.push({ type: "child" });

  const created = await duffelPost("/air/offer_requests?return_offers=true", {
    slices, passengers, cabin_class: String(args.travelClass ?? "economy").toLowerCase(),
  }, token) as { data?: { offers?: unknown[] } };

  const raw = created.data?.offers ?? [];
  const offers = raw.slice(0, Number(args.max ?? 8)).map((o) => {
    const offer = o as Record<string, unknown>;
    const sl = offer.slices as Array<Record<string, unknown>> | undefined;
    return {
      id: offer.id,
      total: offer.total_amount,
      currency: offer.total_currency,
      airlines: [(offer.owner as Record<string, string>)?.iata_code].filter(Boolean),
      legs: sl?.map((s) => {
        const segs = s.segments as Array<Record<string, unknown>> | undefined;
        return {
          duration: s.duration,
          stops: (segs?.length ?? 1) - 1,
          segments: segs?.map((seg) => ({
            from: (seg.origin as Record<string, string>)?.iata_code,
            to: (seg.destination as Record<string, string>)?.iata_code,
            depart: seg.departing_at,
            arrive: seg.arriving_at,
            carrier: (seg.marketing_carrier as Record<string, string>)?.iata_code,
            number: (seg.marketing_carrier_flight_number as string | undefined),
          })),
        };
      }),
    };
  });
  return { offers, count: offers.length, provider: "duffel" };
}

async function hotelOffers(args: Record<string, unknown>, token: string) {
  // Duffel Stays uses /stays/search with location + dates
  const body: Record<string, unknown> = {
    check_in_date: String(args.checkin),
    check_out_date: String(args.checkout),
    rooms: Number(args.rooms ?? 1),
    guests: [...Array(Number(args.adults ?? 2))].map(() => ({ type: "adult" })),
  };
  // Location: prefer explicit lat/lng/radius; fall back to IATA city code via accommodation
  if (args.lat && args.lng) {
    body.location = { radius: Number(args.radius_km ?? 10), geographic_coordinates: { latitude: Number(args.lat), longitude: Number(args.lng) } };
  } else {
    // city as IATA → use Duffel place suggestion to coords
    const city = String(args.city ?? "ROM");
    const suggest = await duffelGet("/stays/suggestions", { query: city }, token).catch(() => null);
    const first = (suggest as { data?: Array<Record<string, unknown>> } | null)?.data?.[0];
    const coords = first?.geographic_coordinates as Record<string, number> | undefined;
    if (coords) {
      body.location = { radius: 15, geographic_coordinates: { latitude: coords.latitude, longitude: coords.longitude } };
    } else {
      return { offers: [], count: 0, provider: "duffel", note: `no coords for ${city}` };
    }
  }
  const j = await duffelPost("/stays/search", body, token) as { data?: { results?: unknown[] } };
  const results = j.data?.results ?? [];
  const offers = results.slice(0, 10).map((r) => {
    const x = r as Record<string, unknown>;
    const acc = x.accommodation as Record<string, unknown> | undefined;
    const cheapest = x.cheapest_rate_total_amount as string | undefined;
    return {
      hotel: acc?.name,
      hotelId: acc?.id,
      total: cheapest,
      currency: x.cheapest_rate_currency,
      rating: acc?.rating,
      checkIn: body.check_in_date,
      checkOut: body.check_out_date,
    };
  });
  return { offers, count: offers.length, provider: "duffel" };
}

async function airportSearch(query: string, token: string) {
  const j = await duffelGet("/air/airports", { name: query, limit: "8" }, token) as { data?: Array<Record<string, unknown>> };
  return (j.data ?? []).slice(0, 8).map((d) => ({
    iata: d.iata_code, name: d.name, city: (d.city as Record<string, string>)?.name,
    country: d.iata_country_code, type: "AIRPORT",
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const { action } = body;
    const duffelToken = Deno.env.get("DUFFEL_API_TOKEN");

    const requiresDuffel = ["flights", "hotels", "airport"].includes(action);
    if (requiresDuffel && !duffelToken) {
      return new Response(JSON.stringify({
        ok: false,
        error: "Duffel not configured",
        hint: "Set DUFFEL_API_TOKEN secret to enable live flights/hotels/airport lookup. FX still works.",
      }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let result: unknown;
    switch (action) {
      case "fx":       result = await fxRate(body.from ?? "NZD", body.to ?? "EUR", body.amount); break;
      case "flights":  result = await flightOffers(body, duffelToken!); break;
      case "hotels":   result = await hotelOffers(body, duffelToken!); break;
      case "airport":  result = await airportSearch(String(body.query ?? ""), duffelToken!); break;
      default: return new Response(JSON.stringify({ error: `unknown action: ${action}` }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: true, action, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("live-travel error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
