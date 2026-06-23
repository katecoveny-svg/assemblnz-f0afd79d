import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { marketplaceAgentBySlug, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, type ModelRung, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { recommendAgents } from '@/lib/atlas/recommend';

export const maxDuration = 30;

/**
 * Atlas — the free AI literacy coach chat endpoint (Vercel AI SDK).
 *
 * Atlas is in the marketplace registry, so its locked system prompt resolves
 * server-side exactly like every other agent. What is different here:
 *
 *  1. A `recommend_agents` tool backs the diagnostic → recommendation flow. The
 *     model describes the user's week in plain words, the tool returns real
 *     matches from the shelf (lib/atlas/recommend). Atlas only ever names agents
 *     the tool confirmed — the shelf is the source of truth, not the model's
 *     memory.
 *
 *  2. Per-message model selection. The diagnostic + recommendation reasoning
 *     runs on the agent's tier primary (Claude Sonnet). A trivial acknowledgement
 *     (a one-word reply, a greeting) drops to a cheaper rung — Gemini Flash — when
 *     one is configured, to keep the free surface cheap to run. The free-fallback
 *     ladder still covers a missing or down primary.
 */

const recommendTool = tool({
  description:
    'Search the assembl agent shelf for agents that fit what the user described. ' +
    'Call this once you understand the shape of their week, BEFORE naming any agent. ' +
    'Pass a plain-language description of the work they do and the bits that take too long.',
  inputSchema: z.object({
    need: z
      .string()
      .describe('Plain description of the user’s work and the tasks they want help with, e.g. "small cafe owner, staff rosters and supplier invoices take too long"'),
  }),
  execute: async ({ need }) => {
    const matches = recommendAgents(need, 3);
    if (matches.length === 0) {
      return {
        status: 'no-fit',
        note:
          'Nothing on the shelf is a close match. Be honest about that and offer Pilot (the agent maker) so they can build their own.',
        matches: [],
      };
    }
    return {
      status: 'ok',
      note: 'These are the closest fits, best first. Give an honest reason for each and say what it will not do.',
      matches,
    };
  },
});

/**
 * Choose the rung for this turn. Trivial acknowledgements use the cheapest
 * non-primary rung when available; everything else uses the primary (Sonnet).
 */
function chooseRung(latestUserText: string, ladder: ModelRung[]): ModelRung | null {
  const primary = pickRung(ladder);
  if (!primary) return null;

  const trimmed = latestUserText.trim().toLowerCase();
  const tokenCount = trimmed.split(/\s+/).filter(Boolean).length;
  const trivial =
    tokenCount <= 3 ||
    /^(hi|hey|kia ora|hello|thanks|thank you|ok|okay|yes|no|sure|cheers|ta|cool|nice)\b/.test(trimmed);

  if (trivial) {
    const cheap = ladder.find((r) => !r.isPrimary && r.id.startsWith('gemini'));
    if (cheap) return cheap;
  }
  return primary;
}

export async function POST(req: Request) {
  const agent = marketplaceAgentBySlug('atlas');
  if (!agent) {
    return Response.json({ error: 'Atlas is not configured.' }, { status: 404 });
  }

  const primaryModelId = MODEL_TIER_TO_ANTHROPIC[agent.modelTier];
  const ladder = resolveModelLadder(primaryModelId, agent.fallbackModels);

  if (ladder.length === 0) {
    return Response.json(
      {
        error:
          'Atlas chat is not configured yet — set ANTHROPIC_API_KEY (primary) or a fallback key (GEMINI_API_KEY / GROQ_API_KEY / OLLAMA_BASE_URL). See .env.local.example.',
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

  const messages = body.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const lastUserText =
    lastUser?.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join(' ') ?? '';

  const rung = chooseRung(lastUserText, ladder) ?? pickRung(ladder);
  if (!rung) {
    return Response.json({ error: 'No model available.' }, { status: 503 });
  }

  const modelMessages = await convertToModelMessages(messages);
  const system = rung.isPrimary ? agent.systemPrompt : `${agent.systemPrompt}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'atlas',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary not configured or trivial-turn routed to a cheaper rung',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools: { recommend_agents: recommendTool },
    stopWhen: stepCountIs(4),
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: 'atlas',
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse();
}
