/**
 * Pearl Live — server-side aggregator for the homepage live counters.
 * Spec: voyage-evidence-craft.md follow-up / future-of-meaningful-work thread.
 *
 * Returns the snapshot rendered above the fold on the homepage:
 *   - packs drafting right now
 *   - packs sealed in the last hour
 *   - positive outcomes today (BCAs accepted, Customs cleared, invoices paid)
 *   - drafts in human-review queues
 *
 * The numbers are aggregated across all tenants. No tenant-specific data
 * surfaces here — this is brand storytelling, not a dashboard.
 *
 * Resilience: if the Supabase tables are missing (early branches, dev
 * environments without migrations applied), this returns a quiet snapshot
 * (zeros) rather than crashing. The page handles zeros gracefully.
 */

import { createClient } from '@/lib/supabase/server';

export interface PearlLiveStats {
  draftingNow: number;
  sealedLastHour: number;
  positiveOutcomesToday: number;
  draftsInReview: number;
  /** ISO 8601 timestamp the snapshot was taken. */
  capturedAt: string;
  /** True if any of the underlying tables errored. The page shows zeros. */
  degraded: boolean;
}

const QUIET: Omit<PearlLiveStats, 'capturedAt'> = {
  draftingNow: 0,
  sealedLastHour: 0,
  positiveOutcomesToday: 0,
  draftsInReview: 0,
  degraded: true,
};

export async function getPearlLiveStats(): Promise<PearlLiveStats> {
  const capturedAt = new Date().toISOString();

  try {
    const supa = await createClient();

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const startOfNzDay = startOfNzDayIso();

    const [sealedHour, positiveToday, drafting, inReview] = await Promise.all([
      supa
        .from('evidence_packs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'sealed')
        .gte('sealed_at', oneHourAgo),
      supa
        .from('outcome_events')
        .select('id', { count: 'exact', head: true })
        .eq('result', 'positive')
        .gte('observed_at', startOfNzDay),
      supa
        .from('evidence_packs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'draft'),
      supa
        .from('reasoning_traces')
        .select('id', { count: 'exact', head: true })
        .is('quality_score', null)
        .gte('created_at', startOfNzDay),
    ]);

    const errored =
      sealedHour.error || positiveToday.error || drafting.error || inReview.error;
    if (errored) {
      return { ...QUIET, capturedAt };
    }

    return {
      draftingNow: drafting.count ?? 0,
      sealedLastHour: sealedHour.count ?? 0,
      positiveOutcomesToday: positiveToday.count ?? 0,
      draftsInReview: inReview.count ?? 0,
      capturedAt,
      degraded: false,
    };
  } catch {
    return { ...QUIET, capturedAt };
  }
}

function startOfNzDayIso(): string {
  // Compute midnight in Pacific/Auckland for "today" semantics. NZ is
  // UTC+12 standard, +13 daylight savings. We use Intl to find the
  // current NZ date, then construct the local midnight as UTC.
  const fmt = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const y = get('year');
  const m = get('month');
  const d = get('day');

  // Determine NZ offset right now by comparing UTC and NZ wall time.
  const nowNzWall = new Date(`${y}-${m}-${d}T00:00:00`);
  const fmtUtc = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: 'numeric',
    hour12: false,
  });
  const nowUtcHour = parseInt(fmtUtc.format(new Date()), 10);
  const nowNzHour = parseInt(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Pacific/Auckland',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10,
  );
  let offsetHours = nowNzHour - nowUtcHour;
  if (offsetHours < -12) offsetHours += 24;
  if (offsetHours > 14) offsetHours -= 24;

  // NZ midnight as UTC
  const utcMidnight = new Date(nowNzWall.getTime() - offsetHours * 3600 * 1000);
  return utcMidnight.toISOString();
}
