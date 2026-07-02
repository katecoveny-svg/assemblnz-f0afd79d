import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Live NZ customs-tariff retrieval over the Tier A knowledge pipeline.
 *
 * The `nz-customs-tariff` source is synced daily by the
 * ingest-nz-customs-tariff edge function (WCO HS 2022 baseline + NZ Working
 * Tariff Document effective dates). This helper is the ONLY read path agents
 * use for it: 1536-dim Gemini query embedding → match_knowledge_tier_a RPC,
 * plus the source-freshness row that decides the trust footer.
 *
 * Family-pilot rule: if the source is missing, blocked, stale past its
 * threshold, or the search errors, we return trust 'UNAVAILABLE' — the agent
 * must then say so and must NOT present a code or rate as current. Never
 * degrade silently.
 */

export const TARIFF_SOURCE_SLUG = 'nz-customs-tariff';
const EMBED_DIM = 1536;
const GEMINI_EMBED_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent';

export interface TariffSourceStatus {
  configured: boolean;
  lastSyncedAt: string | null;
  hoursSinceSync: number | null;
  status: string | null;
  blocked: boolean;
  stale: boolean;
  stalenessThresholdDays: number;
  sourceName: string;
}

export interface LiveTariffMatch {
  content: string;
  sourcePointer: string;
  retrievedAt: string;
  similarity: number;
}

export type LiveTariffResult =
  | {
      trust: 'A';
      matches: LiveTariffMatch[];
      lastSyncedAt: string;
      hoursSinceSync: number;
      sourceName: string;
    }
  | {
      trust: 'UNAVAILABLE';
      reason: string;
      matches: [];
    };

function admin() {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !serviceKey) return null;
  return createClient(base, serviceKey);
}

export async function getTariffSourceStatus(): Promise<TariffSourceStatus | null> {
  const supabase = admin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('knowledge_sources')
    .select('source_name, last_fetched_at, last_status, blocked, staleness_threshold_days, active')
    .eq('source_slug', TARIFF_SOURCE_SLUG)
    .maybeSingle();
  if (error || !data || !data.active) return null;

  const last = data.last_fetched_at ? new Date(data.last_fetched_at) : null;
  const hours = last ? (Date.now() - last.getTime()) / 3_600_000 : null;
  const stale =
    hours === null || hours > data.staleness_threshold_days * 24 || data.blocked === true;

  return {
    configured: true,
    lastSyncedAt: data.last_fetched_at,
    hoursSinceSync: hours === null ? null : Math.round(hours * 10) / 10,
    status: data.last_status,
    blocked: data.blocked === true,
    stale,
    stalenessThresholdDays: data.staleness_threshold_days,
    sourceName: data.source_name,
  };
}

export async function searchLiveTariff(query: string, agentSlug: string): Promise<LiveTariffResult> {
  const supabase = admin();
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!supabase || !geminiKey) {
    return { trust: 'UNAVAILABLE', reason: 'live tariff source not configured in this environment', matches: [] };
  }

  const status = await getTariffSourceStatus();
  if (!status || status.lastSyncedAt === null) {
    return { trust: 'UNAVAILABLE', reason: 'nz-customs-tariff has never synced', matches: [] };
  }
  if (status.stale) {
    return {
      trust: 'UNAVAILABLE',
      reason: `nz-customs-tariff is stale (last synced ${status.lastSyncedAt}${status.blocked ? ', source blocked' : ''})`,
      matches: [],
    };
  }

  try {
    const er = await fetch(`${GEMINI_EMBED_URL}?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: query.slice(0, 8000) }] },
        outputDimensionality: EMBED_DIM,
      }),
    });
    if (!er.ok) return { trust: 'UNAVAILABLE', reason: `query embedding failed (HTTP ${er.status})`, matches: [] };
    const ej = (await er.json()) as { embedding?: { values?: number[] } };
    const embedding = ej.embedding?.values;
    if (!Array.isArray(embedding) || embedding.length !== EMBED_DIM) {
      return { trust: 'UNAVAILABLE', reason: 'query embedding malformed', matches: [] };
    }

    const { data, error } = await supabase.rpc('match_knowledge_tier_a', {
      query_embedding: embedding,
      agent_slug: agentSlug,
      top_k: 6,
    });
    if (error) return { trust: 'UNAVAILABLE', reason: `retrieval failed: ${error.message}`, matches: [] };

    const rows = (data ?? []) as Array<{
      source_slug: string;
      content: string;
      source_pointer: string;
      retrieved_at: string;
      similarity: number;
    }>;
    const matches = rows
      .filter((r) => r.source_slug === TARIFF_SOURCE_SLUG)
      .map((r) => ({
        content: r.content,
        sourcePointer: r.source_pointer,
        retrievedAt: r.retrieved_at,
        similarity: Number.isFinite(r.similarity) ? Number(r.similarity.toFixed(3)) : 0,
      }));

    return {
      trust: 'A',
      matches,
      lastSyncedAt: status.lastSyncedAt,
      hoursSinceSync: status.hoursSinceSync ?? 0,
      sourceName: status.sourceName,
    };
  } catch (e) {
    return {
      trust: 'UNAVAILABLE',
      reason: `live tariff search error: ${e instanceof Error ? e.message : 'unknown'}`,
      matches: [],
    };
  }
}

/**
 * The trust-footer contract shared by every customs agent prompt. Kept in one
 * place so the pilot chat, the marketplace agents, and the transparency tab
 * all describe the same behaviour.
 */
export const TARIFF_TRUST_FOOTER_RULES = `Live tariff grounding (nz-customs-tariff, Tier A — synced daily from the WCO HS 2022 baseline and the NZ Customs Working Tariff Document effective dates):
- Any answer that cites a tariff heading, HS code, or duty treatment MUST use the tariffLookup tool result from the live source, and MUST end with this footer on its own final line (plain English, no te reo, exactly this shape):
  Source: NZ Customs Working Tariff · Trust: A · last synced {hoursSinceSync}h ago
  (fill {hoursSinceSync} from the tool's lastSynced data — never guess it).
- If the tool reports trust UNAVAILABLE, end with exactly:
  Source: NZ Customs Working Tariff · Trust: UNAVAILABLE — not verified against the live tariff
  and present any code from the built-in reference extract as an unverified suggestion only. Never state a duty rate as current when the live source is unavailable, and never invent a code, heading, or rate.
- Duty rates: the live chunks carry codes, headings, and the WTD section (with its effective date and official PDF). Quote rates only where a tool states them; otherwise point the broker at the cited WTD section PDF.`;
