/**
 * DB-first system prompts for the marketplace chat runtime.
 *
 * Prompts are curated in Supabase `agent_prompts` under pack='marketplace'
 * (one active row per agent, versioned via the `version` column) so a prompt
 * fix ships without a redeploy. The locked code prompt in
 * lib/marketplace/agent-prompts.ts stays as the always-available fallback —
 * if the DB is unreachable, the row is missing, or the row is inactive, chat
 * behaves exactly as before this store existed.
 *
 * Rows imported from the kete-era corpus don't carry the shared brand prefix,
 * so composePrompt() guarantees it is present exactly once.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { SHARED_BRAND_PREFIX } from '@/lib/marketplace/agent-prompts';

const PACK = 'marketplace';
const CACHE_TTL_MS = 5 * 60 * 1000;

export type DbPrompt = { text: string; version: number };

const cache = new Map<string, { value: DbPrompt | null; at: number }>();

export async function loadDbPrompt(slug: string): Promise<DbPrompt | null> {
  const hit = cache.get(slug);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  let value: DbPrompt | null = null;
  try {
    const service = getServiceClient();
    // NOTE: no is_active filter. agent_prompts carries a global partial unique
    // index (one active row per lower(agent_name) across ALL packs) that the
    // legacy kete rows already occupy, so marketplace rows are stored with
    // is_active=false and the row's presence in this pack IS the activation.
    // (agent_name, pack) is unique, so this is at most one row.
    const { data, error } = await service
      .from('agent_prompts')
      .select('system_prompt, version')
      .eq('agent_name', slug)
      .eq('pack', PACK)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.system_prompt && data.system_prompt.trim().length > 200) {
      value = { text: data.system_prompt, version: data.version ?? 1 };
    }
  } catch {
    // Fail to the code prompt — never block chat on the prompt store.
    value = null;
  }
  cache.set(slug, { value, at: Date.now() });
  return value;
}

/** Ensure the shared brand prefix is present exactly once. */
export function composePrompt(raw: string): string {
  if (raw.includes('[SHARED BRAND PREFIX]')) {
    return raw.replace('[SHARED BRAND PREFIX]', SHARED_BRAND_PREFIX);
  }
  if (raw.startsWith('# assembl agent')) return raw;
  return `${SHARED_BRAND_PREFIX}\n\n${raw}`;
}

// ── Manual knowledge (pilot-configured) ─────────────────────────────────────
// A second agent_prompts pack, 'knowledge', carries the customer's business
// knowledge for a pilot — profile, FAQs, policies, tone — curated by the
// assembl team (no self-serve upload yet). It rides the same table, the same
// (agent_name, pack) uniqueness and the same is_active=false convention as
// the marketplace pack, so a knowledge fix ships without a redeploy. Absent
// row = no block, chat unchanged.

const KNOWLEDGE_PACK = 'knowledge';

const knowledgeCache = new Map<string, { value: string | null; at: number }>();

export async function loadDbKnowledge(slug: string): Promise<string | null> {
  const hit = knowledgeCache.get(slug);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  let value: string | null = null;
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from('agent_prompts')
      .select('system_prompt')
      .eq('agent_name', slug)
      .eq('pack', KNOWLEDGE_PACK)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data?.system_prompt && data.system_prompt.trim().length > 20) {
      value = data.system_prompt.trim();
    }
  } catch {
    value = null;
  }
  knowledgeCache.set(slug, { value, at: Date.now() });
  return value;
}

/** Wrap pilot knowledge as a system-prompt block with its honesty rule. */
export function knowledgeBlock(raw: string): string {
  return `# Your business knowledge (pilot-configured)\nThe following was provided by the business you are working for. Treat it as your primary source for questions about this business — its services, pricing, policies, hours and tone. If a question about the business is not covered below, say so plainly rather than guessing.\n\n${raw}`;
}
