import type { WhoRunsItResult } from './types';

/**
 * Realistic NZ sandbox fixtures. Labelled sandbox — not live register reads.
 * Includes assembl NZ Limited (publicly cited entity in repo docs) plus a
 * few common lookup shapes for agent dry-runs.
 */
const FIXTURES: WhoRunsItResult[] = [
  {
    status: 'ok',
    query: 'assembl',
    legalName: 'assembl NZ Limited',
    nzbn: '9429053514950',
    entityStatus: 'Registered',
    entityType: 'NZ Limited Company',
    directors: [{ name: 'Kate Hudson', role: 'Director', appointedOn: null }],
    registeredOffice: 'Auckland, New Zealand',
    contactHints: {
      emails: [],
      phones: [],
      websites: ['https://assembl.co.nz'],
      notes: [
        'Sandbox fixture — verify against NZBN / Companies Office for live decisions.',
      ],
    },
    sourceLinks: [
      {
        label: 'NZBN register (live)',
        url: 'https://www.nzbn.govt.nz/',
      },
      {
        label: 'Companies Office search (live)',
        url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search',
      },
      {
        label: 'Sandbox fixture note',
        url: 'https://assembl.co.nz/tools/nz-who-runs-it',
      },
    ],
    sandbox: true,
    gaps: [],
  },
  {
    status: 'ok',
    query: '9429053514950',
    legalName: 'assembl NZ Limited',
    nzbn: '9429053514950',
    entityStatus: 'Registered',
    entityType: 'NZ Limited Company',
    directors: [{ name: 'Kate Hudson', role: 'Director', appointedOn: null }],
    registeredOffice: 'Auckland, New Zealand',
    contactHints: {
      emails: [],
      phones: [],
      websites: ['https://assembl.co.nz'],
      notes: [
        'Sandbox fixture matched by NZBN. Not a live register read.',
      ],
    },
    sourceLinks: [
      {
        label: 'NZBN entity (live lookup path)',
        url: 'https://www.nzbn.govt.nz/',
      },
    ],
    sandbox: true,
    gaps: [],
  },
  {
    status: 'partial',
    query: 'trade me',
    legalName: 'Trade Me Limited',
    nzbn: '9429036051687',
    entityStatus: 'Registered',
    entityType: 'NZ Limited Company',
    directors: [],
    registeredOffice: null,
    contactHints: {
      emails: [],
      phones: [],
      websites: ['https://www.trademe.co.nz'],
      notes: [
        'Sandbox partial fixture — directors/office withheld to model a partial register hit.',
      ],
    },
    sourceLinks: [
      {
        label: 'Companies Office search',
        url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search?q=Trade+Me',
      },
    ],
    sandbox: true,
    gaps: [
      'Director list not included in this sandbox fixture.',
      'Registered office not included in this sandbox fixture.',
    ],
  },
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sandboxWhoRunsIt(company: string): WhoRunsItResult {
  const q = normalize(company);
  if (!q) {
    return {
      status: 'not_found',
      query: company,
      legalName: null,
      nzbn: null,
      entityStatus: null,
      entityType: null,
      directors: [],
      registeredOffice: null,
      contactHints: { emails: [], phones: [], websites: [], notes: [] },
      sourceLinks: [
        {
          label: 'Tool docs',
          url: 'https://assembl.co.nz/tools/nz-who-runs-it',
        },
      ],
      sandbox: true,
      gaps: ['Empty company query.'],
    };
  }

  const hit = FIXTURES.find((f) => {
    const names = [f.query, f.legalName ?? '', f.nzbn ?? ''].map(normalize);
    return names.some((n) => n === q || n.includes(q) || q.includes(n));
  });

  if (hit) {
    return { ...hit, query: company, sandbox: true };
  }

  return {
    status: 'not_found',
    query: company,
    legalName: null,
    nzbn: null,
    entityStatus: null,
    entityType: null,
    directors: [],
    registeredOffice: null,
    contactHints: {
      emails: [],
      phones: [],
      websites: [],
      notes: [
        'No sandbox fixture matched. Try "assembl", NZBN 9429053514950, or "trade me".',
      ],
    },
    sourceLinks: [
      {
        label: 'Sandbox fixture list',
        url: 'https://assembl.co.nz/tools/nz-who-runs-it',
      },
    ],
    sandbox: true,
    gaps: ['No matching sandbox fixture for this query.'],
  };
}
