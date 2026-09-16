import { COMPLIANCE_DISCLAIMER, type CompliancePingResult } from './types';

const FIXTURES: CompliancePingResult[] = [
  {
    status: 'ok',
    query: 'assembl',
    legalName: 'assembl NZ Limited',
    nzbn: '9429053514950',
    entityStatus: 'Registered',
    entityType: 'NZ Limited Company',
    flags: [
      {
        code: 'entity_registered',
        severity: 'info',
        message: 'Entity status on fixture register: Registered.',
        source: 'sandbox-nzbn',
      },
      {
        code: 'limited_company',
        severity: 'info',
        message: 'Entity type: NZ Limited Company.',
        source: 'sandbox-nzbn',
      },
      {
        code: 'gst_not_asserted',
        severity: 'watch',
        message:
          'GST registration is not asserted in this sandbox fixture — check IRD / NZBN GST indicators live.',
        source: 'sandbox',
      },
    ],
    sourceLinks: [
      { label: 'NZBN register (live)', url: 'https://www.nzbn.govt.nz/' },
      {
        label: 'Companies Office search (live)',
        url: 'https://app.companiesoffice.govt.nz/companies/app/ui/pages/companies/search',
      },
    ],
    adapters: { nzbn: 'sandbox' },
    sandbox: true,
    disclaimer: COMPLIANCE_DISCLAIMER,
    gaps: ['Sandbox fixture — not a live register read.'],
  },
  {
    status: 'ok',
    query: '9429053514950',
    legalName: 'assembl NZ Limited',
    nzbn: '9429053514950',
    entityStatus: 'Registered',
    entityType: 'NZ Limited Company',
    flags: [
      {
        code: 'entity_registered',
        severity: 'info',
        message: 'Entity status on fixture register: Registered.',
        source: 'sandbox-nzbn',
      },
    ],
    sourceLinks: [
      { label: 'NZBN register (live)', url: 'https://www.nzbn.govt.nz/' },
    ],
    adapters: { nzbn: 'sandbox' },
    sandbox: true,
    disclaimer: COMPLIANCE_DISCLAIMER,
    gaps: ['Sandbox fixture matched by NZBN.'],
  },
  {
    status: 'partial',
    query: 'struck off demo',
    legalName: 'Sandboxed Struck Off Limited',
    nzbn: '9429047009999',
    entityStatus: 'Removed',
    entityType: 'NZ Limited Company',
    flags: [
      {
        code: 'entity_removed',
        severity: 'alert',
        message:
          'Fixture entity status is Removed / struck-off style — do not treat as trading.',
        source: 'sandbox-nzbn',
      },
    ],
    sourceLinks: [
      { label: 'NZBN register (live)', url: 'https://www.nzbn.govt.nz/' },
    ],
    adapters: { nzbn: 'sandbox' },
    sandbox: true,
    disclaimer: COMPLIANCE_DISCLAIMER,
    gaps: [
      'Sandbox partial fixture to model a non-active entity.',
      'Confirm on live registers before any commercial reliance.',
    ],
  },
];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sandboxCompliancePing(company: string): CompliancePingResult {
  const q = norm(company);
  if (!q) {
    return {
      status: 'not_found',
      query: company,
      legalName: null,
      nzbn: null,
      entityStatus: null,
      entityType: null,
      flags: [],
      sourceLinks: [
        { label: 'Tool docs', url: 'https://assembl.co.nz/tools/nz-compliance-ping' },
      ],
      adapters: { nzbn: 'sandbox' },
      sandbox: true,
      disclaimer: COMPLIANCE_DISCLAIMER,
      gaps: ['Empty company query.'],
    };
  }

  const hit = FIXTURES.find((f) => {
    const names = [f.query, f.legalName ?? '', f.nzbn ?? ''].map(norm);
    return names.some((n) => n === q || n.includes(q) || q.includes(n));
  });

  if (hit) {
    return {
      ...hit,
      query: company,
      sandbox: true,
      adapters: { nzbn: 'sandbox' },
      disclaimer: COMPLIANCE_DISCLAIMER,
    };
  }

  return {
    status: 'not_found',
    query: company,
    legalName: null,
    nzbn: null,
    entityStatus: null,
    entityType: null,
    flags: [],
    sourceLinks: [
      {
        label: 'Sandbox fixture list',
        url: 'https://assembl.co.nz/tools/nz-compliance-ping',
      },
    ],
    adapters: { nzbn: 'sandbox' },
    sandbox: true,
    disclaimer: COMPLIANCE_DISCLAIMER,
    gaps: [
      'No sandbox fixture matched. Try "assembl", NZBN 9429053514950, or "struck off demo".',
    ],
  };
}
