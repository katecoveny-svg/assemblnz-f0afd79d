import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { SWITCH_SYSTEM_PROMPT } from '@/lib/customers/contact-energy/agent';
import {
  BILL_PREVIEW,
  JUNE_VS_MAY,
  LEDGER,
  USAGE_MONTHS,
  WALLET,
  WEEKLY_TREND,
} from '@/lib/customers/contact-energy/data';

export const maxDuration = 60;

/**
 * Contact Energy × Assembling — Switch, the power assistant (TIER-2 SLICE).
 *
 * Real tools over the fictional demo account: usage breakdowns, best-plan
 * checks against the published-tariff mirror, bill forecasts with Assembling
 * credits applied, and the wallet ledger. Concept demo — Contact Energy is a
 * pitch target; nothing touches a live Contact system, no real credits exist.
 */

const TARIFF_CITE = {
  title: 'Contact Energy published tariff feed',
  ref: 'public plan rates — synced daily (demo mirror)',
  tier: 'A' as const,
};

const WORKSPACE_CITE = {
  title: 'Demo account workspace',
  ref: 'fictional usage + ledger — concept demo',
  tier: 'C' as const,
};

/**
 * The demo plan table Switch reasons over. Shaped like Contact's public
 * residential plans; rates are illustrative, not quoted from a live feed.
 */
const PLAN_TABLE = [
  {
    plan: 'Good Nights',
    hook: 'Free power 9pm–midnight weeknights',
    monthlyOnDemoUsage: 243.37,
    note: 'Wins on this profile — EV charging and dishwasher sit inside the free window.',
  },
  {
    plan: 'Good Weekends',
    hook: 'Free power 9am–5pm weekends',
    monthlyOnDemoUsage: 251.47,
    note: 'Weekend daytime use on this profile is too light to beat Good Nights.',
  },
  {
    plan: 'Basic',
    hook: 'Flat anytime rate',
    monthlyOnDemoUsage: 258.9,
    note: 'No free window; loses on any shifted-load profile.',
  },
];

const switchTools = {
  usageBreakdown: tool({
    description:
      "Explain why a bill moved month-on-month: the June-vs-May driver breakdown plus the 12-month usage table. Use for any 'why was my bill higher/lower' question.",
    inputSchema: z.object({}),
    execute: async () => ({
      juneVsMay: JUNE_VS_MAY,
      months: USAGE_MONTHS,
      citations: [WORKSPACE_CITE],
      note: 'Fictional demo account — figures illustrative.',
    }),
  }),

  bestPlanCheck: tool({
    description:
      'Compare the demo usage profile against Good Nights, Good Weekends and Basic; returns the monthly cost of each and the recommendation.',
    inputSchema: z.object({}),
    execute: async () => ({
      plans: PLAN_TABLE,
      recommendation:
        'Stay on Good Nights — ahead of the next-best plan by $8.10/month on the last 90 days of demo usage.',
      citations: [TARIFF_CITE, WORKSPACE_CITE],
      note: 'Plan rates illustrative — a live deployment quotes the synced tariff feed.',
    }),
  }),

  billForecast: tool({
    description:
      'Forecast the next bill for the demo account, itemised, with Assembling credits applied before issue.',
    inputSchema: z.object({}),
    execute: async () => ({
      forecast: BILL_PREVIEW,
      assemblingCreditsApplied: WALLET.thisMonth,
      citations: [WORKSPACE_CITE],
      note: BILL_PREVIEW.forecastNote,
    }),
  }),

  walletLedger: tool({
    description:
      "Where Assembling credits came from: this month's total, lifetime, the weekly trend, and recent ledger entries (loading moment, partner, seconds watched, credit).",
    inputSchema: z.object({
      limit: z.number().min(1).max(47).optional().describe('How many recent entries (default 8)'),
    }),
    execute: async ({ limit }) => ({
      thisMonth: WALLET.thisMonth,
      lifetime: WALLET.lifetime,
      weeklyTrend: WEEKLY_TREND,
      entries: LEDGER.slice(0, limit ?? 8),
      citations: [WORKSPACE_CITE],
      note: 'Demo credits — illustrative, never applied to a real bill.',
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
            body: JSON.stringify({
              content: { parts: [{ text: query.slice(0, 8000) }] },
              outputDimensionality: 768,
            }),
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
  const system = rung.isPrimary ? SWITCH_SYSTEM_PROMPT : `${SWITCH_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-contact-energy',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: switchTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-contact-energy',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
