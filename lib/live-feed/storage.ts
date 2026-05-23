/**
 * Server-side query helpers for live_feed_* tables. Used by Next.js server
 * components and route handlers under app/internal/tenders/*.
 *
 * Edge functions (Deno runtime) talk to the same tables but go straight
 * through the service-role admin client they create at startup — they do
 * NOT import from this file.
 */
import { createClient } from '@/lib/supabase/server';
import type {
  LiveFeedEntry,
  LiveFeedEntryStatus,
  LiveFeedLog,
  LiveFeedSource,
} from './types';

export interface ListEntriesOptions {
  sourceSlug?: string;
  minScore?: number;
  /** If provided, restricts the list to these statuses. */
  statuses?: LiveFeedEntryStatus[];
  limit?: number;
}

/**
 * List entries for a feed, ordered by capability_score desc then
 * published_at desc — high-match tenders first, recent first within a band.
 */
export async function listLiveFeedEntries(
  opts: ListEntriesOptions = {},
): Promise<LiveFeedEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from('live_feed_entries')
    .select('*')
    .order('capability_score', { ascending: false })
    .order('published_at', { ascending: false });

  if (opts.sourceSlug) query = query.eq('source_slug', opts.sourceSlug);
  if (typeof opts.minScore === 'number') query = query.gte('capability_score', opts.minScore);
  if (opts.statuses?.length) query = query.in('status', opts.statuses);
  query = query.limit(opts.limit ?? 100);

  const { data, error } = await query.returns<LiveFeedEntry[]>();
  if (error) throw new Error(`live_feed_entries list failed: ${error.message}`);
  return data ?? [];
}

export async function getLiveFeedEntry(id: string): Promise<LiveFeedEntry | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('live_feed_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle<LiveFeedEntry>();
  if (error) throw new Error(`live_feed_entries get failed: ${error.message}`);
  return data;
}

export async function getLiveFeedSource(slug: string): Promise<LiveFeedSource | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('live_feed_sources')
    .select('*')
    .eq('slug', slug)
    .maybeSingle<LiveFeedSource>();
  if (error) throw new Error(`live_feed_sources get failed: ${error.message}`);
  return data;
}

export async function listRecentPolls(
  sourceSlug: string,
  limit = 10,
): Promise<LiveFeedLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('live_feed_log')
    .select('*')
    .eq('source_slug', sourceSlug)
    .order('started_at', { ascending: false })
    .limit(limit)
    .returns<LiveFeedLog[]>();
  if (error) throw new Error(`live_feed_log list failed: ${error.message}`);
  return data ?? [];
}

export async function updateEntryStatus(
  id: string,
  status: LiveFeedEntryStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('live_feed_entries')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(`live_feed_entries status update failed: ${error.message}`);
}
