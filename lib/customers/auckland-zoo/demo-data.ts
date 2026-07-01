import type {
  CommsDraft,
  CRMCustomer,
  ComplianceItem,
  RosterRow,
  UpcomingEvent,
} from '@/components/ops/widgets/types';
import type { FinanceSummary } from '@/components/ops/widgets/FinancePanel';

/**
 * Auckland Zoo demo data. Every row carries `demo: true` so nothing here gets
 * confused with real animal records. Names are plausible placeholders; James
 * Chatterton is a real Zoo staffer used in the brief but kept flagged as demo.
 *
 * Cultural rule: the six seeded animals here map 1:1 to the six uploaded
 * editorial portraits (giraffe, red panda, lionesses, squirrel monkey, Asian
 * elephant, otter). The four taonga species called out in the brief are
 * intentionally absent and must not be added without kaumātua sign-off.
 */

export const aucklandZooRoster: RosterRow[] = [
  {
    id: 'r1',
    name: 'James Chatterton',
    role: 'Senior keeper · Africa',
    shift: '06:30 – 15:00',
    hours: 8.5,
    cost: 0,
    demo: true,
  },
  {
    id: 'r2',
    name: 'Demo keeper · Asia',
    role: 'Keeper · Asia',
    shift: '07:00 – 15:30',
    hours: 8.5,
    cost: 0,
    demo: true,
  },
  {
    id: 'r3',
    name: 'Demo keeper · South America',
    role: 'Keeper · South America',
    shift: '08:00 – 16:30',
    hours: 8.5,
    cost: 0,
    demo: true,
  },
];

export const aucklandZooFinance: FinanceSummary = {
  // Demo values only — never real Zoo financials.
  revenue: 0,
  expenses: 0,
};

export const aucklandZooComms: CommsDraft[] = [
  {
    id: 'c1',
    channel: 'email',
    audience: 'Keepers roster (46)',
    tone: 'James · calm, direct',
    preview:
      'Morning brief: enrichment schedule for Africa precinct posted; check the shared plan before 07:30.',
    demo: true,
  },
];

/**
 * The 6 seeded animals map 1:1 to the 6 uploaded editorial portraits. Order
 * MUST stay in lockstep with the `avatars` prop passed to <CustomerCRM> from
 * app/customers/auckland-zoo/ops/page.tsx. The CRM widget picks
 * `avatars[i % avatars.length]`.
 *
 * Never add rows for kaumātua-hold taonga species here without sign-off.
 */
export const aucklandZooCustomers: CRMCustomer[] = [
  {
    id: 'zoo-kaia',
    name: 'Kaia (Giraffe) · keeper James Chatterton · Africa',
    stage: 'vip',
    lastSeen: '2026-06-30',
    demo: true,
  },
  {
    id: 'zoo-rimu',
    name: 'Rimu (Red Panda) · keeper demo · Asia',
    stage: 'active',
    lastSeen: '2026-06-29',
    demo: true,
  },
  {
    id: 'zoo-freya-fiona',
    name: 'Freya & Fiona (Lionesses) · keeper demo · Africa',
    stage: 'vip',
    lastSeen: '2026-06-28',
    demo: true,
  },
  {
    id: 'zoo-momo',
    name: 'Momo (Squirrel Monkey) · keeper demo · South America',
    stage: 'active',
    lastSeen: '2026-06-27',
    demo: true,
  },
  {
    id: 'zoo-anjalee',
    name: 'Anjalee (Asian Elephant) · keeper demo · Asia',
    stage: 'vip',
    lastSeen: '2026-06-26',
    demo: true,
  },
  {
    id: 'zoo-miko',
    name: 'Miko (Otter) · keeper demo · Wetlands',
    stage: 'active',
    lastSeen: '2026-06-25',
    demo: true,
  },
];

export const aucklandZooCompliance: ComplianceItem[] = [
  {
    id: 'k1',
    date: '2026-07-15',
    label: 'MPI enclosure inspection window opens',
    severity: 'warn',
    demo: true,
  },
];

export const aucklandZooEvents: UpcomingEvent[] = [
  {
    id: 'e1',
    name: 'Keeper-led talk · Africa precinct',
    when: '2026-07-04T11:00:00+12:00',
    capacity: 60,
    reserved: 22,
    demo: true,
  },
];
