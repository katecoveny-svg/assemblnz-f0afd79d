import { createClient } from '@/lib/supabase/server';

export interface RegulatoryPulseItem {
  id: string;
  title: string;
  sourceName: string;
  sourceUrl: string | null;
  kete: string[];
  detectedAt: string;
  changeType: string;
}

export interface RegulatoryPulseStats {
  changesLastDay: number;
  liveSources: number;
  staleSources: number;
  totalDocuments: number;
  embeddedChunks: number;
  pendingEmbeds: number;
  pcoSources: number;
  latest: RegulatoryPulseItem[];
  capturedAt: string;
  degraded: boolean;
}

const QUIET: Omit<RegulatoryPulseStats, 'capturedAt'> = {
  changesLastDay: 0,
  liveSources: 0,
  staleSources: 0,
  totalDocuments: 0,
  embeddedChunks: 0,
  pendingEmbeds: 0,
  pcoSources: 0,
  latest: [],
  degraded: true,
};

type ChangeRow = {
  id: number;
  change_type: string;
  detected_at: string;
  document_id: string | null;
  source_id: string | null;
  kb_documents?: {
    title: string | null;
    url: string | null;
  } | {
    title: string | null;
    url: string | null;
  }[] | null;
  kb_sources?: {
    name: string | null;
    url: string | null;
    agent_packs: string[] | null;
    authority_tier: number | null;
  } | {
    name: string | null;
    url: string | null;
    agent_packs: string[] | null;
    authority_tier: number | null;
  }[] | null;
};

export async function getRegulatoryPulse(): Promise<RegulatoryPulseStats> {
  const capturedAt = new Date().toISOString();

  try {
    const supa = await createClient();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      changesLastDay,
      liveSources,
      staleSources,
      totalDocuments,
      embeddedChunks,
      pendingEmbeds,
      pcoSources,
      latest,
    ] = await Promise.all([
      supa
        .from('kb_changes')
        .select('id', { count: 'exact', head: true })
        .gte('detected_at', oneDayAgo),
      supa
        .from('kb_sources')
        .select('id', { count: 'exact', head: true })
        .eq('active', true)
        .gte('last_successful_fetch', sevenDaysAgo),
      supa
        .from('kb_sources')
        .select('id', { count: 'exact', head: true })
        .eq('active', true)
        .or(`last_successful_fetch.is.null,last_successful_fetch.lt.${sevenDaysAgo}`),
      supa
        .from('kb_documents')
        .select('id', { count: 'exact', head: true }),
      supa
        .from('kb_doc_chunks')
        .select('id', { count: 'exact', head: true }),
      supa
        .from('kb_embed_queue')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'queued', 'processing']),
      supa
        .from('kb_sources')
        .select('id', { count: 'exact', head: true })
        .eq('active', true)
        .or('name.ilike.%PCO%,url.ilike.%legislation%'),
      supa
        .from('kb_changes')
        .select(`
          id,
          change_type,
          detected_at,
          document_id,
          source_id,
          kb_documents(title,url),
          kb_sources(name,url,agent_packs,authority_tier)
        `)
        .order('detected_at', { ascending: false })
        .limit(24),
    ]);

    const errored =
      changesLastDay.error ||
      liveSources.error ||
      staleSources.error ||
      totalDocuments.error ||
      embeddedChunks.error ||
      pendingEmbeds.error ||
      pcoSources.error ||
      latest.error;
    if (errored) return { ...QUIET, capturedAt };

    const rows = (latest.data ?? []) as ChangeRow[];

    const latestRows = rows.filter((row) => {
      const source = Array.isArray(row.kb_sources)
        ? row.kb_sources[0] ?? null
        : row.kb_sources ?? null;
      return source?.authority_tier ? source.authority_tier <= 2 : false;
    });
    const displayRows = (latestRows.length > 0 ? latestRows : rows).slice(0, 4);

    return {
      changesLastDay: changesLastDay.count ?? 0,
      liveSources: liveSources.count ?? 0,
      staleSources: staleSources.count ?? 0,
      totalDocuments: totalDocuments.count ?? 0,
      embeddedChunks: embeddedChunks.count ?? 0,
      pendingEmbeds: pendingEmbeds.count ?? 0,
      pcoSources: pcoSources.count ?? 0,
      latest: displayRows.map((row) => {
        const document = Array.isArray(row.kb_documents)
          ? row.kb_documents[0] ?? null
          : row.kb_documents ?? null;
        const source = Array.isArray(row.kb_sources)
          ? row.kb_sources[0] ?? null
          : row.kb_sources ?? null;

        return {
          id: String(row.id),
          title: document?.title ?? 'Source update detected',
          sourceName: source?.name ?? 'Knowledge source',
          sourceUrl: document?.url ?? source?.url ?? null,
          kete: source?.agent_packs ?? [],
          detectedAt: row.detected_at,
          changeType: row.change_type,
        };
      }),
      capturedAt,
      degraded: false,
    };
  } catch {
    return { ...QUIET, capturedAt };
  }
}
