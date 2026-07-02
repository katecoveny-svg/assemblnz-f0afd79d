import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { classifyGoods } from '@/lib/customs/classify';
import { computeLandedCost } from '@/lib/customs/landed-cost';
import { inferDutyRateByChapter, matchReference, WORKING_TARIFF_CITATION } from '@/lib/customs/hs-reference';
import { buildEntryPlan } from '@/lib/customs/entry-planner';
import { AIRONAUT_SYSTEM_PROMPT } from '@/lib/customers/aironaut/agent';
import {
  aironautBoatConsignments,
  aironautExoticVehicleConsignments,
  aironautFreightConsignments,
  aironautWineConsignments,
} from '@/lib/customers/aironaut/demo-data';

export const maxDuration = 60;

/**
 * AIRONAUT pilot chat — Pīkau streaming inside the customer workspace.
 *
 * Everything factual runs through REAL tools: the ported Pīkau tariff engine
 * (lib/customs — deterministic HS classification with GRI reasoning + real
 * Working Tariff citations), the landed-cost calculator, the entry planner,
 * the demo consignment store, and live pgvector retrieval over the NZ
 * industry knowledge base. No canned responses.
 *
 * Draft-only: the system prompt forbids lodgement/sending, and no tool here
 * has a side effect beyond reading. No paywall — this sits behind the pilot
 * surface for a named partner (family pilot).
 */

const ALL_CONSIGNMENTS = [
  ...aironautFreightConsignments,
  ...aironautExoticVehicleConsignments,
  ...aironautBoatConsignments,
  ...aironautWineConsignments,
];

const aironautTools = {
  classifyGoods: tool({
    description:
      'Classify a goods description into three ranked HS candidates with GRI reasoning, duty rates, and Working Tariff citations. ALWAYS use this for any classification question — never classify from memory.',
    inputSchema: z.object({
      goodsDescription: z.string().describe('Plain-English description of the goods'),
      hintCode: z.string().optional().describe('An HS code the user believes applies, if they gave one'),
    }),
    execute: async ({ goodsDescription, hintCode }) => {
      const result = classifyGoods(goodsDescription, hintCode);
      return {
        ...result,
        citations: result.citations.map((c) => ({
          title: c.source,
          ref: c.ref,
          url: c.url,
          tier: 'A' as const,
        })),
      };
    },
  }),

  landedCost: tool({
    description:
      'Compute an indicative NZ landed cost: CIF = FOB + freight + insurance; duty = CIF × rate; import GST 15% on (CIF + duty); plus fees. Use for any "what will this cost landed" question. Amounts in NZD.',
    inputSchema: z.object({
      fobNzd: z.number().min(0),
      freightNzd: z.number().min(0).default(0),
      insuranceNzd: z.number().min(0).default(0),
      dutyRatePercent: z.number().min(0).max(100).default(0).describe('Duty rate % — get it from classifyGoods or tariffLookup first'),
      processingFeeNzd: z.number().min(0).default(102.27).describe('Customs + MPI processing (default current combined demo figure)'),
      biosecurityLevyNzd: z.number().min(0).default(0),
      otherFeesNzd: z.number().min(0).default(0),
    }),
    execute: async (input) => {
      const result = computeLandedCost(input);
      return {
        input,
        result,
        citations: [
          { title: 'Customs and Excise Act 2018', ref: 'valuation + GST on imports', tier: 'A' as const },
        ],
        note: 'Indicative only — the licensed broker confirms rate, concessions and valuation method at lodgement.',
      };
    },
  }),

  tariffLookup: tool({
    description:
      'Look up the NZ Working Tariff reference for a goods description: matching HS headings, duty rates, and the tariff citation. Lighter than classifyGoods — use for a quick "what is the tariff on X" question.',
    inputSchema: z.object({
      query: z.string().describe('Goods type to look up, e.g. "leather dog collars"'),
    }),
    execute: async ({ query }) => {
      const matches = matchReference(query);
      const fallbackRate = inferDutyRateByChapter('', query);
      return {
        matches: matches.slice(0, 3).map((m) => ({
          hsCode: m.hsCode,
          heading: m.headingText,
          dutyRatePercent: m.dutyRatePercent,
          gri: m.griApplied,
          chapter: m.chapterText,
        })),
        inferredRateIfNoMatch: matches.length === 0 ? fallbackRate : undefined,
        citations: [
          {
            title: WORKING_TARIFF_CITATION.source,
            ref: WORKING_TARIFF_CITATION.ref,
            url: WORKING_TARIFF_CITATION.url,
            tier: 'A' as const,
          },
        ],
        note: 'Reference extract — broker confirms the full 11-digit code before lodgement.',
      };
    },
  }),

  trackConsignment: tool({
    description:
      'Look up a consignment in the Aironaut workspace by reference (e.g. AIR-2314) or by matching origin/destination/description. Demo records only.',
    inputSchema: z.object({
      query: z.string().describe('Consignment reference or a route/description fragment'),
    }),
    execute: async ({ query }) => {
      const q = query.toLowerCase();
      const hits = ALL_CONSIGNMENTS.filter((c) =>
        Object.values(c).some((v) => typeof v === 'string' && v.toLowerCase().includes(q)),
      );
      return {
        count: hits.length,
        consignments: hits.slice(0, 5),
        citations: hits.length
          ? [{ title: 'Aironaut consignment workspace', ref: 'demo records', tier: 'C' as const }]
          : [],
        note: hits.length
          ? 'Demo consignment records — treat as workflow examples, not live freight.'
          : 'No matching consignment in the demo workspace. Offer to draft a new-consignment intake instead.',
      };
    },
  }),

  draftEntryPlan: tool({
    description:
      'Draft a customs-entry readiness plan for a shipment: duty calc at the given rate, required vs held documents, blockers and warnings with statute citations. Use when asked to "draft a customs entry".',
    inputSchema: z.object({
      shipmentRef: z.string(),
      importerName: z.string(),
      supplierName: z.string(),
      originCountry: z.string(),
      goodsDescription: z.string(),
      customsValueNzd: z.number().min(0),
      freightNzd: z.number().min(0).default(0),
      insuranceNzd: z.number().min(0).default(0),
      dutyRatePercent: z.number().min(0).max(100).default(0),
      hasImporterClientCode: z.boolean().default(false),
      claimPreference: z.boolean().default(false),
      hasFoodForSale: z.boolean().default(false),
      hasWoodPackaging: z.boolean().default(false),
      hasDangerousGoods: z.boolean().default(false),
    }),
    execute: async (i) => {
      const unclassified = i.dutyRatePercent === 0;
      const plan = buildEntryPlan(
        {
          shipmentRef: i.shipmentRef,
          importerName: i.importerName,
          importerId: 'demo-importer',
          supplierName: i.supplierName,
          originCountry: i.originCountry,
          incoterm: 'FOB',
          currency: 'NZD',
          freightNzd: i.freightNzd,
          insuranceNzd: i.insuranceNzd,
          lines: [
            {
              description: i.goodsDescription,
              quantity: 1,
              unitValueNzd: i.customsValueNzd,
              lineValueNzd: i.customsValueNzd,
              countryOfOrigin: i.originCountry,
              hsCode: unclassified ? 'TO BE CLASSIFIED' : 'per classifyGoods',
              unclassified,
            },
          ],
          documentsHeld: ['commercial_invoice'],
          flags: {
            hasImporterClientCode: i.hasImporterClientCode,
            claimPreference: i.claimPreference,
            hasFoodForSale: i.hasFoodForSale,
            hasWoodPackaging: i.hasWoodPackaging,
            hasDangerousGoods: i.hasDangerousGoods,
          },
        },
        i.dutyRatePercent,
      );
      return {
        plan,
        citations: [
          { title: 'Customs and Excise Act 2018', ref: 'entry + lodgement obligations', tier: 'A' as const },
        ],
        note: 'Draft readiness plan only — nothing is lodged. Broker review required.',
      };
    },
  }),

  searchNZKnowledge: tool({
    description:
      "Search assembl's live NZ knowledge base (legislation, regulations, official guidance) via pgvector. Use whenever an answer turns on NZ law or official guidance beyond the tariff reference. Cite returned sources with URLs.",
    inputSchema: z.object({
      query: z.string().describe('The NZ legal / regulatory topic to look up'),
    }),
    execute: async ({ query }) => {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!base || !serviceKey || !geminiKey) {
        return {
          status: 'unavailable',
          note: 'Live knowledge base not reachable — answer from the tariff reference tools and flag that the live source was not checked.',
        };
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
            similarity: Number.isFinite(c.similarity) ? Number(c.similarity.toFixed(3)) : undefined,
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
  const system = rung.isPrimary
    ? AIRONAUT_SYSTEM_PROMPT
    : `${AIRONAUT_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-aironaut',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: aironautTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-aironaut',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
