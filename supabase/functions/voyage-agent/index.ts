// VOYAGE Agent — writes structured trip plans into the VOYAGE schema.
// Accepts either:
//   { mode: "structured", trip: TripPayload }   — direct programmatic write
//   { mode: "natural", prompt: "...", owner_id } — natural-language → LLM → schema
//
// Writes to: trips, trip_families, trip_destinations, trip_days, trip_activities, trip_convoys.
// Returns the trip_id on success so the caller can deep-link to /voyage/command?trip=<id>.

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface FamilyIn {
  name: string;
  accent_color?: string;
  home_city?: string;
  home_lat?: number;
  home_lng?: number;
  member_count?: number;
  members?: string[];
}
interface DestinationIn {
  name: string;
  region?: string;
  color?: string;
  arrival_date: string;
  departure_date: string;
  lat: number;
  lng: number;
}
interface ActivityIn {
  name: string;
  start_time?: string;
  duration_minutes?: number;
  cost?: number;
  activity_type?: string;
  booked?: boolean;
  urgent?: boolean;
  link?: string;
  note?: string;
}
interface DayIn {
  date: string;
  destination_name?: string;
  title?: string;
  summary?: string;
  weather_note?: string;
  activities?: ActivityIn[];
}
interface ConvoyIn {
  family_name: string;
  date: string;
  origin_label?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_label?: string;
  destination_lat?: number;
  destination_lng?: number;
  depart_at?: string;
  arrive_at?: string;
  distance_km?: number;
  status?: string;
}
interface TripPayload {
  name: string;
  tagline?: string;
  currency?: string;
  start_date: string;
  end_date: string;
  base_lat?: number;
  base_lng?: number;
  base_zoom?: number;
  is_sample?: boolean;
  owner_id?: string | null;
  families: FamilyIn[];
  destinations: DestinationIn[];
  days: DayIn[];
  convoys?: ConvoyIn[];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// ── Live grounding for VOYAGE ──────────────────────────────────
// Pulls fresh FX, travel advisories, and flight indicative pricing
// so the LLM grounds its plan in real numbers, not guesses.
async function gatherLiveGrounding(prompt: string): Promise<string> {
  const blocks: string[] = [];
  // 1. FX rates (free, always available)
  try {
    const fx = await fetch("https://api.frankfurter.app/latest?from=NZD&to=EUR,USD,GBP,AUD,JPY").then(r => r.ok ? r.json() : null);
    if (fx?.rates) blocks.push(`[LIVE FX — ${fx.date}, base NZD]\n${Object.entries(fx.rates).map(([k, v]) => `1 NZD = ${v} ${k}`).join("\n")}`);
  } catch { /* skip */ }
  // 2. Brain RAG on travel-safety + destination feeds (kb_doc_chunks via match_kb_knowledge)
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const er = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/text-embedding-004", input: prompt.slice(0, 2000) }),
    });
    if (er.ok) {
      const ej = await er.json();
      const vec = ej?.data?.[0]?.embedding;
      if (vec) {
        const { data } = await sb.rpc("match_kb_knowledge", { query_embedding: vec, agent_pack: "voyage", top_k: 6 });
        if (data?.length) {
          const facts = (data as Array<Record<string, unknown>>).map((d, i) =>
            `[${i + 1}] ${d.title} — ${d.source_name} (${d.published_at ? String(d.published_at).slice(0, 10) : "n/d"})\n${String(d.snippet ?? "").slice(0, 400)}\n${d.url ? `→ ${d.url}` : ""}`
          ).join("\n\n");
          blocks.push(`[VERIFIED LIVE SOURCES — Knowledge Brain]\n${facts}`);
        }
      }
    }
  } catch (e) { console.warn("voyage rag failed", e); }
  // 3. Indicative flight pricing if we can detect from→to (best-effort, AKL→ROM example)
  // Skipped here — agent-router calls live-travel for explicit flight queries.
  return blocks.length ? `\n\n--- LIVE GROUNDING (use these real numbers in your plan) ---\n${blocks.join("\n\n")}\n` : "";
}

async function naturalToStructured(prompt: string): Promise<TripPayload> {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
  const grounding = await gatherLiveGrounding(prompt);
  const sys = `You are VOYAGE — Assembl's NZ travel planning agent. Convert a free-text trip brief into JSON matching this exact TypeScript type (no commentary, JSON only):
{
  name: string; tagline?: string; currency?: string; start_date: "YYYY-MM-DD"; end_date: "YYYY-MM-DD";
  base_lat?: number; base_lng?: number; base_zoom?: number;
  families: { name: string; accent_color?: string; home_city?: string; home_lat?: number; home_lng?: number; member_count?: number; members?: string[] }[];
  destinations: { name: string; region?: string; color?: string; arrival_date: string; departure_date: string; lat: number; lng: number }[];
  days: { date: string; destination_name?: string; title?: string; summary?: string; weather_note?: string;
    activities?: { name: string; start_time?: string; duration_minutes?: number; cost?: number; activity_type?: string; booked?: boolean; urgent?: boolean; link?: string; note?: string }[] }[];
  convoys?: { family_name: string; date: string; origin_label?: string; origin_lat?: number; origin_lng?: number; destination_label?: string; destination_lat?: number; destination_lng?: number; depart_at?: string; arrive_at?: string; distance_km?: number; status?: string }[];
}
Use real lat/lng for known places. Use ISO dates. Keep activities concrete and bookable.`;
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sys + grounding }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!r.ok) throw new Error(`AI gateway ${r.status}: ${await r.text()}`);
  const data = await r.json();
  return JSON.parse(data.choices[0].message.content);
}

async function writeTrip(payload: TripPayload): Promise<string> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  const { data: trip, error: e1 } = await sb.from("trips").insert({
    owner_id: payload.owner_id ?? null,
    name: payload.name,
    tagline: payload.tagline ?? null,
    currency: payload.currency ?? "NZD",
    start_date: payload.start_date,
    end_date: payload.end_date,
    base_lat: payload.base_lat ?? null,
    base_lng: payload.base_lng ?? null,
    base_zoom: payload.base_zoom ?? 5,
    is_sample: payload.is_sample ?? false,
  }).select("id").single();
  if (e1 || !trip) throw new Error(`trip insert: ${e1?.message}`);
  const trip_id = trip.id as string;

  const familyRows = payload.families.map((f) => ({
    trip_id, name: f.name, accent_color: f.accent_color ?? "#16A34A",
    home_city: f.home_city ?? null, home_lat: f.home_lat ?? null, home_lng: f.home_lng ?? null,
    member_count: f.member_count ?? (f.members?.length ?? 1), members: f.members ?? null,
  }));
  const { data: families, error: e2 } = await sb.from("trip_families").insert(familyRows).select("id, name");
  if (e2) throw new Error(`families: ${e2.message}`);
  const familyByName = new Map((families ?? []).map((f) => [f.name, f.id as string]));

  const destRows = payload.destinations.map((d, i) => ({
    trip_id, name: d.name, region: d.region ?? null, color: d.color ?? "#0EA5E9",
    arrival_date: d.arrival_date, departure_date: d.departure_date,
    lat: d.lat, lng: d.lng, sort_order: i,
  }));
  const { data: dests, error: e3 } = await sb.from("trip_destinations").insert(destRows).select("id, name");
  if (e3) throw new Error(`destinations: ${e3.message}`);
  const destByName = new Map((dests ?? []).map((d) => [d.name, d.id as string]));

  const dayRows = payload.days.map((d) => ({
    trip_id, destination_id: d.destination_name ? destByName.get(d.destination_name) ?? null : null,
    date: d.date, title: d.title ?? null, summary: d.summary ?? null, weather_note: d.weather_note ?? null,
  }));
  const { data: days, error: e4 } = await sb.from("trip_days").insert(dayRows).select("id, date");
  if (e4) throw new Error(`days: ${e4.message}`);
  const dayByDate = new Map((days ?? []).map((d) => [d.date, d.id as string]));

  const actRows: Record<string, unknown>[] = [];
  payload.days.forEach((d) => {
    const day_id = dayByDate.get(d.date);
    if (!day_id) return;
    (d.activities ?? []).forEach((a, idx) => {
      actRows.push({
        trip_id, day_id, name: a.name, start_time: a.start_time ?? null,
        duration_minutes: a.duration_minutes ?? null, cost: a.cost ?? null,
        activity_type: a.activity_type ?? "general", booked: a.booked ?? false,
        urgent: a.urgent ?? false, link: a.link ?? null, note: a.note ?? null, sort_order: idx,
      });
    });
  });
  if (actRows.length) {
    const { error: e5 } = await sb.from("trip_activities").insert(actRows);
    if (e5) throw new Error(`activities: ${e5.message}`);
  }

  if (payload.convoys?.length) {
    const convoyRows = payload.convoys.map((c) => ({
      trip_id, family_id: familyByName.get(c.family_name)!,
      day_id: dayByDate.get(c.date)!,
      origin_label: c.origin_label ?? null, origin_lat: c.origin_lat ?? null, origin_lng: c.origin_lng ?? null,
      destination_label: c.destination_label ?? null, destination_lat: c.destination_lat ?? null, destination_lng: c.destination_lng ?? null,
      depart_at: c.depart_at ?? null, arrive_at: c.arrive_at ?? null,
      distance_km: c.distance_km ?? null, status: c.status ?? "planned",
    })).filter((c) => c.family_id && c.day_id);
    if (convoyRows.length) {
      const { error: e6 } = await sb.from("trip_convoys").insert(convoyRows);
      if (e6) throw new Error(`convoys: ${e6.message}`);
    }
  }

  return trip_id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    let payload: TripPayload;
    if (body.mode === "natural") {
      payload = await naturalToStructured(body.prompt);
      if (body.owner_id) payload.owner_id = body.owner_id;
    } else {
      payload = body.trip as TripPayload;
    }
    if (!payload?.name || !payload?.start_date || !payload?.end_date) {
      return new Response(JSON.stringify({ error: "trip.name, start_date, end_date required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const trip_id = await writeTrip(payload);
    return new Response(JSON.stringify({
      trip_id,
      url: `/voyage/command?trip=${trip_id}`,
      message: `VOYAGE wrote "${payload.name}" with ${payload.families.length} families, ${payload.destinations.length} destinations, ${payload.days.length} days.`,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("voyage-agent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
