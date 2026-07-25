/**
 * POST /api/build-agent — the real Claude call driven by the parts on the
 * canvas at /build-an-agent.
 *
 * Body: { config: BuildConfig, question: string }
 *   - config is the visitor's placed-parts configuration (model tier, memory,
 *     tools, knowledge, voice brief, guardrails, name, business).
 *   - question is what the visitor asked their agent.
 *
 * Returns a text/event-stream (Vercel AI SDK data-stream) that the client
 * consumes with fetch + ReadableStream reader. The system prompt is composed
 * from the config, so the answer really reflects what they placed.
 *
 * Rate-limit: 20 questions per IP per hour (in-memory, best-effort).
 * Draft-only by design.
 */

import { NextRequest } from 'next/server';
import type { ModelMessage } from 'ai';
import { streamText } from 'ai';

import { pickRung, resolveModelLadder, FALLBACK_DISCLOSURE } from '@/lib/ai/router';
import { buildSystemPrompt, type BuildConfig } from '@/lib/build-an-agent/config';
import { clientIpFromHeaders } from '@/lib/lead-capture';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_QUESTION_LEN = 900;
const MIN_QUESTION_LEN = 3;

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 20;

/** Rejected requests are not counted — counting them made the window
 *  self-perpetuating and locked people out for as long as they retried. */
function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    HITS.set(ip, recent);
    return true;
  }
  recent.push(now);
  HITS.set(ip, recent);
  return false;
}

function bad(status: number, error: string): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  let body: { config?: Partial<BuildConfig>; question?: string } = {};
  try {
    body = await req.json();
  } catch {
    return bad(400, 'bad request');
  }

  const question = String(body.question ?? '').trim().slice(0, MAX_QUESTION_LEN);
  if (question.length < MIN_QUESTION_LEN) {
    return bad(400, 'Ask your agent a real question.');
  }

  const ip = clientIpFromHeaders(req.headers);
  if (rateLimited(ip)) {
    return bad(429, "You've tried a bunch — take a break or drop your email so Kate can write back.");
  }

  const config: BuildConfig = {
    name: String(body.config?.name ?? '').slice(0, 80),
    business: String(body.config?.business ?? '').slice(0, 900),
    modelTier: (body.config?.modelTier as BuildConfig['modelTier']) ?? 'mid',
    memoryScope: (body.config?.memoryScope as BuildConfig['memoryScope']) ?? 'session',
    tools: Array.isArray(body.config?.tools) ? body.config!.tools.slice(0, 12) : [],
    knowledge: Array.isArray(body.config?.knowledge) ? body.config!.knowledge.slice(0, 12) : [],
    voice: String(body.config?.voice ?? '').slice(0, 500),
    guardrails: Array.isArray(body.config?.guardrails) ? body.config!.guardrails.slice(0, 12) : [],
  };

  const tierModel = MODEL_TIER_TO_ANTHROPIC[config.modelTier] ?? MODEL_TIER_TO_ANTHROPIC.mid;
  const ladder = resolveModelLadder(tierModel, []);
  const rung = pickRung(ladder);

  // Honest offline fallback — the parts still shape a real answer.
  if (!rung) {
    return streamOfflineFallback(config, question);
  }

  const systemBase = buildSystemPrompt(config);
  const system = rung.isPrimary ? systemBase : `${systemBase}\n\n${FALLBACK_DISCLOSURE}`;
  const messages: ModelMessage[] = [{ role: 'user', content: question }];

  const result = streamText({
    model: rung.model,
    system,
    messages,
    maxRetries: 0,
    onError: (event) => {
      console.error('[build-agent] stream error', event);
    },
  });

  return result.toTextStreamResponse();
}

/**
 * When no model rung is available (local dev without keys), still stream a
 * warm, config-shaped answer chunk-by-chunk so the mesh animates correctly.
 */
function streamOfflineFallback(config: BuildConfig, question: string): Response {
  const name = config.name.trim() || 'your assembl agent';
  const toolCount = config.tools.length;
  const guardrailCount = config.guardrails.length;
  const knowledgeCount = config.knowledge.length;
  const memory =
    config.memoryScope === 'none'
      ? "I won't remember this after the answer"
      : config.memoryScope === 'session'
      ? "I'll remember this conversation while we're here"
      : "I'd remember this between your visits if the workspace was live";

  const paragraphs = [
    `Right — you asked: "${question}". The live model is offline in this preview, so this is what I'd draft if I were up. It's still shaped by the parts you placed.`,
    `${name} here. ${memory}. You gave me ${toolCount} tool${toolCount === 1 ? '' : 's'} to reach for, ${knowledgeCount} NZ knowledge source${knowledgeCount === 1 ? '' : 's'} to check, and ${guardrailCount} rule${guardrailCount === 1 ? '' : 's'} I won't cross.`,
    `In your real assembl workspace I'd pull the facts that matter from your Business Genome (services, pricing, hours, the FAQs your customers keep asking) and prepare an answer you can send after a quick look — or say no to.`,
    `Drop your email on the intake above and Kate at assembl will build a live version around the actual paragraph you wrote.`,
  ];

  const text = paragraphs.join('\n\n');
  const encoder = new TextEncoder();
  const chunkSize = 24;

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < text.length; i += chunkSize) {
        controller.enqueue(encoder.encode(text.slice(i, i + chunkSize)));
        await new Promise((r) => setTimeout(r, 22));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
