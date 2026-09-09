/**
 * Arc agent-app PREVIEW copy — pitch surface only.
 * Concrete, NZ English. No partnership claims. No mana/kete product labels.
 */

export const ARC_PREVIEW = {
  metaTitle: 'Arc · architecture agent-app preview',
  metaDescription:
    'Preview of Arc — assembl’s architecture and design agent-app. Observe the model, cite NZ code issues, draft fixes that wait for human approval.',
  previewBadge: 'PREVIEW · sample business · details fictional',
  demoBadge: 'DEMO',

  brand: 'arc',
  productLine: 'assembl agent-app',
  heroLine: 'Architecture work that cites its sources.',
  heroSupport:
    'Arc reads a model, flags NZ Building Code and plan issues, and drafts fixes that wait for your yes.',

  modelEyebrow: 'Click a pin',
  modelTitle: 'Your model. Issues you can name.',
  modelSupport:
    'DEMO pins use NZBC / AUP-class references on a fictional massing. Nothing here is a real consent check.',

  narrativeEyebrow: 'How Arc works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe',
      label: '01',
      title: 'Observe',
      body: 'Arc watches the model as spaces take shape — clearances, barriers, travel paths, openings.',
    },
    {
      id: 'advise',
      label: '02',
      title: 'Advise',
      body: 'Each issue arrives with a clause citation and plain-language summary, ready for review.',
    },
    {
      id: 'act',
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
    'Arc here. Ask about a DEMO pin or a clearance. I cite the clause, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Check the stair handrail against NZBC D1',
      a: 'Draft ready — NZBC D1/AS1. The open stair rises past 1 m without a continuous handrail. Proposed note names the flight, cites the clause, and lists the fix options. Status: awaiting human approval. Sources: DEMO pin stair-handrail · NZBC D1/AS1 (preview).',
    },
    {
      q: 'Draft a clearance note for the accessible WC',
      a: 'Draft ready — NZBC G1 / NZS 4121. Turning circle reads short of 1500 mm on this DEMO plan. The note marks the wall shift and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does exit travel distance fail?',
      a: 'Draft ready — AUP H4 · NZBC C class check on this fictional layout. Furthest habitable room exceeds the demonstrated path. Memo cites the pin and waits. Status: awaiting human approval. Nothing sends.',
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
      detail: 'Browse pins and sample drafts on DEMO models.',
      credits: '0 credits',
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for cited drafts on your own projects.',
      credits: 'starter credits',
    },
    {
      name: 'Studio',
      price: '~NZ$295',
      detail: 'Shared studio seat, more credits, shared evidence receipts.',
      credits: 'studio credits',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      detail: 'Firm standards, SSO later, procurement path — talk to assembl.',
      credits: 'by agreement',
    },
  ],

  footerNote:
    'Arc is an assembl agent-app preview. Independent concept — not a partnership with any practice or third-party product named elsewhere.',
  footerWordmark: 'assembl',
} as const;
