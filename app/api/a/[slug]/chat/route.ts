/**
 * POST /api/a/[slug]/chat — metered public chat with a shared community agent.
 *
 * The system prompt is resolved SERVER-SIDE — from the community_agents row
 * for DB slugs, or rebuilt from the strictly re-validated seed for stateless
 * `l~…` links (lib/agents/community.ts resolveCommunityAgent) — the browser
 * only ever sends the visitor's messages. Order of checks, all BEFORE the
 * stream opens:
 *
 *   1. resolve the agent (404 for unknown / unshared / tampered slugs);
 *   2. IP flood control (stateless slugs are keyed by a short hash so the
 *      counter columns stay small);
 *   3. the shared email-capture gate (kind 'agent': anon 5/day, email 20/day)
 *      — blocked visitors get the 402 whose body drives the capture modal.
 *
 * Photos: incoming image parts are validated server-side (data:image/ only,
 * ≤ 8MB, max 2 per message) and stripped from all but the last four messages
 * before conversion — token control on long threads.
 *
 * Mariner agents get live MetService conditions: when the latest message asks
 * about weather/tides/trips, the matching region's forecast (15-min cached,
 * fail-soft) is injected as labelled system context.
 *
 * Model resolves cheap-first (Gemini preference, fail-open to any configured
 * provider — all vision-capable). Replies carry the community draft-only
 * footer: built by a visitor, drafts only, never sends anything.
 */
import { createHash } from 'node:crypto';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';
import { resolveCommunityAgent } from '@/lib/agents/community';
import { checkChatRateLimit, chatClientIp } from '@/lib/agents/chat-rate-limit';
import { gate, gateBlockedResponse, gateHeaders } from '@/lib/gating/server';
import { resolveModel } from '@/lib/pilot/models';
import { FALLBACK_DISCLOSURE } from '@/lib/ai/router';
import { DEFAULT_MARINE_REGION, getMarineForecast, resolveMarineRegion } from '@/lib/marine/weather';

export const maxDuration = 60;

const COMMUNITY_FOOTER =
  '\n\nYou are a community agent on a public assembl page, built by a visitor with the agent builder. Everything you produce is a draft for the reader to check before it goes anywhere — you never send, post, or run anything yourself, and you say so plainly if asked.';

// Same cap as the fridge-to-list tool: 8MB of image, base64-inflated.
const MAX_IMAGE_DATA_CHARS = 8 * 1024 * 1024 * 1.38;
const MAX_IMAGES_PER_MESSAGE = 2;
// Only the most recent messages keep their images through conversion.
const IMAGE_MESSAGE_WINDOW = 4;

const WEATHER_INTENT =
  /\b(weather|conditions?|forecast|tides?|swell|winds?|trip|fishing spots?|sea state|heading out|launch)\b/i;

function textOf(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ');
}

function latestQuestion(messages: UIMessage[]): string {
  const latest = [...messages].reverse().find((message) => message.role === 'user');
  return latest ? textOf(latest).trim() : '';
}

function previewResponse(
  name: string,
  description: string,
  question: string,
  headers: HeadersInit,
): Response {
  const task = question || 'the question you selected';
  const answer = [
    `I’m ${name}. I’m set up to ${description.replace(/[.!]+$/, '').toLowerCase()}.`,
    `For “${task.slice(0, 240)}”, I’d begin by separating the facts you already trust from the details that still need checking. Then I’d prepare the smallest useful draft: the answer, next step, and any decision that must stay with a person.`,
    'This preview does not have a live model provider connected, so I have not searched a source or taken an action. In a live workspace I would use the approved Business Genome and show the evidence beside the draft.',
    'Draft only — nothing has been sent, posted or changed.',
  ].join('\n\n');
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const id = `preview-${Date.now()}`;
      writer.write({ type: 'start' });
      writer.write({ type: 'text-start', id });
      writer.write({ type: 'text-delta', id, delta: answer });
      writer.write({ type: 'text-end', id });
      writer.write({ type: 'finish', finishReason: 'stop' });
    },
  });
  return createUIMessageStreamResponse({ stream, headers });
}

/** Short stable key for long stateless slugs (rate-limit + gate counters). */
function meterKey(slug: string, stateless: boolean): string {
  if (!stateless) return slug;
  return `l-${createHash('sha256').update(slug).digest('hex').slice(0, 16)}`;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  const agent = await resolveCommunityAgent(slug);
  if (!agent || !agent.systemPrompt.trim()) {
    return Response.json({ error: 'Unknown agent.' }, { status: 404 });
  }

  const key = meterKey(slug, agent.stateless);
  const rate = await checkChatRateLimit(chatClientIp(req.headers), `a:${key}`);
  if (!rate.allowed) {
    return Response.json(
      { error: 'rate_limited', message: 'Too many messages right now — give it a few minutes.' },
      { status: 429 },
    );
  }

  const verdict = await gate(req, 'agent', key);
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: 'Invalid request body.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];

  const resolved = resolveModel('gemini');
  if (!resolved) {
    return previewResponse(
      agent.name,
      agent.description || 'help with the job you described',
      latestQuestion(messages),
      gateHeaders(verdict),
    );
  }

  // Validate every incoming image part before anything reaches the model.
  for (const message of messages) {
    if (!Array.isArray(message.parts)) {
      return Response.json(
        { error: 'Invalid request body.' },
        { status: 400, headers: gateHeaders(verdict) },
      );
    }
    const files = message.parts.filter((p) => p.type === 'file');
    if (files.length > MAX_IMAGES_PER_MESSAGE) {
      return Response.json(
        { error: 'A message can carry up to 2 photos.' },
        { status: 400, headers: gateHeaders(verdict) },
      );
    }
    for (const file of files) {
      const mediaType = typeof file.mediaType === 'string' ? file.mediaType : '';
      const url = typeof file.url === 'string' ? file.url : '';
      if (!mediaType.startsWith('image/') || !url.startsWith('data:image/')) {
        return Response.json(
          { error: 'Only photos can be attached here.' },
          { status: 400, headers: gateHeaders(verdict) },
        );
      }
      if (url.length > MAX_IMAGE_DATA_CHARS) {
        return Response.json(
          // approved line, shared with the fridge-to-list tool
          { error: 'Please upload an image under 8MB.' },
          { status: 413, headers: gateHeaders(verdict) },
        );
      }
    }
  }

  // Token control: only the last few messages keep their images.
  const trimmed = messages.map((message, index) =>
    index < messages.length - IMAGE_MESSAGE_WINDOW
      ? { ...message, parts: message.parts.filter((p) => p.type !== 'file') }
      : message,
  );

  let system = resolved.asRequested
    ? agent.systemPrompt + COMMUNITY_FOOTER
    : `${agent.systemPrompt}${COMMUNITY_FOOTER}\n\n${FALLBACK_DISCLOSURE}`;

  // Mariner agents: inject live MetService conditions when the latest message
  // asks about them. Fail-soft — on any fetch failure nothing is added and
  // the prompt already tells the model to point users at the forecast.
  if (agent.templateId === 'mariner') {
    const lastUser = [...trimmed].reverse().find((m) => m.role === 'user');
    const lastText = lastUser ? textOf(lastUser) : '';
    if (lastText && WEATHER_INTENT.test(lastText)) {
      const region = resolveMarineRegion(lastText) ?? DEFAULT_MARINE_REGION;
      const forecast = await getMarineForecast(region);
      if (forecast) {
        const fetchedAt = forecast.fetchedAt.toLocaleString('en-NZ', {
          timeZone: 'Pacific/Auckland',
        });
        system += `\n\nLive MetService marine forecast — ${forecast.regionName}, fetched ${fetchedAt} NZ time. Treat this as the current picture, tell the user where and when it is from, and still point them at the official MetService forecast before they leave shore:\n${forecast.text}`;
      }
    }
  }

  const modelMessages = await convertToModelMessages(trimmed);

  const result = streamText({
    model: resolved.model,
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse({ headers: gateHeaders(verdict) });
}
