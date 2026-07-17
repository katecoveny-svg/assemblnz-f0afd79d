/**
 * Community agents — server-side store for the public builder (/a).
 *
 * All access goes through the service client because community_agents is RLS
 * deny-all (see supabase/migrations/20260722099000_public_shared_agents.sql).
 * Public reads are STRICTLY filtered to shared = true rows matched by
 * share_slug — an unshared row can never leak onto a public page.
 *
 * Fail-soft on reads: a missing service key (local dev, build-time OG render)
 * returns null instead of throwing, so pages and share cards degrade to their
 * not-found / generic states.
 *
 * Server-only.
 */
import 'server-only';
import { createHash } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';
import { slugify } from '@/lib/pilot/identity';
import { decodeStatelessSlug, isStatelessSlug } from '@/lib/agents/community-link';
import { buildCommunityDraft } from '@/lib/community/seed';
import type { AgentPack, PatternIdentity, PilotSpec } from '@/lib/pilot/types';

export interface SharedAgent {
  name: string;
  description: string;
  icon: string;
  accent: string;
  identity: PatternIdentity | null;
  systemPrompt: string;
  shareSlug: string;
  spec: PilotSpec | null;
}

/** A shared agent plus how it resolved — DB row or stateless link. */
export interface ResolvedCommunityAgent extends SharedAgent {
  /** True when the agent was rebuilt from a `l~…` link, not a DB row. */
  stateless: boolean;
  /** Community template the agent grew from, when known. */
  templateId: string | null;
}

/**
 * Resolve a /a/[slug] agent from EITHER storage mode:
 *  - `l~…` slugs decode + strictly re-validate + rebuild server-side
 *    (no DB touched — these links outlive any outage, forever);
 *  - anything else reads the shared community_agents row as before.
 * Null for unknown/unshared/tampered slugs in both modes.
 */
export async function resolveCommunityAgent(slug: string): Promise<ResolvedCommunityAgent | null> {
  if (isStatelessSlug(slug)) {
    const seed = decodeStatelessSlug(slug);
    if (!seed) return null;
    const draft = buildCommunityDraft(seed);
    if (!draft.pack?.systemPrompt?.trim()) return null;
    return {
      name: draft.name,
      description: draft.description,
      icon: draft.icon,
      accent: draft.accent,
      identity: draft.spec.identity ?? null,
      systemPrompt: draft.pack.systemPrompt,
      shareSlug: slug,
      spec: draft.spec,
      stateless: true,
      templateId: seed.templateId || null,
    };
  }
  const agent = await getSharedAgent(slug);
  if (!agent) return null;
  return { ...agent, stateless: false, templateId: agent.spec?.templateId ?? null };
}

function rowToShared(row: Record<string, unknown>): SharedAgent {
  const spec = (row.spec as PilotSpec | null) ?? null;
  return {
    name: (row.name as string) ?? '',
    description: (row.description as string) ?? '',
    icon: (row.icon as string) ?? 'spark',
    accent: (row.accent as string) ?? '#3f7373',
    identity: spec?.identity ?? null,
    systemPrompt: (row.system_prompt as string) ?? '',
    shareSlug: (row.share_slug as string) ?? '',
    spec,
  };
}

/** Read one PUBLICLY SHARED community agent by share slug. Null otherwise. */
export async function getSharedAgent(shareSlug: string): Promise<SharedAgent | null> {
  if (!shareSlug || !/^[a-z0-9-]{1,64}$/.test(shareSlug)) return null;
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from('community_agents')
      .select('share_slug, name, description, icon, accent, spec, system_prompt')
      .eq('share_slug', shareSlug)
      .eq('shared', true)
      .maybeSingle();
    if (error || !data) return null;
    return rowToShared(data);
  } catch {
    return null;
  }
}

/**
 * Reserve a unique share slug derived from the name: `slugify(name)`, then
 * -2, -3, … suffixes on collision. Bounded probe — after that, a short
 * random suffix guarantees termination.
 */
export async function reserveShareSlug(name: string): Promise<string> {
  const base = slugify(name) || 'agent';
  const service = getServiceClient();
  for (let i = 1; i <= 30; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const { data } = await service
      .from('community_agents')
      .select('id')
      .eq('share_slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Salted SHA-256 of an IP for abuse tracing (never displayed). */
export function creatorHash(ip: string): string {
  const salt = process.env.VESSEL_IP_HASH_SALT ?? 'assembl-vessel-default-salt';
  return createHash('sha256').update(`community:${salt}:${ip}`).digest('hex');
}

export interface CommunityAgentInput {
  name: string;
  description: string;
  icon: string;
  accent: string;
  spec: PilotSpec;
  pack: AgentPack;
  systemPrompt: string;
  createdByHash: string;
}

/** Insert a community agent (shared immediately) and return its share slug. */
export async function insertCommunityAgent(input: CommunityAgentInput): Promise<string | null> {
  const service = getServiceClient();
  // Two attempts ride out a reserve/insert race on the unique slug index.
  for (let attempt = 0; attempt < 2; attempt++) {
    const shareSlug = await reserveShareSlug(input.name);
    const { error } = await service.from('community_agents').insert({
      share_slug: shareSlug,
      name: input.name,
      description: input.description,
      icon: input.icon,
      accent: input.accent,
      spec: input.spec,
      pack: input.pack,
      system_prompt: input.systemPrompt,
      created_by_hash: input.createdByHash,
      shared: true,
    });
    if (!error) return shareSlug;
    if (error.code !== '23505') return null; // only retry unique violations
  }
  return null;
}

/**
 * Share flow for signed-in Pilot builds: an existing row by the same creator
 * with the same name is reused, so re-clicking "Share a public page" returns
 * the same link instead of minting -2, -3, … copies.
 */
export async function findExistingShare(
  name: string,
  createdByHash: string,
): Promise<string | null> {
  try {
    const service = getServiceClient();
    const { data } = await service
      .from('community_agents')
      .select('share_slug')
      .eq('name', name)
      .eq('created_by_hash', createdByHash)
      .eq('shared', true)
      .limit(1)
      .maybeSingle();
    return (data?.share_slug as string | undefined) ?? null;
  } catch {
    return null;
  }
}
