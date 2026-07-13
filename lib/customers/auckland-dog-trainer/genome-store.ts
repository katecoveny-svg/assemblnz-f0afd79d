/**
 * Business Genome store — the genome as real data.
 *
 * Facts live in Supabase (`living_site_genome`, seeded by migration
 * 20260718100000) and are read server-side by every surface: the public
 * /living-site demo, Sam's public landing page, and the gated ops console.
 * Edit a row once and every surface renders the new value on next load.
 *
 * Falls back to the in-repo GENOME_FACTS when the database is unreachable
 * (local dev without service keys, preview branches) so the demo never 500s.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import {
  GENOME_FACTS,
  type GenomeFact,
  type GenomeSection,
  type GenomeVerification,
  type SurfaceId,
} from './genome';

export const GENOME_TENANT = 'auckland-dog-trainer';

type GenomeRow = {
  fact_id: string;
  section: string;
  label: string;
  value: string;
  read_by: string[] | null;
  // provenance columns (migration 20260722090000) — absent on older DBs
  source?: string | null;
  verification?: string | null;
  confidence?: number | null;
  verified_at?: string | null;
};

const VERIFICATIONS: GenomeVerification[] = [
  'confirmed',
  'inferred',
  'suggested',
  'stale',
  'conflicting',
];

export type GenomeRead = { facts: GenomeFact[]; live: boolean };

const SECTION_ORDER: GenomeSection[] = [
  'identity',
  'services',
  'team',
  'knowledge',
  'proof',
  'operations',
];

function rowToFact(row: GenomeRow): GenomeFact {
  return {
    id: row.fact_id,
    section: (SECTION_ORDER.includes(row.section as GenomeSection)
      ? row.section
      : 'operations') as GenomeSection,
    label: row.label,
    value: row.value,
    readBy: (row.read_by ?? []) as SurfaceId[],
    source: row.source ?? undefined,
    verification: VERIFICATIONS.includes(row.verification as GenomeVerification)
      ? (row.verification as GenomeVerification)
      : undefined,
    confidence: row.confidence ?? undefined,
    verifiedAt: row.verified_at ?? undefined,
  };
}

/**
 * Live genome for ANY tenant, ordered like its canonical fallback list
 * (facts added in the DB but unknown to the repo are kept, grouped last).
 * Falls back to `fallback` whenever the DB/keys are unavailable.
 */
export async function getGenomeFactsFor(
  tenant: string,
  fallback: GenomeFact[],
  opts?: {
    /** Include suggested/inferred/stale facts. ONLY for the owner's review
     *  surfaces — public sites and agent grounding must never see them. */
    includeUnverified?: boolean;
  },
): Promise<GenomeRead> {
  try {
    const supabase = getServiceClient();
    // select('*') so the read works with or without the provenance columns
    const { data, error } = await supabase
      .from('living_site_genome')
      .select('*')
      .eq('tenant', tenant);
    if (error || !data || data.length === 0) {
      return { facts: fallback, live: false };
    }
    const rows = (data as GenomeRow[]).filter(
      (r) =>
        opts?.includeUnverified ||
        !r.verification ||
        r.verification === 'confirmed',
    );
    if (rows.length === 0) return { facts: fallback, live: false };
    const byId = new Map(rows.map((r) => [r.fact_id, rowToFact(r)]));
    const ordered: GenomeFact[] = [];
    for (const fact of fallback) {
      const live = byId.get(fact.id);
      ordered.push(live ?? fact);
      byId.delete(fact.id);
    }
    for (const extra of byId.values()) ordered.push(extra);
    return { facts: ordered, live: true };
  } catch {
    return { facts: fallback, live: false };
  }
}

/** Live genome for the flagship dog-training tenant (confirmed facts). */
export async function getLiveGenomeFacts(): Promise<GenomeRead> {
  return getGenomeFactsFor(GENOME_TENANT, GENOME_FACTS);
}

/** The owner's review read: includes suggested/inferred/stale facts so the
 *  console can show what needs confirmation. Never use on public surfaces. */
export async function getLiveGenomeFactsForReview(): Promise<GenomeRead> {
  return getGenomeFactsFor(GENOME_TENANT, GENOME_FACTS, { includeUnverified: true });
}

export type LiveEnquiry = {
  id: string;
  name: string;
  email: string;
  dog: string | null;
  message: string;
  source: string;
  /** Pre-formatted NZ-time display string — formatted server-side so the
   *  client component that renders it can never hydration-mismatch. */
  when: string;
};

const whenFormat = new Intl.DateTimeFormat('en-NZ', {
  timeZone: 'Pacific/Auckland',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/**
 * Recent public-website enquiries for the ops console — the other half of
 * the enquiry loop. Returns [] when the DB/keys are unavailable so the
 * console falls back to its sample leads without erroring.
 */
export async function getRecentEnquiries(limit = 8, tenant: string = GENOME_TENANT): Promise<LiveEnquiry[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_enquiries')
      .select('id, name, email, dog, message, source, created_at')
      .eq('tenant', tenant)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((r) => ({
      id: String(r.id),
      name: r.name,
      email: r.email,
      dog: r.dog ?? null,
      message: r.message,
      source: r.source,
      when: whenFormat.format(new Date(r.created_at)),
    }));
  } catch {
    return [];
  }
}

/**
 * Store a public landing-page enquiry. Returns false when the DB is down.
 * `tenant` defaults to the flagship; callers must validate it against the
 * known sample-vertical tenants before passing anything user-influenced.
 * The `dog` column predates the multi-vertical pivot — it now carries each
 * vertical's "detail" line (shipment, project, booking…).
 */
export async function storeEnquiry(input: {
  name: string;
  email: string;
  dog?: string;
  message: string;
  tenant?: string;
}): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('living_site_enquiries').insert({
      tenant: input.tenant ?? GENOME_TENANT,
      name: input.name,
      email: input.email,
      dog: input.dog ?? null,
      message: input.message,
      source: 'landing',
    });
    return !error;
  } catch {
    return false;
  }
}
