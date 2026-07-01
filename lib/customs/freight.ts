/**
 * Freight-quote comparison — ported from the Pīkau freight_quote_compare
 * workflow (supabase/functions/_shared/kete/pikau/*). Ranks carrier quotes and
 * flags Incoterms 2020 gaps (CIF/CIP require seller-provided insurance) and
 * GST zero-rating on exports.
 */
import type { Incoterm2020 } from './types';
import { round2, nonNegative } from './format';

export interface FreightQuote {
  carrier: string;
  amountNzd: number;
  transitDays: number;
  includesInsurance: boolean;
}

export interface FreightComparison {
  quotes: (FreightQuote & { cheapest: boolean; fastest: boolean })[];
  cheapest: string | null;
  fastest: string | null;
  savingsNzd: number;
  flags: string[];
}

export function compareFreight(
  quotes: FreightQuote[],
  incoterm: Incoterm2020,
): FreightComparison {
  const clean = quotes.filter((q) => q.carrier.trim() && nonNegative(q.amountNzd) > 0);
  if (clean.length === 0) {
    return { quotes: [], cheapest: null, fastest: null, savingsNzd: 0, flags: ['Add at least one quote to compare.'] };
  }
  const cheapestAmt = Math.min(...clean.map((q) => q.amountNzd));
  const dearestAmt = Math.max(...clean.map((q) => q.amountNzd));
  const fastestDays = Math.min(...clean.map((q) => q.transitDays));

  const ranked = clean.map((q) => ({
    ...q,
    cheapest: q.amountNzd === cheapestAmt,
    fastest: q.transitDays === fastestDays,
  }));

  const flags: string[] = [];
  if (['CIF', 'CIP'].includes(incoterm)) {
    const missing = clean.filter((q) => !q.includesInsurance).map((q) => q.carrier);
    if (missing.length) {
      flags.push(`Incoterms 2020 ${incoterm} requires seller-provided insurance — missing on: ${missing.join(', ')}.`);
    }
  }
  const cheapestQ = ranked.find((q) => q.cheapest);
  const fastestQ = ranked.find((q) => q.fastest);
  if (cheapestQ && fastestQ && cheapestQ.carrier !== fastestQ.carrier) {
    flags.push(`Cheapest (${cheapestQ.carrier}) is not the fastest (${fastestQ.carrier}) — weigh cost against ${fastestQ.transitDays}-day transit.`);
  }

  return {
    quotes: ranked,
    cheapest: cheapestQ?.carrier ?? null,
    fastest: fastestQ?.carrier ?? null,
    savingsNzd: round2(dearestAmt - cheapestAmt),
    flags,
  };
}

export const FREIGHT_EXAMPLE: FreightQuote[] = [
  { carrier: 'Southbound Line', amountNzd: 5200, transitDays: 28, includesInsurance: false },
  { carrier: 'Pacific Reefer Co', amountNzd: 6100, transitDays: 22, includesInsurance: true },
  { carrier: 'AirBridge Express', amountNzd: 9400, transitDays: 6, includesInsurance: true },
];
