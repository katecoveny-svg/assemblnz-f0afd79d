import type {
  CommsDraft,
  ManaReceipt,
} from '@/components/ops/widgets/types';

/**
 * AIRONAUT demo data — four service lines, each with 3–5 clearly-fake
 * consignment rows. Every entry carries `demo: true`. No real customer
 * names, no real PII, no real phone numbers. Every ref reads as `demo · …`
 * so nothing here can be mistaken for a live consignment.
 *
 * Kate's dad reviews everything before it leaves the workspace. This file
 * exists purely so the four service pages have something visual to render
 * until the real client / consignment data lands.
 */

export type AironautConsignment = {
  id: string;
  ref: string;
  mode: string;
  status: string;
  demo: true;
};

export const aironautFreightConsignments: AironautConsignment[] = [
  {
    id: 'DEMO-FRT-0001',
    ref: 'demo · Auckland → Sydney · 12 pallets',
    mode: 'Sea LCL',
    status: 'In transit',
    demo: true,
  },
  {
    id: 'DEMO-FRT-0002',
    ref: 'demo · Los Angeles → Auckland · air express',
    mode: 'Air',
    status: 'Customs pending',
    demo: true,
  },
  {
    id: 'DEMO-FRT-0003',
    ref: 'demo · Shanghai → Tauranga · FCL 40HC',
    mode: 'Sea FCL',
    status: 'Landed',
    demo: true,
  },
];

export const aironautExoticVehicleConsignments: AironautConsignment[] = [
  {
    id: 'DEMO-EXV-0001',
    ref: 'demo · Aston Martin DB11 · Tokyo → Auckland',
    mode: 'RoRo',
    status: 'Awaiting inspection',
    demo: true,
  },
  {
    id: 'DEMO-EXV-0002',
    ref: 'demo · classic Porsche 911 · Auckland → Los Angeles',
    mode: 'Sea container (single)',
    status: 'Loading',
    demo: true,
  },
  {
    id: 'DEMO-EXV-0003',
    ref: 'demo · Range Rover SVAutobiography · Southampton → Wellington',
    mode: 'RoRo',
    status: 'In transit',
    demo: true,
  },
];

export const aironautBoatConsignments: AironautConsignment[] = [
  {
    id: 'DEMO-BYT-0001',
    ref: 'demo · 42ft sailing yacht · Auckland → Papeete',
    mode: 'Deck cargo',
    status: 'Cradle prep',
    demo: true,
  },
  {
    id: 'DEMO-BYT-0002',
    ref: 'demo · 28ft powerboat · Sydney → Auckland',
    mode: 'FCL 40 flat rack',
    status: 'Booked',
    demo: true,
  },
  {
    id: 'DEMO-BYT-0003',
    ref: 'demo · 60ft catamaran · Fort Lauderdale → Whangārei',
    mode: 'Heavy-lift semi-submersible',
    status: 'In transit',
    demo: true,
  },
];

export const aironautWineConsignments: Array<
  AironautConsignment & { partner: string }
> = [
  {
    id: 'DEMO-WIN-0001',
    ref: 'demo · Marlborough Sauvignon Blanc · Auckland → London',
    mode: 'Reefer LCL',
    status: 'Temp-controlled load',
    partner: 'Global Wine Logistics (demo)',
    demo: true,
  },
  {
    id: 'DEMO-WIN-0002',
    ref: 'demo · Central Otago Pinot Noir · Christchurch → Hong Kong',
    mode: 'Air (chilled)',
    status: 'Customs pending',
    partner: 'Global Wine Logistics (demo)',
    demo: true,
  },
  {
    id: 'DEMO-WIN-0003',
    ref: 'demo · Bordeaux futures inbound · Bordeaux → Auckland',
    mode: 'Reefer FCL 20',
    status: 'In transit',
    partner: 'Global Wine Logistics (demo)',
    demo: true,
  },
];

export const aironautComms: CommsDraft[] = [
  {
    id: 'ac1',
    channel: 'email',
    audience: 'demo · overdue consignment enquiries',
    tone: 'crisp, professional',
    preview:
      'Hi — quick heads-up your Auckland → Sydney LCL is now on-water; ETA 08 July. Landed-cost report to follow.',
    demo: true,
  },
  {
    id: 'ac2',
    channel: 'email',
    audience: 'demo · quote request follow-ups',
    tone: 'warm, direct',
    preview:
      'Thanks for the quote request — attaching an indicative rate for the Fort Lauderdale → Whangārei yacht move. Happy to hop on a call.',
    demo: true,
  },
];

export const aironautReceipt: ManaReceipt = {
  id: 'MR-AIRO-000001',
  at: '2026-07-01T09:00:00+12:00',
  kind: 'demo.placeholder',
  note: 'Family pilot — every action here stays a draft until Kate’s dad reviews.',
  evidence: ['aironaut/pilot/family-review-required'],
};

/**
 * Seeded "today" activity for the backend-transparency tab. Every row is
 * demo:true — this is what a live day WOULD look like, on demo records only.
 */
export type AironautActivityEvent = {
  at: string; // NZ local time, HH:mm
  kind: 'drafted' | 'read' | 'flagged' | 'computed';
  note: string;
  demo: true;
};

export const aironautActivity: AironautActivityEvent[] = [
  { at: '06:45', kind: 'read', note: 'Scanned overnight carrier manifests — 3 demo consignments moved status.', demo: true },
  { at: '07:10', kind: 'computed', note: 'Re-priced landed cost on AIR-2314 after freight uplift (+NZ$140).', demo: true },
  { at: '07:32', kind: 'drafted', note: 'Drafted ETA update email for the Auckland → Sydney LCL (awaiting review).', demo: true },
  { at: '08:05', kind: 'flagged', note: 'Wine consignment WNE-0907: excise note missing — flagged for broker.', demo: true },
  { at: '08:41', kind: 'drafted', note: 'Drafted three-candidate HS classification for stainless brewing tanks (GRI 1).', demo: true },
  { at: '09:00', kind: 'computed', note: 'Issued Mana Receipt for the morning classification run (hash-chained).', demo: true },
];
