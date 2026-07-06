import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Inbox status for the Family OS "Inbox (Echo)" tab.
 *
 * Reads the latest row from public.family_inbox_runs (written by the
 * family-inbox-sync edge function each time the 15-min cron fires). Fail-soft:
 * if the table doesn't exist yet, or no real (non-dry) run has happened, the
 * tab shows the labelled sample and a "not connected" strip. `connected` means
 * a real inbox has been synced — a dry run (no creds set) does not count.
 */

export type InboxStatus = {
  connected: boolean;
  provider: string | null;
  lastSyncLabel: string | null;
  scanned: number;
  createdItems: number;
};

function relativeLabel(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export async function getInboxStatus(hub = 'demo'): Promise<InboxStatus | null> {
  void hub;
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('family_inbox_runs')
      .select('*')
      .order('ran_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as { ran_at: string; provider: string | null; dry_run: boolean; scanned: number | null; created_items: number | null };
    return {
      connected: !row.dry_run,
      provider: row.provider,
      lastSyncLabel: relativeLabel(row.ran_at),
      scanned: row.scanned ?? 0,
      createdItems: row.created_items ?? 0,
    };
  } catch {
    return null;
  }
}
