/**
 * Mana Receipt DEMO schema v0 — wait-state evidence mock.
 *
 * Locks (Kate-approved):
 * - status is always DEMO (never pretend live)
 * - First visual wait_type is port_2fa (port 2FA YES ≤2h)
 * - Mock context_hash / rules_hash are fine
 * - currency_note is adjacency language only — never claim live Phone Dollars
 * - Carrier owns currency; assembl owns evidence
 * - No One NZ affiliation / partnership claim
 */

import { ASSEMBL_CANON } from '@/lib/loyalty/one-nz';

export const MANA_RECEIPT_SCHEMA_VERSION = 'v0' as const;

export type ManaReceiptDemoStatus = 'DEMO';

/** Primary mint wait type for the first DEMO visual. */
export type ManaReceiptWaitType = 'port_2fa';

export interface ManaReceiptDemoV0 {
  schema_version: typeof MANA_RECEIPT_SCHEMA_VERSION;
  status: ManaReceiptDemoStatus;
  wait_type: ManaReceiptWaitType;
  /** Mock hash over wait context — illustrative only. */
  context_hash: string;
  /** Mock hash over earn/permission rules — illustrative only. */
  rules_hash: string;
  /**
   * Currency adjacency note. Currency-generic.
   * Never asserts live Phone Dollars or any live wallet credit.
   */
  currency_note: string;
  receipt_id: string;
  issued_at: string;
  wait: {
    label: string;
    window: string;
    /** Auth path must stay clear — never slow or block 2FA. */
    auth_path: 'clear';
    moment: string;
  };
  earn: {
    /** Sample stamp amount shown as DEMO adjacency only. */
    sample_stamp_nzd: number;
    destination_label: string;
    permission: string;
  };
  ownership: {
    currency_owner: string;
    evidence_owner: string;
  };
  named_human: {
    name: string;
    role: string;
  };
  permission: {
    opted_in: boolean;
    reversible: boolean;
  };
}

/** Hero DEMO — port_2fa first mint. */
export const PORT_2FA_MANA_RECEIPT_DEMO: ManaReceiptDemoV0 = {
  schema_version: MANA_RECEIPT_SCHEMA_VERSION,
  status: 'DEMO',
  wait_type: 'port_2fa',
  context_hash:
    'sha256:7c4a8d09ca3762af61e59520943dc26494f8941b7d9c8a7b6f5e4d3c2b1a09f8',
  rules_hash:
    'sha256:2b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfe',
  currency_note:
    'Sample wallet credit shown beside the wait — not live currency, not a claim on any carrier balance.',
  receipt_id: 'MR-DEMO-PORT2FA-20260909',
  issued_at: '9 Sep 2026, 11:05am NZST',
  wait: {
    label: 'Port 2FA',
    window: 'YES ≤2h',
    auth_path: 'clear',
    moment: 'Number port in progress — 2FA window open',
  },
  earn: {
    sample_stamp_nzd: 0.45,
    destination_label: 'carrier wallet (sample)',
    permission: 'opted in · reversible',
  },
  ownership: {
    currency_owner: 'Carrier owns the currency',
    evidence_owner: 'assembl owns the evidence',
  },
  named_human: {
    name: 'Alex R.',
    role: 'loyalty operations',
  },
  permission: {
    opted_in: true,
    reversible: true,
  },
};

export const MANA_RECEIPT_DEMO_DISCLAIMER =
  'DEMO receipt only — sample wait→earn evidence. Not a live credit, not a carrier offer, not an affiliation claim.';

export const MANA_RECEIPT_DEMO_SPINE =
  'Port 2FA is underway. Credit can land while you wait — the auth path stays clear.';

export { ASSEMBL_CANON };

export function formatSampleCredit(amount: number): string {
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}
