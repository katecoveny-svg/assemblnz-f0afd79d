import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { AIRNZ_SYSTEM_PROMPT } from '@/lib/customers/air-nz/agent';
import {
  CDO_BRIEF,
  COMPLIANCE_CHECKS,
  REVENUE_FORECAST_JUL,
  REVENUE_MTD,
  ROUTE_PERFORMANCE,
  SPONSORS,
  TIME_OF_DAY,
  revenueSplit,
} from '@/lib/customers/air-nz/ops-data';

export const maxDuration = 60;

/**
 * Air NZ partner-ops chat — the Assembling desk (TIER-2 SLICE).
 *
 * Real tools over the mocked partner workspace: earn trajectories from the
 * real route/time-of-day performance tables, the CDO brief, the fixed
 * revenue-split maths, and live pgvector retrieval. Concept demo — nothing
 * touches a live Air NZ system, no real Airpoints Dollars are minted.
 */

const WORKSPACE_CITE = { title: 'Partner-ops workspace', ref: 'mocked — concept demo', tier: 'C' as const };

const airnzTools = {
  earnTrajectory: tool({
    description:
      "Build a passenger's wait-state earn trajectory across a travel day: per-route conversion (opt-in, CTR, Airpoints Dollars per pax) and time-of-day earn index. Use for any 'how does a passenger earn across the day' question.",
    inputSchema: z.object({
      route: z.string().optional().describe('Optional route filter, e.g. "AKL ⇄ WLG" or "Trans-Tasman"'),
    }),
    execute: async ({ route }) => {
      const q = route?.trim().toLowerCase();
      const routes = q
        ? ROUTE_PERFORMANCE.filter((r) => r.route.toLowerCase().includes(q))
        : ROUTE_PERFORMANCE;
      return {
        routes,
        timeOfDayEarnIndex: TIME_OF_DAY,
        readingGuide:
          'apdPerPax = Airpoints Dollars earned per opted-in passenger per trip leg. Index 100 = average earn density; Evening (127) and Early (118) are the strongest wait windows.',
        citations: [WORKSPACE_CITE],
        note: 'Aggregate cohorts only (min bucket 1,000) — no individual passenger data exists in this workspace.',
      };
    },
  }),

  morningBrief: tool({
    description:
      "Get the live inputs for the CDO morning briefing: overnight results, upcoming items, revenue vs forecast, and open compliance flags. The model drafts the briefing from this.",
    inputSchema: z.object({}),
    execute: async () => {
      const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
      const openFlags = COMPLIANCE_CHECKS.filter(
        (c) => c.fairTrading !== 'pass' || c.ipp3aNotice !== 'shown',
      );
      return {
        brief: CDO_BRIEF,
        revenue: { mtd: REVENUE_MTD, split, forecastJul: REVENUE_FORECAST_JUL },
        openComplianceFlags: openFlags,
        citations: [WORKSPACE_CITE],
        note: 'Draft for the customer team — concept demo figures.',
      };
    },
  }),

  sponsorLookup: tool({
    description: 'Look up sponsors and their campaign status in the partner workspace.',
    inputSchema: z.object({
      query: z.string().optional().describe('Sponsor name fragment; empty for all'),
    }),
    execute: async ({ query }) => {
      const q = query?.trim().toLowerCase();
      const hits = q ? SPONSORS.filter((s) => s.name.toLowerCase().includes(q)) : SPONSORS;
      return { sponsors: hits, citations: [WORKSPACE_CITE] };
    },
  }),

  revenueSplitCalc: tool({
    description:
      'Compute the fixed partnership revenue split on a gross figure: 55% treasury (60% of that credited to members as Airpoints Dollars), 45% assembl share.',
    inputSchema: z.object({
      grossNzd: z.number().min(0),
    }),
    execute: async ({ grossNzd }) => ({
      split: revenueSplit(grossNzd),
      citations: [WORKSPACE_CITE],
      note: 'Fixed concept-demo split — commercial terms are illustrative.',
    }),
  }),

  searchNZKnowledge: tool({
    description:
      "Search assembl's live NZ knowledge base (legislation, official guidance) via pgvector — Fair Trading Act, Privacy Act IPP 3A, ASA codes. Cite returned sources with URLs.",
    inputSchema: z.object({ query: z.string() }),
    execute: async ({ query }) => {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!base || !serviceKey || !geminiKey) {
        return { status: 'unavailable', note: 'Live KB not reachable — flag it was not checked.' };
      }
      try {
        const er = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: { parts: [{ text: query.slice(0, 8000) }] }, outputDimensionality: 768 }),
          },
        );
        if (!er.ok) return { status: 'error', note: 'Live search failed — flag it was not verified.' };
        const ej = (await er.json()) as { embedding?: { values?: number[] } };
        const embedding = ej.embedding?.values;
        if (!Array.isArray(embedding) || embedding.length === 0) {
          return { status: 'error', note: 'No embedding — flag it was not verified.' };
        }
        const supabase = createClient(base, serviceKey) as unknown as SupabaseRpcClient;
        const cites = await citeFromPCO(supabase, embedding, null, 6);
        if (!cites.length) return { status: 'no_results', note: 'Nothing close in the live KB — say so.' };
        return {
          status: 'ok',
          citations: cites.map((c) => ({
            title: c.title,
            url: c.url,
            ref: c.snippet.slice(0, 240),
            tier: 'B' as const,
          })),
          retrievedAt: new Date().toISOString().slice(0, 10),
        };
      } catch (e) {
        return { status: 'error', note: `Knowledge search error: ${e instanceof Error ? e.message : 'unknown'}.` };
      }
    },
  }),
};

export async function POST(req: Request) {
  const primaryModelId = MODEL_TIER_TO_ANTHROPIC.mid;
  const ladder = resolveModelLadder(primaryModelId, []);
  const rung = pickRung(ladder);
  if (!rung) {
    return Response.json(
      { error: 'Chat is not configured — set ANTHROPIC_API_KEY or a fallback key.' },
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
  const system = rung.isPrimary ? AIRNZ_SYSTEM_PROMPT : `${AIRNZ_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-air-nz',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: airnzTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-air-nz',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
