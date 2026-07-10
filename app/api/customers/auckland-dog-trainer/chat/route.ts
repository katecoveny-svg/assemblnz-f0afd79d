import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { FRED_SYSTEM_PROMPT } from '@/lib/customers/auckland-dog-trainer/agent';
import {
  DOGS,
  LEADS,
  OFFERS,
  PROGRAMMES,
  type OfferSlug,
} from '@/lib/customers/auckland-dog-trainer/demo-data';
import { transformSessionNotes } from '@/lib/customers/auckland-dog-trainer/notes-engine';

export const maxDuration = 60;

const WORKSPACE_CITE = {
  title: 'Harbourside Dog Training workspace',
  ref: 'programmes · dogs · leads · notes engine · social',
  tier: 'C' as const,
};

function recommendOffer(text: string): OfferSlug {
  const t = text.toLowerCase();
  if (/bite|aggress|lunge|safety/.test(t)) return 'private';
  if (/reactiv|scooter|threshold/.test(t)) return 'reactivity';
  if (/recall|off-?leash|e-?collar/.test(t)) return 'recall';
  if (/board|live.?in|intensive/.test(t)) return 'board-train';
  if (/board(ing)?|holiday|travel/.test(t)) return 'boutique-board';
  if (/pull|jump|manners|obedience|puppy/.test(t)) return 'obedience-6w';
  return 'private';
}

const fredTools = {
  listProgrammes: tool({
    description:
      'List Sam’s programme catalogue with SAMPLE prices and active-dog counts. Use before recommending an offer.',
    inputSchema: z.object({}),
    execute: async () => ({
      programmes: PROGRAMMES,
      offers: OFFERS,
      citations: [WORKSPACE_CITE],
      note: 'Indicative prices are placeholders, not live quotes.',
    }),
  }),

  triageLead: tool({
    description:
      'Triage a new dog–human enquiry into urgency + recommended offer. Pass free-text symptoms/goals.',
    inputSchema: z.object({
      owner: z.string().optional(),
      dog: z.string().optional(),
      breed: z.string().optional(),
      age: z.string().optional(),
      suburb: z.string().optional(),
      issues: z.string().describe('Behaviour issues, goals, bite history, household notes'),
    }),
    execute: async (i) => {
      const recommended = recommendOffer(i.issues);
      const urgency = /bite|aggress|lunge|attack/.test(i.issues.toLowerCase())
        ? 'urgent'
        : /reactiv|scooter|select/.test(i.issues.toLowerCase())
          ? 'soon'
          : 'routine';
      const riskLevel =
        urgency === 'urgent' ? 'high' : /reactiv|scooter|aggress/.test(i.issues.toLowerCase()) ? 'medium' : 'low';
      const similar = LEADS.filter((l) => l.recommended === recommended).slice(0, 2);
      return {
        recommended,
        offer: OFFERS[recommended],
        urgency,
        riskLevel,
        triageNote:
          urgency === 'urgent'
            ? 'Safety flag — private assessment first; do not route to group or park work yet.'
            : `Likely fit for ${OFFERS[recommended].label}. Sam confirms before booking.`,
        similarLeads: similar,
        draftReplyHint: `Kia ora — thanks for getting in touch about ${i.dog ?? 'your dog'}. From what you've shared, ${OFFERS[recommended].label} looks like the cleanest next step (${OFFERS[recommended].priceSample}). Draft only — Sam sends.`,
        explainerHint:
          recommended === 'reactivity'
            ? 'Understanding thresholds (Reactivity W2)'
            : recommended === 'recall'
              ? 'Recall under distraction'
              : 'Private assessment explainer',
        citations: [WORKSPACE_CITE],
      };
    },
  }),

  transformNotes: tool({
    description:
      'Turn a session voice-note transcript into client summary, homework, risk notes, course match, booking prompt, and trainer handover.',
    inputSchema: z.object({
      transcript: z.string().min(10),
    }),
    execute: async ({ transcript }) => ({
      plan: transformSessionNotes(transcript),
      citations: [WORKSPACE_CITE],
      note: 'Draft only — Sam reviews before anything is sent to the owner.',
    }),
  }),

  lookupDog: tool({
    description: 'Look up a dog already on a Sam programme by name.',
    inputSchema: z.object({ name: z.string() }),
    execute: async ({ name }) => {
      const q = name.trim().toLowerCase();
      const dog = DOGS.find((d) => d.name.toLowerCase() === q || d.name.toLowerCase().includes(q));
      if (!dog) {
        return { found: false, roster: DOGS.map((d) => d.name), citations: [WORKSPACE_CITE] };
      }
      return {
        found: true,
        dog: { ...dog, programmeLabel: OFFERS[dog.programme].label },
        citations: [WORKSPACE_CITE],
      };
    },
  }),

  draftHandover: tool({
    description: 'Draft a second-trainer handover brief for a dog on programme.',
    inputSchema: z.object({
      dogName: z.string(),
      extraNotes: z.string().optional(),
    }),
    execute: async ({ dogName, extraNotes }) => {
      const dog = DOGS.find((d) => d.name.toLowerCase() === dogName.trim().toLowerCase());
      if (!dog) {
        return { found: false, note: 'Dog not on the SAMPLE roster — ask for session details and draft from those.' };
      }
      const plan = transformSessionNotes(
        `Met ${dog.name} today. ${dog.age} ${dog.breed}. Issues: ${dog.triggers.join(', ') || dog.goals.join(', ')}. ${extraNotes ?? dog.lastWin}`,
      );
      return {
        found: true,
        handover: plan.trainerHandover,
        homework: plan.weeklyHomework,
        riskNotes: plan.riskNotes,
        citations: [WORKSPACE_CITE],
      };
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
    ? FRED_SYSTEM_PROMPT
    : `${FRED_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-auckland-dog-trainer',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: fredTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-auckland-dog-trainer',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
