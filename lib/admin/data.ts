import 'server-only';

import { getServiceClient } from '@/lib/supabase/service';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin data layer — service-role reads for the operator hub.
 *
 * Every helper is defensive: a missing table, an empty table, or unset env all
 * resolve to a safe default (null count / empty list) instead of throwing, so a
 * half-migrated environment still renders the hub. Callers are already past the
 * ensureAdmin() gate, so the RLS bypass is authorised (see lib/supabase/service).
 */

export const DAY_MS = 24 * 60 * 60 * 1000;

/** Flat marketplace price used for revenue estimates (NZ$15/agent install). */
export const FLAT_AGENT_PRICE_NZD = 15;

function client(): SupabaseClient | null {
  try {
    return getServiceClient();
  } catch {
    return null;
  }
}

/** Count rows in a table with an optional query builder. null = unavailable. */
export async function count(
  table: string,
  modify?: (q: any) => any,
): Promise<number | null> {
  const c = client();
  if (!c) return null;
  try {
    let q: any = c.from(table).select('*', { count: 'exact', head: true });
    if (modify) q = modify(q);
    const { count: n, error } = await q;
    if (error) return null;
    return n ?? 0;
  } catch {
    return null;
  }
}

/** Fetch rows; [] on any failure. */
export async function rows<T = any>(
  table: string,
  modify?: (q: any) => any,
): Promise<T[]> {
  const c = client();
  if (!c) return [];
  try {
    let q: any = c.from(table).select('*');
    if (modify) q = modify(q);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as T[];
  } catch {
    return [];
  }
}

export const since24h = () => new Date(Date.now() - DAY_MS).toISOString();

// ── Today overview ───────────────────────────────────────────────────────────
export type TodayMetrics = {
  signups24h: number | null;
  installs24h: number | null;
  installsTotal: number | null;
  mrrEstimate: number | null;
  openSupport: number | null;
  pilotQueue: number | null;
  health: HealthSummary;
};

export async function getTodayMetrics(): Promise<TodayMetrics> {
  const day = since24h();
  const [signups24h, installs24h, installsTotal, openSupport, pilotQueue, health] =
    await Promise.all([
      count('profiles', (q) => q.gte('created_at', day)),
      count('agent_installs', (q) => q.gte('installed_at', day)),
      count('agent_installs'),
      getOpenSupportCount(),
      getPilotQueueCount(),
      getHealthSummary(),
    ]);

  const mrrEstimate =
    installsTotal === null ? null : installsTotal * FLAT_AGENT_PRICE_NZD;

  return { signups24h, installs24h, installsTotal, mrrEstimate, openSupport, pilotQueue, health };
}

// ── Support ──────────────────────────────────────────────────────────────────
/** Open support items — counts lead_inquiries (falls back to hapai_leads). */
export async function getOpenSupportCount(): Promise<number | null> {
  const inq = await count('lead_inquiries', (q) => q.gte('created_at', since24h()));
  if (inq !== null) return inq;
  return count('hapai_leads', (q) => q.gte('created_at', since24h()));
}

export type SupportMessage = {
  id: string;
  created_at: string | null;
  email: string | null;
  name: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
};

export async function getSupportMessages(limit = 60): Promise<{ rows: SupportMessage[]; source: string }> {
  // Prefer a dedicated inquiries table; degrade to lead captures.
  const inq = await rows<any>('lead_inquiries', (q) => q.order('created_at', { ascending: false }).limit(limit));
  if (inq.length) {
    return {
      source: 'lead_inquiries',
      rows: inq.map((r) => ({
        id: String(r.id),
        created_at: r.created_at ?? null,
        email: r.email ?? null,
        name: r.name ?? r.payload?.name ?? null,
        message: r.message ?? r.body ?? r.note ?? null,
        source: r.source ?? r.kind ?? null,
        status: r.status ?? null,
      })),
    };
  }
  const leads = await rows<any>('hapai_leads', (q) => q.order('created_at', { ascending: false }).limit(limit));
  return {
    source: 'hapai_leads',
    rows: leads.map((r) => ({
      id: String(r.id),
      created_at: r.created_at ?? null,
      email: r.email ?? null,
      name: r.payload?.name ?? null,
      message: r.payload?.business ? `Business: ${r.payload.business}` : null,
      source: r.tool_slug ?? r.source ?? null,
      status: r.consent ? 'opted-in' : null,
    })),
  };
}

// ── Pilot (user-built agents) ────────────────────────────────────────────────
/** Best-effort: review queue for user-built agents awaiting sign-off. */
export async function getPilotQueueCount(): Promise<number | null> {
  for (const table of ['pilot_agents', 'user_agents', 'agent_drafts']) {
    const n = await count(table, (q) => q.in('status', ['pending', 'submitted', 'review']));
    if (n !== null) return n;
  }
  return null;
}

export type PilotDraft = {
  id: string;
  name: string | null;
  owner: string | null;
  status: string | null;
  created_at: string | null;
};

export async function getPilotDrafts(): Promise<{ rows: PilotDraft[]; table: string | null }> {
  for (const table of ['pilot_agents', 'user_agents', 'agent_drafts']) {
    const data = await rows<any>(table, (q) => q.order('created_at', { ascending: false }).limit(80));
    // count() returns null when the table is absent; an empty array is ambiguous,
    // so probe existence with a head count.
    const exists = await count(table);
    if (exists !== null) {
      return {
        table,
        rows: data.map((r) => ({
          id: String(r.id),
          name: r.name ?? r.title ?? r.slug ?? null,
          owner: r.owner_email ?? r.user_email ?? r.user_id ?? null,
          status: r.status ?? null,
          created_at: r.created_at ?? null,
        })),
      };
    }
  }
  return { rows: [], table: null };
}

// ── Users ────────────────────────────────────────────────────────────────────
export type AdminUserRow = {
  user_id: string;
  email: string | null;
  name: string | null;
  created_at: string | null;
  role: string | null;
  installs: number;
};

export async function getUsers(roleFilter?: string): Promise<AdminUserRow[]> {
  const profiles = await rows<any>('profiles', (q) =>
    q.order('created_at', { ascending: false }).limit(300),
  );
  if (!profiles.length) return [];

  const roleRows = await rows<any>('user_roles');
  const roleByUser = new Map<string, string>();
  for (const r of roleRows) roleByUser.set(r.user_id, r.role);

  const installRows = await rows<any>('agent_installs');
  const installsByUser = new Map<string, number>();
  for (const r of installRows) {
    installsByUser.set(r.user_id, (installsByUser.get(r.user_id) ?? 0) + 1);
  }

  let list = profiles.map((p) => ({
    user_id: p.user_id ?? p.id,
    email: p.email ?? null,
    name: p.name ?? null,
    created_at: p.created_at ?? null,
    role: roleByUser.get(p.user_id ?? p.id) ?? 'free',
    installs: installsByUser.get(p.user_id ?? p.id) ?? 0,
  }));

  if (roleFilter && roleFilter !== 'all') {
    list = list.filter((u) => u.role === roleFilter);
  }
  return list;
}

// ── Agents (catalogue metrics from Supabase) ─────────────────────────────────
export type AgentMetric = { chats: number; installs: number; revenue: number };

export async function getAgentMetrics(): Promise<Record<string, AgentMetric>> {
  const [sessions, installs] = await Promise.all([
    rows<any>('agent_chat_sessions'),
    rows<any>('agent_installs'),
  ]);
  const out: Record<string, AgentMetric> = {};
  const bump = (slug: string | null, key: keyof AgentMetric) => {
    if (!slug) return;
    out[slug] = out[slug] ?? { chats: 0, installs: 0, revenue: 0 };
    out[slug][key] += 1;
  };
  for (const s of sessions) bump(s.agent_slug ?? s.slug, 'chats');
  for (const i of installs) {
    const slug = i.agent_slug ?? i.slug;
    bump(slug, 'installs');
    if (out[slug]) out[slug].revenue += FLAT_AGENT_PRICE_NZD;
  }
  return out;
}

/** DB-side status overrides for agents (status toggle writes here). */
export async function getAgentStatusOverrides(): Promise<Record<string, string>> {
  const data = await rows<any>('agents', (q) => q.select('slug,status'));
  const out: Record<string, string> = {};
  for (const r of data) if (r.slug && r.status) out[r.slug] = r.status;
  return out;
}

// ── Billing ──────────────────────────────────────────────────────────────────
export type BillingSummary = {
  activeSubs: number | null;
  byTier: Record<string, number>;
  failed: number | null;
  installsTotal: number | null;
  mrrEstimate: number | null;
};

export async function getBillingSummary(): Promise<BillingSummary> {
  const subs = await rows<any>('subscriptions');
  const byTier: Record<string, number> = {};
  let activeSubs: number | null = null;
  if (subs.length || (await count('subscriptions')) !== null) {
    activeSubs = 0;
    for (const s of subs) {
      const status = (s.status ?? '').toLowerCase();
      if (status === 'active' || status === 'trialing') {
        activeSubs += 1;
        const tier = s.tier ?? 'unknown';
        byTier[tier] = (byTier[tier] ?? 0) + 1;
      }
    }
  }

  const failed = await count('toro_stripe_customers', (q) =>
    q.in('subscription_status', ['past_due', 'unpaid', 'incomplete']),
  );
  const installsTotal = await count('agent_installs');
  const mrrEstimate = installsTotal === null ? null : installsTotal * FLAT_AGENT_PRICE_NZD;

  return { activeSubs, byTier, failed, installsTotal, mrrEstimate };
}

// ── Receipts (Mana Receipts ledger) ──────────────────────────────────────────
export type ReceiptRow = {
  id: string;
  agent: string | null;
  domain: string | null;
  issuer: string | null;
  hitl_status: string | null;
  created_at: string | null;
};

export async function getReceipts(filter?: { agent?: string }): Promise<{ rows: ReceiptRow[]; available: boolean }> {
  const exists = await count('mana_receipts');
  if (exists === null) return { rows: [], available: false };
  const data = await rows<any>('mana_receipts', (q) => {
    let b = q.order('created_at', { ascending: false }).limit(120);
    if (filter?.agent) b = b.eq('agent', filter.agent);
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

// ── Health ───────────────────────────────────────────────────────────────────
export type HealthCheck = {
  name: string;
  status: 'ok' | 'error';
  response_time_ms: number;
  error_message?: string;
  category?: string;
};

export type HealthLog = {
  id: string;
  created_at: string;
  overall_status: 'ok' | 'degraded' | 'down';
  checks: HealthCheck[];
  failures: number;
  brevo_ip_blocked: boolean;
  alerted: boolean;
  webhook_delivered: boolean;
  email_delivered: boolean;
  duration_ms: number | null;
  run_source: string;
};

export type HealthSummary = {
  status: 'ok' | 'degraded' | 'down' | 'unknown';
  brevoBlocked: boolean;
  lastRun: string | null;
  services: { name: string; status: 'ok' | 'error' | 'unknown' }[];
};

export async function getHealthLogs(): Promise<HealthLog[]> {
  return rows<HealthLog>('health_check_logs', (q) =>
    q.gte('created_at', since24h()).order('created_at', { ascending: false }),
  );
}

export async function getHealthSummary(): Promise<HealthSummary> {
  const logs = await getHealthLogs();
  const latest = logs[0];
  if (!latest) {
    return { status: 'unknown', brevoBlocked: false, lastRun: null, services: [] };
  }
  return {
    status: latest.overall_status,
    brevoBlocked: !!latest.brevo_ip_blocked,
    lastRun: latest.created_at,
    services: (latest.checks ?? []).map((c) => ({ name: c.name, status: c.status })),
  };
}

export function nzd(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n);
}
