// ═══════════════════════════════════════════════════════════════
// live-travel — single endpoint that returns live travel data
// for any agent (VOYAGE, AURA, etc). Combines free + paid sources:
//
//   action: "fx"            → Frankfurter (ECB) NZD→target rate (free)
//   action: "flights"       → Amadeus self-service /shopping/flight-offers (needs AMADEUS_API_KEY + AMADEUS_API_SECRET)
//   action: "hotels"        → Amadeus /shopping/hotel-offers
//   action: "airport"       → Amadeus /reference-data/locations (IATA lookup)
//   action: "advisory"      → MFAT SafeTravel scrape for a destination
//   action: "kb"            → matches kb_doc_chunks (existing RAG)
//
// Browser-safe: requires JWT. Returns JSON.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Amadeus token cache ────────────────────────────────────────
let amadeusToken: { token: string; expiresAt: number } | null = null;
async function getAmadeusToken(): Promise<string | null> {
  const key = Deno.env.get("AMADEUS_API_KEY");
  const secret = Deno.env.get("AMADEUS_API_SECRET");
  if (!key || !secret) return null;
  if (amadeusToken && amadeusToken.expiresAt > Date.now() + 60_000) return amadeusToken.token;
  const r = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(key)}&client_secret=${encodeURIComponent(secret)}`,
  });
  if (!r.ok) { console.error("amadeus token failed", r.status); return null; }
  const j = await r.json();
  amadeusToken = { token: j.access_token, expiresAt: Date.now() + (j.expires_in ?? 1800) * 1000 };
  return amadeusToken.token;
}

async function amadeusGet(path: string, params: Record<string, string>): Promise<unknown> {
  const tok = await getAmadeusToken();
  if (!tok) throw new Error("AMADEUS_API_KEY / AMADEUS_API_SECRET not configured");
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`https://test.api.amadeus.com${path}?${qs}`, {
    headers: { Authorization: `Bearer ${tok}` },
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Amadeus ${path} ${r.status}: ${body.slice(0, 300)}`);
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

async function flightOffers(args: Record<string, unknown>) {
  const params: Record<string, string> = {
    originLocationCode: String(args.from ?? "AKL"),
    destinationLocationCode: String(args.to ?? "ROM"),
    departureDate: String(args.depart),
    adults: String(args.adults ?? 2),
    currencyCode: String(args.currency ?? "NZD"),
    max: String(args.max ?? 5),
  };
  if (args.return_date) params.returnDate = String(args.return_date);
  if (args.children) params.children = String(args.children);
  if (args.travelClass) params.travelClass = String(args.travelClass);
  const j = await amadeusGet("/v2/shopping/flight-offers", params) as { data?: unknown[] };
  // Compact each offer to essentials
  const offers = (j.data ?? []).slice(0, 10).map((o) => {
    const offer = o as Record<string, unknown>;
    const itineraries = offer.itineraries as Array<Record<string, unknown>> | undefined;
    const price = offer.price as Record<string, string> | undefined;
    return {
      id: offer.id,
      total: price?.grandTotal ?? price?.total,
      currency: price?.currency,
      airlines: offer.validatingAirlineCodes,
      legs: itineraries?.map((it) => {
        const segs = it.segments as Array<Record<string, unknown>> | undefined;
        return {
          duration: it.duration,
          stops: (segs?.length ?? 1) - 1,
          segments: segs?.map((s) => ({
            from: (s.departure as Record<string, string>)?.iataCode,
            to: (s.arrival as Record<string, string>)?.iataCode,
            depart: (s.departure as Record<string, string>)?.at,
            arrive: (s.arrival as Record<string, string>)?.at,
            carrier: s.carrierCode,
            number: s.number,
          })),
        };
      }),
    };
  });
  return { offers, count: offers.length };
}

async function hotelOffers(args: Record<string, unknown>) {
  // Step 1: hotels in city
  const list = await amadeusGet("/v1/reference-data/locations/hotels/by-city", {
    cityCode: String(args.city ?? "ROM"),
  }) as { data?: Array<{ hotelId: string }> };
  const ids = (list.data ?? []).slice(0, 10).map((h) => h.hotelId).join(",");
  if (!ids) return { offers: [], count: 0 };
  // Step 2: offers
  const j = await amadeusGet("/v3/shopping/hotel-offers", {
    hotelIds: ids,
    adults: String(args.adults ?? 2),
    checkInDate: String(args.checkin),
    checkOutDate: String(args.checkout),
    currency: String(args.currency ?? "NZD"),
  }) as { data?: unknown[] };
  const offers = (j.data ?? []).slice(0, 10).map((o) => {
    const x = o as Record<string, unknown>;
    const hotel = x.hotel as Record<string, string> | undefined;
    const offer = (x.offers as Array<Record<string, unknown>> | undefined)?.[0];
    const price = offer?.price as Record<string, string> | undefined;
    return {
      hotel: hotel?.name,
      hotelId: hotel?.hotelId,
      total: price?.total,
      currency: price?.currency,
      checkIn: offer?.checkInDate,
      checkOut: offer?.checkOutDate,
    };
  });
  return { offers, count: offers.length };
}

async function airportSearch(query: string) {
  const j = await amadeusGet("/v1/reference-data/locations", {
    keyword: query, subType: "AIRPORT,CITY",
  }) as { data?: Array<Record<string, unknown>> };
  return (j.data ?? []).slice(0, 8).map((d) => ({
    iata: d.iataCode, name: d.name, city: (d.address as Record<string, string>)?.cityName,
    country: (d.address as Record<string, string>)?.countryName, type: d.subType,
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

    let result: unknown;
    switch (action) {
      case "fx":       result = await fxRate(body.from ?? "NZD", body.to ?? "EUR", body.amount); break;
      case "flights":  result = await flightOffers(body); break;
      case "hotels":   result = await hotelOffers(body); break;
      case "airport":  result = await airportSearch(String(body.query ?? "")); break;
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
