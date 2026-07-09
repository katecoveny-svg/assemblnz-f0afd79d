import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { LULA_SYSTEM_PROMPT } from '@/lib/customers/lula-inn/agent';
import {
  COVERS,
  EVENTS,
  FRIDGE_LOGS,
  SHIFTS,
  TODAY_ALERTS,
  VENUE_REVENUE,
  staffById,
} from '@/lib/customers/lula-inn/demo-data';

export const maxDuration = 60;

const WORKSPACE_CITE = {
  title: 'Lula Inn workspace',
  ref: 'covers · shifts · fridge · events',
  tier: 'C' as const,
};

const lulaTools = {
  todayBrief: tool({
    description: 'Opening picture for today — covers, alerts, revenue snapshot, open shifts count.',
    inputSchema: z.object({}),
    execute: async () => {
      const openShifts = SHIFTS.filter((s) => s.status !== 'confirmed');
      const revenue = VENUE_REVENUE.find((v) => v.venue === 'The Lula Inn');
      return {
        covers: COVERS,
        alerts: TODAY_ALERTS,
        openShifts: openShifts.length,
        revenue,
        citations: [WORKSPACE_CITE],
        note: 'SAMPLE demo day — Friday 27 June 2026 seed.',
      };
    },
  }),

  listShifts: tool({
    description: 'List roster shifts, optionally only those needing cover.',
    inputSchema: z.object({
      needingCoverOnly: z.boolean().default(false),
      day: z.string().optional(),
    }),
    execute: async ({ needingCoverOnly, day }) => {
      let rows = SHIFTS;
      if (day) rows = rows.filter((s) => s.day.toLowerCase() === day.toLowerCase());
      if (needingCoverOnly) rows = rows.filter((s) => s.status !== 'confirmed');
      return {
        shifts: rows.map((s) => ({
          ...s,
          staffName: staffById(s.staffId)?.name ?? s.staffId,
        })),
        citations: [WORKSPACE_CITE],
      };
    },
  }),

  fridgeStatus: tool({
    description: 'Food-safety fridge / cooler log status for the venue.',
    inputSchema: z.object({}),
    execute: async () => ({
      logs: FRIDGE_LOGS,
      citations: [WORKSPACE_CITE],
      note: 'Draft guidance only — manager confirms before any corrective action is logged.',
    }),
  }),

  listEvents: tool({
    description: 'List upcoming venue events / private bookings on the demo board.',
    inputSchema: z.object({}),
    execute: async () => ({ events: EVENTS, citations: [WORKSPACE_CITE] }),
  }),

  draftManagerNote: tool({
    description: 'Draft a short manager note for the floor team (never sends).',
    inputSchema: z.object({
      topic: z.string(),
      detail: z.string().optional(),
    }),
    execute: async ({ topic, detail }) => ({
      draft: `Floor team — ${topic}.\n\n${detail?.trim() || 'Please check with the manager on duty before service.'}\n\n— Draft from the Lula floor desk (not sent)`,
      citations: [WORKSPACE_CITE],
    }),
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
  const system = rung.isPrimary ? LULA_SYSTEM_PROMPT : `${LULA_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'pilot-lula-inn',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: lulaTools,
    stopWhen: stepCountIs(5),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'pilot-lula-inn',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
