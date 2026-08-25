import { createClient } from '@/lib/supabase/server';
import {
  normalizeOpportunity,
  OPPORTUNITY_LIFECYCLE,
  shouldIncludeOpportunity,
  sortOpportunities,
  type OpportunityDocumentContext,
  type OpportunityHorizonItem,
  type OpportunitySourceContext,
} from '@/lib/opportunity-horizon-model';

type SourceRow = {
  id: string;
  name: string;
  type: string;
  url: string;
  category: string;
  authority_tier: number | null;
  authority_weight: number | string | null;
  provenance: string | null;
  status: string | null;
  active: boolean;
  last_checked_at: string | null;
  last_updated_at: string | null;
  consecutive_failures: number | null;
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

export type OpportunitySourceHealth = {
  id: string;
  name: string;
  url: string;
  sourceClass: string;
  authorityTier: number;
  status: string;
  active: boolean;
  optional: boolean;
  lastCheckedAt: string | null;
  lastUpdatedAt: string | null;
  consecutiveFailures: number;
};

export type OpportunityHorizonResponse = {
  query: string | null;
  lifecycle: typeof OPPORTUNITY_LIFECYCLE;
  items: OpportunityHorizonItem[];
  sources: OpportunitySourceHealth[];
  capturedAt: string;
  available: boolean;
  degraded: boolean;
  partial: boolean;
};

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function isOpportunitySource(source: SourceRow): boolean {
  return source.category === 'opportunity_horizon' ||
    Object.keys(objectValue(source.config?.opportunity)).length > 0;
}

export function cleanOpportunityQuery(value?: string): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function sourceContext(source: SourceRow): OpportunitySourceContext {
  return {
    id: source.id,
    name: source.name,
    url: source.url,
    category: source.category,
    authorityTier: source.authority_tier ?? 4,
    authorityWeight: Number(source.authority_weight ?? 0.4),
    provenance: source.provenance,
    status: source.status,
    lastCheckedAt: source.last_checked_at,
    config: source.config,
  };
}

function documentContext(document: DocumentRow): OpportunityDocumentContext {
  return {
    id: document.id,
    title: document.title,
    url: document.url,
    content: document.content,
    publishedAt: document.published_at,
    insertedAt: document.inserted_at,
    metadata: document.metadata,
  };
}

function healthFor(source: SourceRow): OpportunitySourceHealth {
  const opportunity = objectValue(source.config?.opportunity);
  return {
    id: source.id,
    name: source.name,
    url: source.url,
    sourceClass: typeof opportunity.source_class === 'string' ? opportunity.source_class : 'unknown',
    authorityTier: source.authority_tier ?? 4,
    status: source.status ?? 'unknown',
    active: source.active,
    optional: opportunity.optional === true,
    lastCheckedAt: source.last_checked_at,
    lastUpdatedAt: source.last_updated_at,
    consecutiveFailures: source.consecutive_failures ?? 0,
  };
}

export async function getOpportunityHorizon(query?: string): Promise<OpportunityHorizonResponse> {
  const capturedAt = new Date().toISOString();
  const q = cleanOpportunityQuery(query);

  try {
    const supabase = await createClient();
    const { data: sourceData, error: sourceError } = await supabase
      .from('kb_sources')
      .select('id,name,type,url,category,authority_tier,authority_weight,provenance,status,active,last_checked_at,last_updated_at,consecutive_failures,config');

    if (sourceError) throw sourceError;
    const sourceRows = ((sourceData ?? []) as SourceRow[]).filter(isOpportunitySource);
    const sources = sourceRows.map(healthFor).sort((a, b) => a.authorityTier - b.authorityTier || a.name.localeCompare(b.name));
    const partial = sources.some((source) => source.active && ['error', 'paused'].includes(source.status));

    if (!sourceRows.length) {
      return {
        query: q || null,
        lifecycle: OPPORTUNITY_LIFECYCLE,
        items: [],
        sources: [],
        capturedAt,
        available: false,
        degraded: false,
        partial: false,
      };
    }

    const sourceById = new Map(sourceRows.map((source) => [source.id, source]));
    const { data: documentData, error: documentError } = await supabase
      .from('kb_documents')
      .select('id,source_id,title,url,content,published_at,inserted_at,metadata')
      .in('source_id', sourceRows.map((source) => source.id))
      .order('published_at', { ascending: false, nullsFirst: false })
      .limit(q ? 500 : 180);

    if (documentError) throw documentError;
    const needle = q.toLowerCase();
    const items = ((documentData ?? []) as DocumentRow[]).flatMap((document) => {
      const source = sourceById.get(document.source_id);
      if (!source) return [];
      const corpus = `${document.title}\n${document.content}`;
      if (needle && !corpus.toLowerCase().includes(needle)) return [];
      const sourceCtx = sourceContext(source);
      const documentCtx = documentContext(document);
      if (!shouldIncludeOpportunity(sourceCtx, documentCtx)) return [];
      return [normalizeOpportunity({ source: sourceCtx, document: documentCtx, query: q || undefined })];
    });

    return {
      query: q || null,
      lifecycle: OPPORTUNITY_LIFECYCLE,
      items: sortOpportunities(items).slice(0, 80),
      sources,
      capturedAt,
      available: true,
      degraded: false,
      partial,
    };
  } catch {
    // A missing database or optional source must not turn this into a 500.
    return {
      query: q || null,
      lifecycle: OPPORTUNITY_LIFECYCLE,
      items: [],
      sources: [],
      capturedAt,
      available: false,
      degraded: true,
      partial: true,
    };
  }
}
