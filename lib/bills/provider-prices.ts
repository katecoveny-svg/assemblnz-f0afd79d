import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import type { LivePlan } from './provider-types';

// Re-export the client-safe helpers so existing server imports keep working.
export { CATEGORY_LABEL, orderCategories } from './provider-types';
export type { LivePlan } from './provider-types';

/**
 * Live provider price book. Reads public.assembl_bills_provider_prices — the
 * table the refresh-provider-prices Edge Function keeps current. Every row
 * carries its own source_url + source_last_verified_at + trust_tier so the UI
 * can show "Source: … · last verified …" per price. If the table is empty or
 * unreachable, the surface falls back to the static provider list and the page
 * marks itself "Sample" instead of "Live".
 */

export type PriceBook = {
  live: boolean;
  plans: LivePlan[];
  lastVerified: string | null; // most recent verify across the book
};

const hostOf = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

export async function getPriceBook(): Promise<PriceBook> {
  try {
    const service = getServiceClient();
    const { data, error } = await service
      .from('assembl_bills_provider_prices')
      .select('id, category, provider, plan_name, monthly_cost_nzd, key_features, eligibility_notes, source_url, source_last_verified_at, trust_tier, status')
      .eq('status', 'active')
      .order('category', { ascending: true })
      .order('monthly_cost_nzd', { ascending: true });

    if (error || !data || data.length === 0) {
      return { live: false, plans: [], lastVerified: null };
    }

    const plans: LivePlan[] = data.map((r) => ({
      id: r.id as string,
      category: r.category as string,
      provider: r.provider as string,
      planName: r.plan_name as string,
      monthlyCost: (r.monthly_cost_nzd as number) ?? null,
      features: Array.isArray(r.key_features) ? (r.key_features as string[]) : [],
      eligibilityNotes: (r.eligibility_notes as string) ?? null,
      sourceUrl: r.source_url as string,
      sourceHost: hostOf(r.source_url as string),
      lastVerified: r.source_last_verified_at as string,
      trustTier: (r.trust_tier as 'A' | 'B' | 'C') ?? 'A',
      status: r.status as string,
    }));

    const lastVerified = plans
      .map((p) => p.lastVerified)
      .sort()
      .slice(-1)[0] ?? null;

    return { live: true, plans, lastVerified };
  } catch {
    return { live: false, plans: [], lastVerified: null };
  }
}
