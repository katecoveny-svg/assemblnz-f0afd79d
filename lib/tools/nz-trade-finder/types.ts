export type TradeFinderStatus = 'ok' | 'partial' | 'not_found';

export type TradeFinderContactHints = {
  emails: string[];
  phones: string[];
  websites: string[];
  notes: string[];
};

export type TradeFinderResultRow = {
  tradingName: string;
  legalName: string | null;
  nzbn: string | null;
  ownerHints: string[];
  contactHints: TradeFinderContactHints;
  sourceLinks: Array<{ label: string; url: string }>;
  confidence: 'high' | 'medium' | 'low';
};

export type TradeFinderAdapters = {
  nzbn: 'live' | 'sandbox' | 'unavailable' | 'stubbed';
  companiesOffice: 'live' | 'sandbox' | 'unavailable' | 'stubbed';
};

export type TradeFinderResult = {
  status: TradeFinderStatus;
  query: { city: string; trade: string; limit: number };
  results: TradeFinderResultRow[];
  adapters: TradeFinderAdapters;
  sandbox: boolean;
  /** Honest gap notes — never invent live register data */
  gaps: string[];
};

export type TradeFinderInput = {
  city: string;
  trade: string;
  limit: number;
};
