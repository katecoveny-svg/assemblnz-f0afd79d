import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { ECHO_MODEL_TIER, ECHO_PUBLIC, ECHO_SYSTEM_PROMPT } from '@/lib/echo/persona';
import { canAccessHiddenAgent } from '@/lib/marketplace/private-access';

export const maxDuration = 60;

/**
 * Echo — private founder co-pilot chat (Vercel AI SDK streaming).
 *
 * Mirrors the marketplace agent chat route (app/api/agents/[slug]/chat) but for
 * Kate's private Echo persona: the system prompt is resolved SERVER-SIDE and the
 * browser only ever sends the user's messages. Same free-fallback model ladder
 * (Opus 4.8 primary → Gemini → Groq → Ollama, filtered to configured keys).
 *
 * Deliberately NO paywall and NO usage metering — Echo is a private, unlisted
 * tool, not a marketplace agent. It is not in the public registry, so it never
 * appears on the shelf.
 */
export async function POST(req: Request) {
  // Owner-only: Echo is Kate's private co-pilot. Reject anyone else.
  if (!(await canAccessHiddenAgent())) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const primaryModelId = MODEL_TIER_TO_ANTHROPIC[ECHO_MODEL_TIER];
  const ladder = resolveModelLadder(primaryModelId, ECHO_PUBLIC.fallbackModels);
  const rung = pickRung(ladder);

  if (!rung) {
    return Response.json(
      {
        error:
          'Echo is not configured yet — set ANTHROPIC_API_KEY (primary) or a fallback key (GEMINI_API_KEY / GROQ_API_KEY / OLLAMA_BASE_URL). See .env.local.example.',
      },
      { status: 503 },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const modelMessages = await convertToModelMessages(body.messages ?? []);

  // On a fallback rung, Echo self-discloses and we log the selection-time fallback.
  const baseSystem = rung.isPrimary ? ECHO_SYSTEM_PROMPT : `${ECHO_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  const system =
    baseSystem +
    '\n\nLive tools you can call: weatherTomorrow (forecast — use it to advise what to pack or wear), busPositions (live Auckland Transport vehicle positions), and driveTime (drive distance and time between two lat/lon points, for school runs and pickups). Use them when they genuinely help. If a tool returns an error or a fallback estimate, say so plainly rather than inventing figures.';
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'echo',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const echoTools = {
    weatherTomorrow: tool({
      description:
        "Tomorrow's weather forecast for an NZ location (defaults to Auckland). Use it to advise what to pack or wear.",
      inputSchema: z.object({
        latitude: z.number().optional().describe('Latitude (default Auckland -36.8485)'),
        longitude: z.number().optional().describe('Longitude (default Auckland 174.7633)'),
      }),
      execute: async ({ latitude, longitude }) => {
        const lat = latitude ?? -36.8485;
        const lon = longitude ?? 174.7633;
        try {
          const u = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Pacific%2FAuckland&forecast_days=2`;
          const r = await fetch(u, { signal: AbortSignal.timeout(8000) });
          if (!r.ok) return { error: `weather fetch failed (${r.status})` };
          const d = await r.json();
          const i = 1; // tomorrow
          return {
            date: d.daily?.time?.[i],
            maxTempC: d.daily?.temperature_2m_max?.[i],
            minTempC: d.daily?.temperature_2m_min?.[i],
            rainChancePct: d.daily?.precipitation_probability_max?.[i],
            weatherCode: d.daily?.weather_code?.[i],
          };
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'weather error' };
        }
      },
    }),
    busPositions: tool({
      description:
        'Live Auckland Transport vehicle positions (bus/train/ferry). Optionally filter by comma-separated GTFS route_ids. Returns a vehicle count and up to 8 positions.',
      inputSchema: z.object({
        route_ids: z.string().optional().describe('Comma-separated AT GTFS route_ids to filter by'),
      }),
      execute: async ({ route_ids }) => {
        try {
          const r = await fetch(`${SB_URL}/functions/v1/bus-positions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(route_ids ? { route_ids } : {}),
            signal: AbortSignal.timeout(9000),
          });
          if (!r.ok) return { error: `AT fetch failed (${r.status})` };
          const d = await r.json();
          return { count: d.count, vehicles: (d.vehicles ?? []).slice(0, 8) };
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'bus error' };
        }
      },
    }),
    driveTime: tool({
      description: 'Drive distance and time between two NZ points (lat/lon) via MapBox. Use for school runs and pickups.',
      inputSchema: z.object({
        origin: z.object({ lat: z.number(), lon: z.number() }),
        destination: z.object({ lat: z.number(), lon: z.number() }),
      }),
      execute: async ({ origin, destination }) => {
        try {
          const r = await fetch(`${SB_URL}/functions/v1/nz-routes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination }),
            signal: AbortSignal.timeout(9000),
          });
          if (!r.ok) return { error: `route fetch failed (${r.status})` };
          return await r.json();
        } catch (e) {
          return { error: e instanceof Error ? e.message : 'route error' };
        }
      },
    }),
  };

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: echoTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'echo',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
