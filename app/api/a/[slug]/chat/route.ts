/**
 * POST /api/a/[slug]/chat — metered public chat with a shared community agent.
 *
 * The system prompt is resolved SERVER-SIDE from the community_agents row
 * (shared rows only, via the service client) — the browser only ever sends
 * the visitor's messages. Order of checks, all BEFORE the stream opens:
 *
 *   1. resolve the shared agent (404 for unknown / unshared slugs);
 *   2. IP flood control (same primitive as marketplace chat, slug `a:<slug>`);
 *   3. the shared email-capture gate (kind 'agent': anon 5/day, email 20/day)
 *      — blocked visitors get the 402 whose body drives the capture modal.
 *
 * Model resolves cheap-first (Gemini preference, fail-open to any configured
 * provider). Replies carry the community draft-only footer: built by a
 * visitor, drafts only, never sends anything.
 */
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { getSharedAgent } from '@/lib/agents/community';
import { checkChatRateLimit, chatClientIp } from '@/lib/agents/chat-rate-limit';
import { gate, gateBlockedResponse, gateHeaders } from '@/lib/gating/server';
import { resolveModel } from '@/lib/pilot/models';
import { FALLBACK_DISCLOSURE } from '@/lib/ai/router';

export const maxDuration = 60;

const COMMUNITY_FOOTER =
  '\n\nYou are a community agent on a public assembl page, built by a visitor with the agent builder. Everything you produce is a draft for the reader to check before it goes anywhere — you never send, post, or run anything yourself, and you say so plainly if asked.';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  const agent = await getSharedAgent(slug);
  if (!agent || !agent.systemPrompt.trim()) {
    return Response.json({ error: 'Unknown agent.' }, { status: 404 });
  }

  const rate = await checkChatRateLimit(chatClientIp(req.headers), `a:${slug}`);
  if (!rate.allowed) {
    return Response.json(
      { error: 'rate_limited', message: 'Too many messages right now — give it a few minutes.' },
      { status: 429 },
    );
  }

  const verdict = await gate(req, 'agent', slug);
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  const resolved = resolveModel('gemini');
  if (!resolved) {
    return Response.json(
      { error: 'No model provider is configured.' },
      { status: 503, headers: gateHeaders(verdict) },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  const system = resolved.asRequested
    ? agent.systemPrompt + COMMUNITY_FOOTER
    : `${agent.systemPrompt}${COMMUNITY_FOOTER}\n\n${FALLBACK_DISCLOSURE}`;

  const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: resolved.model,
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse({ headers: gateHeaders(verdict) });
}
