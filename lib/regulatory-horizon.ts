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

type ParliamentBillSummary = {
  id?: string;
  title?: string;
  billNumber?: string;
  status?: string;
  billCurrentStageName?: string;
  lastStageDate?: string;
  lastModified?: string;
  publicationDate?: string;
};

type ParliamentSearchResponse = {
  results?: ParliamentBillSummary[];
};

const PARLIAMENT_SEARCH_URL = 'https://bills.parliament.nz/api/data/search';

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

function parliamentStage(summary: ParliamentBillSummary): RegulatoryHorizonStage {
  const text = `${summary.status ?? ''} ${summary.billCurrentStageName ?? ''}`.toLowerCase();
  return /royal assent|assented|passed/.test(text) ? 'PASSED' : 'PARLIAMENT';
}

function sourceKindFor(source: SourceRow): RegulatoryHorizonItem['sourceKind'] {
  if (source.category === 'regulatory_signal') return 'proposal';
  if (source.name.startsWith('PCO —')) return 'legislation';
  return 'parliament';
}

function cleanQuery(value: string | undefined) {
  return (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function isHorizonSource(source: SourceRow) {
  return source.category === 'regulatory_horizon' ||
    source.category === 'regulatory_signal' ||
    source.name.startsWith('PCO —');
}

function parliamentSearchPayload(keyword: string) {
  return {
    id: null,
    documentPreset: 1,
    keyword,
    selectCommittee: null,
    status: [],
    documentTypes: [],
    documentSubtypes: [],
    beforeCommittee: null,
    billStages: [],
    billTab: 'All',
    billId: null,
    includeBillStages: true,
    subject: null,
    person: null,
    parliament: null,
    dateFrom: null,
    dateTo: null,
    datePeriod: null,
    restrictedFrom: null,
    restrictedTo: null,
    terminatedReason: null,
    prettyTerminatedReason: null,
    terminatedReasons: [],
    column: 17,
    direction: 1,
    pageSize: 25,
    page: 1,
  };
}

async function searchParliamentLive(query: string): Promise<RegulatoryHorizonItem[]> {
  if (!query) return [];
  const response = await fetch(PARLIAMENT_SEARCH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      Origin: 'https://bills.parliament.nz',
      Referer: 'https://bills.parliament.nz/',
      'User-Agent': 'assembl-regulatory-horizon/1.0 (+https://www.assembl.co.nz)',
    },
    body: JSON.stringify(parliamentSearchPayload(query)),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Parliament search returned ${response.status}`);
  const payload = await response.json() as ParliamentSearchResponse;

  return (payload.results ?? []).flatMap((bill) => {
    if (!bill.id || !bill.title) return [];
    const publishedAt = bill.lastStageDate ?? bill.lastModified ?? bill.publicationDate ?? null;
    return [{
      id: `parliament-live:${bill.id}`,
      title: bill.title,
      url: `https://bills.parliament.nz/v/6/${bill.id}`,
      sourceName: 'NZ Parliament — Bills API (live)',
      sourceKind: 'parliament',
      stage: parliamentStage(bill),
      detailStage: bill.billCurrentStageName ?? null,
      detectedAt: null,
      publishedAt,
      billNumber: bill.billNumber ?? null,
      status: bill.status ?? null,
    } satisfies RegulatoryHorizonItem];
  });
}

function dedupe(items: RegulatoryHorizonItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.billNumber
      ? `${item.sourceKind}:${item.billNumber}`
      : `${item.sourceKind}:${item.title.toLowerCase()}:${item.stage}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortItems(items: RegulatoryHorizonItem[], query: string) {
  const rank: Record<RegulatoryHorizonStage, number> = { SIGNAL: 0, PARLIAMENT: 1, PASSED: 2, IN_FORCE: 3 };
  items.sort((a, b) => {
    if (query && a.title.toLowerCase() === query.toLowerCase()) return -1;
    if (query && b.title.toLowerCase() === query.toLowerCase()) return 1;
    const dateA = Date.parse(a.publishedAt ?? a.detectedAt ?? '') || 0;
    const dateB = Date.parse(b.publishedAt ?? b.detectedAt ?? '') || 0;
    return dateB - dateA || rank[a.stage] - rank[b.stage];
  });
  return items;
}

export async function getRegulatoryHorizon(query?: string): Promise<{
  query: string | null;
  items: RegulatoryHorizonItem[];
  capturedAt: string;
  degraded: boolean;
  liveParliamentChecked: boolean;
}> {
  const capturedAt = new Date().toISOString();
  const q = cleanQuery(query);
  let liveItems: RegulatoryHorizonItem[] = [];
  let liveParliamentChecked = false;

  if (q) {
    try {
      liveItems = await searchParliamentLive(q);
      liveParliamentChecked = true;
    } catch {
      // The persisted Knowledge Brain remains the fallback if Parliament is unavailable.
    }
  }

  try {
    const supa = await createClient();
    const { data: sources, error: sourceError } = await supa
      .from('kb_sources')
      .select('id,name,category,config');

    if (sourceError) throw sourceError;
    const sourceRows = ((sources ?? []) as SourceRow[]).filter(isHorizonSource);
    if (!sourceRows.length) {
      return {
        query: q || null,
        items: sortItems(dedupe(liveItems), q),
        capturedAt,
        degraded: false,
        liveParliamentChecked,
      };
    }

    const sourceById = new Map(sourceRows.map((row) => [row.id, row]));
    const { data, error } = await supa
      .from('kb_documents')
      .select('id,source_id,title,url,content,published_at,inserted_at,metadata')
      .in('source_id', sourceRows.map((row) => row.id))
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(q ? 250 : 80);

    if (error) throw error;

    const needle = q.toLowerCase();
    const storedItems = ((data ?? []) as DocumentRow[]).flatMap((doc) => {
      const source = sourceById.get(doc.source_id);
      if (!source) return [];
      if (needle && !`${doc.title}\n${doc.content}`.toLowerCase().includes(needle)) return [];
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

    return {
      query: q || null,
      items: sortItems(dedupe([...liveItems, ...storedItems]), q),
      capturedAt,
      degraded: false,
      liveParliamentChecked,
    };
  } catch {
    return {
      query: q || null,
      items: sortItems(dedupe(liveItems), q),
      capturedAt,
      degraded: true,
      liveParliamentChecked,
    };
  }
}
