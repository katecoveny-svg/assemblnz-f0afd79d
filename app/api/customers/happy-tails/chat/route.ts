import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { HAPPY_TAILS_SYSTEM_PROMPT } from '@/lib/customers/happy-tails/agent';
import {
  DRAFTS,
  PRICING,
  ROSTER,
  VOICE_RULES,
  dogBySlug,
  welcomePackPages,
  type CarerVoice,
} from '@/lib/tenants/happy-tails/data';

export const maxDuration = 60;

/**
 * Happy Tails pilot chat — Keeper streaming inside the customer workspace.
 *
 * Real tools over the real workspace data: the roster (Franklin is record
 * #1), the INV-3031 pricing maths, the five-page Welcome Pack builder, the
 * locked two-voice model (Mathis SMS / Liana email), the incident template,
 * and live pgvector retrieval over the NZ knowledge base. Draft-only — no
 * tool has a side effect.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

const WORKSPACE_CITE = { title: 'Happy Tails workspace', ref: 'roster · pricing · voice models', tier: 'C' as const };

const happyTailsTools = {
  lookupDog: tool({
    description:
      'Look up a dog on the Happy Tails roster by name or slug — breed, size tier, discount, owner (masked), schedule notes. Use before drafting anything dog-specific.',
    inputSchema: z.object({
      name: z.string().describe('Dog name or slug, e.g. "franklin"'),
    }),
    execute: async ({ name }) => {
      const q = name.trim().toLowerCase();
      const dog =
        dogBySlug(q) ??
        ROSTER.find((d) => d.name.toLowerCase() === q) ??
        ROSTER.find((d) => d.name.toLowerCase().includes(q));
      if (!dog) {
        return {
          found: false,
          roster: ROSTER.map((d) => d.name),
          note: 'No dog by that name on the roster. If they are newly enrolled, draft from the enrolment details the user gives you.',
        };
      }
      return { found: true, dog, citations: [WORKSPACE_CITE] };
    },
  }),

  draftInvoice: tool({
    description:
      'Compute a monthly invoice draft in the INV-3031 shape: GST-inclusive line items, small-pup discount on overnights where the dog qualifies, 7-day terms. ALWAYS use this for invoice maths — never compute rates from memory.',
    inputSchema: z.object({
      dogName: z.string(),
      daycareWithBusDays: z.number().int().min(0).default(0),
      overnightNights: z.number().int().min(0).default(0),
      adjustmentNzd: z.number().default(0).describe('Optional part-month rounding / credit (can be negative)'),
      adjustmentNote: z.string().optional(),
    }),
    execute: async (i) => {
      const dog =
        dogBySlug(i.dogName.trim().toLowerCase()) ??
        ROSTER.find((d) => d.name.toLowerCase() === i.dogName.trim().toLowerCase());
      const smallPup = dog?.sizeTier === 'small';
      const overnightRate = smallPup ? PRICING.overnightSmallPup : PRICING.overnight;
      const lines = [
        ...(i.daycareWithBusDays > 0
          ? [{ service: 'Daycare with bus', note: 'GST incl.', qty: i.daycareWithBusDays, rate: PRICING.daycareWithBus, amount: round2(i.daycareWithBusDays * PRICING.daycareWithBus) }]
          : []),
        ...(i.overnightNights > 0
          ? [{ service: 'Overnight Care', note: smallPup ? `small-pup ${PRICING.smallPupDiscountPct}% discount` : 'standard rate', qty: i.overnightNights, rate: overnightRate, amount: round2(i.overnightNights * overnightRate) }]
          : []),
        ...(i.adjustmentNzd !== 0
          ? [{ service: 'Adjustment', note: i.adjustmentNote ?? 'part-month adjustment', qty: null, rate: null, amount: round2(i.adjustmentNzd) }]
          : []),
      ];
      const total = round2(lines.reduce((s, l) => s + l.amount, 0));
      return {
        shape: 'INV-3031',
        to: dog ? `${dog.ownerName} — ${dog.name} (${dog.breed.toLowerCase()}${smallPup ? ', small pup' : ''})` : i.dogName,
        terms: PRICING.terms,
        currency: PRICING.currency,
        lines,
        total,
        status: 'DRAFT — created as Draft in Xero, a human issues it',
        citations: [
          { title: 'Happy Tails pricing schema', ref: `daycare ${PRICING.currency}${PRICING.daycareWithBus} · overnight ${PRICING.currency}${PRICING.overnight} · small-pup −${PRICING.smallPupDiscountPct}%`, tier: 'C' as const },
        ],
      };
    },
  }),

  welcomePack: tool({
    description:
      'Build the five-page Happy Tails Welcome Pack for a newly enrolled dog (cover, welcome letter in Liana\'s voice, bus, helpful info, sign-off). Returns the real page content to present.',
    inputSchema: z.object({
      dogName: z.string(),
      ownerName: z.string(),
      pronoun: z.enum(['he', 'she']).default('he'),
    }),
    execute: async ({ dogName, ownerName, pronoun }) => {
      const p = pronoun === 'she' ? { subj: 'she', obj: 'her', poss: 'her' } : { subj: 'he', obj: 'him', poss: 'his' };
      return {
        pages: welcomePackPages(dogName, ownerName, p),
        emailSubjectShape: DRAFTS.email.welcomePackSubject.replace('Franklin', dogName),
        voice: 'liana — email channel',
        citations: [
          { title: 'Happy Tails Welcome Pack template', ref: '5 pages · Liana voice', tier: 'C' as const },
        ],
        note: 'Draft — Liana reviews and sends. Trial day is confirmed by the humans.',
      };
    },
  }),

  voiceRules: tool({
    description:
      "Get the locked two-voice channel rules before drafting ANY comms: Mathis (SMS — casual, brief, single 😀) or Liana (email — warm, formal, no emoji). Returns opener, sign-off, style notes, and a real reference draft in that voice.",
    inputSchema: z.object({
      voice: z.enum(['mathis', 'liana']),
    }),
    execute: async ({ voice }) => {
      const rules = VOICE_RULES[voice as CarerVoice];
      return {
        voice,
        rules,
        referenceDraft:
          voice === 'mathis' ? DRAFTS.sms.nextDayPickup : DRAFTS.email.vaccinationReminderBody.join('\n'),
        citations: [
          { title: 'Happy Tails voice model (§5.4 locked)', ref: `${voice} · ${rules.channel}`, tier: 'C' as const },
        ],
      };
    },
  }),

  incidentReport: tool({
    description:
      'Get the incident-report template for a dog incident (nip, scuffle, injury, escape attempt). Returns the required fields and the compliance notes to include. The model fills it from what the user describes.',
    inputSchema: z.object({
      incidentType: z.enum(['nip', 'scuffle', 'injury', 'illness', 'escape_attempt', 'other']),
    }),
    execute: async ({ incidentType }) => {
      return {
        incidentType,
        requiredFields: [
          'date + time + location (daycare / bus / pickup)',
          'dogs involved (names + size tiers)',
          'what happened — factual sequence, no blame language',
          'immediate response taken (separation, check-over, first aid)',
          'injuries observed (or "none observed — monitored for 30 min")',
          'carer on duty',
          'owner notification plan (both owners, same day, phone first for anything above a graze)',
          'follow-up actions (group re-matching, muzzle-free reintroduction plan, vet advice if any)',
        ],
        complianceNotes: [
          'Animal Welfare Act 1999 — duty of care record',
          'Dog Control Act 1996 — council notification ONLY if a person was harmed or a dog is dangerous; a minor dog-dog nip at pickup is an internal record',
          'Privacy Act 2020 IPP 3A — no owner contact details inside the report body',
        ],
        citations: [
          { title: 'Animal Welfare Act 1999', ref: 'duty of care', tier: 'A' as const },
          { title: 'Dog Control Act 1996', ref: 'notification threshold', tier: 'A' as const },
        ],
        note: 'Draft for the owner file — a human reviews before it is filed or any owner is contacted.',
      };
    },
  }),

  searchNZKnowledge: tool({
    description:
      "Search assembl's live NZ knowledge base (legislation, official guidance) via pgvector. Use when an answer turns on NZ law beyond the workspace rules. Cite returned sources with URLs.",
    inputSchema: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (!base || !serviceKey || !geminiKey) {
        return { status: 'unavailable', note: 'Live KB not reachable — answer from workspace rules and flag it was not checked.' };
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
  const system = rung.isPrimary
    ? HAPPY_TAILS_SYSTEM_PROMPT
    : `${HAPPY_TAILS_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-happy-tails',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: happyTailsTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-happy-tails',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
