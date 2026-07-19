/**
 * POST /api/home-intake — the homepage front-door agent.
 *
 * The visitor describes their REAL business in their own words (no pre-picked
 * segment). The general analyst (server-side prompt) reads it and prepares a
 * genuinely useful first answer via the fallback-capable model router, so it
 * works even without the primary key and never fakes a generated answer.
 *
 * Every genuine submission is emailed straight to assembl@assembl.co.nz as a
 * lead (fail-soft), enriched with the visitor's email when they leave one.
 *
 * Draft-only by design: the agent prepares work a named human approves.
 */

import { NextRequest } from 'next/server';
import type { ModelMessage } from 'ai';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { GENERAL_ANALYST, GENERAL_ANALYST_PROMPT } from '@/lib/home-intake/specialists';
import { notifyLead, persistLead, clientIpFromHeaders, type NotifyLeadInput } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BUSINESS_LEN = 900;
const MIN_BUSINESS_LEN = 12;
const FALLBACK_EMAIL = 'hello@assembl.co.nz';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

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

/**
 * Capture a lead so Kate never loses one:
 *  - persistLead is AWAITED → a durable row in lead_inquiries, visible at
 *    /admin/support, regardless of email deliverability.
 *  - notifyLead is best-effort (not awaited) → emails assembl@assembl.co.nz
 *    without blocking the response on Brevo's retry backoff.
 * Both legs are fail-soft and never throw.
 */
async function captureLead(input: NotifyLeadInput) {
  try {
    await persistLead(input);
  } catch {
    /* fail-soft — persistLead already logs */
  }
  void notifyLead(input);
}

export async function POST(req: NextRequest) {
  let body: {
    business?: string;
    email?: string;
    agentName?: string;
    /** Set by the client when it re-posts to attach a lead's email — no new answer needed. */
    leadOnly?: boolean;
    answer?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad request' }, 400);
  }

  const business = String(body.business ?? '').trim().slice(0, MAX_BUSINESS_LEN);
  if (business.length < MIN_BUSINESS_LEN) {
    return json({ error: 'Tell the agent a little about your business.' }, 400);
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'anon';
  const email = String(body.email ?? '').trim();
  const validEmail = EMAIL_RE.test(email);

  // A lead-only re-post (visitor left their email on an answer they already
  // have) — capture the enriched lead and return, no model call.
  if (body.leadOnly) {
    if (validEmail) {
      await captureLead({
        formName: 'Homepage agent — lead left contact',
        email,
        fields: {
          business,
          namedAgent: String(body.agentName ?? '').trim() || undefined,
          answer: String(body.answer ?? '').slice(0, 1500) || undefined,
        },
        sourceUrl: req.headers.get('referer'),
        ip,
      });
    }
    return json({ ok: true });
  }

  if (rateLimited(ip)) {
    return json({ error: `You've tried a few — email us at ${FALLBACK_EMAIL} to see more.` }, 429);
  }

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.cheap, []);
  const messages: ModelMessage[] = [{ role: 'user', content: `My business:\n${business}` }];

  let answer = '';
  let fellBack = false;
  if (ladder.length > 0) {
    const res = await generateWithFallback({
      ladder,
      system: GENERAL_ANALYST_PROMPT,
      messages,
      agentSlug: 'home-intake',
      tenant: 'homepage',
    });
    if (res.ok) {
      answer = res.text.trim();
      fellBack = !res.rung.isPrimary;
    }
  }

  // Honest fallback if no model is reachable — never fake a generated answer.
  // Warm, first-person, still centred on the Business Genome idea so the shape
  // of the answer matches what the live model would return.
  if (!answer) {
    answer = `Thanks for that — I read it properly. The live model's offline for a beat, but here's the shape of what I'd draft for you.\n\nYour Business Genome is the one place you'd hold every fact about the way you work — the services, the pricing, the questions your customers always ask, the rules that never change. Every surface reads it: the website, the CRM, the drafts your team sends, the answers on the phone. Change a fact once — everything updates.\n\nMonday morning I'd already have the week's small awkward jobs teed up as drafts for you to say yes to. Nothing sends until you approve it. That's how assembl feels different from software you have to remember to open.\n\nDrop your email below and Kate will write back with a plan built around the actual paragraph you just wrote — not a template.`;
    fellBack = true;
  }

  // Every genuine submission is a lead — capture it (durable row + email).
  await captureLead({
    formName: 'Homepage agent — new business',
    email: validEmail ? email : null,
    fields: {
      business,
      answerPreview: answer.slice(0, 900),
    },
    sourceUrl: req.headers.get('referer'),
    ip,
  });

  return json({
    agentName: GENERAL_ANALYST.agentName,
    role: GENERAL_ANALYST.role,
    answer,
    fellBack,
  });
}
