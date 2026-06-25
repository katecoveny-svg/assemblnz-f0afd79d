import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
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
  const system = rung.isPrimary ? ECHO_SYSTEM_PROMPT : `${ECHO_SYSTEM_PROMPT}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: 'echo',
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    stopWhen: stepCountIs(2),
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
