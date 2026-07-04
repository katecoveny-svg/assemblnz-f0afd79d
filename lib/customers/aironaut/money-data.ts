/**
 * AIRONAUT money-work data — AR chase, customer credit checks, cashflow
 * exposure, and the integration map. Sample data only: customer names are
 * deliberately generic (Peninsula Motors, Northland Distributors, Waikato
 * Wine Co) — no real Aironaut customer, contact, or invoice appears here.
 * Draft-only: approve buttons flip local state; nothing sends.
 */

// ---------------------------------------------------------------------------
// AR chase
// ---------------------------------------------------------------------------

export type ChaseInvoice = {
  id: string;
  customer: string;
  amount: string;
  daysOverdue: number;
  jobSummary: string;
  /** Which cadence step the draft below sits at. */
  cadenceStage: string;
  /** The drafted chase message, in Aironaut's voice. */
  draft: string;
  channel: 'Outlook email' | 'WhatsApp' | 'SMS';
};

export const chaseCadence = [
  { day: 'day 3', step: 'polite reminder' },
  { day: 'day 7', step: 'warmer nudge' },
  { day: 'day 14', step: 'firm but friendly' },
  { day: 'day 21', step: 'escalation draft for you to send' },
] as const;

export const chaseInvoices: ChaseInvoice[] = [
  {
    id: 'INV-2418',
    customer: 'Peninsula Motors',
    amount: '$12,840',
    daysOverdue: 18,
    jobSummary: 'Two vehicle clearances · duty + GST disbursed',
    cadenceStage: 'firm but friendly (day 14)',
    draft:
      'Morning Mike — invoice INV-2418 for the two vehicle clearances is now 18 days past due. We’ve already fronted the duty and GST to Customs on these, so we do need payment this week. If something’s holding it up, give me a call and we’ll sort it.',
    channel: 'Outlook email',
  },
  {
    id: 'INV-2431',
    customer: 'Northland Distributors',
    amount: '$8,265',
    daysOverdue: 9,
    jobSummary: 'Sea freight FCL · entries + delivery order',
    cadenceStage: 'warmer nudge (day 7)',
    draft:
      'Hi Sarah — just flagging invoice INV-2431 for the Tauranga container, now 9 days past due. Probably just slipped through the month-end run. Could you check where it’s at on your side?',
    channel: 'Outlook email',
  },
  {
    id: 'INV-2442',
    customer: 'Waikato Wine Co',
    amount: '$4,590',
    daysOverdue: 5,
    jobSummary: 'Reefer LCL to London · MPI + excise fees',
    cadenceStage: 'polite reminder (day 3)',
    draft:
      'Hi Tom — quick reminder that invoice INV-2442 for the London reefer shipment fell due last week. Bank details are on the invoice. Sing out if you need a copy.',
    channel: 'WhatsApp',
  },
];

export const chaseStats = '8–12 days faster payment · around 15 hours a week back';

// ---------------------------------------------------------------------------
// Credit check
// ---------------------------------------------------------------------------

export type CreditVerdict = 'green' | 'amber' | 'red';

export type CreditCheckResult = {
  company: string;
  nzbn: string;
  verdict: CreditVerdict;
  recommendation: string;
  reasons: string[];
};

export const creditCheckSteps = [
  'Companies Office — directors, age, filings',
  'Credit bureau — score and defaults',
  'Payment history in this industry',
  'IRD tax-debt public register',
  'Court filings check',
] as const;

export const creditCheckSamples: CreditCheckResult[] = [
  {
    company: 'Harbourline Traders',
    nzbn: '9429041234567',
    verdict: 'amber',
    recommendation: '7-day terms recommended',
    reasons: [
      'Director changed 4 months ago',
      'One small overdue invoice with another broker',
      'Industry: construction — delays run higher in this sector',
      'Two years of accounts filed, both on time',
    ],
  },
  {
    company: 'Southern Cross Marine',
    nzbn: '9429049876543',
    verdict: 'green',
    recommendation: 'Standard 30-day terms recommended',
    reasons: [
      'Trading 14 years, same two directors throughout',
      'Clean bureau record — no defaults, no arrears',
      'Nothing on the IRD tax-debt register or court lists',
    ],
  },
  {
    company: 'Kea Building Supplies',
    nzbn: '9429045550123',
    verdict: 'red',
    recommendation: 'Prepayment recommended',
    reasons: [
      'Listed on the IRD tax-debt public register',
      'Two court judgments in the last 18 months',
      'Bureau score in the bottom decile for the sector',
    ],
  },
];

// ---------------------------------------------------------------------------
// Cashflow exposure
// ---------------------------------------------------------------------------

export type CashflowWeek = {
  /** Week-commencing label, e.g. "w/c 6 Jul". */
  label: string;
  /** Net position for the week in $k. Negative = exposed. */
  netK: number;
  status: 'positive' | 'tight' | 'exposed';
  /** What's driving the number — shown when the bar is clicked. */
  drivers: string[];
};

export const cashflowHeadline = {
  out: '$187k out to Customs this month',
  back: '$142k due back by 15 Aug',
};

export const cashflowWeeks: CashflowWeek[] = [
  {
    label: 'w/c 6 Jul',
    netK: 38,
    status: 'positive',
    drivers: [
      'Client payments expected: $61k',
      'Deferred GST instalment to Customs: $23k',
    ],
  },
  {
    label: 'w/c 13 Jul',
    netK: 21,
    status: 'positive',
    drivers: [
      'Client payments expected: $47k',
      'Duty on five vehicle entries: $26k',
    ],
  },
  {
    label: 'w/c 20 Jul',
    netK: 6,
    status: 'tight',
    drivers: [
      'Deferred account payment day — $84k to Customs',
      'Client payments expected: $90k, two of them already late last month',
    ],
  },
  {
    label: 'w/c 27 Jul',
    netK: -12,
    status: 'tight',
    drivers: [
      'MPI and port disbursements: $19k',
      'Peninsula Motors invoice ($12.8k) still unpaid at this point',
    ],
  },
  {
    label: 'w/c 3 Aug',
    netK: -84,
    status: 'exposed',
    drivers: [
      'Deferred GST due to Customs: $63k',
      'Duty on four vehicle entries: $21k',
      'Cover depends on Peninsula Motors and Northland Distributors paying',
    ],
  },
  {
    label: 'w/c 10 Aug',
    netK: 44,
    status: 'positive',
    drivers: [
      'Client payments expected: $76k, most of the 20th-of-month run',
      'No deferred account payment this week',
    ],
  },
];

export const cashflowSqueeze = {
  line: 'On 3 Aug you’re $84k short unless Peninsula Motors’ invoice clears.',
  cta: 'Chase it now',
  href: '/customers/aironaut/ops#ar-chase',
};

// ---------------------------------------------------------------------------
// Integration map
// ---------------------------------------------------------------------------

export type IntegrationNode = {
  id: string;
  label: string;
  /** Short monogram drawn in the node. */
  glyph: string;
  /** Recognisable brand tint for the node chip. */
  tint: string;
  reads: string;
  writes: string;
};

/** Layer 1 — reads and writes daily. */
export const integrationInnerRing: IntegrationNode[] = [
  {
    id: 'outlook',
    label: 'Outlook',
    glyph: 'O',
    tint: '#0F6CBD',
    reads: 'incoming customer email',
    writes: 'drafts replies and invoice chases for approval',
  },
  {
    id: 'xero',
    label: 'Xero',
    glyph: 'X',
    tint: '#13B5EA',
    reads: 'invoices, payments, deferred-payment ledger',
    writes: 'draft invoices and reconciliation notes',
  },
  {
    id: 'bank',
    label: 'Bank feed · ANZ / BNZ',
    glyph: '$',
    tint: '#1E4B8F',
    reads: 'payments as they land',
    writes: 'nothing — read only',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp + SMS',
    glyph: 'W',
    tint: '#1FAF5E',
    reads: 'inbound customer questions',
    writes: 'drafts chases and updates for approval',
  },
  {
    id: 'cusmod',
    label: 'CusMod / CargoWise + EDI',
    glyph: 'C',
    tint: '#C8622A',
    reads: 'entry status and EDI messages',
    writes: 'draft entries — you review and lodge',
  },
  {
    id: 'docs',
    label: 'Dropbox / SharePoint',
    glyph: 'D',
    tint: '#5C7A99',
    reads: 'shipping docs where they already live',
    writes: 'files completed paperwork alongside them',
  },
];

/** Layer 2 — signal sources, read-only. */
export const integrationOuterRing: IntegrationNode[] = [
  {
    id: 'tariff',
    label: 'NZ Customs Working Tariff',
    glyph: 'T',
    tint: '#0B1F3A',
    reads: 'tariff codes and duty rates, synced daily',
    writes: 'nothing — read only',
  },
  {
    id: 'companies',
    label: 'Companies Office + Illion / Equifax',
    glyph: 'Co',
    tint: '#4A5A6A',
    reads: 'directors, filings, credit scores',
    writes: 'nothing — read only',
  },
  {
    id: 'shipping',
    label: 'Maersk · MSC · CMA CGM',
    glyph: 'S',
    tint: '#42B0D5',
    reads: 'container tracking',
    writes: 'nothing — read only',
  },
  {
    id: 'aircargo',
    label: 'Cathay · Emirates SkyCargo',
    glyph: 'A',
    tint: '#006564',
    reads: 'air waybill tracking',
    writes: 'nothing — read only',
  },
  {
    id: 'mpi',
    label: 'MPI biosecurity',
    glyph: 'M',
    tint: '#2E6B34',
    reads: 'biosecurity directions for perishables',
    writes: 'nothing — read only',
  },
  {
    id: 'nzta',
    label: 'NZTA',
    glyph: 'N',
    tint: '#003A70',
    reads: 'vehicle import requirements',
    writes: 'nothing — read only',
  },
  {
    id: 'gwl',
    label: 'Global Wine Logistics',
    glyph: 'G',
    tint: '#6B2D3E',
    reads: 'partner bookings and schedules',
    writes: 'nothing — read only',
  },
  {
    id: 'ird',
    label: 'IRD tax-debt register + court filings',
    glyph: 'I',
    tint: '#7A3B3B',
    reads: 'public red flags on new customers',
    writes: 'nothing — read only',
  },
];

export const integrationRollout = [
  { week: 'week 1', items: 'Outlook + Xero + WhatsApp + Tariff' },
  { week: 'week 3', items: 'CusMod + bank feed + credit bureaux' },
  { week: 'week 6', items: 'shipping APIs + MPI + NZTA' },
] as const;

export const integrationRolloutNote =
  'Nothing gets migrated overnight — each layer switches on beside what you already use.';
