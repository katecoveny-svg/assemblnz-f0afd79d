/**
 * POST /api/a/create — anonymous-friendly agent creation for the public
 * builder (/a).
 *
 * The browser sends only the visitor's choices (template id, name, one
 * sentence, tone, identity settings). The full draft is built SERVER-SIDE
 * via the shared seed module (lib/community/seed.ts) — the spec, pack and
 * system prompt are never trusted from the request body.
 *
 * Hand-over order (viral builder v1.1):
 *   1. flood control, 2. capture gate, 3. validation, 4. pack build,
 *   5. capture-before-hand-over: an anonymous visitor (no assembl_captured
 *      cookie) gets a 402 {error:'capture_required', capture:true} INSTEAD of
 *      the share URL — the composer opens the capture modal and retries once
 *      the email lifts the tier,
 *   6. DB insert; if the DB is down/paused, fall back to a STATELESS `l~…`
 *      link that encodes the validated seed in the slug itself
 *      (lib/agents/community-link.ts) — the agent works with no database.
 *
 * Abuse posture unchanged: IP rate limit (slug 'a-create'), the shared
 * email-capture gate (kind 'agent', key 'create'), name/sentence caps, URLs
 * stripped from names, created_by_hash = salted SHA-256 of the IP.
 */
import { gate, gateBlockedResponse, gateHeaders } from '@/lib/gating/server';
import { checkChatRateLimit, chatClientIp } from '@/lib/agents/chat-rate-limit';
import {
  SEED_TONES,
  buildCommunityDraft,
  cleanSeedName,
  validateCommunitySeed,
} from '@/lib/community/seed';
import { communityTemplateById } from '@/lib/community/templates';
import type { AgentTone } from '@/lib/pilot/types';
import { encodeStatelessSlug } from '@/lib/agents/community-link';
import { creatorHash, insertCommunityAgent } from '@/lib/agents/community';

export const maxDuration = 30;

export async function POST(req: Request) {
  // Flood control first (cheap), then the daily capture gate (consumes one).
  const rate = await checkChatRateLimit(chatClientIp(req.headers), 'a-create');
  if (!rate.allowed) {
    return Response.json(
      { error: 'rate_limited', message: 'Too many new agents right now — give it a few minutes.' },
      { status: 429 },
    );
  }

  const verdict = await gate(req, 'agent', 'create');
  if (!verdict.allowed) return gateBlockedResponse(verdict);

  let body: {
    template?: string;
    name?: string;
    sentence?: string;
    tone?: string;
    identity?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Field-level errors first (same messages as before), then the strict seed.
  if (!cleanSeedName(typeof body.name === 'string' ? body.name : '')) {
    return Response.json(
      { error: 'missing_name', message: 'Give the agent a name.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }
  if (!(typeof body.sentence === 'string' && body.sentence.trim())) {
    return Response.json(
      { error: 'missing_sentence', message: 'Say what it should handle.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  // Normalise the whitelisted fields the way the UI does — an unknown template
  // id means "start blank", an unknown tone falls back to the template's (or
  // warm) — then run the strict shared validation.
  const rawTemplateId = typeof body.template === 'string' ? body.template : '';
  const template = communityTemplateById(rawTemplateId);
  const tone: AgentTone = SEED_TONES.includes(body.tone as AgentTone)
    ? (body.tone as AgentTone)
    : (template?.tone ?? 'warm');
  const seed = validateCommunitySeed({
    templateId: template ? rawTemplateId : '',
    name: body.name,
    sentence: body.sentence,
    tone,
    identity: body.identity,
  });
  if (!seed) {
    return Response.json(
      { error: 'invalid_input', message: 'Could not create the agent — try again.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  // Build the full draft server-side (pack + system prompt + template addendum).
  const draft = buildCommunityDraft(seed);

  // Capture before hand-over: the agent is built, but an anonymous visitor
  // leaves an email before receiving the share link. The composer's capture
  // modal handles the 402 and retries automatically once the tier lifts.
  if (verdict.tier === 'anon') {
    return Response.json(
      { error: 'capture_required', capture: true },
      { status: 402, headers: { ...gateHeaders(verdict), 'Cache-Control': 'no-store' } },
    );
  }

  let shareSlug: string | null = null;
  try {
    shareSlug = await insertCommunityAgent({
      name: draft.name,
      description: draft.description,
      icon: draft.icon,
      accent: draft.accent,
      spec: draft.spec,
      pack: draft.pack,
      systemPrompt: draft.pack.systemPrompt,
      createdByHash: creatorHash(chatClientIp(req.headers)),
    });
  } catch {
    shareSlug = null;
  }

  if (shareSlug) {
    return Response.json(
      { slug: shareSlug, url: `/a/${shareSlug}` },
      { status: 201, headers: gateHeaders(verdict) },
    );
  }

  // DB down or paused — hand over a stateless link instead. The whole agent
  // rebuilds from the slug on every visit, so this link works forever.
  try {
    const statelessSlug = encodeStatelessSlug(seed);
    return Response.json(
      { slug: statelessSlug, url: `/a/${statelessSlug}`, stateless: true },
      { status: 201, headers: gateHeaders(verdict) },
    );
  } catch {
    return Response.json(
      { error: 'create_failed', message: 'Could not save the agent — try again shortly.' },
      { status: 503, headers: gateHeaders(verdict) },
    );
  }
}
