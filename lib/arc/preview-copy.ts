/**
 * Arc agent-app PREVIEW copy — pitch surface only.
 * Concrete NZ English. No partnership claims. No mana/kete product labels.
 */

export const ARC_PREVIEW = {
  metaTitle: 'Arc · architecture agent-app preview',
  metaDescription:
    'Arc helps an NZ architecture practice review a plan before it lodges — flags Building Code and plan gaps, cites the clause, and drafts a note that waits for a human yes. DEMO only.',
  previewBadge: 'PREVIEW · sample business · details fictional',
  demoBadge: 'DEMO',

  brand: 'arc',
  productLine: 'assembl agent-app',
  heroLine: 'Review the plan before it lodges.',
  heroSupport:
    'Arc flags NZ Building Code and plan gaps on a DEMO terrace, cites the clause, and drafts a note that waits for your yes. Nothing lodges a consent.',

  assembleEyebrow: '01 · plan pack',
  assembleTitle: 'Spaces, stairs and openings — one DEMO pack.',
  assembleSupport:
    'A fictional Auckland terrace plan comes together so you can see the gaps before lodge. DEMO only — not a consent set.',
  ctaAssemble: 'See the plan pack',
  ctaPins: 'Tap the DEMO flags',

  modelEyebrow: '02 · flags',
  modelTitle: 'Tap a flag on the plan.',
  modelSupport:
    'Each DEMO flag cites an NZBC or AUP-class rule on a fictional harbour terrace. Nothing here is a real consent check.',

  narrativeEyebrow: 'How Arc works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Arc watches the plan as spaces take shape — clearances, barriers, travel paths, openings.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each flag arrives with a clause citation and plain-language note, ready for review.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything changes a drawing or leaves the desk.',
    },
  ],

  chatEyebrow: 'Chat as proof',
  chatTitle: 'Ask once. Get a cited draft.',
  chatSupport:
    'Scripted preview — no model call, nothing sends. Every reply ends as a draft awaiting approval.',
  chatGreeting:
    'Arc here. Ask about a DEMO flag or a clearance. I cite the clause, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Check the stair handrail against NZBC D1',
      a: 'Draft ready — NZBC D1/AS1. The open stair rises past 1 m without a continuous handrail. Proposed note names the flight, cites the clause, and lists the fix options. Status: awaiting human approval. Sources: DEMO flag stair-handrail · NZBC D1/AS1 (preview).',
    },
    {
      q: 'Draft a clearance note for the accessible WC',
      a: 'Draft ready — NZBC G1 / NZS 4121. Turning circle reads short of 1500 mm on this DEMO plan. The note marks the wall shift and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does exit travel distance fail?',
      a: 'Draft ready — AUP H4 · NZBC C class check on this fictional layout. Furthest habitable room exceeds the demonstrated path. Memo cites the flag and waits. Status: awaiting human approval. Nothing sends.',
    },
  ],
  chatFooter: 'draft-only · cites clauses · DEMO · nothing sends without you',
  approvalLabel: 'Awaiting human approval',
  evidenceLabel: 'Evidence receipt',

  pricingEyebrow: 'Hours back · credits',
  pricingTitle: 'Sketch pricing — not live checkout',
  pricingSupport:
    'UI sketch only. No payments, no SSO. Numbers are directional for the preview conversation.',
  hoursBack: 'hours back each week',
  hoursBackNote: 'Less chasing clauses. More time on the design.',
  tiers: [
    {
      name: 'Look',
      price: 'Free',
      detail: 'Browse DEMO flags and sample drafts on this door.',
      credits: '0 credits',
      hoursBack: 0,
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for cited drafts on your own projects.',
      credits: 'starter credits',
      hoursBack: 3,
    },
    {
      name: 'Studio',
      price: '~NZ$295',
      detail: 'Shared studio seat, more credits, shared evidence receipts.',
      credits: 'studio credits',
      hoursBack: 8,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      detail: 'Firm standards, SSO later, procurement path — talk to assembl.',
      credits: 'by agreement',
      hoursBack: 20,
    },
  ],

  footerNote:
    'Arc is an assembl agent-app preview. Independent concept — not a partnership with any practice or third-party product named elsewhere. Draft-only — nothing lodges.',
  footerWordmark: 'assembl',
} as const;
