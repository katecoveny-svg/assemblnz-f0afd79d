/**
 * Live-feed shared types. Mirrors the live_feed_* tables added in
 * 20260523080000_live_feed_foundation.sql. Used by Next.js server components
 * and route handlers. Supabase edge functions duplicate the shape under the
 * Deno runtime — keep both in sync when changing the schema.
 */
import type { ManaReceipt } from '@/lib/evidence/types';
import type { KeteSlug } from '@/lib/kete';

export type LiveFeedSourceKind = 'rss' | 'json' | 'html' | 'mixed';

export interface LiveFeedSource {
  slug: string;
  name: string;
  kind: LiveFeedSourceKind;
  url: string;
  description: string | null;
  enabled: boolean;
  poll_cron_hint: string | null;
  last_polled_at: string | null;
  last_success_at: string | null;
  consecutive_failures: number;
  created_at: string;
  updated_at: string;
}

export type LiveFeedEntryStatus =
  | 'new'
  | 'reviewing'
  | 'go'
  | 'no_go'
  | 'drafted'
  | 'submitted'
  | 'archived';

/**
 * One signal that contributed to a capability assessment. `points` is signed:
 * positive = increases the score, negative = decreases it (we don't use
 * negatives yet but reserved for future tuning).
 */
export interface CapabilitySignal {
  label: string;
  points: number;
  /** Short evidence string. e.g. matched keyword, agency name, threshold. */
  evidence?: string;
}

export interface CapabilityAssessment {
  /** 0..100, clamped. */
  score: number;
  signals: CapabilitySignal[];
  assessed_at: string;
  /**
   * Internal-flavoured Mana Receipt covering the assessment. key_id is
   * `assembl-internal-capability-v1` and the signature is a placeholder —
   * these are not customer-facing legal artefacts yet, just the schema-shaped
   * attestation so the Evidence ledger can render them.
   */
  mana_receipt: ManaReceipt;
}

/**
 * Per-kete relevance scores, 0..100. Sparse — only kete that scored above 0
 * appear. Used for filtering "which kete cares about this entry".
 */
export type KeteRelevance = Partial<Record<KeteSlug, number>>;

/**
 * GETS-specific tender_meta shape. Different feeds will have different
 * tender_meta shapes; the `feed_kind` discriminator separates them.
 */
export interface GetsTenderMeta {
  feed_kind: 'gets';
  rfx_id: string;
  ref_number: string | null;
  agency: string | null;
  /** RFP, RFT, RFI, NOI, ROI, or other. */
  tender_type: string | null;
  close_at: string | null;
  detail_url: string | null;
  /** Free-text response format requirements if extracted. */
  response_format: string | null;
  /** Best-effort: amount in NZD if a budget hint was extracted. null otherwise. */
  budget_nzd_estimate: number | null;
  /** Drafted go/no-go reasoning. Null until generated. */
  go_no_go: {
    decision: 'go' | 'no_go' | 'tbd';
    reasoning: string;
    drafted_at: string;
  } | null;
  /** Drafted response, only present for 70+ score entries. */
  response_draft: {
    body: string;
    drafted_at: string;
    model: string;
  } | null;
}

export type TenderMeta = GetsTenderMeta; // union as more feeds are added

export interface LiveFeedEntry {
  id: string;
  source_slug: string;
  external_id: string;
  title: string;
  summary: string | null;
  url: string | null;
  published_at: string | null;
  content_hash: string | null;
  kete_relevance: KeteRelevance;
  capability_assessment: CapabilityAssessment | null;
  capability_score: number;
  tender_meta: TenderMeta | null;
  status: LiveFeedEntryStatus;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type LiveFeedLogStatus = 'running' | 'ok' | 'error' | 'skipped_time_gate';

export interface LiveFeedLog {
  id: number;
  source_slug: string;
  started_at: string;
  finished_at: string | null;
  status: LiveFeedLogStatus;
  entries_fetched: number;
  entries_inserted: number;
  entries_updated: number;
  entries_notified: number;
  duration_ms: number | null;
  error: { message?: string; [key: string]: unknown } | null;
  notes: string | null;
}

/** Threshold above which a tender is "high match" and triggers a notification. */
export const HIGH_MATCH_THRESHOLD = 70;
/** Threshold above which a tender is "medium match" and gets a summary in the UI. */
export const MEDIUM_MATCH_THRESHOLD = 40;
