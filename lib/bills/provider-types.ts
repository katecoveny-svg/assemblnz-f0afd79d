// Client-safe provider-price types + label helpers. No 'server-only' here so
// both client components (ProviderGrid) and the server reader (provider-prices)
// can share them.

export type LivePlan = {
  id: string;
  category: string;
  provider: string;
  planName: string;
  monthlyCost: number | null;
  features: string[];
  eligibilityNotes: string | null;
  sourceUrl: string;
  sourceHost: string;
  lastVerified: string; // ISO
  trustTier: 'A' | 'B' | 'C';
  status: string;
};

export const CATEGORY_LABEL: Record<string, string> = {
  electricity: 'Electricity',
  broadband: 'Broadband',
  insurance: 'Insurance',
  mobile: 'Mobile',
  streaming: 'Streaming',
  subscription: 'Subscriptions',
  gas: 'Gas',
  council_rates: 'Council rates',
  fuel: 'Fuel',
};

/** Categories present in the book, in a sensible display order. */
export function orderCategories(cats: string[]): string[] {
  const order = ['electricity', 'broadband', 'insurance', 'mobile', 'streaming', 'subscription', 'gas', 'council_rates', 'fuel'];
  return [...new Set(cats)].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
