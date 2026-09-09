/**
 * Gateway agent-app PREVIEW copy — pitch surface only.
 * Customs brokerage / tariff / entry. Concrete NZ English.
 * No partnership claims. No mana/kete product labels.
 * Draft-only honesty — nothing lodges to TSW or Customs.
 */

export const GATEWAY_PREVIEW = {
  metaTitle: 'Gateway · customs agent-app preview · concept · demo data',
  metaDescription:
    'Preview of Gateway — assembl’s customs brokerage agent-app with Pīkau. Observe the entry plate, flag tariff and border issues, draft actions that wait for human approval.',
  previewBadge: 'PREVIEW · concept · demo data · details fictional',
  demoBadge: 'DEMO',

  brand: 'gateway',
  productLine: 'assembl agent-app',
  heroLine: 'Border work that cites its pins.',
  heroSupport:
    'Gateway and Pīkau read the entry plate, flag tariff and Customs Act issues, and draft broker actions that wait for your yes.',

  assembleEyebrow: '01 · assemble',
  assembleTitle: 'Pins on the plate. Then an entry.',
  assembleSupport:
    'Flat-lay invoice, tariff strip and border stamps settle into a fictional NZ entry plate — DEMO only, not a lodged clearance.',
  ctaAssemble: 'Watch pins assemble',
  ctaPins: 'See DEMO pins',

  modelEyebrow: 'Click a pin',
  modelTitle: 'Your entry. Pins you can name.',
  modelSupport:
    'DEMO pins use Customs and Excise Act / Working Tariff references on a fictional broker plate. Nothing here is a real clearance check.',

  narrativeEyebrow: 'How Gateway works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Gateway watches the entry plate as lines arrive — HS gaps, missing origin proof, biosecurity holds, valuation evidence.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each pin arrives with a cited clause and plain-language summary, ready for a licensed broker to review.',
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
    'Gateway here. Ask about a DEMO tariff pin or an entry flag. I cite the rule, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Classify this line against the NZ Working Tariff',
      a: 'Draft ready — NZ Working Tariff · GRI. Line 2 reads as insulated cable with no confirmed heading. Proposed note cites GRI 1 / 3(b), lists candidate headings, and holds for broker sign-off. Status: awaiting human approval. Sources: DEMO pin hs-pending · Working Tariff (preview).',
    },
    {
      q: 'Draft an entry note for the missing certificate of origin',
      a: 'Draft ready — Customs and Excise Act 2018. Preference claim on this DEMO entry lacks a certificate of origin. The note marks the gap, lists acceptable proof, and waits. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does the biosecurity hold block clearance?',
      a: 'Draft ready — Biosecurity Act 1993. Wooden packing on this DEMO plate lacks an ISPM 15 mark for the scheduled release. Memo cites the pin and waits. Status: awaiting human approval. Nothing sends.',
    },
  ],
  chatFooter: 'draft-only · cites pins · DEMO · nothing lodges without you',
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
      detail: 'Browse DEMO pins and sample drafts on the entry plate.',
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
