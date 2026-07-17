/**
 * Community-builder seed — the small validated record every /a agent grows
 * from: template id, name, one sentence, tone, identity settings.
 *
 * ONE validation path for both storage modes: the create route validates the
 * browser's fields into a CommunitySeed, and the stateless link decoder
 * (lib/agents/community-link.ts) re-validates decoded payloads through the
 * exact same functions — a decoded value is never trusted beyond what a fresh
 * create request would be. `buildCommunityDraft` then rebuilds the full pack
 * server-side (buildPack is pure/deterministic), so DB rows and stateless
 * links produce identical agents from identical seeds.
 *
 * Pure and client-safe: no server-only imports, no zlib — the encoder lives
 * in lib/agents/community-link.ts.
 */
import { buildPack } from '@/lib/pilot/pack-builder';
import { slugify, suggestIcon } from '@/lib/pilot/identity';
import {
  emptyDraft,
  type AgentPack,
  type AgentTone,
  type PatternIdentity,
  type PilotDraft,
} from '@/lib/pilot/types';
import { communityTemplateById, DEFAULT_IDENTITY } from '@/lib/community/templates';

export const SEED_NAME_MAX = 60;
export const SEED_SENTENCE_MAX = 300;
export const SEED_TONES: AgentTone[] = ['warm', 'neutral', 'formal', 'specialist'];

export interface CommunitySeed {
  /** '' = start blank; otherwise a COMMUNITY_TEMPLATES id. */
  templateId: string;
  name: string;
  sentence: string;
  tone: AgentTone;
  identity: PatternIdentity;
}

/** Strip URLs, collapse whitespace, cap the length. Same rule as create. */
export function cleanSeedName(raw: string): string {
  return raw
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, SEED_NAME_MAX);
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Clamp every identity field to the builder's ranges; fall back per-field. */
export function sanitiseSeedIdentity(raw: unknown, fallback: PatternIdentity): PatternIdentity {
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

/**
 * Validate untrusted fields into a CommunitySeed. STRICT on the whitelisted
 * fields: an unknown template id or tone rejects the whole seed (null) rather
 * than being coerced — a tampered stateless link must fail closed. Name and
 * sentence must be non-empty after cleaning.
 */
export function validateCommunitySeed(raw: {
  templateId?: unknown;
  name?: unknown;
  sentence?: unknown;
  tone?: unknown;
  identity?: unknown;
}): CommunitySeed | null {
  const templateId = typeof raw.templateId === 'string' ? raw.templateId : '';
  const template = templateId ? communityTemplateById(templateId) : null;
  if (templateId && !template) return null;

  const name = cleanSeedName(typeof raw.name === 'string' ? raw.name : '');
  if (!name) return null;

  const sentence =
    typeof raw.sentence === 'string' ? raw.sentence.trim().slice(0, SEED_SENTENCE_MAX) : '';
  if (!sentence) return null;

  if (typeof raw.tone !== 'string' || !SEED_TONES.includes(raw.tone as AgentTone)) return null;

  return {
    templateId,
    name,
    sentence,
    tone: raw.tone as AgentTone,
    identity: sanitiseSeedIdentity(raw.identity, template?.identity ?? DEFAULT_IDENTITY),
  };
}

/**
 * Rebuild the full draft (spec + 19-item pack + system prompt) from a
 * validated seed — the single server-side authority for what a community
 * agent IS, shared by the create route and the stateless resolvers.
 */
export function buildCommunityDraft(seed: CommunitySeed): PilotDraft & { pack: AgentPack } {
  const template = communityTemplateById(seed.templateId);

  const draft = emptyDraft();
  draft.name = seed.name;
  draft.description = seed.sentence;
  draft.slug = slugify(seed.name) || 'agent';
  draft.icon = template?.icon ?? suggestIcon(`${seed.name} ${seed.sentence}`);
  draft.accent = template?.accent ?? seed.identity.foregroundColor;
  draft.spec = {
    ...draft.spec,
    domain: template?.domain ?? 'custom',
    resultType: template?.resultType ?? 'task-list',
    agentType: template?.agentType ?? 'assistant',
    tone: seed.tone,
    identity: seed.identity,
    ...(seed.templateId ? { templateId: seed.templateId } : {}),
    workflow: {
      ...draft.spec.workflow,
      trigger: template?.workflow.trigger ?? '',
      inputs: template?.workflow.inputs ?? seed.sentence,
      output: template?.workflow.output ?? '',
    },
  };
  const pack = buildPack(draft);
  if (template?.promptAddendum) {
    pack.systemPrompt = `${pack.systemPrompt}\n\n${template.promptAddendum}`;
  }
  return { ...draft, pack };
}
