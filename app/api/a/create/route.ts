/**
 * POST /api/a/create — anonymous-friendly agent creation for the public
 * builder (/a).
 *
 * The browser sends only the visitor's choices (template id, name, one
 * sentence, tone, identity settings). The full draft is built SERVER-SIDE:
 * emptyDraft() + the template seed + the user fields → buildPack — so the
 * spec, pack and system prompt are never trusted from the request body.
 *
 * Abuse posture: IP rate limit (same primitive as agent chat, slug
 * 'a-create'), the shared email-capture gate (kind 'agent', key 'create' —
 * heavy anonymous creation hits capture like heavy chatting does), name and
 * sentence length caps, URLs stripped from names, and created_by_hash =
 * salted SHA-256 of the IP for tracing.
 */
import { gate, gateBlockedResponse, gateHeaders } from '@/lib/gating/server';
import { checkChatRateLimit, chatClientIp } from '@/lib/agents/chat-rate-limit';
import { buildPack } from '@/lib/pilot/pack-builder';
import { emptyDraft, type AgentTone, type PatternIdentity } from '@/lib/pilot/types';
import { slugify, suggestIcon } from '@/lib/pilot/identity';
import { communityTemplateById, DEFAULT_IDENTITY } from '@/lib/community/templates';
import { creatorHash, insertCommunityAgent } from '@/lib/agents/community';

export const maxDuration = 30;

const NAME_MAX = 60;
const SENTENCE_MAX = 300;
const TONES: AgentTone[] = ['warm', 'neutral', 'formal', 'specialist'];

function cleanName(raw: string): string {
  return raw
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, NAME_MAX);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function sanitiseIdentity(raw: unknown, fallback: PatternIdentity): PatternIdentity {
  const r = (raw ?? {}) as Partial<PatternIdentity>;
  return {
    mode: r.mode === 'particles' ? 'particles' : 'vortex',
    foregroundColor:
      typeof r.foregroundColor === 'string' && HEX.test(r.foregroundColor)
        ? r.foregroundColor
        : fallback.foregroundColor,
    accentColor:
      typeof r.accentColor === 'string' && HEX.test(r.accentColor)
        ? r.accentColor
        : fallback.accentColor,
    count: clamp(Number(r.count) || fallback.count, 20, 400),
    turbulence: clamp(Number(r.turbulence) || fallback.turbulence, 0, 100),
    speed: clamp(Number(r.speed) || fallback.speed, 0.2, 3),
    glow: typeof r.glow === 'boolean' ? r.glow : fallback.glow,
  };
}

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

  const name = cleanName(typeof body.name === 'string' ? body.name : '');
  const sentence =
    typeof body.sentence === 'string' ? body.sentence.trim().slice(0, SENTENCE_MAX) : '';
  if (!name) {
    return Response.json(
      { error: 'missing_name', message: 'Give the agent a name.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }
  if (!sentence) {
    return Response.json(
      { error: 'missing_sentence', message: 'Say what it should handle.' },
      { status: 400, headers: gateHeaders(verdict) },
    );
  }

  const template = communityTemplateById(typeof body.template === 'string' ? body.template : '');
  const tone: AgentTone = TONES.includes(body.tone as AgentTone)
    ? (body.tone as AgentTone)
    : (template?.tone ?? 'warm');
  const identity = sanitiseIdentity(body.identity, template?.identity ?? DEFAULT_IDENTITY);

  // Build the full draft server-side.
  const draft = emptyDraft();
  draft.name = name;
  draft.description = sentence;
  draft.slug = slugify(name) || 'agent';
  draft.icon = template?.icon ?? suggestIcon(`${name} ${sentence}`);
  draft.accent = template?.accent ?? identity.foregroundColor;
  draft.spec = {
    ...draft.spec,
    domain: template?.domain ?? 'custom',
    resultType: template?.resultType ?? 'task-list',
    agentType: template?.agentType ?? 'assistant',
    tone,
    identity,
    workflow: {
      ...draft.spec.workflow,
      trigger: template?.workflow.trigger ?? '',
      inputs: template?.workflow.inputs ?? sentence,
      output: template?.workflow.output ?? '',
    },
  };
  draft.pack = buildPack(draft);

  let shareSlug: string | null = null;
  try {
    shareSlug = await insertCommunityAgent({
      name,
      description: sentence,
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
  if (!shareSlug) {
    return Response.json(
      { error: 'create_failed', message: 'Could not save the agent — try again shortly.' },
      { status: 503, headers: gateHeaders(verdict) },
    );
  }

  return Response.json(
    { slug: shareSlug, url: `/a/${shareSlug}` },
    { status: 201, headers: gateHeaders(verdict) },
  );
}
