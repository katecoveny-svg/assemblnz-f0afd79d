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
        id: 'gets-demo- ev',
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
} as const;

export type FixtureKey = keyof typeof FIXTURES;
