/**
 * DEMO fixtures for DO Agent OS v0.
 * Honest sample data — not live scrapes of locked sites.
 */

export const FIXTURES = {
  'school-notice': {
    title: 'Harbour View Primary — week of 15 Sep',
    body: `Kia ora whānau,

Monday 15 Sep — mufti day (gold coin for the PTA).
Wednesday 17 Sep — Year 5/6 athletics at the domain, 9:30am–12:30pm. Sports uniform + drink bottle.
Thursday 18 Sep — permission slips for the museum trip due back.
Friday 19 Sep — early finish at 2:00pm (teacher only day follow-on).

Ngā mihi,
Office`,
  },
  'gets-opportunities': {
    title: 'DEMO opportunities (GETS-like fixtures)',
    items: [
      {
        id: 'gets-demo-001',
        agency: 'Sample District Council',
        title: 'Website accessibility remediation — small site',
        category: 'ICT / digital',
        closes: '2026-10-03',
        summary:
          'Remediate WCAG 2.2 AA issues on a public information site. DEMO listing only.',
      },
      {
        id: 'gets-demo-002',
        agency: 'Sample DHB facilities',
        title: 'Wayfinding print refresh — outpatient block',
        category: 'Print / design',
        closes: '2026-09-28',
        summary: 'Update directory maps and corridor signs. DEMO listing only.',
      },
      {
        id: 'gets-demo-003',
        agency: 'Sample Transport Agency',
        title: 'Community engagement summary — cycleway trial',
        category: 'Research / writing',
        closes: '2026-10-12',
        summary: 'Synthesise feedback into a one-page brief. DEMO listing only.',
      },
    ],
  },
  'quote-compare': {
    title: 'DEMO quotes — fence repair, Ponsonby',
    quotes: [
      {
        supplier: 'Northside Fencing Co',
        total: '$2,480',
        includes: ['labour', 'palings', 'disposal'],
        excludes: ['painting', 'council consent if required'],
        validUntil: '2026-09-30',
        leadTime: '2 weeks',
      },
      {
        supplier: 'Harbour Posts Ltd',
        total: '$2,150',
        includes: ['labour', 'palings'],
        excludes: ['disposal', 'painting', 'gate hardware'],
        validUntil: '2026-09-22',
        leadTime: '10 days',
      },
      {
        supplier: 'Aroha Timberworks',
        total: '$2,920',
        includes: ['labour', 'palings', 'disposal', 'primer coat'],
        excludes: ['full repaint'],
        validUntil: '2026-10-15',
        leadTime: '3 weeks',
      },
    ],
  },
  'kids-tomorrow': {
    title: 'DEMO — kids tomorrow',
    date: 'Tuesday 16 Sep 2026',
    kids: [
      {
        name: 'Mia (Year 6)',
        needs: ['athletics gear', 'filled drink bottle', 'signed museum slip'],
        pickup: 'normal 3:00pm gate',
      },
      {
        name: 'Jonno (Year 3)',
        needs: ['library bag', 'fruit for shared morning tea'],
        pickup: 'after-school care until 5:15pm',
      },
    ],
  },
  /** DEMO power-price pages for Watch change detection (v1 → v2). */
  'power-price-watch': {
    title: 'DEMO · residential power price card',
    v1: {
      url: 'fixture://power-price/v1',
      body: 'Contact Energy DEMO · Anytime rate 32.4 c/kWh · Daily fixed $2.10 · Effective until 30 Sep 2026.',
    },
    v2: {
      url: 'fixture://power-price/v2',
      body: 'Contact Energy DEMO · Anytime rate 35.1 c/kWh · Daily fixed $2.10 · Effective from 1 Oct 2026.',
    },
  },

  // ── Mitre 10 · SAP pursuit DEMO fixtures (fictional RFP / landscape) ──
  'mitre10-sap-rfp': {
    title: 'DEMO · Mitre 10 SAP pursuit — RFP snippet',
    buyer: 'Mitre 10 (DEMO fictional pursuit)',
    closes: '2026-10-24 17:00 NZST',
    body: `REQUEST FOR PROPOSAL — Store operations + supply-chain visibility (DEMO)

Buyer: Mitre 10 New Zealand (sample business — details fictional for this DEMO).
Closing: 24 Oct 2026, 17:00 NZST.

Scope (extract):
1. Improve purchase-order visibility from DC to store for seasonal lines.
2. Reduce stock-out false positives on high-velocity SKUs.
3. Align store-level receiving with SAP ECC / S/4 landscape notes below.

Must-haves:
- Integration pattern that respects existing SAP MM / SD touchpoints
- Read-path for open POs and ASN status within 15 minutes of change
- Human approval before any write-back to SAP

Evaluation:
- Fit to current SAP landscape (40%)
- Delivery risk and staged rollout (30%)
- Commercial model (30%)

SAP landscape notes (DEMO):
- ECC 6.0 with S/4 migration programme underway (wave 2 stores)
- MM: PO, GR, stock movements
- SD: store transfers, limited B2B
- Middleware: existing PI/PO; new adapters preferred over custom RFC spam
- Identity: Azure AD SSO already in place for store managers`,
  },
  'mitre10-sap-competitor': {
    title: 'DEMO · competitor tender page',
    v1: {
      url: 'fixture://mitre10-competitor/v1',
      body: 'Competitor DEMO · “Same-day ASN visibility for retail” · Case study: 12 stores · Price band: mid · Updated 1 Sep 2026.',
    },
    v2: {
      url: 'fixture://mitre10-competitor/v2',
      body: 'Competitor DEMO · “Same-day ASN visibility for retail + SAP MM read API” · Case study: 40 stores · Price band: mid-high · Updated 14 Sep 2026 · NEW: claims native S/4 connector.',
    },
  },
  'mitre10-sap-stakeholders': {
    title: 'DEMO · stakeholder extract source',
    body: `Meeting notes — Mitre 10 SAP pursuit (DEMO, fictional)

Attendees mentioned:
- Sam Reed — National Merchandise Ops (sponsor)
- Priya Nair — SAP programme lead (S/4 wave 2)
- Jordan Blake — Store systems, Auckland cluster
- Chris Ng — Procurement category manager (evaluator)
- External: Deloitte SAP advisory (influence on architecture scoring)

Decision path (stated):
1. Chris screens commercial fit
2. Priya scores SAP landscape fit
3. Sam holds go/no-go with CFO pack
4. Board paper only if capital > threshold (not in this RFP)`,
  },
  'mitre10-sap-proposal-compare': {
    title: 'DEMO · proposal vs requirements',
    requirements: [
      'PO visibility DC → store',
      'Stock-out false-positive reduction',
      'Respect SAP MM / SD touchpoints',
      'Read-path ≤ 15 min',
      'Human approval before SAP write-back',
    ],
    draftCoverage: [
      { requirement: 'PO visibility DC → store', status: 'covered', note: 'ASN + open PO read model' },
      { requirement: 'Stock-out false-positive reduction', status: 'partial', note: 'Alerting only — no store UI yet' },
      { requirement: 'Respect SAP MM / SD touchpoints', status: 'covered', note: 'Read adapters; no custom RFC' },
      { requirement: 'Read-path ≤ 15 min', status: 'covered', note: '15-min poll + event hook stub' },
      { requirement: 'Human approval before SAP write-back', status: 'covered', note: 'Needs you gate on all writes' },
    ],
  },
  'mitre10-sap-meeting': {
    title: 'DEMO · next meeting pack source',
    body: `Email thread (DEMO) — Mitre 10 pursuit

From: Priya Nair
Re: Architecture workshop 18 Sep

Open:
- Confirm PI/PO vs new adapter preference
- Share S/4 wave-2 store list (redacted)
- Walk stock-out false-positive examples from three Auckland stores
- Commercial: staged licence vs fixed — Chris wants options on one page

Ask before send: do not forward landscape notes outside the pursuit team.`,
  },

  // ── Broader launch-menu fixtures ──
  'plan-compare': {
    title: 'DEMO · power plans',
    plans: [
      { name: 'Anytime Classic', monthly: '$178', contract: '12 months', exitFee: '$50' },
      { name: 'Low User Flex', monthly: '$162', contract: 'month-to-month', exitFee: '$0' },
    ],
  },
  'physio-slots': {
    title: 'DEMO · physio availability',
    v1: { url: 'fixture://physio/v1', body: 'Harbour Physio DEMO · Next free: Thu 18 Sep 14:30 · Fri 19 Sep 09:00.' },
    v2: { url: 'fixture://physio/v2', body: 'Harbour Physio DEMO · CANCELLED slot open: Wed 17 Sep 11:15 · Next free: Thu 18 Sep 14:30.' },
  },
  'tradie-availability': {
    title: 'DEMO · tradie shortlist',
    items: [
      { name: 'Northside Plumbing', trade: 'plumber', earliest: 'Thu 18 Sep AM', area: 'Auckland central' },
      { name: 'Grey Lynn Sparks', trade: 'electrician', earliest: 'Wed 17 Sep PM', area: 'Inner west' },
    ],
  },
  'recurring-expenses': {
    title: 'DEMO · statement recurring lines',
    lines: [
      { payee: 'Netflix', amount: '$24.99', cadence: 'monthly' },
      { payee: 'Storage Unit 12', amount: '$89.00', cadence: 'monthly' },
      { payee: 'Gym — Harbour Fit', amount: '$62.00', cadence: 'monthly' },
    ],
  },
  'invoice-extract': {
    title: 'DEMO · invoice',
    body: 'Invoice INV-1042 · Supplier: Harbour Posts Ltd · Total due $2,150.00 incl GST · Due 30 Sep 2026.',
  },
  'bid-brief': {
    title: 'DEMO · tender page for bid brief',
    body: 'Sample Transport Agency · Community engagement summary — cycleway trial · Closes 12 Oct 2026 · Deliverable: one-page brief.',
  },
  'competitor-page': {
    title: 'DEMO · competitor page',
    v1: { url: 'fixture://competitor/v1', body: 'Competitor DEMO · Pricing from $49/mo · “Local support” claim · Updated Aug 2026.' },
    v2: { url: 'fixture://competitor/v2', body: 'Competitor DEMO · Pricing from $59/mo · “Local + ISO certified” claim · Updated Sep 2026.' },
  },
  'meeting-prep': {
    title: 'DEMO · meeting thread',
    body: 'Thread: Q3 ops review · Open: stock-out report, roster gap Fri, supplier lead-time slip on SKU-882.',
  },
  'study-tutor': {
    title: 'DEMO · tutor prompt',
    body: 'Year 11 maths · Solve for x in 3(x − 2) = 2x + 5. Goal: scaffold hints, not the final answer.',
  },
  'newsletter-calendar': {
    title: 'DEMO · club newsletter',
    body: 'Harbour Run Club · Sat 20 Sep 7:30am group run · Tue 23 Sep stretch class · RSVP by Thu 18 Sep.',
  },
  'stock-page': {
    title: 'DEMO · stock page',
    v1: { url: 'fixture://stock/v1', body: 'SKU-4412 Treated pine 90×45 · In stock: 14 · Price $12.40' },
    v2: { url: 'fixture://stock/v2', body: 'SKU-4412 Treated pine 90×45 · In stock: 2 · Price $12.40 · LOW STOCK' },
  },
  'supplier-quotes': {
    title: 'DEMO · supplier quotes',
    quotes: [
      { supplier: 'TimberDirect', unit: '$11.80', moq: 50, lead: '5 days', freight: 'excluded' },
      { supplier: 'BuildSupply NZ', unit: '$12.10', moq: 20, lead: '2 days', freight: 'included Auckland' },
    ],
  },
  'store-notice': {
    title: 'DEMO · store ops notice',
    body: 'Store 214 · Promo window starts Mon 22 Sep · Early delivery Thu 18 Sep 6am · Two staff needed for bay reset Fri.',
  },
  'xero-recurring': {
    title: 'DEMO · Xero recurring costs (stub)',
    v1: { url: 'fixture://xero-recurring/v1', body: 'Xero DEMO · Adobe $79.99 · Storage $89.00 · Cleaning $120.00' },
    v2: { url: 'fixture://xero-recurring/v2', body: 'Xero DEMO · Adobe $79.99 · Storage $109.00 · Cleaning $120.00 · Storage jumped +$20' },
  },
  'customer-follow-up': {
    title: 'DEMO · customer thread',
    body: 'Customer Jordan · Quote sent 8 Sep · Asked about lead time · No reply yet · Promise: follow up this week.',
  },
} as const;

export type FixtureKey = keyof typeof FIXTURES;

const MITRE_FIXTURE_KEYS = new Set([
  'mitre10-sap-rfp',
  'mitre10-sap-competitor',
  'mitre10-sap-stakeholders',
  'mitre10-sap-proposal-compare',
  'mitre10-sap-meeting',
]);

/** Public fixtures exclude Mitre/SAP pursuit pack. */
export function fixturesForPack(pack: 'public' | 'mitre10' = 'public'): Record<string, unknown> {
  if (pack === 'mitre10') {
    return Object.fromEntries(
      Object.entries(FIXTURES).filter(([key]) => MITRE_FIXTURE_KEYS.has(key)),
    );
  }
  return Object.fromEntries(
    Object.entries(FIXTURES).filter(([key]) => !MITRE_FIXTURE_KEYS.has(key)),
  );
}
