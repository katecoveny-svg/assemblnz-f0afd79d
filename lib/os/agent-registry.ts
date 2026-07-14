/**
 * Agent Definition Registry — the system of record for agent releases.
 *
 * (Kate's Mistral-watch note, 2026-07-13.) Agent instructions, skills,
 * model policy and approval logic are production business logic and must be
 * governed like it: versioned, owned, evaluated, and deployed as IMMUTABLE
 * releases — not anonymous prompt strings scattered through source files.
 *
 * Provider-neutral by design: this lives in Assembl's own database
 * (`agent_releases`), so assembl retains control of its core business
 * logic. Mistral Studio validated the pattern; it is not a dependency.
 *
 * Every completed task records exactly which agent release, prompt, skill,
 * genome-schema, model and policy versions produced the result — recorded
 * beside the proof ledger (os_evidence).
 *
 * Immutability: a release is content-hashed on publish and never updated;
 * a new version is a new row. verifyRelease() recomputes the hash so tamper
 * is detectable.
 */
import 'server-only';
import { createHash } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

export type ReleaseStatus = 'draft' | 'production' | 'retired';

/** The immutable, provider-neutral definition of one agent release. */
export type AgentDefinition = {
  agentId: string;
  version: string; // semver, e.g. '1.0.0'
  promptVersion: string;
  skillVersions: Record<string, string>;
  genomeSchemaVersion: string;
  modelPolicyVersion: string;
  owner: string;
  status: ReleaseStatus;
  /** Role summary + the governed instruction refs (never tenant data). */
  role: string;
  responsibilities: string[];
  capabilities: string[];
  evidenceRequirements: string[];
  /** Null until the Assembl evals score this release on real workflows. */
  evaluationScore: number | null;
};

/** Deterministic JSON so the content hash is stable across runs. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`)
    .join(',')}}`;
}

/** SHA-256 over the definition — the release's tamper-evident identity. */
export function contentHash(def: AgentDefinition): string {
  return createHash('sha256').update(stableStringify(def)).digest('hex');
}

/** Compare two semvers; returns >0 if a is newer. */
export function semverCompare(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  }
  return 0;
}

/* ── the seed: the current OS agents as v1.0.0 governed releases ──────────
 * genome schema v2 = provenance columns added (migration 20260722090000);
 * model policy v1 = the Model & Capability Router (lib/os/routing.ts). */
export const SEED_RELEASES: readonly AgentDefinition[] = [
  {
    agentId: 'desk',
    version: '1.0.0',
    promptVersion: '1',
    skillVersions: { draftEnquiryReply: '1', groundInConfirmedFacts: '1' },
    genomeSchemaVersion: '2',
    modelPolicyVersion: '1',
    owner: 'operations',
    status: 'production',
    role: 'Customer communications',
    responsibilities: [
      'answer enquiries from the Business Genome',
      'draft replies for the owner to approve',
      'never commit to prices, times or promises outside confirmed facts',
    ],
    capabilities: ['read_genome', 'send_customer_email', 'create_task', 'suggest_genome_fact'],
    evidenceRequirements: ['model_call', 'draft', 'approval'],
    evaluationScore: null,
  },
  {
    agentId: 'operations',
    version: '1.0.0',
    promptVersion: '1',
    skillVersions: { triageBooking: '1' },
    genomeSchemaVersion: '2',
    modelPolicyVersion: '1',
    owner: 'operations',
    status: 'production',
    role: 'Bookings & delivery',
    responsibilities: [
      'triage booking requests against the booking rules',
      'keep the day runnable — flag conflicts before they bite',
    ],
    capabilities: ['read_genome', 'create_task', 'create_calendar_event'],
    evidenceRequirements: ['record_change'],
    evaluationScore: null,
  },
  {
    agentId: 'knowledge',
    version: '1.0.0',
    promptVersion: '1',
    skillVersions: { proposeGenomeFact: '1', flagStaleFact: '1' },
    genomeSchemaVersion: '2',
    modelPolicyVersion: '1',
    owner: 'operations',
    status: 'production',
    role: 'Institutional memory',
    responsibilities: [
      'notice recurring questions and propose new genome facts',
      'flag stale or conflicting facts for review',
    ],
    capabilities: ['read_genome', 'search_knowledge', 'suggest_genome_fact', 'create_task'],
    evidenceRequirements: ['note'],
    evaluationScore: null,
  },
];

type ReleaseRow = {
  agent_id: string;
  version: string;
  prompt_version: string;
  skill_versions: Record<string, string> | null;
  genome_schema_version: string;
  model_policy_version: string;
  owner: string;
  status: string;
  evaluation_score: number | null;
  definition: AgentDefinition;
  content_hash: string;
  released_at: string;
};

/**
 * Publish a release — append-only. If (agentId, version) already exists it
 * is left untouched (releases are immutable). Returns the content hash.
 */
export async function publishRelease(def: AgentDefinition): Promise<string | null> {
  const hash = contentHash(def);
  try {
    const supabase = getServiceClient();
    await supabase.from('agent_releases').upsert(
      {
        agent_id: def.agentId,
        version: def.version,
        prompt_version: def.promptVersion,
        skill_versions: def.skillVersions,
        genome_schema_version: def.genomeSchemaVersion,
        model_policy_version: def.modelPolicyVersion,
        owner: def.owner,
        status: def.status,
        evaluation_score: def.evaluationScore,
        definition: def,
        content_hash: hash,
      },
      { onConflict: 'agent_id,version', ignoreDuplicates: true },
    );
    return hash;
  } catch {
    return null;
  }
}

/** The current production release for an agent (highest version). Falls back
 *  to the in-code seed so provenance always resolves, even pre-seed. */
export async function getProductionRelease(agentId: string): Promise<AgentDefinition | null> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('agent_releases')
      .select('definition, version')
      .eq('agent_id', agentId)
      .eq('status', 'production');
    const rows = (data ?? []) as Array<{ definition: AgentDefinition; version: string }>;
    if (rows.length > 0) {
      rows.sort((a, b) => semverCompare(b.version, a.version));
      return rows[0].definition;
    }
  } catch {
    /* fall through to seed */
  }
  return SEED_RELEASES.find((r) => r.agentId === agentId && r.status === 'production') ?? null;
}

/** All releases for an agent, newest first (the governance history). */
export async function listReleases(agentId: string): Promise<ReleaseRow[]> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('agent_releases')
      .select('*')
      .eq('agent_id', agentId)
      .order('released_at', { ascending: false })
      .limit(50);
    return (data ?? []) as ReleaseRow[];
  } catch {
    return [];
  }
}

/** The version stamp recorded on a task's evidence — the exact recipe that
 *  produced a result, provider-neutral. */
export function provenanceStamp(def: AgentDefinition, model: string) {
  return {
    agentId: def.agentId,
    agentVersion: def.version,
    promptVersion: def.promptVersion,
    skillVersions: def.skillVersions,
    genomeSchemaVersion: def.genomeSchemaVersion,
    modelPolicyVersion: def.modelPolicyVersion,
    model,
  };
}

/** Recompute the hash and compare — tamper detection for a stored release. */
export function verifyRelease(def: AgentDefinition, storedHash: string): boolean {
  return contentHash(def) === storedHash;
}
