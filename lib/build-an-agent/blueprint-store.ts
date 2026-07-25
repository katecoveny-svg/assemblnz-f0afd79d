/**
 * Reading a kept Business Blueprint.
 *
 * Retention is enforced here rather than by a cron: a row past `expires_at` is
 * treated as gone, whatever is still sitting in the table. That way the 90-day
 * promise on the page holds even if a cleanup job is late or never runs.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

export interface StoredBrief {
  business: string;
  sells: string[];
  voice: string;
  questions: string[];
  facts: string[];
  blindSpots: string[];
  answered?: number;
  source: string;
  brand: { primary: string; secondary: string | null; accent: string | null; ink: string } | null;
}

export interface StoredBlueprint {
  slug: string;
  domain: string;
  brief: StoredBrief;
  createdAt: string;
  expiresAt: string;
}

export async function readBlueprint(slug: string): Promise<StoredBlueprint | null> {
  if (!/^[a-z0-9-]{4,40}$/.test(slug)) return null;
  try {
    const { data, error } = await getServiceClient()
      .from('blueprint_shares')
      .select('slug, domain, brief, created_at, expires_at')
      .eq('slug', slug)
      .maybeSingle();
    if (error || !data) return null;
    if (new Date(data.expires_at as string).getTime() < Date.now()) return null;
    return {
      slug: data.slug as string,
      domain: data.domain as string,
      brief: data.brief as StoredBrief,
      createdAt: data.created_at as string,
      expiresAt: data.expires_at as string,
    };
  } catch {
    // Storage down — the page 404s rather than showing a broken shell.
    return null;
  }
}
