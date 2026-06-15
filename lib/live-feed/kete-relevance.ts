/**
 * UI helpers for rendering a live_feed_entry's kete relevance and capability
 * signals. The actual scoring is done once at ingest time in
 * supabase/functions/live-feed-gets-poll/capability-matcher.ts (and equivalent
 * files for future feeds) — this file is the read-side only.
 *
 * Keep this module Pure TS with no runtime imports beyond ./types and the
 * shared kete registry. It is rendered inside React Server Components.
 */
import { KETES, type Kete, type KeteSlug } from '@/lib/kete';
import {
  HIGH_MATCH_THRESHOLD,
  MEDIUM_MATCH_THRESHOLD,
  type CapabilityAssessment,
  type CapabilitySignal,
  type KeteRelevance,
} from './types';

export type MatchBand = 'high' | 'medium' | 'low';

/**
 * Canonical kete tagging. Incoming feed/source tags historically used a few
 * non-canonical pack names; map them to the canonical 9 (or the shared
 * `cross` bucket for cross-cutting sources). The canonical names themselves
 * pass through unchanged. Used on the read side and by the one-shot backfill.
 */
/** The canonical kete tags: the 9 ketes plus `cross` for cross-cutting. */
export const CANONICAL_KETE_PACKS = [
  'manaaki', 'waihanga', 'auaha', 'arataki', 'pikau', 'ako', 'matauranga', 'hoko', 'toro', 'cross',
] as const;

const CANONICAL_KETE = new Set<string>(CANONICAL_KETE_PACKS);

// Legacy / non-canonical pack names → canonical. The named sources behind
// these were general or cross-cutting (news, government, security), so they
// resolve to `cross` rather than a specialist kete.
const KETE_PACK_ALIASES: Record<string, string> = {
  pakihi: 'cross',     // old general-business codename
  hangarau: 'cross',   // old technology codename
  muse: 'cross',       // general media
  kahu: 'cross',       // general / regional news
  flux: 'cross',       // general / finance news
  whenua: 'cross',     // land / hazard, cross-cutting
};

/** Map a single pack name to its canonical equivalent. */
export function normalizeKetePack(pack: string): string {
  return KETE_PACK_ALIASES[pack] ?? pack;
}

/**
 * Normalise a list of pack tags to the canonical set, de-duplicated and with
 * any unknown tokens dropped so non-canonical names can never surface.
 */
export function normalizeKetePacks(packs: readonly string[]): string[] {
  const out: string[] = [];
  for (const raw of packs) {
    const mapped = normalizeKetePack(raw);
    if (CANONICAL_KETE.has(mapped) && !out.includes(mapped)) out.push(mapped);
  }
  return out;
}

/**
 * Validate raw pack tags against the canonical allow-list. Ingest paths should
 * reject (HTTP 400) any payload whose tags aren't canonical, echoing the
 * allow-list so the source-side tagger can correct itself.
 */
export function validateKetePacks(packs: readonly string[]): { ok: boolean; invalid: string[] } {
  const invalid = packs.filter((p) => !CANONICAL_KETE.has(p));
  return { ok: invalid.length === 0, invalid };
}

/**
 * Map a 0..100 capability score to a discrete band. Thresholds are defined
 * once in ./types and used everywhere — change them there if calibration
 * shifts.
 */
export function bandForScore(score: number): MatchBand {
  if (score >= HIGH_MATCH_THRESHOLD) return 'high';
  if (score >= MEDIUM_MATCH_THRESHOLD) return 'medium';
  return 'low';
}

/** Plain-English label for a match band, for tooltips and badges. */
export function labelForBand(band: MatchBand): string {
  switch (band) {
    case 'high':
      return 'high match — assembl could credibly respond';
    case 'medium':
      return 'medium match — worth a scan';
    case 'low':
      return 'low match — logged for reference only';
  }
}

/**
 * Return the kete that scored above zero, sorted highest first. UI uses this
 * to render a row of kete chips.
 */
export function topRelevantKete(
  relevance: KeteRelevance,
  limit = 4,
): Array<{ kete: Kete; score: number }> {
  const entries: Array<{ kete: Kete; score: number }> = [];
  for (const kete of KETES) {
    const s = relevance[kete.slug];
    if (typeof s === 'number' && s > 0) entries.push({ kete, score: s });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.slice(0, limit);
}

/**
 * Group the signals on an assessment by sign (positive vs negative) and
 * sort by absolute points desc. Helps the UI render a clean "why this score"
 * breakdown.
 */
export function groupSignals(assessment: CapabilityAssessment | null): {
  positive: CapabilitySignal[];
  negative: CapabilitySignal[];
} {
  if (!assessment) return { positive: [], negative: [] };
  const positive: CapabilitySignal[] = [];
  const negative: CapabilitySignal[] = [];
  for (const sig of assessment.signals) {
    if (sig.points >= 0) positive.push(sig);
    else negative.push(sig);
  }
  positive.sort((a, b) => b.points - a.points);
  negative.sort((a, b) => a.points - b.points);
  return { positive, negative };
}

/** Tailwind colour token for a band, matching the kaupapa page palette. */
export function bandClasses(band: MatchBand): {
  badge: string;
  bar: string;
} {
  switch (band) {
    case 'high':
      return {
        badge: 'bg-pounamu-100 text-pounamu-900 border-pounamu-300',
        bar: 'bg-pounamu-600',
      };
    case 'medium':
      return {
        badge: 'bg-karaka-100 text-karaka-900 border-karaka-300',
        bar: 'bg-karaka-500',
      };
    case 'low':
      return {
        badge: 'bg-mist-100 text-taupe-700 border-taupe-300',
        bar: 'bg-taupe-400',
      };
  }
}

export function formatKeteList(relevance: KeteRelevance): string {
  const top = topRelevantKete(relevance);
  if (top.length === 0) return 'no kete match';
  return top.map(({ kete, score }) => `${kete.name} ${score}`).join(' · ');
}

/**
 * For accessibility labels — describe a tender's capability assessment in a
 * sentence. e.g. "score 84/100, high match, top signals: kete:waihanga (+20),
 * mentions agent (+25)".
 */
export function describeAssessment(
  assessment: CapabilityAssessment | null,
): string {
  if (!assessment) return 'assessment pending';
  const band = bandForScore(assessment.score);
  const { positive } = groupSignals(assessment);
  const topThree = positive
    .slice(0, 3)
    .map((s) => `${s.label} (+${s.points})`)
    .join(', ');
  return `score ${assessment.score}/100, ${band} match${topThree ? `, top signals: ${topThree}` : ''}`;
}

/** Re-export the slug constants the UI commonly needs for type-narrowing. */
export type { Kete, KeteSlug };
