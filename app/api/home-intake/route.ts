/**
 * POST /api/home-intake — the homepage front-door agent.
 *
 * A visitor picks a business segment on the front page and names their
 * biggest pain point. The segment's real specialist (server-side prompt,
 * lib/home-intake/specialists.ts) prepares a substantive first answer via
 * the fallback-capable model router, so it works even without the primary
 * key. The pain point is captured as an anonymous lead (fail-soft); the
 * optional email arrives later from the "make it yours" step.
 *
 * Draft-only by design: the agent prepares work a named human approves.
 */

import { NextRequest } from 'next/server';
import type { ModelMessage } from 'ai';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { specialistFor } from '@/lib/home-intake/specialists';
import { notifyLead, clientIpFromHeaders } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PAIN_LEN = 400;
const FALLBACK_EMAIL = 'hello@assembl.co.nz';

// Best-effort in-memory limiter — bounds abuse within a single instance.
// Fail-open: serverless spread means this is a courtesy cap, not a wall.
const HITS = new Map<string, number[]>();
const WINDOW_MS = 10 * 60_000;
const MAX_HITS = 14;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_HITS;
}

function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export async function POST(req: NextRequest) {
  let body: { segment?: string; painPoint?: string; email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  const painPoint = String(body.painPoint ?? '').trim().slice(0, MAX_PAIN_LEN);
  if (painPoint.length < 3) return json({ error: 'Tell the agent what eats your time.' }, 400);

  const ip = clientIpFromHeaders(req.headers) ?? 'anon';
  if (rateLimited(ip)) {
    return json({ error: `You've tried a few — email us at ${FALLBACK_EMAIL} to see more.` }, 429);
  }

  const specialist = specialistFor(body.segment);

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.cheap, []);
  const messages: ModelMessage[] = [{ role: 'user', content: painPoint }];

  let answer = '';
  let fellBack = false;
  if (ladder.length > 0) {
    const res = await generateWithFallback({
      ladder,
      system: specialist.systemPrompt,
      messages,
      agentSlug: `home-intake:${body.segment ?? 'service'}`,
      tenant: 'homepage',
    });
    if (res.ok) {
      answer = res.text.trim();
      fellBack = !res.rung.isPrimary;
    }
  }

  // Honest fallback if no model is reachable — never fake a generated answer.
  if (!answer) {
    answer = `Here's how I'd start on that. First I'd gather the evidence this job repeats on — the notes, files and history you already have — then prepare a first draft you can check in minutes rather than build from scratch. Nothing goes out until you approve it.\n\nThat's the shape of it. To see me do it on your real work, ${specialist.agentName} runs inside your assembl workspace.`;
    fellBack = true;
  }

  // Capture the pain point as an anonymous lead — fail-soft, never blocks.
  void notifyLead({
    formName: 'Homepage front-door agent',
    email: body.email ?? null,
    fields: { segment: body.segment ?? 'service', specialist: specialist.agentName, painPoint },
    sourceUrl: req.headers.get('referer'),
    ip,
  });

  return json({
    agentName: specialist.agentName,
    role: specialist.role,
    answer,
    fellBack,
  });
}
