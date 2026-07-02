import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';
import { ZOO_SYSTEM_PROMPT } from '@/lib/customers/auckland-zoo/agent';
import {
  aucklandZooCustomers,
  aucklandZooRoster,
  aucklandZooEvents,
} from '@/lib/customers/auckland-zoo/demo-data';

export const maxDuration = 60;

/**
 * Auckland Zoo pilot chat — Kaitiaki streaming inside the keeper workspace.
 *
 * Real tools over the seeded keeper register (six demo animals — the
 * kaumātua-hold on taonga species is enforced in the system prompt AND here:
 * the register simply contains none). Draft-only; no tool has a side effect.
 */

const WORKSPACE_CITE = { title: 'Keeper workspace register', ref: 'demo set · kaumātua-hold on taonga species', tier: 'C' as const };

const zooTools = {
  lookupAnimal: tool({
    description:
      'Look up an animal in the keeper register by name or species — precinct, status, last-seen. Use before drafting anything animal-specific.',
    inputSchema: z.object({
      name: z.string().describe('Animal name or species, e.g. "Rimu" or "red panda"'),
    }),
    execute: async ({ name }) => {
      const q = name.trim().toLowerCase();
      const hits = aucklandZooCustomers.filter((a) => a.name.toLowerCase().includes(q));
      if (!hits.length) {
        return {
          found: false,
          register: aucklandZooCustomers.map((a) => a.name),
          note: 'Not in the register. If this is a taonga species (kiwi, tuatara, tūī …), explain the kaumātua-hold — that work waits for kaumātua guidance.',
        };
      }
      return { found: true, animals: hits, citations: [WORKSPACE_CITE] };
    },
  }),

  enrichmentLog: tool({
    description:
      'Get the enrichment-log template (Animal Welfare Act record shape). The model fills it from what the keeper describes.',
    inputSchema: z.object({
      animalName: z.string(),
    }),
    execute: async ({ animalName }) => {
      const animal = aucklandZooCustomers.find((a) =>
        a.name.toLowerCase().includes(animalName.trim().toLowerCase()),
      );
      return {
        animal: animal ?? null,
        requiredFields: [
          'date + time + precinct',
          'animal(s) — names from the register',
          'enrichment type (cognitive / sensory / food-based / structural / social)',
          'item + presentation (e.g. puzzle feeder, scatter, browse)',
          'duration + engagement observed (specific behaviours, not moods)',
          'outcome rating (engaged / partial / ignored) + evidence',
          'keeper on duty',
          'follow-up (rotate item, adjust difficulty, vet note if concern)',
        ],
        complianceNotes: [
          'Animal Welfare Act 1999 — positive welfare states are part of the duty of care; enrichment records evidence it',
        ],
        citations: [
          { title: 'Animal Welfare Act 1999', ref: 'duty of care · enrichment record', tier: 'A' as const },
          WORKSPACE_CITE,
        ],
        note: 'Draft record — keeper reviews before it is filed.',
      };
    },
  }),

  welfareEmail: tool({
    description:
      'Get the daily welfare-check email shape for the vet team: which animals to cover today (from the register), the observation structure, and the review rule. The model drafts the email from this.',
    inputSchema: z.object({
      focus: z.string().optional().describe('Optional focus, e.g. a precinct or an animal'),
    }),
    execute: async ({ focus }) => {
      const roster = aucklandZooRoster.map((r) => `${r.name} (${r.role}, ${r.shift})`);
      return {
        animalsToday: aucklandZooCustomers.map((a) => ({ name: a.name, lastSeen: a.lastSeen, stage: a.stage })),
        keepersOnShift: roster,
        focus: focus ?? null,
        emailShape: [
          'subject: Daily welfare check — {date, NZ format}',
          'one line per animal: name · precinct · observation (specific behaviour) · flag if any',
          'flags first, all-clear last',
          'sign-off: drafted by Kaitiaki, reviewed by {keeper}',
        ],
        citations: [WORKSPACE_CITE],
        note: 'Draft — the duty keeper reviews and sends from their own account.',
      };
    },
  }),

  schoolGroupBrief: tool({
    description:
      'Prep a school-group brief for a precinct: which animals the group will meet, talking points, safety notes, and any scheduled keeper talks.',
    inputSchema: z.object({
      precinct: z.string().describe('Zone/precinct, e.g. "Africa", "Asia", "South America", "Wetlands"'),
    }),
    execute: async ({ precinct }) => {
      const q = precinct.trim().toLowerCase();
      const animals = aucklandZooCustomers.filter((a) => a.name.toLowerCase().includes(q));
      const events = aucklandZooEvents.filter((e) => e.name.toLowerCase().includes(q));
      return {
        precinct,
        animals: animals.map((a) => a.name),
        scheduledTalks: events.map((e) => ({ name: e.name, when: e.when, capacity: e.capacity, reserved: e.reserved })),
        briefShape: [
          'group size + age band + arrival time',
          'route through the precinct (keeper-approved)',
          'two talking points per animal — behaviour + conservation, factual',
          'safety: barriers, noise, no feeding, hand hygiene stations',
          'wet-weather fallback',
        ],
        citations: [WORKSPACE_CITE],
        note: animals.length ? undefined : 'No register animals in that precinct — offer the nearest precinct with animals.',
      };
    },
  }),

  searchNZKnowledge: tool({
    description:
      "Search assembl's live NZ knowledge base (legislation, official guidance) via pgvector. Use when an answer turns on NZ law (Animal Welfare Act, containment standards). Cite returned sources with URLs.",
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
  const system = rung.isPrimary ? ZOO_SYSTEM_PROMPT : `${ZOO_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-auckland-zoo',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: zooTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-auckland-zoo',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
