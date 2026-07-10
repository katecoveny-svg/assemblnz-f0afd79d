/**
 * Business Genome store — the genome as real data.
 *
 * Facts live in Supabase (`living_site_genome`, seeded by migration
 * 20260718100000) and are read server-side by every surface: the public
 * /living-site demo, Fred's public landing page, and the gated ops console.
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
  type SurfaceId,
} from './genome';

export const GENOME_TENANT = 'auckland-dog-trainer';

type GenomeRow = {
  fact_id: string;
  section: string;
  label: string;
  value: string;
  read_by: string[] | null;
};

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
  };
}

/** Live genome, ordered like the canonical fact list (new facts appended). */
export async function getLiveGenomeFacts(): Promise<GenomeRead> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_genome')
      .select('fact_id, section, label, value, read_by')
      .eq('tenant', GENOME_TENANT);
    if (error || !data || data.length === 0) {
      return { facts: GENOME_FACTS, live: false };
    }
    const byId = new Map((data as GenomeRow[]).map((r) => [r.fact_id, rowToFact(r)]));
    const ordered: GenomeFact[] = [];
    for (const fact of GENOME_FACTS) {
      const live = byId.get(fact.id);
      ordered.push(live ?? fact);
      byId.delete(fact.id);
    }
    // facts added in the DB but unknown to the repo — keep them, grouped last
    for (const extra of byId.values()) ordered.push(extra);
    return { facts: ordered, live: true };
  } catch {
    return { facts: GENOME_FACTS, live: false };
  }
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
export async function getRecentEnquiries(limit = 8): Promise<LiveEnquiry[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('living_site_enquiries')
      .select('id, name, email, dog, message, source, created_at')
      .eq('tenant', GENOME_TENANT)
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

/** Store a public landing-page enquiry. Returns false when the DB is down. */
export async function storeEnquiry(input: {
  name: string;
  email: string;
  dog?: string;
  message: string;
}): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const { error } = await supabase.from('living_site_enquiries').insert({
      tenant: GENOME_TENANT,
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
