import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { EDR_SYSTEM_PROMPT } from '@/lib/customers/everyday-rewards/agent';
import {
  CAMPAIGNS,
  CDMO_BRIEF,
  POINT_VALUE_NZD,
  RECON,
  REVENUE_FORECAST_JUL,
  REVENUE_MTD,
  REVENUE_TREND,
  SPONSORS,
  SPONSOR_TIERS,
  revenueSplit,
} from '@/lib/customers/everyday-rewards/ops-data';

export const maxDuration = 60;

/**
 * Everyday Rewards partner-ops chat — the Assembling desk (TIER-2 SLICE).
 *
 * Real tools over the mocked partner workspace: current-hour earn maths from
 * the MTD figures, the weekly partner email inputs, sponsor/tier lookups,
 * reconciliation status, and live pgvector retrieval. Concept demo — no live
 * Everyday Rewards systems, no real points minted.
 */

const WORKSPACE_CITE = { title: 'Partner-ops workspace', ref: 'mocked — concept demo', tier: 'C' as const };

const HOURS_ELAPSED_MTD = 24 * 1.5 * 10; // demo month-to-date trading-hours basis (fixed for determinism)

const edrTools = {
  earnRateNow: tool({
    description:
      "Compute the partner earn rate this hour from the MTD figures: sponsored moments per hour, points minted per hour, and dollar value. Use for any 'earn rate right now' question.",
    inputSchema: z.object({}),
    execute: async () => {
      const split = revenueSplit(REVENUE_MTD.grossAdRevenue);
      const momentsPerHour = Math.round(REVENUE_MTD.sponsoredMoments / HOURS_ELAPSED_MTD);
      const pointsPerHour = Math.round(split.pointsMinted / HOURS_ELAPSED_MTD);
      return {
        thisHour: {
          sponsoredMoments: momentsPerHour,
          pointsMinted: pointsPerHour,
          valueNzd: Math.round(pointsPerHour * POINT_VALUE_NZD * 100) / 100,
          fillRate: REVENUE_MTD.fillRate,
        },
        basis: `MTD figures averaged over a fixed demo trading-hours basis (${HOURS_ELAPSED_MTD}h) — a live feed replaces this in production.`,
        mtd: { gross: split.gross, pointsMinted: split.pointsMinted, toShopper: split.toShopper },
        citations: [WORKSPACE_CITE],
        note: 'Concept demo — no real points are minted.',
      };
    },
  }),

  weeklyPartnerEmail: tool({
    description:
      'Get the inputs for the weekly partner performance email (recipient: Sarah, partner manager — demo persona): trend, recon status, brief, sponsor states. The model drafts the email from this.',
    inputSchema: z.object({}),
    execute: async () => ({
      recipient: 'Sarah — partner manager (demo persona)',
      trend: REVENUE_TREND,
      forecastJul: REVENUE_FORECAST_JUL,
      recon: RECON,
      brief: CDMO_BRIEF,
      liveSponsors: SPONSORS.filter((s) => s.status === 'live').map((s) => s.name),
      runningCampaigns: CAMPAIGNS.filter((c) => c.status === 'running').length,
      emailShape: [
        'subject: Assembling × Everyday Rewards — week in review',
        'headline number first, then trend vs forecast',
        'recon status one line (balanced / variance + cents)',
        'sponsor movements, then next week',
        'sign-off: drafted by the Assembling desk, reviewed by {owner}',
      ],
      citations: [WORKSPACE_CITE],
      note: 'Draft — a human reviews and sends. Concept demo figures.',
    }),
  }),

  sponsorLookup: tool({
    description: 'Look up sponsors, their tier economics, and campaign status in the partner workspace.',
    inputSchema: z.object({
      query: z.string().optional().describe('Sponsor name or tier (platinum/gold/silver); empty for all'),
    }),
    execute: async ({ query }) => {
      const q = query?.trim().toLowerCase();
      const hits = q
        ? SPONSORS.filter((s) => s.name.toLowerCase().includes(q) || s.tier === q)
        : SPONSORS;
      return { sponsors: hits, tierEconomics: SPONSOR_TIERS, citations: [WORKSPACE_CITE] };
    },
  }),

  reconStatus: tool({
    description: 'Get the sponsor-funded points reconciliation status (batches, treasury, variance).',
    inputSchema: z.object({}),
    execute: async () => ({
      recon: RECON,
      citations: [WORKSPACE_CITE],
      note: 'Concept demo reconciliation — real feeds replace this in production.',
    }),
  }),

  searchNZKnowledge: tool({
    description:
      "Search assembl's live NZ knowledge base (legislation, official guidance) via pgvector — Fair Trading Act, ASA codes, Privacy Act IPP 3A. Cite returned sources with URLs.",
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
  const system = rung.isPrimary ? EDR_SYSTEM_PROMPT : `${EDR_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-everyday-rewards',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: edrTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-everyday-rewards',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
