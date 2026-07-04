'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';
import { isMarketplaceAgent } from '@/lib/marketplace/agents';

/**
 * Agents CRUD server actions — every write happens with the service role ONLY
 * after ensureAdmin() has proven authorisation. RLS stays intact on the tables.
 *
 * Prompt caveat (reference_agent_prompts_live_in_code): the runtime reads
 * system prompts from code (lib/marketplace/agent-prompts.ts). Admin edits are
 * STAGED in agent_prompt_overrides — a reviewed draft for the next code sync —
 * and the UI labels them exactly that. Nothing at runtime reads the override
 * today; that is deliberate and documented in migration 20260703100000.
 */

// Matches the DB check (20260623140050): live | draft | retired | coming_soon.
// NB: the previous version of this action wrote 'archived', which silently
// violated the check constraint — fixed to 'retired'.
const STATUSES = ['live', 'draft', 'retired', 'coming_soon'] as const;
type AgentDbStatus = (typeof STATUSES)[number];

const MODEL_TIERS = ['cheap', 'mid', 'premium'] as const;
const BUNDLES = ['assembler', 'forge', 'ensemble', 'practice', 'hearth', 'counsel', 'visa'] as const;

/** Set an agent's catalogue status in the `agents` mirror table. */
export async function setAgentStatus(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  const next = String(formData.get('status') ?? '');
  if (!isMarketplaceAgent(slug) || !STATUSES.includes(next as AgentDbStatus)) return;

  try {
    const sb = getServiceClient();
    await sb.from('agents').update({ status: next, updated_at: new Date().toISOString() }).eq('slug', slug);
  } catch {
    // Mirror table may not exist in this environment — fail soft.
  }

  revalidatePath('/admin/agents');
  revalidatePath(`/admin/agents/${slug}`);
}

/**
 * Update an agent's catalogue metadata in the DB mirror: display name,
 * description, model tier, bundle assignment and lead flag. The code registry
 * remains the marketplace's render source; this keeps the analytics/join mirror
 * (and the bundle taxonomy columns from 20260701093000) current.
 */
export async function updateAgentMeta(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  if (!isMarketplaceAgent(slug)) return;

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const modelTier = String(formData.get('model_tier') ?? '');
  const bundleRaw = String(formData.get('bundle') ?? '');
  const isLead = formData.get('is_bundle_lead') === 'on';

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  patch.description = description || null;
  if (MODEL_TIERS.includes(modelTier as (typeof MODEL_TIERS)[number])) patch.model_tier = modelTier;
  patch.bundle = BUNDLES.includes(bundleRaw as (typeof BUNDLES)[number]) ? bundleRaw : null;
  patch.is_bundle_lead = isLead;

  try {
    const sb = getServiceClient();
    await sb.from('agents').update(patch).eq('slug', slug);
  } catch {
    // Fail soft in half-migrated environments.
  }

  revalidatePath('/admin/agents');
  revalidatePath(`/admin/agents/${slug}`);
  revalidatePath('/admin/bundles');
}

/**
 * Stage a system-prompt edit. Code stays canonical — this writes a draft to
 * agent_prompt_overrides (status 'staged') for the next code sync, and the UI
 * says exactly that next to the form.
 */
export async function stagePromptOverride(formData: FormData) {
  const admin = await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  const prompt = String(formData.get('system_prompt') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!isMarketplaceAgent(slug) || prompt.trim().length === 0) return;

  try {
    const sb = getServiceClient();
    await sb.from('agent_prompt_overrides').upsert(
      {
        agent_slug: slug,
        system_prompt: prompt,
        note: note || null,
        status: 'staged',
        updated_by: admin.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'agent_slug' },
    );
  } catch {
    // Table lands with migration 20260703100000 — fail soft before it runs.
  }

  revalidatePath(`/admin/agents/${slug}`);
}

/** Discard a staged prompt edit (keeps the row for the audit trail). */
export async function discardPromptOverride(formData: FormData) {
  const admin = await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  if (!isMarketplaceAgent(slug)) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('agent_prompt_overrides')
      .update({ status: 'discarded', updated_by: admin.email, updated_at: new Date().toISOString() })
      .eq('agent_slug', slug);
  } catch {
    // Fail soft.
  }

  revalidatePath(`/admin/agents/${slug}`);
}

/**
 * Link/unlink an agent from a knowledge source by toggling the agent's slug in
 * knowledge_sources.dependent_agents (the array the Tier A diff-and-alert loop
 * uses to flag agents for a scenario-pack refresh — see 20260701090000).
 */
export async function toggleKnowledgeLink(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  const sourceSlug = String(formData.get('source_slug') ?? '');
  const link = String(formData.get('link') ?? '') === '1';
  if (!isMarketplaceAgent(slug) || !sourceSlug) return;

  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from('knowledge_sources')
      .select('dependent_agents')
      .eq('source_slug', sourceSlug)
      .maybeSingle();
    if (!data) return;

    const current: string[] = Array.isArray(data.dependent_agents) ? data.dependent_agents : [];
    const next = link
      ? Array.from(new Set([...current, slug]))
      : current.filter((s) => s !== slug);

    await sb
      .from('knowledge_sources')
      .update({ dependent_agents: next, updated_at: new Date().toISOString() })
      .eq('source_slug', sourceSlug);
  } catch {
    // Fail soft.
  }

  revalidatePath(`/admin/agents/${slug}`);
  revalidatePath('/admin/knowledge');
}

/**
 * Manual "sync now" for a Tier A knowledge source — invokes the deployed
 * knowledge-ingest-tier-a edge function with the single-source override
 * ({ source_slug }). The function fetches, diffs, re-embeds on change and
 * stamps last_fetched_at; we just kick it and revalidate.
 */
export async function syncKnowledgeSource(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  const sourceSlug = String(formData.get('source_slug') ?? '');
  if (!sourceSlug) return;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !serviceKey) return;

  try {
    await fetch(`${base}/functions/v1/knowledge-ingest-tier-a`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ source_slug: sourceSlug }),
      // The ingest can take a while on a changed source; don't hold the action
      // past Vercel's window — the row's last_status shows the outcome.
      signal: AbortSignal.timeout(25_000),
    });
  } catch {
    // Timeout or network — the sync may still complete server-side; the
    // knowledge_sources row records the real outcome either way.
  }

  if (slug) revalidatePath(`/admin/agents/${slug}`);
  revalidatePath('/admin/agents');
  revalidatePath('/admin/knowledge');
}

/**
 * Record a test-chat exchange in assembl_audit_log so the drilldown's audit
 * section reflects Kate's own test traffic. Draft-mode: decision is always
 * 'draft' — nothing was sent anywhere. Called from the TestChatPanel client
 * after each completed exchange; service-role write behind ensureAdmin.
 */
export async function recordTestExchange(input: {
  slug: string;
  query: string;
  response: string;
  sessionId?: string;
  held?: boolean;
}) {
  const admin = await ensureAdmin();

  const slug = String(input.slug ?? '');
  if (!isMarketplaceAgent(slug)) return;

  const sessionId =
    typeof input.sessionId === 'string' && /^[0-9a-f-]{36}$/i.test(input.sessionId)
      ? input.sessionId
      : crypto.randomUUID();

  try {
    const sb = getServiceClient();
    await sb.from('assembl_audit_log').insert({
      // Fixed internal-org marker for operator test traffic (org_id is NOT NULL
      // with no FK; no orgs table exists yet — revisit when one lands).
      org_id: '00000000-0000-4000-8000-000000000001',
      user_id: admin.id,
      session_id: sessionId,
      agent_slug: slug,
      tool_name: 'admin-test-chat',
      tool_input: { query: String(input.query ?? '').slice(0, 4000) },
      tool_output: {
        response: String(input.response ?? '').slice(0, 8000),
        draft: true,
        ...(input.held ? { kaumatua_hold: true } : {}),
      },
      decision: input.held ? 'kaumatua_hold' : 'draft',
    });
  } catch {
    // Fail soft — the audit table may not exist in this environment.
  }
}
