import { createClient } from '@supabase/supabase-js';
import { PUBLIC_MARKETPLACE_AGENTS } from '@/lib/marketplace/agents';

/**
 * LIVE agent counts for the v2 marketing surfaces.
 *
 * Hard rule (DIRECTION-LOCKED-2026-07-01): never fabricate metrics — show
 * real numbers or show nothing. The primary source is the Supabase `agents`
 * table (the seeded mirror of the code registry). If Supabase is unreachable
 * the fallback is the code registry itself (lib/marketplace/agents.ts), which
 * is the roster's source of truth — still a real count, never an invention.
 */

export type LiveCounts = {
  /** total agents with status = 'live' */
  total: number;
  /** live agents per bundle slug (only bundles that have members counted) */
  byBundle: Record<string, number>;
  /** where the numbers came from */
  source: 'supabase' | 'registry';
};

function registryCounts(): LiveCounts {
  const live = PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.status === 'live');
  const byBundle: Record<string, number> = {};
  for (const a of live) {
    if (a.bundle) byBundle[a.bundle] = (byBundle[a.bundle] ?? 0) + 1;
  }
  return { total: live.length, byBundle, source: 'registry' };
}

export async function getLiveAgentCounts(): Promise<LiveCounts> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return registryCounts();

  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from('agents')
      .select('slug,bundle,status')
      .eq('status', 'live');

    if (error || !data || data.length === 0) return registryCounts();

    const byBundle: Record<string, number> = {};
    for (const row of data as Array<{ bundle: string | null }>) {
      if (row.bundle) byBundle[row.bundle] = (byBundle[row.bundle] ?? 0) + 1;
    }
    return { total: data.length, byBundle, source: 'supabase' };
  } catch {
    return registryCounts();
  }
}

/** Live members of one bundle, from the code registry (real, never invented). */
export function registryLiveBundleCount(bundleSlug: string): number {
  return PUBLIC_MARKETPLACE_AGENTS.filter(
    (a) => a.bundle === bundleSlug && a.status === 'live',
  ).length;
}
