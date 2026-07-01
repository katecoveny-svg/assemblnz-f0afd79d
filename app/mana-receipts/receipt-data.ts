/**
 * Sample Mana Receipts — the shape of the signed audit record assembl writes
 * for every run. These are illustrative fixtures (not live runs); the sample
 * page lets a buyer download one as JSON to see the exact record structure.
 *
 * The project ref matches the one shown on the trust page so a curious auditor
 * can tie a receipt back to the database that wrote it (Supabase, Sydney,
 * AWS ap-southeast-2). SHA-256 seals here are illustrative.
 */

export type ReviewStatus = 'sealed' | 'awaiting-human';

export interface ManaReceipt {
  id: string;
  /** English agent name */
  agent: string;
  /** the bundle this run lives inside */
  bundle: string;
  /** which review tier applied (see §2 of the trust page) */
  reviewTier: 'light' | 'kaitiaki' | 'full';
  reviewTierLabel: string;
  /** what the agent read */
  read: string;
  /** what it cited */
  cited: string[];
  /** what was checked before the output left the agent */
  checked: string[];
  /** what still needs a human */
  needsHuman: string;
  /** model provider called + when + request shape */
  provider: string;
  providerCalledAt: string;
  requestShape: string;
  /** Supabase project ref — same number on every receipt */
  projectRef: string;
  /** tamper-evident seal over the sealed record */
  sha256: string;
  status: ReviewStatus;
  /** IPP 3A flag, when the output carries someone else's personal information */
  ippFlag?: string;
  /** named reviewer, with consent, when a human has signed */
  reviewedBy?: string;
  reviewedAt?: string;
}

export const SAMPLE_RECEIPTS: ManaReceipt[] = [
  {
    id: 'MR-2026-0701-AK41',
    agent: 'Pānui Parser',
    bundle: 'Family & Whānau',
    reviewTier: 'light',
    reviewTierLabel: 'Tier one — light review',
    read: 'One school newsletter PDF (3 pages) uploaded by the user.',
    cited: [
      'Term 3 calendar — pages 1–2 of the uploaded notice',
      'Permission slip deadline — page 3, paragraph 4',
    ],
    checked: [
      'Tikanga gate (Mead’s five tests) — passed',
      'Dates cross-checked against the source text',
      'No advice given — extraction only',
    ],
    needsHuman: 'Confirm the two calendar events before they are added to your phone.',
    provider: 'Anthropic (Claude)',
    providerCalledAt: '2026-07-01T08:14:22+12:00',
    requestShape: 'text-in / structured-json-out · no training use',
    projectRef: 'wurwcrgxjjwqdaxqceey',
    sha256: '9f2c1ab7e5d84c0f3b6a92d1e7c4508fbb1a0d63e29f7c845a1b2e3d4f5061a7',
    status: 'sealed',
    ippFlag:
      'This output contains personal information about someone other than the user (a named child). IPP 3A may apply. Consider whether notification is required before acting.',
  },
  {
    id: 'MR-2026-0701-BR09',
    agent: 'Invoice Tidy',
    bundle: 'Business & SME',
    reviewTier: 'light',
    reviewTierLabel: 'Tier one — light review',
    read: 'Bank statement CSV (42 lines) and 6 supplier invoices (PDF).',
    cited: [
      'Statement line 18 matched to invoice INV-2291',
      'Statement line 27 — no matching invoice found',
    ],
    checked: [
      'Tikanga gate (Mead’s five tests) — passed',
      'Arithmetic re-run on every reconciled total',
      'Flagged as draft — not a filed return',
    ],
    needsHuman: 'Review the one unmatched line before you close the month.',
    provider: 'Anthropic (Claude)',
    providerCalledAt: '2026-07-01T09:02:47+12:00',
    requestShape: 'text-in / structured-json-out · no training use',
    projectRef: 'wurwcrgxjjwqdaxqceey',
    sha256: '3d7e9042fa1c6b58e0a4d2f7c93b1560ad8e4712f0c96b3a4d5e6172839a0bcd',
    status: 'sealed',
  },
  {
    id: 'MR-2026-0701-CT02',
    agent: 'Counsel — Te Tiriti',
    bundle: 'Governance & Oversight',
    reviewTier: 'kaitiaki',
    reviewTierLabel: 'Tier two — kaitiaki review',
    read: 'A draft consultation summary referencing mana whenua interests.',
    cited: [
      'Te Tiriti o Waitangi — Article 2 (tino rangatiratanga)',
      'Local iwi management plan — section on wāhi tapu',
    ],
    checked: [
      'Tikanga gate (Mead’s five tests) — passed',
      'Kaitiaki review by a kaumātua-validated reviewer',
      'Marked draft — not for release without sign-off',
    ],
    needsHuman: 'A named kaitiaki reviewer signs before this is shared with the hapū.',
    provider: 'Anthropic (Claude)',
    providerCalledAt: '2026-07-01T10:31:05+12:00',
    requestShape: 'text-in / text-out · no training use',
    projectRef: 'wurwcrgxjjwqdaxqceey',
    sha256: 'c1a5f83b06e94d27f0b3a6d1e582c74099fbd4130e6a7c928b4d5e6f70819a23',
    status: 'awaiting-human',
    reviewedBy: 'Kaitiaki reviewer named on sign-off (with consent)',
  },
];

export const HERO_RECEIPT = SAMPLE_RECEIPTS[0];
