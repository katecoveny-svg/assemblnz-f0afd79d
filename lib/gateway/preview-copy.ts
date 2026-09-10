/**
 * Gateway agent-app PREVIEW copy — pitch surface only.
 * Customs brokerage / tariff / entry / border / clearance.
 * Plain NZ English. No architecture plan-sheet language.
 * No partnership claims. No mana/kete product labels.
 * Draft-only honesty — nothing lodges to TSW or Customs.
 */

export const GATEWAY_PREVIEW = {
  metaTitle: 'Gateway · customs broker preview · concept · demo data',
  metaDescription:
    'Gateway helps a customs broker (with Pīkau) review an import entry before it lodges — flags tariff gaps, missing origin proof and biosecurity holds, cites the rule, and drafts a note that waits for a human yes. DEMO only.',
  previewBadge: 'PREVIEW · concept · demo data · details fictional',
  demoBadge: 'DEMO',

  brand: 'gateway',
  productLine: 'assembl agent-app',
  heroLine: 'Review the entry before it lodges.',
  heroSupport:
    'Gateway and Pīkau flag tariff gaps, missing origin proof and biosecurity holds on a DEMO entry pack, cite the rule, and draft a note that waits for your yes. Nothing lodges to Customs or TSW.',

  assembleEyebrow: '01 · entry pack',
  assembleTitle: 'Invoice, tariff and border — one DEMO pack.',
  assembleSupport:
    'A fictional NZ entry pack comes together so you can see the gaps before lodge. DEMO only — not a real clearance.',
  ctaAssemble: 'See the entry pack',
  ctaPins: 'Tap the DEMO flags',

  modelEyebrow: '02 · flags',
  modelTitle: 'Tap a flag on the entry pack.',
  modelSupport:
    'Each DEMO flag cites a Customs Act, Working Tariff or Biosecurity rule on a fictional broker pack. Nothing here is a real clearance check.',
  pinHint: 'Tap a flag on the entry pack',

  narrativeEyebrow: 'How Gateway works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Gateway watches the entry as lines arrive — HS gaps, missing origin proof, biosecurity holds, valuation evidence.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each flag arrives with a cited clause and plain-language note, ready for a licensed broker to review.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything lodges an entry, claims preference, or leaves the desk.',
    },
  ],

  chatEyebrow: 'Chat as proof',
  chatTitle: 'Ask once. Get a cited draft.',
  chatSupport:
    'Scripted preview — no model call, nothing sends. Every reply ends as a draft awaiting approval.',
  chatGreeting:
    'Gateway here. Ask about a DEMO tariff flag or an entry hold. I cite the rule, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Classify this line against the NZ Working Tariff',
      a: 'Draft ready — NZ Working Tariff · GRI. Line 2 reads as insulated cable with no confirmed heading. Proposed note cites GRI 1 / 3(b), lists candidate headings, and holds for broker sign-off. Status: awaiting human approval. Sources: DEMO flag hs-pending · Working Tariff (preview).',
    },
    {
      q: 'Draft an entry note for the missing certificate of origin',
      a: 'Draft ready — Customs and Excise Act 2018. Preference claim on this DEMO entry lacks a certificate of origin. The note marks the gap, lists acceptable proof, and waits. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does the biosecurity hold block clearance?',
      a: 'Draft ready — Biosecurity Act 1993. Wooden packing on this DEMO pack lacks an ISPM 15 mark for the scheduled release. Memo cites the flag and waits. Status: awaiting human approval. Nothing sends.',
    },
  ],
  chatFooter: 'draft-only · cites flags · DEMO · nothing lodges without you',
  approvalLabel: 'Awaiting human approval',
  evidenceLabel: 'Evidence receipt',

  pricingEyebrow: 'Hours back · credits',
  pricingTitle: 'Sketch pricing — not live checkout',
  pricingSupport:
    'UI sketch only. No payments, no SSO. Numbers are directional for the preview conversation — hours back, not seats sold.',
  hoursBack: 'hours back each week',
  hoursBackNote: 'Less chasing tariff gaps. More time on broker judgment.',
  tiers: [
    {
      name: 'Look',
      price: 'Free',
      detail: 'Browse DEMO flags and sample drafts on the entry pack.',
      credits: '0 credits',
      hoursBack: 0,
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for cited drafts on your own entry day.',
      credits: 'starter credits',
      hoursBack: 3,
    },
    {
      name: 'Studio',
      price: '~NZ$295',
      detail: 'Shared broker desk, more credits, shared evidence receipts.',
      credits: 'studio credits',
      hoursBack: 8,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      detail: 'Multi-desk standards, SSO later, procurement path — talk to assembl.',
      credits: 'by agreement',
      hoursBack: 20,
    },
  ],

  footerNote:
    'Gateway is an assembl agent-app preview with Pīkau. Independent concept — not a partnership with NZ Customs, MPI, or any brokerage named elsewhere. Draft-only — nothing lodges.',
  footerWordmark: 'assembl',
} as const;
