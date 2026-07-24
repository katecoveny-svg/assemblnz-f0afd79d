import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import {
  WOOLWORTHS_CONCEPT_SYSTEM,
  WOOLWORTHS_KAIMAHI_SYSTEM,
} from '@/lib/concepts/woolworths-kb';

export const maxDuration = 30;

/**
 * Live agent for the private Woolworths "assembled shop" concept.
 *
 * Two personas mirror the reference implementation:
 *   - `concept` — evidence-first Q&A about the concept, pilot and commercials.
 *   - `kaimahi` — the in-app customer agent (role-play), named by the buyer.
 *
 * Model-backed via the repo's Anthropic ladder; fails soft with a 503 the
 * client falls back from (to the grounded, run-derived answers). Concept demo —
 * no live Woolworths system is touched and no order is ever placed.
 */
export async function POST(req: Request) {
  let body: { agent?: string; message?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const agent = body.agent === 'kaimahi' ? 'kaimahi' : 'concept';
  const message = (body.message ?? '').trim();
  if (!message) return Response.json({ text: '' });
  if (message.length > 2000) {
    return Response.json({ error: 'Message too long.' }, { status: 413 });
  }

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.cheap, ['gemini-2.5-flash', 'groq:llama-3.3-70b-versatile']);
  if (ladder.length === 0) {
    // No model configured — tell the client to use its grounded fallback.
    return Response.json({ error: 'agent_unconfigured' }, { status: 503 });
  }

  const system = agent === 'kaimahi' ? WOOLWORTHS_KAIMAHI_SYSTEM : WOOLWORTHS_CONCEPT_SYSTEM;
  const userContent =
    agent === 'kaimahi' && body.name?.trim()
      ? `MY NAME IS: ${body.name.trim().slice(0, 40)}\n\n${message}`
      : message;

  const result = await generateWithFallback({
    ladder,
    system,
    messages: [{ role: 'user', content: userContent }],
    agentSlug: `concept-everyday-rewards-${agent}`,
    tenant: 'everyday-rewards',
  });

  if (!result.ok) {
    return Response.json({ error: 'agent_error' }, { status: 502 });
  }

  return Response.json(
    { text: result.text, agent, backend: result.rung.id },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
