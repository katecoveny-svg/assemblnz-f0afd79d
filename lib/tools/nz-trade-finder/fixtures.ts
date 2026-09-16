import type { TradeFinderResult } from './types';

/**
 * Sandbox fixtures for city + trade shortlists.
 * Register-shaped only — no invented emails. Labelled sandbox.
 */
const FIXTURES: Array<{
  city: string;
  trade: string;
  result: Omit<TradeFinderResult, 'query' | 'sandbox'>;
}> = [
  {
    city: 'wellington',
    trade: 'plumber',
    result: {
      status: 'ok',
      results: [
        {
          tradingName: 'Harbour Pipe Services',
          legalName: 'Harbour Pipe Services Limited',
          nzbn: '9429047001001',
          ownerHints: ['Director: Sam Aroha (public register)'],
          contactHints: {
            emails: [],
            phones: [],
            websites: ['https://example.invalid/harbour-pipe'],
            notes: [
              'Sandbox fixture — website is illustrative only. No email published on register in this fixture.',
            ],
          },
          sourceLinks: [
            {
              label: 'NZBN search (live)',
              url: 'https://www.nzbn.govt.nz/',
            },
            {
              label: 'Companies Office search (live)',
              url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=Harbour+Pipe',
            },
          ],
          confidence: 'high',
        },
        {
          tradingName: 'Te Aro Drainage Co',
          legalName: 'Te Aro Drainage Company Limited',
          nzbn: '9429047001002',
          ownerHints: ['Director: Moana Rangi (public register)'],
          contactHints: {
            emails: [],
            phones: [],
            websites: [],
            notes: [
              'Sandbox fixture — register contact fields empty; do not invent phones or emails.',
            ],
          },
          sourceLinks: [
            {
              label: 'NZBN search (live)',
              url: 'https://www.nzbn.govt.nz/',
            },
          ],
          confidence: 'medium',
        },
        {
          tradingName: 'Kelburn Plumbing',
          legalName: null,
          nzbn: null,
          ownerHints: ['Owner-operator hint only — NZBN not in this fixture'],
          contactHints: {
            emails: [],
            phones: [],
            websites: [],
            notes: [
              'Sandbox low-confidence row — enrich via nz-who-runs-it once a legal name is known.',
            ],
          },
          sourceLinks: [
            {
              label: 'Companies Office search',
              url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=Kelburn+Plumbing',
            },
          ],
          confidence: 'low',
        },
      ],
      adapters: { nzbn: 'sandbox', companiesOffice: 'sandbox' },
      gaps: [
        'Sandbox shortlist only — not a live NZBN or Companies Office search.',
        'No email scrape: contactHints.emails stay empty unless a register publishes them.',
      ],
    },
  },
  {
    city: 'auckland',
    trade: 'electrician',
    result: {
      status: 'ok',
      results: [
        {
          tradingName: 'Isthmus Electrical',
          legalName: 'Isthmus Electrical Limited',
          nzbn: '9429047002001',
          ownerHints: ['Director: Priya Nair (public register)'],
          contactHints: {
            emails: [],
            phones: [],
            websites: ['https://example.invalid/isthmus-electrical'],
            notes: ['Sandbox fixture — illustrative website only.'],
          },
          sourceLinks: [
            {
              label: 'NZBN search (live)',
              url: 'https://www.nzbn.govt.nz/',
            },
          ],
          confidence: 'high',
        },
        {
          tradingName: 'Onehunga Sparks',
          legalName: 'Onehunga Sparks Limited',
          nzbn: '9429047002002',
          ownerHints: [],
          contactHints: {
            emails: [],
            phones: [],
            websites: [],
            notes: ['Sandbox fixture — no public contact on register payload.'],
          },
          sourceLinks: [
            {
              label: 'Companies Office search',
              url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=Onehunga+Sparks',
            },
          ],
          confidence: 'medium',
        },
      ],
      adapters: { nzbn: 'sandbox', companiesOffice: 'sandbox' },
      gaps: ['Sandbox shortlist only — not live register search.'],
    },
  },
];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sandboxTradeFinder(input: {
  city: string;
  trade: string;
  limit: number;
}): TradeFinderResult {
  const city = norm(input.city);
  const trade = norm(input.trade);
  const hit = FIXTURES.find(
    (f) =>
      (f.city === city || city.includes(f.city) || f.city.includes(city)) &&
      (f.trade === trade || trade.includes(f.trade) || f.trade.includes(trade)),
  );

  if (!hit) {
    return {
      status: 'not_found',
      query: { city: input.city, trade: input.trade, limit: input.limit },
      results: [],
      adapters: { nzbn: 'sandbox', companiesOffice: 'sandbox' },
      sandbox: true,
      gaps: [
        'No sandbox fixture for this city+trade. Try city=Wellington trade=plumber or city=Auckland trade=electrician.',
      ],
    };
  }

  const results = hit.result.results.slice(0, input.limit);
  return {
    status: results.length ? hit.result.status : 'not_found',
    query: { city: input.city, trade: input.trade, limit: input.limit },
    results,
    adapters: { nzbn: 'sandbox', companiesOffice: 'sandbox' },
    sandbox: true,
    gaps: hit.result.gaps,
  };
}
