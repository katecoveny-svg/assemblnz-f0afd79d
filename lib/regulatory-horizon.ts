import { createClient } from '@/lib/supabase/server';

export type RegulatoryHorizonStage = 'SIGNAL' | 'PARLIAMENT' | 'PASSED' | 'IN_FORCE';

export type RegulatoryHorizonItem = {
  id: string;
  title: string;
  url: string | null;
  sourceName: string;
  sourceKind: 'proposal' | 'parliament' | 'legislation';
  stage: RegulatoryHorizonStage;
  detailStage: string | null;
  detectedAt: string | null;
  publishedAt: string | null;
  billNumber: string | null;
  status: string | null;
};

type SourceRow = {
  id: string;
  name: string;
  category: string;
  config: Record<string, unknown> | null;
};

type DocumentRow = {
  id: string;
  source_id: string;
  title: string;
  url: string | null;
  content: string;
  published_at: string | null;
  inserted_at: string;
  metadata: Record<string, unknown> | null;
};

function stageFor(source: SourceRow, metadata: Record<string, unknown> | null): RegulatoryHorizonStage {
  if (source.category === 'regulatory_signal') return 'SIGNAL';
  if (source.name.startsWith('PCO —')) {
    return String(metadata?.legislation_status ?? '').toLowerCase() === 'in_force' ? 'IN_FORCE' : 'PASSED';
  }
  const stage = String(metadata?.horizon_stage ?? '').toUpperCase();
  if (stage === 'PASSED') return 'PASSED';
  if (stage === 'IN_FORCE') return 'IN_FORCE';
  if (stage === 'SIGNAL') return 'SIGNAL';
  return 'PARLIAMENT';
}

function sourceKindFor(source: SourceRow): RegulatoryHorizonItem['sourceKind'] {
  if (source.category === 'regulatory_signal') return 'proposal';
  if (source.name.startsWith('PCO —')) return 'legislation';
  return 'parliament';
}

function cleanQuery(value: string | undefined) {
  return (value ?? '').trim().replace(/[,%()]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
}

export async function getRegulatoryHorizon(query?: string): Promise<{
  query: string | null;
  items: RegulatoryHorizonItem[];
  capturedAt: string;
  degraded: boolean;
}> {
  const capturedAt = new Date().toISOString();
  const q = cleanQuery(query);

  try {
    const supa = await createClient();
    const { data: sources, error: sourceError } = await supa
      .from('kb_sources')
      .select('id,name,category,config')
      .or('category.in.(regulatory_horizon,regulatory_signal),name.ilike.PCO —%');

    if (sourceError) throw sourceError;
    const sourceRows = (sources ?? []) as SourceRow[];
    if (!sourceRows.length) return { query: q || null, items: [], capturedAt, degraded: false };

    const sourceById = new Map(sourceRows.map((row) => [row.id, row]));
    let docs = supa
      .from('kb_documents')
      .select('id,source_id,title,url,content,published_at,inserted_at,metadata')
      .in('source_id', sourceRows.map((row) => row.id))
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(q ? 120 : 60);

    if (q) {
      const like = `%${q}%`;
      docs = docs.or(`title.ilike.${like},content.ilike.${like}`);
    }

    const { data, error } = await docs;
    if (error) throw error;

    const items = ((data ?? []) as DocumentRow[]).flatMap((doc) => {
      const source = sourceById.get(doc.source_id);
      if (!source) return [];
      const metadata = doc.metadata ?? {};
      return [{
        id: doc.id,
        title: doc.title,
        url: doc.url,
        sourceName: source.name,
        sourceKind: sourceKindFor(source),
        stage: stageFor(source, metadata),
        detailStage: String(metadata.current_stage ?? metadata.legislation_status ?? '') || null,
        detectedAt: doc.inserted_at ?? null,
        publishedAt: doc.published_at,
        billNumber: String(metadata.bill_number ?? '') || null,
        status: String(metadata.bill_status ?? metadata.legislation_status ?? '') || null,
      } satisfies RegulatoryHorizonItem];
    });

    const rank: Record<RegulatoryHorizonStage, number> = { SIGNAL: 0, PARLIAMENT: 1, PASSED: 2, IN_FORCE: 3 };
    items.sort((a, b) => {
      if (q && a.title.toLowerCase() === q.toLowerCase()) return -1;
      if (q && b.title.toLowerCase() === q.toLowerCase()) return 1;
      const dateA = Date.parse(a.publishedAt ?? a.detectedAt ?? '') || 0;
      const dateB = Date.parse(b.publishedAt ?? b.detectedAt ?? '') || 0;
      return dateB - dateA || rank[a.stage] - rank[b.stage];
    });

    return { query: q || null, items, capturedAt, degraded: false };
  } catch {
    return { query: q || null, items: [], capturedAt, degraded: true };
  }
}
