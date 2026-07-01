import type {
  CommsDraft,
  CRMCustomer,
  ComplianceItem,
  LoyaltyState,
  ManaReceipt,
  RosterRow,
  UpcomingEvent,
} from '@/components/ops/widgets/types';
import type { FinanceSummary } from '@/components/ops/widgets/FinancePanel';

/**
 * Happy Tails demo data. Every object carries `demo: true` where the widget
 * type supports it so nothing ever gets mistaken for real customer data.
 * Reference names (Franklin, Mathis, Liana, Xero INV-3031) are shaped like the
 * brief examples but flagged demo.
 */

export const happyTailsRoster: RosterRow[] = [
  {
    id: 'r1',
    name: 'Mathis',
    role: 'Groomer',
    shift: '07:00 – 15:00',
    hours: 8,
    cost: 240,
    demo: true,
  },
  {
    id: 'r2',
    name: 'Liana',
    role: 'Front of house',
    shift: '09:00 – 17:00',
    hours: 8,
    cost: 224,
    demo: true,
  },
  {
    id: 'r3',
    name: 'Franklin (owner)',
    role: 'Managing',
    shift: 'On-call',
    hours: 4,
    cost: 0,
    demo: true,
  },
];

export const happyTailsFinance: FinanceSummary = {
  // Xero INV-3031-shaped totals — demo values.
  revenue: 4820,
  expenses: 3140,
};

export const happyTailsComms: CommsDraft[] = [
  {
    id: 'c1',
    channel: 'sms',
    audience: 'Overdue clients (12)',
    tone: 'Mathis · warm, blunt',
    preview:
      "Hey — Franklin's booked in Friday. Want a matching slot for Biscuit?",
    demo: true,
  },
  {
    id: 'c2',
    channel: 'email',
    audience: 'Newsletter (218)',
    tone: 'Liana · gentle, chatty',
    preview:
      'Just a wee reminder: winter coat trims are half-price all July. Bring the pupper in.',
    demo: true,
  },
];

export const happyTailsCustomers: CRMCustomer[] = [
  {
    id: 'cust-1',
    name: 'Kelly & Biscuit',
    stage: 'vip',
    lastSeen: '2026-06-24',
    demo: true,
  },
  {
    id: 'cust-2',
    name: 'Harata & Nala',
    stage: 'active',
    lastSeen: '2026-06-19',
    demo: true,
  },
  {
    id: 'cust-3',
    name: 'Josh & Bruno',
    stage: 'lapsed',
    lastSeen: '2026-03-02',
    demo: true,
  },
];

export const happyTailsCompliance: ComplianceItem[] = [
  {
    id: 'k1',
    date: '2026-07-10',
    label: 'Council groomer WOF renewal',
    severity: 'warn',
    demo: true,
  },
  {
    id: 'k2',
    date: '2026-07-22',
    label: 'GST filing due',
    severity: 'critical',
    demo: true,
  },
];

export const happyTailsEvents: UpcomingEvent[] = [
  {
    id: 'e1',
    name: 'Doggo social hour',
    when: '2026-07-05T17:00:00+12:00',
    capacity: 20,
    reserved: 14,
    demo: true,
  },
];

export const happyTailsLoyalty: LoyaltyState = {
  points: 1240,
  tier: 'Regular',
  nextTierAt: 2000,
  demo: true,
};

export const happyTailsReceipt: ManaReceipt = {
  id: 'MR-HT-000341',
  at: '2026-07-01T09:12:00+12:00',
  kind: 'draft.reviewed',
  note: 'Liana approved the July newsletter draft; no changes required.',
  evidence: ['comms/c2/draft.md', 'reviewer/liana'],
};
