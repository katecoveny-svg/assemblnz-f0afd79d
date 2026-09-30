import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { buildPublicNzResult, matchesSource, PUBLIC_NZ_LIMITS, PUBLIC_NZ_SOURCES, type SourceRow, type LinkRow } from './model';

/** Anonymous, cookie-free read; no service role, ingestion, external fetch or RLS changes. */
export async function retrievePublicNzKnowledge(options: { query?: string; limit?: number } = {}) {
  const now = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PUBLIC_NZ_LIMITS.timeoutMs);
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error('unavailable');
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const read = async () => {
      const sources = await db.from('kb_sources').select('id,type,url,category,active,status,last_checked_at,last_successful_fetch').in('id', PUBLIC_NZ_SOURCES.map(s => s.id)).limit(PUBLIC_NZ_LIMITS.sources).abortSignal(controller.signal);
      if (sources.error) throw sources.error;
      const rows = (sources.data ?? []) as SourceRow[];
      const approved = PUBLIC_NZ_SOURCES.filter(p => rows.some(s => matchesSource(s, p)));
      const pages = await Promise.all(approved.map(async policy => {
        const result = await db.from('kb_documents').select('source_id,external_id,url,inserted_at').eq('source_id', policy.id).order('inserted_at', { ascending: false }).limit(PUBLIC_NZ_LIMITS.scannedPerSource).abortSignal(controller.signal);
        if (result.error) throw result.error;
        return (result.data ?? []) as LinkRow[];
      }));
      return buildPublicNzResult(rows, pages.flat(), { ...options, now });
    };
    // Deadline settles even if a transport fails to honour cancellation.
    return await Promise.race([read(), new Promise<never>((_, reject) => controller.signal.addEventListener('abort', () => reject(new Error('deadline')), { once: true }))]);
  } catch {
    return buildPublicNzResult([], [], { ...options, now, failed: true });
  } finally { clearTimeout(timeout); }
}
