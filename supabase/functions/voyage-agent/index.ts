// ═══════════════════════════════════════════════════════════════
// VOYAGE Agent — writes structured trip plans into the canonical
// March voyage schema (trip_plans + trip_destinations + trip_days +
// trip_activities, with optional accommodation/packing/expenses/notes).
//
// Modes
// ─────
//   { mode: "structured", trip: TripPayload }
//       Direct programmatic write — caller supplies the full structure.
//
//   { mode: "natural", prompt: "...", owner_id: "<uuid>" }
//       Natural language → Gemini → structured payload → DB write.
//
// History
// ───────
// Originally written against the April "trips/trip_families/trip_convoys"
// schema, which never successfully landed in prod (FK conflict with the
// March schema). Rewritten 2026-05-17 to target the canonical March
// schema for Kate's Italy trip. Also migrated from the deprecated
// Lovable AI Gateway to Gemini direct (same path the iho-router took
// on 2026-05-04).
//
// Returns { trip_id, url, message } on success. URL deep-links to the
// app surface at /app/voyage?trip=<id>.
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { embedText } from "../_shared/embed.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Payload types (match March schema column names) ────────────

interface DestinationIn {
  name: string;
  color?: string;
  dates_label?: string;     // e.g. "5–9 Jun"
  nights: number;
  lat?: number;
  lng?: number;
}

interface ActivityIn {
  name: string;
  cost_eur?: number;
  type?: "free" | "ticket" | "food" | "experience" | "transport";
  booked?: boolean;
  urgent?: boolean;
  link?: string;
  note?: string;
  map_url?: string;
}

interface DayIn {
  day_date: string;          // ISO YYYY-MM-DD
  weekday?: string;          // "Mon" — Gemini fills this
  title: string;
  stay?: string;
  destination_name?: string; // resolved → destination_id server-side
  activities?: ActivityIn[];
}

interface TripPayload {
  name: string;
  travelers?: string[];
  currency?: string;                    // default 'NZD'
  exchange_rate?: number;               // NZD → EUR equivalent, default ~1.85
  departure_date: string;               // ISO YYYY-MM-DD
  return_date: string;                  // ISO YYYY-MM-DD
  status?: "planning" | "active" | "completed";
  owner_id?: string | null;             // FK → auth.users.id (created_by)
  destinations: DestinationIn[];
  days: DayIn[];
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

// ── Live grounding (FX + Pīkau-style RAG over a voyage corpus) ──

async function gatherLiveGrounding(prompt: string): Promise<string> {
  const blocks: string[] = [];

  // 1. Frankfurter FX — free, no key. Returns "1 NZD = X foreign". We also
  //    derive the inverse (foreign → NZD) because trip_plans.exchange_rate
  //    follows the schema's "EUR → local" convention (NZD per EUR ≈ 1.85),
  //    and the prompt needs both directions to reason about budgets.
  try {
    const r = await fetch("https://api.frankfurter.app/latest?from=NZD&to=EUR,USD,GBP,AUD,JPY");
    if (r.ok) {
      const fx = await r.json();
      if (fx?.rates) {
        const lines: string[] = [`[LIVE FX — ${fx.date}, base NZD]`];
        for (const [k, vRaw] of Object.entries(fx.rates)) {
          const v = Number(vRaw);
          const inverse = v > 0 ? (1 / v).toFixed(4) : "n/a";
          lines.push(`1 NZD = ${v} ${k}   ·   1 ${k} = ${inverse} NZD`);
        }
        blocks.push(lines.join("\n"));
      }
    }
  } catch { /* FX is best-effort */ }

  // 2. Best-effort RAG over any voyage-tagged kb_documents (none yet —
  //    placeholder so this lights up when a voyage corpus gets seeded).
  if (GEMINI_KEY) {
    try {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      const vec = await embedText(prompt.slice(0, 2000), GEMINI_KEY);
      if (vec) {
        const { data } = await sb.rpc("match_kb_knowledge", {
          query_embedding: vec,
          agent_pack: "voyage",
          top_k: 4,
        });
        if (data?.length) {
          const facts = (data as Array<Record<string, unknown>>)
            .map((d, i) =>
              `[${i + 1}] ${d.title} — ${d.source_name ?? "internal"}` +
              (d.published_at ? ` (${String(d.published_at).slice(0, 10)})` : "") +
              `\n${String(d.snippet ?? "").slice(0, 400)}`,
            )
            .join("\n\n");
          blocks.push(`[VOYAGE KNOWLEDGE BASE]\n${facts}`);
        }
      }
    } catch (e) { console.warn("voyage rag failed", e); }
  }

  return blocks.length
    ? `\n\n--- LIVE GROUNDING (use these real numbers) ---\n${blocks.join("\n\n")}\n`
    : "";
}

// ── Natural language → structured payload (Gemini direct) ──

async function naturalToStructured(prompt: string): Promise<TripPayload> {
  if (!GEMINI_KEY) {
    throw new Error("GEMINI_API_KEY not configured — natural mode unavailable");
  }

  const grounding = await gatherLiveGrounding(prompt);

  const systemInstruction = `You are VOYAGE — assembl's NZ-based travel planning agent.

Convert the user's free-text trip brief into JSON matching this exact TypeScript shape (return JSON only, no commentary, no markdown fences):

{
  "name": string,                          // e.g. "Kate's Italy Trip"
  "travelers": string[],                   // e.g. ["Kate"]
  "currency": "NZD",
  "exchange_rate": number,                 // NZD per EUR (EUR → NZD direction, default ~1.85). If LIVE FX is provided, use the "1 EUR = X NZD" value verbatim.
  "departure_date": "YYYY-MM-DD",
  "return_date": "YYYY-MM-DD",
  "status": "planning",
  "destinations": [
    {
      "name": string,                      // city
      "color": string,                     // hex accent, e.g. "#0EA5E9"
      "dates_label": string,               // e.g. "5–9 Jun"
      "nights": number,
      "lat": number,
      "lng": number
    }
  ],
  "days": [
    {
      "day_date": "YYYY-MM-DD",
      "weekday": "Mon|Tue|...",
      "title": string,                     // e.g. "Vatican & Trastevere"
      "stay": string,                      // hotel/area, e.g. "Hotel Artemide, Rome"
      "destination_name": string,          // matches one of destinations[].name
      "activities": [
        {
          "name": string,
          "cost_eur": number,              // in EUR — convert if pricing source is different
          "type": "free|ticket|food|experience|transport",
          "booked": false,
          "urgent": boolean,               // true if must-book-in-advance (e.g. Last Supper, Uffizi)
          "link": string,                  // booking URL when known
          "note": string,                  // tip, warning, or context
          "map_url": string                // Google Maps link when known
        }
      ]
    }
  ]
}

Rules:
• Use real lat/lng for known places.
• Use ISO dates.
• Keep activities concrete and bookable. Italian must-books (Uffizi, Vatican Museums, Last Supper, Borghese Gallery, Colosseum, Doge's Palace) should be marked urgent:true.
• Costs in EUR. The exchange_rate field is **NZD per EUR** (EUR→NZD direction). To convert a NZD budget to EUR, **divide** NZD by exchange_rate. To convert an EUR cost to NZD, **multiply** EUR by exchange_rate. Example: a NZ$10,000 budget at exchange_rate 1.85 ≈ €5,405. Never multiply NZD by exchange_rate, never divide EUR by exchange_rate.
• Don't invent FX rates — use the "1 EUR = X NZD" value from the LIVE FX block as exchange_rate when present.
• If you don't know an exact cost, use 0 and explain in note.
• Default to small, walkable groupings (3–5 activities/day max).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction + grounding }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => "");
    throw new Error(`Gemini API ${r.status}: ${errText}`);
  }
  const data = await r.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no JSON content");

  let parsed: TripPayload;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error(`Gemini returned invalid JSON: ${(e as Error).message}`);
  }
  return parsed;
}

// ── DB write — March schema ────────────────────────────────────

async function writeTrip(payload: TripPayload): Promise<string> {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  if (!payload.owner_id) {
    throw new Error("owner_id is required — trip_plans.created_by is NOT NULL");
  }

  // 1. trip_plans (master record)
  const { data: trip, error: e1 } = await sb
    .from("trip_plans")
    .insert({
      created_by: payload.owner_id,
      name: payload.name,
      travelers: payload.travelers ?? [],
      currency: payload.currency ?? "NZD",
      // exchange_rate follows the schema convention: NZD per EUR (EUR→NZD).
      // Default 1.85 matches trip_plans.exchange_rate's column default.
      exchange_rate: payload.exchange_rate ?? 1.85,
      departure_date: payload.departure_date,
      return_date: payload.return_date,
      status: payload.status ?? "planning",
    })
    .select("id")
    .single();
  if (e1 || !trip) throw new Error(`trip_plans insert: ${e1?.message}`);
  const trip_id = trip.id as string;

  // 2. trip_members (owner row so RLS works for subsequent reads)
  await sb.from("trip_members").insert({
    trip_id,
    user_id: payload.owner_id,
    role: "owner",
    display_name: payload.travelers?.[0] ?? "Owner",
  });

  // 3. trip_destinations
  const destRows = payload.destinations.map((d, i) => ({
    trip_id,
    name: d.name,
    color: d.color ?? "#0EA5E9",
    dates_label: d.dates_label ?? null,
    nights: d.nights ?? 1,
    sort_order: i,
    lat: d.lat ?? null,
    lng: d.lng ?? null,
  }));
  const { data: dests, error: e3 } = await sb
    .from("trip_destinations")
    .insert(destRows)
    .select("id, name");
  if (e3) throw new Error(`destinations: ${e3.message}`);
  const destByName = new Map((dests ?? []).map((d) => [d.name, d.id as string]));

  // 4. trip_days
  const dayRows = payload.days.map((d, i) => ({
    trip_id,
    destination_id: d.destination_name ? destByName.get(d.destination_name) ?? null : null,
    day_date: d.day_date,
    weekday: d.weekday ?? null,
    title: d.title,
    stay: d.stay ?? null,
    sort_order: i,
  }));
  const { data: days, error: e4 } = await sb
    .from("trip_days")
    .insert(dayRows)
    .select("id, day_date");
  if (e4) throw new Error(`days: ${e4.message}`);
  const dayByDate = new Map((days ?? []).map((d) => [d.day_date, d.id as string]));

  // 5. trip_activities
  const actRows: Record<string, unknown>[] = [];
  payload.days.forEach((d) => {
    const day_id = dayByDate.get(d.day_date);
    if (!day_id) return;
    (d.activities ?? []).forEach((a, idx) => {
      actRows.push({
        trip_id,
        day_id,
        name: a.name,
        cost_eur: a.cost_eur ?? 0,
        type: a.type ?? "free",
        booked: a.booked ?? false,
        urgent: a.urgent ?? false,
        link: a.link ?? null,
        note: a.note ?? null,
        map_url: a.map_url ?? null,
        sort_order: idx,
      });
    });
  });
  if (actRows.length) {
    const { error: e5 } = await sb.from("trip_activities").insert(actRows);
    if (e5) throw new Error(`activities: ${e5.message}`);
  }

  return trip_id;
}

// ── HTTP handler ───────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // ── AUTH: bind ownership to the verified JWT subject ──────────
    //
    // The function deploys with verify_jwt=true so the platform has
    // already rejected unauthenticated calls before we get here. We
    // still need to know WHICH user is calling so we can stamp
    // trip_plans.created_by + trip_members.user_id correctly — never
    // trusting body.owner_id directly, since this function holds the
    // service role and could otherwise be used to create trips
    // owned by an arbitrary uuid.
    //
    // If body.owner_id is supplied, we accept it ONLY when it matches
    // the authenticated user's id. Mismatch → 403. This keeps the
    // shape compatible with future server-to-server calls that pass
    // owner_id explicitly while still matching the JWT subject.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authorization Bearer token is required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    const authedUserId = userData?.user?.id;
    if (userErr || !authedUserId) {
      return new Response(
        JSON.stringify({ error: "Auth token did not resolve to a user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();

    // Reject obvious owner-id spoofing before doing any LLM work.
    if (
      body.owner_id &&
      typeof body.owner_id === "string" &&
      body.owner_id !== authedUserId
    ) {
      return new Response(
        JSON.stringify({
          error: "owner_id does not match the authenticated user",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let payload: TripPayload;
    if (body.mode === "natural") {
      payload = await naturalToStructured(body.prompt);
    } else {
      payload = body.trip as TripPayload;
    }
    // Always stamp ownership from the verified JWT — never from the
    // request body, even if it would match. Single source of truth.
    payload.owner_id = authedUserId;

    if (!payload?.name || !payload?.departure_date || !payload?.return_date) {
      return new Response(
        JSON.stringify({ error: "trip.name, departure_date, return_date are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const trip_id = await writeTrip(payload);
    return new Response(
      JSON.stringify({
        trip_id,
        url: `/app/voyage?trip=${trip_id}`,
        message:
          `VOYAGE wrote "${payload.name}" with ${payload.destinations.length} destinations and ${payload.days.length} days.`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("voyage-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
