/**
 * Ensemble agent-app PREVIEW copy — pitch surface only.
 * Marketing / creative studio. Concrete NZ English.
 * No partnership claims. No mana/kete product labels.
 * Prism / Auaha / creative-agency surfaces are demos/targets only — not partners.
 */

export const ENSEMBLE_PREVIEW = {
  metaTitle: 'Ensemble · creative agent-app preview · concept · demo data',
  metaDescription:
    'Preview of Ensemble — assembl’s marketing and creative studio agent-app. Observe the studio floor, flag ASA and Fair Trading issues, draft campaign actions that wait for human approval.',
  previewBadge: 'PREVIEW · concept · demo data · details fictional',
  demoBadge: 'DEMO',

  brand: 'ensemble',
  productLine: 'assembl agent-app',
  heroLine: 'Campaign work that cites its claims.',
  heroSupport:
    'Ensemble reads the studio floor plate, flags ASA and Fair Trading issues on the brand board, and drafts campaign actions that wait for your yes.',

  assembleEyebrow: '01 · assemble',
  assembleTitle: 'Formes on the sheet. Then a set.',
  assembleSupport:
    'Flat-lay type sheets, asset frames and campaign formes settle into a fictional NZ studio floor plate — DEMO only, not a live media plan.',
  ctaAssemble: 'Watch formes assemble',
  ctaPins: 'See DEMO pins',

  modelEyebrow: 'Click a pin',
  modelTitle: 'Your floor. Claims you can name.',
  modelSupport:
    'DEMO pins use ASA and Fair Trading Act references on a fictional studio plan. Nothing here is a real compliance clearance.',

  narrativeEyebrow: 'How Ensemble works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Ensemble watches the studio floor as campaigns take shape — brand board marks, claim lines, print imposition, asset sheets.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each flag arrives with a cited rule and plain-language summary, ready for the creative desk to review.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything books media, publishes a claim, or leaves the desk.',
    },
  ],

  chatEyebrow: 'Chat as proof',
  chatTitle: 'Ask once. Get a cited draft.',
  chatSupport:
    'Scripted preview — no model call, nothing sends. Every reply ends as a draft awaiting approval.',
  chatGreeting:
    'Ensemble here. Ask about a DEMO ASA pin or a Fair Trading flag. I cite the rule, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Check this headline against ASA truthfulness',
      a: 'Draft ready — ASA. The DEMO headline claims “NZ’s #1” without substantiation on the brand board. Proposed note names the claim line, cites ASA Principle 2, and lists evidence options. Status: awaiting human approval. Sources: DEMO pin asa-claim · ASA (preview).',
    },
    {
      q: 'Draft a Fair Trading note for this price claim',
      a: 'Draft ready — Fair Trading Act 1986. The DEMO offer omits material conditions on the price lock-up. The note marks missing fields and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not published.',
    },
    {
      q: 'Where does the print imposition block the campaign set?',
      a: 'Draft ready — studio plate. Forme B overlaps the trim on sheet 2 of this DEMO imposition. Memo cites the pin and waits. Status: awaiting human approval. Nothing sends.',
    },
  ],
  chatFooter: 'draft-only · cites claims · DEMO · nothing sends without you',
  approvalLabel: 'Awaiting human approval',
  evidenceLabel: 'Evidence receipt',

  pricingEyebrow: 'Hours back · credits',
  pricingTitle: 'Sketch pricing — not live checkout',
  pricingSupport:
    'UI sketch only. No payments, no SSO. Numbers are directional for the preview conversation — hours back, not seats sold.',
  hoursBack: 'hours back each week',
  hoursBackNote: 'Less chasing claim clearances. More time on the studio floor.',
  tiers: [
    {
      name: 'Look',
      price: 'Free',
      detail: 'Browse DEMO pins and sample drafts on the studio floor plate.',
      credits: '0 credits',
      hoursBack: 0,
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for cited drafts on your own campaign day.',
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
      detail: 'Multi-brand standards, SSO later, procurement path — talk to assembl.',
      credits: 'by agreement',
      hoursBack: 20,
    },
  ],

  footerNote:
    'Ensemble is an assembl agent-app preview. Independent concept — not a partnership with any creative agency, ASA, or third-party studio named elsewhere. Demo data only.',
  footerWordmark: 'assembl',
} as const;
