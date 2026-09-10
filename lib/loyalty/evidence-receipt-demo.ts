/**
 * Evidence receipt DEMO — wait→earn loyalty craft (Engage People craft BAR).
 *
 * Checklist #1198 (borrow craft principles — NOT Engage branding/copy):
 * 1. One plain-language outcome for members + operators
 * 2. System map: campaign → earn → pending/wait → Evidence receipt → balance →
 *    reward choice → redemption → confirmation
 * 3. Wait→earn explicit (status, timing, why, next action)
 * 4. Evidence receipt first-class (source, timestamp, rule, amount, status, audit)
 * 5. Real journey moments with UI surfaces
 * 6. Light operating layer (triggers / approvals / DEMO reporting)
 * 7. Assembl craft: plum/paper, Instrument/Plex, legible motion
 * 8. Trust strip DEMO directional — no fake logos
 * 9. Mobile stacks; full-width CTAs
 * 10. One CTA pattern: Inspect Evidence / Try port_2fa DEMO
 *
 * Locks:
 * - status is always DEMO · Phase 0 spine = port_2fa
 * - Carrier owns currency; assembl owns evidence
 * - No mana/kete · no bare "AI" · homepage `/` untouched
 */

import { ASSEMBL_CANON } from '@/lib/loyalty/one-nz';

export const EVIDENCE_RECEIPT_SCHEMA_VERSION = 'v0' as const;

export type EvidenceReceiptDemoStatus = 'DEMO';

/** Primary mint wait type for the Phase 0 DEMO spine. */
export type EvidenceReceiptWaitType = 'port_2fa';

export interface EvidenceReceiptDemoV0 {
  schema_version: typeof EVIDENCE_RECEIPT_SCHEMA_VERSION;
  status: EvidenceReceiptDemoStatus;
  wait_type: EvidenceReceiptWaitType;
  /** Mock hash over wait context — illustrative only. */
  context_hash: string;
  /** Mock hash over earn/permission rules — illustrative only. */
  rules_hash: string;
  /**
   * Currency adjacency note. Currency-generic.
   * Never asserts live wallet credit on a carrier balance.
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
  /** First-class Evidence receipt fields (checklist #4). */
  evidence: {
    source: string;
    timestamp: string;
    rule: string;
    amount_label: string;
    status: EvidenceReceiptDemoStatus;
    /** In-page audit anchor — DEMO only, not a live ledger URL. */
    audit_href: string;
    audit_label: string;
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
export const PORT_2FA_EVIDENCE_RECEIPT_DEMO: EvidenceReceiptDemoV0 = {
  schema_version: EVIDENCE_RECEIPT_SCHEMA_VERSION,
  status: 'DEMO',
  wait_type: 'port_2fa',
  context_hash:
    'sha256:7c4a8d09ca3762af61e59520943dc26494f8941b7d9c8a7b6f5e4d3c2b1a09f8',
  rules_hash:
    'sha256:2b7e151628aed2a6abf7158809cf4f3c762e7160f38b4da56a784d9045190cfe',
  currency_note:
    'Sample stamp beside the wait. DEMO only — not live currency, no claim on a carrier balance.',
  receipt_id: 'ER-DEMO-PORT2FA-20260909',
  issued_at: '9 Sep 2026, 11:05am NZST',
  wait: {
    label: 'Port 2FA',
    window: 'YES ≤2h',
    auth_path: 'clear',
    moment: 'Number port running · 2FA window open',
  },
  earn: {
    sample_stamp_nzd: 0.45,
    destination_label: 'carrier wallet (sample)',
    permission: 'opted in · reversible',
  },
  evidence: {
    source: 'wait_type · port_2fa',
    timestamp: '9 Sep 2026, 11:05am NZST',
    rule: 'earn beside clear auth · YES ≤2h · reversible permission',
    amount_label: '+$0.45 NZD (sample)',
    status: 'DEMO',
    audit_href: '#erd-receipt',
    audit_label: 'Open audit detail',
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

/** Full loyalty system map — checklist #2. */
export const EVIDENCE_RECEIPT_SYSTEM = [
  {
    id: 'campaign',
    step: '01',
    label: 'Campaign',
    body: 'Program opens a wait→earn offer. Member opts in. Reversible.',
  },
  {
    id: 'earn',
    step: '02',
    label: 'Earn',
    body: 'A real wait starts the sample stamp. No invented delay.',
  },
  {
    id: 'pending-wait',
    step: '03',
    label: 'Pending / wait',
    body: 'Status, window, and why-wait stay visible while auth stays clear.',
  },
  {
    id: 'evidence-receipt',
    step: '04',
    label: 'Evidence receipt',
    body: 'Source, timestamp, rule, amount, status, and audit link lock.',
  },
  {
    id: 'balance',
    step: '05',
    label: 'Balance',
    body: 'Sample credit sits on the carrier wallet. Ownership stays put.',
  },
  {
    id: 'reward-choice',
    step: '06',
    label: 'Reward choice',
    body: 'Member picks a DEMO destination. Draft only until human yes.',
  },
  {
    id: 'redemption',
    step: '07',
    label: 'Redemption',
    body: 'Staged redeem path. Nothing outbound from this page.',
  },
  {
    id: 'confirmation',
    step: '08',
    label: 'Confirmation',
    body: 'Named human confirms. Evidence receipt stays on the record.',
  },
] as const;

/** Explicit wait→earn panel — checklist #3. */
export const EVIDENCE_RECEIPT_WAIT = {
  status: 'Waiting · port_2fa · DEMO',
  timing: 'YES ≤2h from port start',
  why: 'Number port keeps a 2FA window open. Earn stamps beside it — auth is never slowed.',
  nextAction: 'Keep the Evidence receipt open. Named human reviews before settle.',
} as const;

/** Real journey moments with UI surfaces — checklist #5. */
export const EVIDENCE_RECEIPT_MOMENTS = [
  {
    id: 'first-earn',
    short: 'First earn',
    title: 'First earn lands beside the wait',
    summary:
      'Member sees the wait window, sample stamp, and auth-clear note on the phone surface.',
    ui: [
      { label: 'status', value: 'DEMO · waiting' },
      { label: 'window', value: 'YES ≤2h' },
      { label: 'sample stamp', value: '+$0.45' },
      { label: 'next', value: 'Hold for Evidence receipt' },
    ],
  },
  {
    id: 'receipt-review',
    short: 'Receipt review',
    title: 'Ops reviews the Evidence receipt',
    summary:
      'Loyalty ops opens source, timestamp, rule, amount, status, and the audit link before saying yes.',
    ui: [
      { label: 'source', value: 'wait_type · port_2fa' },
      { label: 'timestamp', value: '9 Sep 2026, 11:05am NZST' },
      { label: 'rule', value: 'earn beside clear auth' },
      { label: 'audit', value: 'Open detail · DEMO' },
    ],
  },
  {
    id: 'redeem',
    short: 'Redeem',
    title: 'Reward choice → staged redeem',
    summary:
      'Member picks a sample destination. Redeem stays staged until confirmation. Currency stays with the carrier.',
    ui: [
      { label: 'balance', value: '$0.45 sample' },
      { label: 'choice', value: 'carrier wallet (sample)' },
      { label: 'redemption', value: 'staged · not sent' },
      { label: 'confirm', value: 'Alex R. · loyalty ops' },
    ],
  },
] as const;

/** Light operating layer — checklist #6. */
export const EVIDENCE_RECEIPT_OPS = {
  eyebrow: 'Operating layer · DEMO',
  title: 'Triggers. Approvals. DEMO reporting.',
  support:
    'A light ops strip for this DEMO. Shows what fired, who must approve, and what reporting stays sample-only.',
  tiles: [
    {
      id: 'triggers',
      title: 'Triggers',
      body: 'port_2fa wait detected · permission opted in · auth path clear',
    },
    {
      id: 'approvals',
      title: 'Approvals',
      body: 'Named human Alex R. holds settle. Act stays locked without a yes.',
    },
    {
      id: 'reporting',
      title: 'DEMO reporting',
      body: 'Receipt count 1 · outbound 0 · sample stamp only · no live feed',
    },
  ],
} as const;

/** Connected loyalty workflows — kept for pin rail / legacy tests. */
export const EVIDENCE_RECEIPT_WORKFLOWS = [
  {
    id: 'wait-earn',
    step: '01',
    short: 'Wait → earn',
    title: 'Wait becomes the earn event',
    summary:
      'A real wait starts — port 2FA, hold, activation. assembl detects it and stamps a sample earn beside the wait. No invented delay.',
    pinCode: 'wait_type · port_2fa',
    pinTitle: 'Port 2FA · YES ≤2h',
    pinBody:
      'DEMO spine. Auth path stays clear while a sample stamp lands beside the wait. Not a live credit.',
    desk: 'Member · loyalty wait',
    demo: true as const,
  },
  {
    id: 'prove-wait',
    step: '02',
    short: 'Prove wait',
    title: 'Evidence receipt locks the proof',
    summary:
      'The wait, sample earn, permission, and named human lock into an Evidence receipt — wait proof you can keep and audit.',
    pinCode: 'Evidence receipt · v0',
    pinTitle: 'Proof you can keep',
    pinBody:
      'Mock context_hash and rules_hash. Status stays DEMO. Named human reviews before anything settles.',
    desk: 'Loyalty ops · audit',
    demo: true as const,
  },
  {
    id: 'redeem-credit',
    step: '03',
    short: 'Redeem path',
    title: 'Credit path stays with the program',
    summary:
      'Sample destination is the carrier wallet. Currency ownership never moves. assembl layers evidence on the existing program — no rip-replace.',
    pinCode: 'destination · sample',
    pinTitle: 'Carrier wallet (sample)',
    pinBody:
      'Permissioned, reversible, opted-in. DEMO adjacency only — no claim on a live balance.',
    desk: 'Program owner · currency',
    demo: true as const,
  },
  {
    id: 'agent-surface',
    step: '04',
    short: 'Agent desk',
    title: 'Ask the wait. Get a cited draft.',
    summary:
      'A loyalty agent answers wait, earn, and Evidence receipt questions in plain English — drafts stay staged for a human yes.',
    pinCode: 'conversation · DEMO',
    pinTitle: 'Scripted loyalty desk',
    pinBody:
      'Nothing outbound from this page. Replies end as drafts awaiting approval. Evidence stays labelled DEMO.',
    desk: 'Member · loyalty agent',
    demo: true as const,
  },
] as const;

/**
 * Full PREVIEW copy for `/journeys/evidence-receipt`.
 * Engage People craft BAR; Assembl-owned wait→earn wedge.
 */
export const EVIDENCE_RECEIPT_PREVIEW = {
  metaTitle: 'PREVIEW · Evidence receipt DEMO — port_2fa | assembl',
  metaDescription:
    'DEMO Evidence receipt for wait_type=port_2fa. Assembl turns wait into earn with auditable wait proof. Auth path stays clear. Sample only.',
  previewBadge: 'DEMO · draft-only · sample · NZ first',
  demoBadge: 'DEMO',

  brand: 'assembl',
  productLine: 'Evidence receipt · wait→earn',
  /** Checklist #1 — one outcome for members + operators. */
  heroLine: 'Members earn in the wait. Operators keep the proof.',
  heroSupport:
    'While a real wait runs — port 2FA first — assembl stamps a sample earn for the member and locks an Evidence receipt for the operator. Auth stays clear. Currency stays with the carrier.',

  kicker: 'wait_type · port_2fa · Phase 0 DEMO',
  spine:
    'Port 2FA can take up to two hours. Earn can stamp while you wait. 2FA stays on its own path.',
  disclaimer:
    'DEMO sample only. Not a live credit. No carrier offer. No affiliation.',

  /** Checklist #10 — one clear CTA pattern. */
  ctaInspect: 'Inspect Evidence receipt',
  ctaPort2fa: 'Try port_2fa DEMO',
  /** @deprecated Prefer ctaInspect */
  ctaWorkflows: 'Inspect Evidence receipt',
  ctaChat: 'Ask the loyalty desk',

  systemEyebrow: '01 · the system',
  systemTitle: 'Campaign through confirmation — one loyalty path.',
  systemSupport:
    'Eight stages from offer to confirmation. Wait→earn sits in the middle; Evidence receipt is the proof you keep.',

  waitEyebrow: '02 · wait → earn',
  waitTitle: 'Status. Timing. Why wait. Next action.',
  waitSupport:
    'Make the wait legible before the earn stamps. Auth path stays clear for the whole window.',

  receiptEyebrow: '03 · Evidence receipt',
  receiptTitle: 'First-class wait proof — not a footnote.',
  receiptSupport:
    'Source, timestamp, rule, amount, status, and an audit link. DEMO only — mock hashes, no live credit.',

  momentsEyebrow: '04 · journey moments',
  momentsTitle: 'First earn. Receipt review. Redeem.',
  momentsSupport:
    'Real UI surfaces for the three moments that matter — not slogan tiles.',

  whoForEyebrow: 'Who it is for',
  whoForTitle: 'Member wait. Loyalty ops. Program owner.',
  whoForSupport:
    'Built for NZ loyalty programs that want wait time to earn — without ripping out the wallet they already run.',
  whoForPoints: [
    {
      title: 'Member in the wait',
      body: 'Sees the wait, the sample stamp, and an Evidence receipt that names what happened — in plain English.',
    },
    {
      title: 'Loyalty operations',
      body: 'Reviews permission, hashes, and the named human on the record before anything settles.',
    },
    {
      title: 'Program owner',
      body: 'Keeps the currency. assembl layers wait proof on top — open adjacency, no rip-replace.',
    },
  ],

  metricsEyebrow: 'DEMO trust · directional',
  metricsTitle: 'Proof signals — not invented live scores.',
  metricsSupport:
    'Sample figures for this DEMO conversation only. Not Engage People benchmarks, not a signed carrier result, not a live feed. No fake client logos.',
  metrics: [
    {
      value: '≤2h',
      label: 'Port 2FA wait window',
      note: 'Phase 0 DEMO spine',
    },
    {
      value: 'clear',
      label: 'Auth path',
      note: '2FA never slowed for earn',
    },
    {
      value: '1',
      label: 'Human yes before settle',
      note: 'Named loyalty ops on the receipt',
    },
    {
      value: '0',
      label: 'Outbound sends from this page',
      note: 'DEMO never messages a member',
    },
  ],

  pillarsEyebrow: 'Loyalty suite',
  pillarsTitle: 'Five jobs a loyalty wait actually runs.',
  pillarsSupport:
    'Loyalty-tech suite clarity — Assembl wedge is monetised wait → earn with auditable Evidence receipts.',
  pillars: [
    {
      id: 'wait-earn',
      title: 'Wait → earn',
      body: 'Detect a real wait and stamp a sample earn beside it. The wait is the earn event.',
    },
    {
      id: 'prove',
      title: 'Prove the wait',
      body: 'Lock wait, earn, permission, and named human into an Evidence receipt — wait proof you can audit.',
    },
    {
      id: 'redeem',
      title: 'Redeem / credit path',
      body: 'Sample destination stays on the program wallet. Currency ownership never moves to assembl.',
    },
    {
      id: 'insights',
      title: 'Ops insight',
      body: 'Loyalty ops see hashes, permission state, and who must say yes — without a dashboard mush of fake KPIs.',
    },
    {
      id: 'layer',
      title: 'Layer, do not replace',
      body: 'Open adjacency on existing programs. Carrier keeps the balance; assembl keeps the evidence.',
    },
  ],

  workflowsEyebrow: 'Named workflows',
  workflowsTitle: 'Wait → earn → prove → credit path.',
  workflowsSupport:
    'Tap a workflow for a DEMO pin. This is a connected loyalty journey board — not a live member feed.',
  workflowsHint: 'DEMO pins · sample only · not live',

  portEyebrow: '05 · Phase 0 spine',
  portTitle: 'port_2fa mint — the concrete DEMO.',
  portSupport:
    'First visual wait_type. Phone receipt and detail ledger stay honest: status=DEMO, auth clear, sample stamp only.',

  narrativeEyebrow: '06 · human in the loop',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'assembl watches the wait — port 2FA window, permission state, sample stamp adjacency.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'A draft Evidence receipt assembles with hashes, ownership boundary, and a plain-language summary.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'A named human in loyalty ops reviews before anything settles. Nothing outbound without that yes.',
    },
  ],

  chatEyebrow: 'Conversation as proof',
  chatTitle: 'Ask the loyalty agent once.',
  chatSupport:
    'Scripted DEMO desk on this page. Every reply ends as a draft awaiting approval — nothing sends.',
  chatGreeting:
    'Loyalty desk here. Ask about wait→earn, the Evidence receipt, or the port_2fa DEMO. I cite the wait, draft the proof, and hold for a human yes.',
  chatOpeners: [
    {
      q: 'How does the wait earn?',
      a: 'Draft ready — wait→earn. A real wait (port_2fa · YES ≤2h) starts the sample stamp beside auth. 2FA stays on its own path. Status: awaiting human approval. Evidence receipt: DEMO · not a live credit.',
    },
    {
      q: 'Show the Evidence receipt',
      a: 'Draft ready — Evidence receipt. Locks wait label, sample earn, permission, and named human Alex R. Mock hashes only. Status: awaiting human approval. Nothing settles without a yes.',
    },
    {
      q: 'Who reviews the credit?',
      a: 'Draft ready — human yes. Loyalty operations (Alex R. on this DEMO) reviews before anything settles. Permission is opted in and reversible. Status: awaiting human approval. Outbound: none from this page.',
    },
    {
      q: 'Does this replace our wallet?',
      a: 'Draft ready — layer, do not replace. Carrier owns the currency. assembl owns the evidence. Sample destination stays on the program wallet. Status: DEMO adjacency only · no affiliation claim.',
    },
  ],
  chatFooter: 'draft-only · cites wait proof · DEMO · nothing sends without you',
  approvalLabel: 'Awaiting human approval',
  evidenceLabel: 'Evidence receipt',

  footerNote:
    'Evidence receipt is an assembl loyalty DEMO. Independent concept — not affiliated with any carrier or points marketplace. Schema v0 · mock hashes · DEMO only.',
  footerWordmark: 'assembl',

  nav: {
    studio: { label: 'Generative Studio', href: '/generative-studio' },
    operator: { label: 'Operator', href: '/admin/login' },
  },
} as const;

/** @deprecated Prefer EVIDENCE_RECEIPT_PREVIEW.disclaimer */
export const EVIDENCE_RECEIPT_DEMO_DISCLAIMER = EVIDENCE_RECEIPT_PREVIEW.disclaimer;

/** @deprecated Prefer EVIDENCE_RECEIPT_PREVIEW.spine */
export const EVIDENCE_RECEIPT_DEMO_SPINE = EVIDENCE_RECEIPT_PREVIEW.spine;

/** @deprecated Prefer EVIDENCE_RECEIPT_PREVIEW.heroLine */
export const EVIDENCE_RECEIPT_DEMO_HEADLINE = EVIDENCE_RECEIPT_PREVIEW.heroLine;

/** @deprecated Prefer EVIDENCE_RECEIPT_PREVIEW.kicker */
export const EVIDENCE_RECEIPT_DEMO_KICKER = EVIDENCE_RECEIPT_PREVIEW.kicker;

/** @deprecated Prefer EVIDENCE_RECEIPT_PREVIEW.nav */
export const EVIDENCE_RECEIPT_NAV = EVIDENCE_RECEIPT_PREVIEW.nav;

export { ASSEMBL_CANON };

export function formatSampleCredit(amount: number): string {
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}
