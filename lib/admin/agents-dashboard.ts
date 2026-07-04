import 'server-only';

import { MARKETPLACE_AGENTS, type MarketplaceAgent } from '@/lib/marketplace/agents';
import { BUNDLES, BUNDLE_ORDER, type BundleMeta } from '@/lib/marketplace/bundles';
import { rows } from '@/lib/admin/data';
import { getKnowledgeSources, type KnowledgeSourceRow } from '@/lib/admin/v2-data';

/**
 * Single-pane agent dashboard data layer (/admin/agents).
 *
 * The roster truth is the CODE registry (lib/marketplace/agents.ts) plus the
 * V4 bundle map (lib/marketplace/bundles.ts) — the DB `agents` mirror only
 * contributes status overrides. Supabase contributes the wiring facts:
 * knowledge_sources.dependent_agents (Tier A anchors + last sync),
 * agent_prompt_overrides (staged prompt edits) and agent_prompts (the legacy
 * SQL corpus, shown as provenance only — runtime never reads it).
 *
 * Derived status is honest, not aspirational:
 *   live       — registry live AND >=1 active Tier A source lists the slug
 *   chat_only  — registry live, chat works via /api/agents/[slug]/chat, but no
 *                dedicated Tier A source is linked (citations are generic)
 *   stub       — registered but coming_soon / draft: card renders, no live chat
 *   not_started— a provisional bundle lead with no MarketplaceAgent yet
 */

export type DerivedStatus = 'live' | 'chat_only' | 'stub' | 'not_started';

export const STATUS_LABELS: Record<DerivedStatus, string> = {
  live: 'Live',
  chat_only: 'Chat wired, no citations',
  stub: 'Stub / static',
  not_started: 'Not started',
};

export type PromptSource = 'code' | 'code_staged' | 'missing';

export type DashboardRow = {
  slug: string;
  /** English display name, rendered lowercase in Cormorant on the table */
  name: string;
  teReo: string;
  bundle: string | null;
  bundleName: string;
  isBundleLead: boolean;
  status: DerivedStatus;
  promptSource: PromptSource;
  /** slug also present in the legacy agent_prompts SQL corpus */
  inSqlCorpus: boolean;
  /** Tier A anchors that list this agent as a dependant */
  knowledgeSources: { slug: string; name: string; tier: string }[];
  /** most recent last_fetched_at across those anchors */
  lastSyncedAt: string | null;
  /** relative URLs the agent is reachable at */
  surfaces: { href: string; label: string }[];
  /** compliance */
  kaumatuaHold: boolean;
  tikangaSensitive: boolean;
};

/** Kaitiaki conservation specialties where taonga content is kaumātua-gated. */
export const KAUMATUA_HOLD_SLUGS = new Set([
  'kakapo-recovery',
  'kiwi-conservation',
  'species-recovery',
  'wildbase-recovery',
  'zoo-vet',
]);

/** Pilot consoles an agent is demonstrably live on (beyond /agents). */
const PILOT_SURFACES: Record<string, { href: string; label: string }[]> = {
  'doggy-daycare': [{ href: '/customers/happy-tails/ops', label: 'happy tails ops' }],
  keeper: [{ href: '/customers/happy-tails/ops', label: 'happy tails ops' }],
  pikau: [{ href: '/customers/aironaut', label: 'aironaut pilot' }],
  gateway: [{ href: '/customers/aironaut', label: 'aironaut pilot' }],
  'zoo-vet': [{ href: '/customers/auckland-zoo', label: 'auckland zoo pilot' }],
  echo: [{ href: '/echo', label: 'echo live chat' }],
};

/** slug → V4 bundle slug, from the bundle groups + lead slugs + registry field. */
export function bundleForSlug(slug: string, agent?: MarketplaceAgent): string | null {
  for (const key of BUNDLE_ORDER) {
    const b = BUNDLES[key];
    if (b.leadSlug === slug) return b.slug;
    for (const g of b.groups) if (g.slugs.includes(slug)) return b.slug;
  }
  return agent?.bundle ?? null;
}

/** Provisional bundle leads with no MarketplaceAgent yet — the ⚫ rows. */
function provisionalLeads(): { slug: string; bundle: BundleMeta }[] {
  const registered = new Set(MARKETPLACE_AGENTS.map((a) => a.slug));
  return BUNDLE_ORDER.map((k) => BUNDLES[k])
    .filter((b) => !registered.has(b.leadSlug))
    .map((b) => ({ slug: b.leadSlug, bundle: b }));
}

function titleFromSlug(slug: string): string {
  return slug.replace(/-/g, ' ');
}

export async function buildDashboardRows(): Promise<{
  rows: DashboardRow[];
  sources: KnowledgeSourceRow[];
}> {
  const [knowledge, statusRows, stagedRows, corpusRows] = await Promise.all([
    getKnowledgeSources(),
    rows<any>('agents', (q) => q.select('slug,status')),
    rows<any>('agent_prompt_overrides', (q) => q.select('agent_slug,status').eq('status', 'staged')),
    rows<any>('agent_prompts', (q) => q.select('agent_name,kete_slug').limit(400)),
  ]);

  const statusOverride = new Map<string, string>(statusRows.map((r) => [r.slug, r.status]));
  const staged = new Set<string>(stagedRows.map((r) => r.agent_slug));
  const corpus = new Set<string>();
  for (const r of corpusRows) {
    if (r.agent_name) corpus.add(String(r.agent_name));
    if (r.kete_slug) corpus.add(String(r.kete_slug));
  }

  const activeSources = knowledge.rows.filter((s) => s.active);
  const sourcesForAgent = (slug: string) => activeSources.filter((s) => s.dependent_agents.includes(slug));

  const out: DashboardRow[] = MARKETPLACE_AGENTS.map((a) => {
    const bundleSlug = bundleForSlug(a.slug, a);
    const bundleMeta = bundleSlug ? BUNDLES[bundleSlug] : undefined;
    const anchors = sourcesForAgent(a.slug);
    const dbStatus = statusOverride.get(a.slug) ?? (a.status === 'live' ? 'live' : 'coming_soon');
    const isLive = dbStatus === 'live';
    const status: DerivedStatus = isLive ? (anchors.length > 0 ? 'live' : 'chat_only') : 'stub';
    const lastSyncedAt =
      anchors
        .map((s) => s.last_fetched_at)
        .filter((t): t is string => !!t)
        .sort()
        .pop() ?? null;

    const surfaces: { href: string; label: string }[] = [];
    if (isLive) {
      surfaces.push({ href: `/agents/${a.slug}`, label: `/agents/${a.slug}` });
      surfaces.push({ href: `/agents/${a.slug}/chat`, label: 'chat' });
    }
    if (bundleMeta) surfaces.push({ href: `/bundles/${bundleMeta.slug}`, label: `bundle · ${bundleMeta.name.toLowerCase()}` });
    for (const p of PILOT_SURFACES[a.slug] ?? []) surfaces.push(p);

    return {
      slug: a.slug,
      name: a.name,
      teReo: a.teReo,
      bundle: bundleSlug,
      bundleName: bundleMeta?.name ?? '—',
      isBundleLead: a.isBundleLead === true || bundleMeta?.leadSlug === a.slug,
      status,
      promptSource: staged.has(a.slug) ? 'code_staged' : 'code',
      inSqlCorpus: corpus.has(a.slug),
      knowledgeSources: anchors.map((s) => ({ slug: s.source_slug, name: s.source_name, tier: s.tier })),
      lastSyncedAt,
      surfaces,
      kaumatuaHold: KAUMATUA_HOLD_SLUGS.has(a.slug),
      tikangaSensitive: KAUMATUA_HOLD_SLUGS.has(a.slug) || bundleSlug === 'kaitiaki',
    };
  });

  for (const p of provisionalLeads()) {
    out.push({
      slug: p.slug,
      name: titleFromSlug(p.slug),
      teReo: '',
      bundle: p.bundle.slug,
      bundleName: p.bundle.name,
      isBundleLead: true,
      status: 'not_started',
      promptSource: 'missing',
      inSqlCorpus: corpus.has(p.slug),
      knowledgeSources: [],
      lastSyncedAt: null,
      surfaces: [{ href: `/bundles/${p.bundle.slug}`, label: `bundle · ${p.bundle.name.toLowerCase()}` }],
      kaumatuaHold: false,
      tikangaSensitive: p.bundle.slug === 'kaitiaki',
    });
  }

  out.sort((x, y) => x.name.localeCompare(y.name));
  return { rows: out, sources: knowledge.rows };
}

// ── Audit log (assembl_audit_log) ────────────────────────────────────────────
export type AuditRow = {
  id: string;
  created_at: string | null;
  tool_name: string | null;
  query: string;
  response: string;
  trust: string | null;
  decision: string | null;
  user_id: string | null;
};

export async function getAgentAuditLog(slug: string, limit = 20): Promise<AuditRow[]> {
  const data = await rows<any>('assembl_audit_log', (q) =>
    q.eq('agent_slug', slug).order('created_at', { ascending: false }).limit(limit),
  );
  return data.map((r) => ({
    id: String(r.id),
    created_at: r.created_at ?? null,
    tool_name: r.tool_name ?? null,
    query: typeof r.tool_input?.query === 'string' ? r.tool_input.query : JSON.stringify(r.tool_input ?? {}),
    response:
      typeof r.tool_output?.response === 'string' ? r.tool_output.response : JSON.stringify(r.tool_output ?? {}),
    trust: typeof r.tool_output?.trust === 'string' ? r.tool_output.trust : null,
    decision: r.decision ?? null,
    user_id: r.user_id ?? null,
  }));
}
