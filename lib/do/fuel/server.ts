import 'server-only';
import { z } from 'zod';
import type { FuelObservation, FuelType } from './watch';

/**
 * Reads the weekly national fuel prices the existing `nz-fuel-prices` edge function publishes
 * from MBIE's monitoring page, and says plainly whether it was live or the function's labelled
 * fallback. National weekly averages, not a pump price.
 */
const payload = z.object({
  petrol91: z.number().min(0.5).max(10), petrol95: z.number().min(0.5).max(10), diesel: z.number().min(0.5).max(10),
  source: z.enum(['mbie_live', 'fallback']), publishedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
}).passthrough();
export type FuelPrices = { checkedAt: string; publishedDate: string; source: 'mbie_weekly' | 'mbie_fallback'; prices: Record<FuelType, number> };

export async function readFuelPrices(fetcher: typeof fetch = fetch): Promise<FuelPrices | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || null;
  if (!url) return null;
  try {
    const response = await fetcher(`${url}/functions/v1/nz-fuel-prices`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(key ? { Authorization: `Bearer ${key}`, apikey: key } : {}) },
      body: '{}', signal: AbortSignal.timeout(12_000), cache: 'no-store',
    });
    if (!response.ok) return null;
    const parsed = payload.safeParse(await response.json());
    if (!parsed.success) return null;
    const data = parsed.data;
    return { checkedAt: new Date().toISOString(), publishedDate: data.publishedDate, source: data.source === 'mbie_live' ? 'mbie_weekly' : 'mbie_fallback', prices: { '91': data.petrol91, '95': data.petrol95, diesel: data.diesel } };
  } catch { return null; }
}
export function fuelObservationFrom(prices: FuelPrices, fuel: FuelType): FuelObservation {
  return { date: prices.publishedDate, price: prices.prices[fuel], source: prices.source, label: prices.source === 'mbie_weekly' ? 'MBIE weekly national average' : 'MBIE fallback figure, not this week' };
}
