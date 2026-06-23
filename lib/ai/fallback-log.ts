/**
 * Best-effort fallback telemetry. Writes to model_fallback_events /
 * skill_fallback_events via the service-role client.
 *
 * FAIL-OPEN by contract: telemetry must NEVER break a user request. Every path
 * swallows its own errors. If Supabase env is unset (e.g. local dev), these are
 * silent no-ops.
 *
 * Server-only.
 */
import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabase/service';

// The runtime knows agents by slug; the events tables key by agents.id (uuid).
// Resolve + cache slug → id; null on miss (the FK column is nullable).
const slugIdCache = new Map<string, string | null>();

async function agentIdForSlug(
  client: SupabaseClient,
  slug: string | null | undefined,
): Promise<string | null> {
  if (!slug) return null;
  const cached = slugIdCache.get(slug);
  if (cached !== undefined) return cached;
  try {
    const { data } = await client.from('agents').select('id').eq('slug', slug).maybeSingle();
    const id = (data?.id as string | undefined) ?? null;
    slugIdCache.set(slug, id);
    return id;
  } catch {
    return null;
  }
}

function clientOrNull(): SupabaseClient | null {
  try {
    return getServiceClient();
  } catch {
    return null;
  }
}

export type ModelFallbackEvent = {
  agentSlug?: string | null;
  userId?: string | null;
  primaryModel?: string | null;
  fallbackModel?: string | null;
  reason?: string | null;
};

export async function recordModelFallback(event: ModelFallbackEvent): Promise<void> {
  const client = clientOrNull();
  if (!client) return;
  try {
    const agentId = await agentIdForSlug(client, event.agentSlug);
    await client.from('model_fallback_events').insert({
      user_id: event.userId ?? null,
      agent_id: agentId,
      primary_model: event.primaryModel ?? null,
      fallback_model: event.fallbackModel ?? null,
      reason: event.reason?.slice(0, 2000) ?? null,
    });
  } catch {
    /* fail-open */
  }
}

export type SkillFallbackEvent = {
  agentSlug?: string | null;
  userId?: string | null;
  primarySkill?: string | null;
  fallbackSkill?: string | null;
  reason?: string | null;
};

export async function recordSkillFallback(event: SkillFallbackEvent): Promise<void> {
  const client = clientOrNull();
  if (!client) return;
  try {
    const agentId = await agentIdForSlug(client, event.agentSlug);
    await client.from('skill_fallback_events').insert({
      user_id: event.userId ?? null,
      agent_id: agentId,
      primary_skill: event.primarySkill ?? null,
      fallback_skill: event.fallbackSkill ?? null,
      reason: event.reason?.slice(0, 2000) ?? null,
    });
  } catch {
    /* fail-open */
  }
}
