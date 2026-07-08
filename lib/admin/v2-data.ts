import 'server-only';

import { count, rows } from '@/lib/admin/data';

/**
 * v2 admin data layer — service-role reads for the Phase 2 CRUD sections
 * (bundles, knowledge, tenants, approvals, prompt overrides, receipts search).
 *
 * Same defensive contract as lib/admin/data.ts: a missing table or unset env
 * resolves to a safe default instead of throwing, so a half-migrated
 * environment still renders the hub. Callers are past ensureAdmin().
 */

// ── Agents (DB mirror rows — code registry stays the runtime truth) ─────────
export type AgentDbRow = {
  slug: string;
  name: string | null;
  description: string | null;
  category: string | null;
  model_tier: string | null;
  status: string | null;
  bundle: string | null;
  is_bundle_lead: boolean;
  parent_slug: string | null;
  system_prompt: string | null;
};

export async function getAgentDbRow(slug: string): Promise<AgentDbRow | null> {
  const data = await rows<any>('agents', (q) =>
    q
      .select('slug,name,description,category,model_tier,status,bundle,is_bundle_lead,parent_slug,system_prompt')
      .eq('slug', slug)
      .limit(1),
  );
  const r = data[0];
  if (!r) return null;
  return {
    slug: r.slug,
    name: r.name ?? null,
    description: r.description ?? null,
    category: r.category ?? null,
    model_tier: r.model_tier ?? null,
    status: r.status ?? null,
    bundle: r.bundle ?? null,
    is_bundle_lead: r.is_bundle_lead === true,
    parent_slug: r.parent_slug ?? null,
    system_prompt: r.system_prompt ?? null,
  };
}

// ── Prompt overrides (staged edits; code is canonical) ──────────────────────
export type PromptOverride = {
  agent_slug: string;
  system_prompt: string;
  note: string | null;
  status: string;
  updated_by: string | null;
  updated_at: string | null;
};

export async function getPromptOverride(slug: string): Promise<PromptOverride | null> {
  const data = await rows<any>('agent_prompt_overrides', (q) => q.eq('agent_slug', slug).limit(1));
  const r = data[0];
  if (!r) return null;
  return {
    agent_slug: r.agent_slug,
    system_prompt: r.system_prompt ?? '',
    note: r.note ?? null,
    status: r.status ?? 'staged',
    updated_by: r.updated_by ?? null,
    updated_at: r.updated_at ?? null,
  };
}

export async function getStagedOverrideCount(): Promise<number | null> {
  return count('agent_prompt_overrides', (q) => q.eq('status', 'staged'));
}

// ── Marketplace prompt rows (what the chat runtime actually reads) ──────────
// prompt-store.ts resolves prompts from agent_prompts pack='marketplace' with
// the code registry as fallback; this mirrors that read so the admin drilldown
// can show the effective live prompt. No is_active filter — see prompt-store.
export type MarketplacePromptRow = {
  system_prompt: string;
  version: number;
  updated_at: string | null;
};

export async function getMarketplacePromptRow(slug: string): Promise<MarketplacePromptRow | null> {
  const data = await rows<any>('agent_prompts', (q) =>
    q
      .select('system_prompt,version,updated_at')
      .eq('agent_name', slug)
      .eq('pack', 'marketplace')
      .order('version', { ascending: false })
      .limit(1),
  );
  const r = data[0];
  if (!r || typeof r.system_prompt !== 'string' || r.system_prompt.trim().length <= 200) return null;
  return {
    system_prompt: r.system_prompt,
    version: typeof r.version === 'number' ? r.version : 1,
    updated_at: r.updated_at ?? null,
  };
}

// ── Designated admins (operator allowlist) ──────────────────────────────────
export type DesignatedAdminRow = {
  email: string;
  user_id: string | null;
  display_name: string | null;
  added_by: string | null;
  active: boolean;
  created_at: string | null;
};

export async function getDesignatedAdmins(): Promise<{ rows: DesignatedAdminRow[]; available: boolean }> {
  const exists = await count('designated_admins');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('designated_admins', (q) => q.order('created_at'));
  return {
    available: true,
    rows: data.map((r) => ({
      email: r.email,
      user_id: r.user_id ?? null,
      display_name: r.display_name ?? null,
      added_by: r.added_by ?? null,
      active: r.active !== false,
      created_at: r.created_at ?? null,
    })),
  };
}

// ── Bundles ──────────────────────────────────────────────────────────────────
export type BundleRow = {
  slug: string;
  name: string;
  category: string | null;
  lead_agent_slug: string | null;
  short_pitch: string | null;
  monthly_nzd: number | null;
  status: string | null;
  sort_order: number;
  accent: string | null;
};

export async function getBundles(): Promise<{ rows: BundleRow[]; available: boolean }> {
  const exists = await count('bundles');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('bundles', (q) => q.order('slug'));
  const mapped: BundleRow[] = data.map((r) => ({
    slug: r.slug,
    name: r.name ?? r.slug,
    category: r.category ?? null,
    lead_agent_slug: r.lead_agent_slug ?? null,
    short_pitch: r.short_pitch ?? null,
    monthly_nzd: r.monthly_nzd === null || r.monthly_nzd === undefined ? null : Number(r.monthly_nzd),
    status: r.status ?? null,
    // sort_order lands with migration 20260703100000; default when absent.
    sort_order: typeof r.sort_order === 'number' ? r.sort_order : 100,
    accent: r.accent ?? null,
  }));
  mapped.sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));
  return { rows: mapped, available: true };
}

export type BundleMember = {
  slug: string;
  name: string | null;
  status: string | null;
  is_bundle_lead: boolean;
  parent_slug: string | null;
};

/** All agents grouped by bundle (null key = unbundled). */
export async function getAgentsByBundle(): Promise<Map<string | null, BundleMember[]>> {
  const data = await rows<any>('agents', (q) =>
    q.select('slug,name,status,bundle,is_bundle_lead,parent_slug').order('slug'),
  );
  const map = new Map<string | null, BundleMember[]>();
  for (const r of data) {
    const key = r.bundle ?? null;
    const list = map.get(key) ?? [];
    list.push({
      slug: r.slug,
      name: r.name ?? null,
      status: r.status ?? null,
      is_bundle_lead: r.is_bundle_lead === true,
      parent_slug: r.parent_slug ?? null,
    });
    map.set(key, list);
  }
  return map;
}

// ── Knowledge sources + alerts ───────────────────────────────────────────────
export type KnowledgeSourceRow = {
  source_slug: string;
  source_name: string;
  tier: string;
  url: string | null;
  source_type: string | null;
  refresh_cadence_days: number;
  staleness_threshold_days: number;
  steward: string | null;
  dependent_agents: string[];
  last_fetched_at: string | null;
  last_status: string | null;
  blocked: boolean;
  active: boolean;
};

export async function getKnowledgeSources(): Promise<{ rows: KnowledgeSourceRow[]; available: boolean }> {
  const exists = await count('knowledge_sources');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('knowledge_sources', (q) => q.order('tier').order('source_slug'));
  return {
    available: true,
    rows: data.map((r) => ({
      source_slug: r.source_slug,
      source_name: r.source_name ?? r.source_slug,
      tier: r.tier ?? 'A',
      url: r.url ?? null,
      source_type: r.source_type ?? null,
      refresh_cadence_days: r.refresh_cadence_days ?? 7,
      staleness_threshold_days: r.staleness_threshold_days ?? 30,
      steward: r.steward ?? null,
      dependent_agents: Array.isArray(r.dependent_agents) ? r.dependent_agents : [],
      last_fetched_at: r.last_fetched_at ?? null,
      last_status: r.last_status ?? null,
      blocked: r.blocked === true,
      active: r.active !== false,
    })),
  };
}

/** Days since last fetch, or null when never fetched. */
export function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

/** Stale = never fetched, blocked, or overdue past its refresh cadence. */
export function isStale(s: KnowledgeSourceRow): boolean {
  if (!s.active) return false;
  if (s.blocked) return true;
  const d = daysSince(s.last_fetched_at);
  return d === null || d > s.refresh_cadence_days;
}

export type KnowledgeAlertRow = {
  id: string;
  source_slug: string | null;
  alert_type: string;
  severity: string;
  message: string;
  dependent_agents: string[];
  resolved: boolean;
  created_at: string | null;
};

export async function getKnowledgeAlerts(includeResolved = false): Promise<{
  rows: KnowledgeAlertRow[];
  available: boolean;
}> {
  const exists = await count('knowledge_alerts');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('knowledge_alerts', (q) => {
    let b = q.order('created_at', { ascending: false }).limit(80);
    if (!includeResolved) b = b.eq('resolved', false);
    return b;
  });
  return {
    available: true,
    rows: data.map((r) => ({
      id: String(r.id),
      source_slug: r.source_slug ?? null,
      alert_type: r.alert_type ?? 'info',
      severity: r.severity ?? 'info',
      message: r.message ?? '',
      dependent_agents: Array.isArray(r.dependent_agents) ? r.dependent_agents : [],
      resolved: r.resolved === true,
      created_at: r.created_at ?? null,
    })),
  };
}

// ── Tenants ──────────────────────────────────────────────────────────────────
export type TenantDbRow = {
  slug: string;
  name: string;
  agent: string | null;
  bundle: string | null;
  status: string | null;
  tagline: string | null;
  brand_config: string | null;
  demo_seed_enabled: boolean;
  updated_at: string | null;
};

export async function getTenantDbRows(): Promise<{ rows: TenantDbRow[]; available: boolean }> {
  const exists = await count('tenant_customers');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('tenant_customers', (q) => q.order('slug'));
  return {
    available: true,
    rows: data.map((r) => ({
      slug: r.slug,
      name: r.name ?? r.slug,
      agent: r.agent ?? null,
      bundle: r.bundle ?? null,
      status: r.status ?? null,
      tagline: r.tagline ?? null,
      // Columns land with migration 20260703100000; default when absent.
      brand_config: r.brand_config ?? null,
      demo_seed_enabled: r.demo_seed_enabled !== false,
      updated_at: r.updated_at ?? null,
    })),
  };
}

// ── Content approvals ────────────────────────────────────────────────────────
export type ApprovalRow = {
  id: string;
  surface: string;
  kind: string;
  storage_path: string | null;
  title: string | null;
  summary: string | null;
  tenant_slug: string | null;
  status: string;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string | null;
  payload: Record<string, unknown> | null;
};

export async function getApprovals(status?: string): Promise<{ rows: ApprovalRow[]; available: boolean }> {
  const exists = await count('content_approvals');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('content_approvals', (q) => {
    let b = q.order('created_at', { ascending: false }).limit(120);
    if (status && status !== 'all') b = b.eq('status', status);
    return b;
  });
  return {
    available: true,
    rows: data.map((r) => ({
      id: String(r.id),
      surface: r.surface ?? '',
      kind: r.kind ?? '',
      storage_path: r.storage_path ?? null,
      title: r.title ?? null,
      summary: r.summary ?? null,
      tenant_slug: r.tenant_slug ?? null,
      status: r.status ?? 'pending',
      created_by: r.created_by ?? null,
      reviewed_by: r.reviewed_by ?? null,
      reviewed_at: r.reviewed_at ?? null,
      review_note: r.review_note ?? null,
      created_at: r.created_at ?? null,
      payload: (r.payload as Record<string, unknown> | null) ?? null,
    })),
  };
}

export async function getPendingApprovalCount(): Promise<number | null> {
  return count('content_approvals', (q) => q.eq('status', 'pending'));
}

// ── Mana Receipts — search (extends lib/admin/data.ts getReceipts) ──────────
export type ReceiptSearchRow = {
  id: string;
  agent: string | null;
  domain: string | null;
  issuer: string | null;
  hitl_status: string | null;
  created_at: string | null;
};

export async function searchReceipts(opts: {
  q?: string;
  agent?: string;
  limit?: number;
}): Promise<{ rows: ReceiptSearchRow[]; available: boolean }> {
  const exists = await count('mana_receipts');
  if (exists === null) return { rows: [], available: false };
  const limit = Math.min(opts.limit ?? 200, 2000);
  const data = await rows<any>('mana_receipts', (q) => {
    let b = q.order('created_at', { ascending: false }).limit(limit);
    if (opts.agent) b = b.eq('agent', opts.agent);
    if (opts.q) {
      // Escape PostgREST or() special characters, then match across the
      // searchable text columns.
      const safe = opts.q.replace(/[(),]/g, ' ').trim();
      if (safe) {
        b = b.or(`agent.ilike.%${safe}%,domain.ilike.%${safe}%,issuer.ilike.%${safe}%`);
      }
    }
    return b;
  });
  return {
    available: true,
    rows: data.map((r) => ({
      id: String(r.id),
      agent: r.agent ?? null,
      domain: r.domain ?? null,
      issuer: r.issuer ?? null,
      hitl_status: r.hitl?.status ?? null,
      created_at: r.created_at ?? r.issued_at ?? null,
    })),
  };
}

/** CSV-encode receipt rows (RFC 4180 quoting). */
export function receiptsToCsv(list: ReceiptSearchRow[]): string {
  const esc = (v: string | null) => {
    const s = v ?? '';
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = 'id,agent,domain,issuer,hitl_status,created_at';
  const lines = list.map((r) =>
    [r.id, r.agent, r.domain, r.issuer, r.hitl_status, r.created_at].map(esc).join(','),
  );
  return [head, ...lines].join('\n') + '\n';
}
