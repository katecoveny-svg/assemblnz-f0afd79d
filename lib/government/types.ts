import type { Agent } from '@/lib/agents';

export type CrownAgency = 'msd' | 'ird' | 'moe' | 'ot' | 'twe' | 'mbie';

export type DataResidency = 'nz-only' | 'nz-or-au' | 'global';

export interface PaeCertifications {
  nzism: 'aligned' | 'pending' | 'not-required';
  iso27001: 'certified' | 'in-progress' | 'planned';
  soc2: 'type-ii' | 'type-i' | 'planned';
  cloudCodeOfPractice: boolean;
  meadsTested: boolean;
  tiritiImpactStatement: 'completed' | 'in-progress' | 'planned';
}

export interface PaeAgent extends Agent {
  /** Public Assembly names lead with English; te reo appears as secondary descriptor only. */
  subtitle?: string;
  agency: CrownAgency;
  /** Crown-side legal basis the agent's outputs rely on. */
  statutoryBasis: string[];
  /** Always-present approver role on the human side. */
  humanApprover: string;
  /** Required PIA scope. */
  privacyImpact: {
    sensitiveDataKinds: string[];
    consentModel: 'opt-in' | 'opt-in-with-revocation' | 'statutory';
    retentionMonths: number;
  };
  dataResidency: DataResidency;
  certifications: PaeCertifications;
  /** RFC 3161 Time-Stamp Authority used for Crown-side timestamping. */
  timestampAuthority: 'govtsa' | 'digicert-nz' | null;
  /** SLA the Crown contract holds Public Assembly to. */
  serviceLevel: {
    responseSeconds: number;
    availabilityNinety: number;
  };
  /** Iwi sponsorship — required for OT, MSD whānau work. */
  iwiSponsor: {
    required: boolean;
    entity?: string;
    advisorRoles: string[];
  };
}

export interface PCOCitation {
  documentId: string;
  title: string;
  url: string | null;
  snippet: string;
  sourceName: string;
  publishedAt: string | null;
  similarity: number;
  authorityTier: number | null;
  authorityWeight: number | null;
  weightedScore: number;
}

export type SupabaseRpcClient = {
  rpc: (
    fn: 'match_kb_knowledge' | string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message?: string } | null }>;
};

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function citeFromPCO(
  supabase: SupabaseRpcClient,
  queryEmbedding: number[],
  agentPack: string | null,
  topK = 5,
): Promise<PCOCitation[]> {
  if (!Array.isArray(queryEmbedding) || queryEmbedding.length === 0) return [];

  const { data, error } = await supabase.rpc('match_kb_knowledge', {
    query_embedding: queryEmbedding,
    agent_pack: agentPack,
    top_k: topK,
  });

  if (error) {
    throw new Error(`PCO citation retrieval failed: ${error.message ?? 'unknown error'}`);
  }

  return (Array.isArray(data) ? data : []).map((row) => {
    const hit = row as Record<string, unknown>;
    return {
      documentId: String(hit.document_id ?? ''),
      title: String(hit.title ?? 'Untitled legislation source'),
      url: typeof hit.url === 'string' ? hit.url : null,
      snippet: String(hit.snippet ?? ''),
      sourceName: String(hit.source_name ?? 'PCO New Zealand Legislation API'),
      publishedAt: typeof hit.published_at === 'string' ? hit.published_at : null,
      similarity: toNumber(hit.similarity),
      authorityTier: hit.authority_tier == null ? null : toNumber(hit.authority_tier),
      authorityWeight: hit.authority_weight == null ? null : toNumber(hit.authority_weight),
      weightedScore: toNumber(hit.weighted_score),
    };
  });
}
