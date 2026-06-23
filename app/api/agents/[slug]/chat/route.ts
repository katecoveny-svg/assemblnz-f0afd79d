import { anthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { marketplaceAgentBySlug, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FREE_MESSAGE_LIMIT } from '@/lib/billing/agent-pricing';
import { getEntitlementStatus, incrementFreeUsage } from '@/lib/billing/agent-entitlement';
import { resolveChatIdentity, ANON_COOKIE, anonCookieOptions } from '@/lib/billing/chat-identity';

export const maxDuration = 30;

/** Build a Set-Cookie header string from our anon cookie options. */
function anonSetCookie(value: string): string {
  const o = anonCookieOptions();
  const parts = [`${ANON_COOKIE}=${value}`, `Path=${o.path}`, `Max-Age=${o.maxAge}`, `SameSite=Lax`];
  if (o.httpOnly) parts.push('HttpOnly');
  if (o.secure) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Per-agent streaming chat endpoint (Vercel AI SDK).
 *
 * The system prompt is resolved SERVER-SIDE from the marketplace registry and
 * never trusted from the request body — the browser only ever sends the user's
 * messages. The model is chosen from the agent's model tier.
 *
 * Free tier: the first 3 messages per agent are free (counted per signed-in
 * user or anonymous device). After that the route returns 402 with a paywall
 * payload. A paid install (per-agent / bundle / all-access) lifts the limit.
 *
 * NZ knowledge tools (Gazette / PCO Legislation / Beehive) are scaffolded here
 * as stubs. They expose the shape the model can call, but return a "not yet
 * wired" placeholder. Real retrieval (pgvector embeddings + live source wiring)
 * lands in a follow-up task.
 */

const nzKnowledgeTools = {
  searchGazette: tool({
    description:
      'Search the New Zealand Gazette for official notices (appointments, regulations, authorisations). Use for "has anything been gazetted about…" questions.',
    inputSchema: z.object({
      query: z.string().describe('What to search the NZ Gazette for'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live NZ Gazette search is not wired up yet (follow-up task). Answer from general knowledge and clearly flag that this was not checked against the live Gazette.',
      query,
    }),
  }),
  searchLegislation: tool({
    description:
      'Look up current New Zealand legislation via the PCO Legislation source (Acts, regulations, sections). Use to confirm a specific statutory reference.',
    inputSchema: z.object({
      query: z.string().describe('Act, regulation, or section to look up'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live PCO Legislation lookup is not wired up yet (follow-up task). Cite the relevant Act from general knowledge but flag that it was not verified against the live source.',
      query,
    }),
  }),
  searchBeehive: tool({
    description:
      'Search Beehive.govt.nz for recent New Zealand Government announcements and ministerial releases.',
    inputSchema: z.object({
      query: z.string().describe('What government announcement to search for'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live Beehive search is not wired up yet (follow-up task). Flag that the live source was not checked.',
      query,
    }),
  }),
};

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);

  if (!agent) {
    return Response.json({ error: 'Unknown agent.' }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          'Chat is not configured yet — set ANTHROPIC_API_KEY in the environment (see .env.local.example).',
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

  // ── Free-tier gate ────────────────────────────────────────────────────────
  // Entitled (paid) callers skip the limit. Otherwise this user/device gets
  // FREE_MESSAGE_LIMIT messages on this agent, then the paywall.
  const { identity, setAnonId } = await resolveChatIdentity();
  const status = await getEntitlementStatus(identity, slug);
  if (!status.entitled && status.remaining <= 0) {
    return Response.json(
      {
        error: 'free_limit_reached',
        paywall: true,
        agentSlug: slug,
        freeLimit: FREE_MESSAGE_LIMIT,
        message: `You've used your ${FREE_MESSAGE_LIMIT} free messages with ${agent.name}. Subscribe to keep going.`,
      },
      { status: 402 },
    );
  }
  if (!status.entitled) {
    await incrementFreeUsage(identity, slug);
  }

  const messages = body.messages ?? [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(MODEL_TIER_TO_ANTHROPIC[agent.modelTier]),
    system: agent.systemPrompt,
    messages: modelMessages,
    tools: nzKnowledgeTools,
    // Allow a couple of tool round-trips before the final answer.
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse(
    setAnonId ? { headers: { 'Set-Cookie': anonSetCookie(setAnonId) } } : undefined,
  );
}
