/**
 * Agent entitlement + free-tier counter (server-only).
 *
 * Free tier: the first FREE_MESSAGE_LIMIT messages per agent are free, counted
 * in agent_chat_sessions against either a signed-in user (user_id) or an
 * anonymous device cookie (anon_id). After that the paywall offers the flat
 * ladder (lib/billing/agent-pricing.ts).
 *
 * Paid entitlement: a row in agent_installs with a paid plan grants unlimited
 * use. An all-access install (agent_slug = '*') grants every agent.
 *
 * Everything here uses the service-role client and is import-guarded to
 * server-only — never bundle this to the browser.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { ALL_ACCESS_SLUG, FREE_MESSAGE_LIMIT } from './agent-pricing';

/**
 * Plans on an agent_installs row that grant unlimited (paid) access. The locked
 * ladder uses everyday/specialist/all_access; the flat per_agent + bundle ids
 * are kept so grandfathered subscriptions stay entitled.
 */
const PAID_INSTALL_PLANS = [
  'paid', // legacy
  'everyday',
  'specialist',
  'all_access',
  // legacy (grandfathered) — flat per-agent + bundle ladder
  'per_agent',
  'bundle_5',
  'bundle_10',
  'bundle_20',
];

/** Who we are counting / entitling. Exactly one field is set. */
export type ChatIdentity = { userId: string; anonId?: null } | { userId?: null; anonId: string };

export type EntitlementStatus = {
  /** Paid (unlimited) access to this agent. */
  entitled: boolean;
  /** Free messages already used (only meaningful when not entitled). */
  freeUsed: number;
  /** The free allowance. */
  freeLimit: number;
  /** Free messages still available before the paywall. */
  remaining: number;
};

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42P01') return true;
  const m = (error.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the table');
}

/**
 * Does this signed-in user have a paid install covering this agent? Anonymous
 * visitors are never entitled (they only ever get the free messages). Fails
 * open to `false` on infra errors so we fall back to the free counter rather
 * than handing out unlimited access.
 */
export async function isAgentEntitled(userId: string | null | undefined, agentSlug: string): Promise<boolean> {
  if (!userId) return false;
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('agent_installs')
      .select('agent_slug, plan')
      .eq('user_id', userId)
      .in('plan', PAID_INSTALL_PLANS)
      .in('agent_slug', [agentSlug, ALL_ACCESS_SLUG])
      .limit(1);
    if (error) {
      if (!isMissingTable(error)) console.error(`isAgentEntitled: ${error.message}`);
      return false;
    }
    return (data?.length ?? 0) > 0;
  } catch (err) {
    console.error('isAgentEntitled:', err instanceof Error ? err.message : err);
    return false;
  }
}

function identityFilter(identity: ChatIdentity): { column: 'user_id' | 'anon_id'; value: string } {
  return identity.userId
    ? { column: 'user_id', value: identity.userId }
    : { column: 'anon_id', value: identity.anonId as string };
}

/** Read how many free messages this identity has used against an agent. */
async function readFreeUsed(identity: ChatIdentity, agentSlug: string): Promise<number> {
  const supabase = getServiceClient();
  const { column, value } = identityFilter(identity);
  const { data, error } = await supabase
    .from('agent_chat_sessions')
    .select('free_message_count')
    .eq('agent_slug', agentSlug)
    .eq(column, value)
    .maybeSingle();
  if (error) {
    if (!isMissingTable(error)) console.error(`readFreeUsed: ${error.message}`);
    return 0;
  }
  return Number(data?.free_message_count ?? 0);
}

/** Entitlement + free-usage snapshot for an agent (used by the GET endpoint + UI). */
export async function getEntitlementStatus(
  identity: ChatIdentity,
  agentSlug: string,
  opts?: { freeForever?: boolean },
): Promise<EntitlementStatus> {
  // Free-forever agents (priceNzd 0 — the everyday utility agents) are never
  // message-capped, so they never hit the paywall. The pricing page promises
  // they are "free forever"; capping them showed a nonsensical "Subscribe · Free".
  if (opts?.freeForever) {
    return { entitled: true, freeUsed: 0, freeLimit: FREE_MESSAGE_LIMIT, remaining: FREE_MESSAGE_LIMIT };
  }
  const entitled = await isAgentEntitled(identity.userId ?? null, agentSlug);
  if (entitled) {
    return { entitled: true, freeUsed: 0, freeLimit: FREE_MESSAGE_LIMIT, remaining: FREE_MESSAGE_LIMIT };
  }
  const freeUsed = await readFreeUsed(identity, agentSlug).catch(() => 0);
  return {
    entitled: false,
    freeUsed,
    freeLimit: FREE_MESSAGE_LIMIT,
    remaining: Math.max(0, FREE_MESSAGE_LIMIT - freeUsed),
  };
}

/**
 * Record one free message against an agent and return the new count. Lazily
 * creates the counter row. Best-effort: on infra error it returns the pre-bump
 * count rather than throwing, so a counter hiccup never breaks a chat reply.
 */
export async function incrementFreeUsage(identity: ChatIdentity, agentSlug: string): Promise<number> {
  try {
    const supabase = getServiceClient();
    const { column, value } = identityFilter(identity);

    const { data: existing } = await supabase
      .from('agent_chat_sessions')
      .select('id, free_message_count')
      .eq('agent_slug', agentSlug)
      .eq(column, value)
      .maybeSingle();

    if (existing?.id) {
      const next = Number(existing.free_message_count ?? 0) + 1;
      await supabase
        .from('agent_chat_sessions')
        .update({ free_message_count: next, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      return next;
    }

    const row: Record<string, unknown> = { agent_slug: agentSlug, free_message_count: 1 };
    if (identity.userId) row.user_id = identity.userId;
    else row.anon_id = identity.anonId;
    const { error } = await supabase.from('agent_chat_sessions').insert(row);
    if (error && !isMissingTable(error)) console.error(`incrementFreeUsage insert: ${error.message}`);
    return 1;
  } catch (err) {
    console.error('incrementFreeUsage:', err instanceof Error ? err.message : err);
    return 0;
  }
}
