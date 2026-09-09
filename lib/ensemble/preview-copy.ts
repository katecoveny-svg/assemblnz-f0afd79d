/**
 * Ensemble agent-app — creative studio front door copy.
 * Marketing / creative desk. Concrete NZ English.
 * No partnership claims. No mana product labels.
 * Floor-plate / architecture craft is retired for Ensemble — Arc keeps that kit.
 */

export const ENSEMBLE_PREVIEW = {
  metaTitle: 'Ensemble · creative studio',
  metaDescription:
    'Ensemble is assembl’s creative studio agent-app. Brief the desk once — copy, stills, film and voice assemble into a package that waits for your yes.',
  previewBadge: 'DEMO · draft-only · sample business · details fictional',
  demoBadge: 'DEMO',

  brand: 'ensemble',
  productLine: 'assembl agent-app',
  heroLine: 'Brief once. The package assembles.',
  heroSupport:
    'Ensemble is the creative studio front door — brand board, generative craft, and a desk that stages copy, stills, film and voice for human approval.',

  assembleEyebrow: '01 · brief desk',
  assembleTitle: 'A brief on the desk. Then a package.',
  assembleSupport:
    'Strategy, copy, stills, film and voice settle into one reviewable set — DEMO package only, not a live campaign.',
  ctaAssemble: 'Watch the package assemble',
  ctaBoard: 'Open the brand board',

  boardEyebrow: 'Brand board',
  boardTitle: 'Work you can point at.',
  boardSupport:
    'Real samples from the creative desk — stills, film, voice and copy. Every piece is labelled DEMO and stays draft-only until a person says yes.',

  toolsEyebrow: 'Studio craft',
  toolsTitle: 'Open the live tools.',
  toolsSupport:
    'Generative Studio, Pattern Studio, Ad Studio, plus Auaha, Prism and Muse — the same craft DNA behind this desk.',

  workspaceEyebrow: 'Creative workspace',
  workspaceTitle: 'The desk that runs the brief.',
  workspaceSupport:
    'Pick a maker, drop a brief, watch the package stage. Scripted DEMO on this door — open the live workspace when you want the full console.',
  workspaceCta: 'Open live workspace',

  narrativeEyebrow: 'How Ensemble works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Ensemble watches the brief land — audience, offer, brand marks, claim lines, asset shelf.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each piece arrives cited and plain: copy options, art direction, film beat, voice script — ready for the desk to review.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything books media, publishes a claim, or leaves the desk.',
    },
  ],

  chatEyebrow: 'Chat as proof',
  chatTitle: 'Ask once. Get a staged draft.',
  chatSupport:
    'Scripted preview — no model call, nothing sends. Every reply ends as a draft awaiting approval.',
  chatGreeting:
    'Ensemble here. Ask about a DEMO claim on the brand board, a package brief, or a Fair Trading note. I cite the rule, draft the piece, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Assemble a winter café package from this brief',
      a: 'Draft ready — package. Strategy: warm winter cuppa for Wellington walk-ins. Muse: three headline options + social cut. Prism: editorial product still brief. Flux: 15s steam-and-cup film beat. Verse: 40s voice script. Status: awaiting human approval. Sources: DEMO brief · brand board (preview).',
    },
    {
      q: 'Check this headline against ASA truthfulness',
      a: 'Draft ready — ASA. The DEMO headline claims “NZ’s #1” without substantiation on the brand board. Proposed note names the claim line, cites ASA Principle 2, and lists evidence options. Status: awaiting human approval. Sources: DEMO pin asa-claim · ASA (preview).',
    },
    {
      q: 'Draft a Fair Trading note for this price claim',
      a: 'Draft ready — Fair Trading Act 1986. The DEMO offer omits material conditions on the price lock-up. The note marks missing fields and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not published.',
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
  hoursBackNote: 'Less chasing claim clearances. More time on the creative desk.',
  tiers: [
    {
      name: 'Look',
      price: 'Free',
      detail: 'Browse the DEMO brand board and sample package on this door.',
      credits: '0 credits',
      hoursBack: 0,
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for staged drafts on your own campaign day.',
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
    'Ensemble is an assembl agent-app. Independent concept — not a partnership with any creative agency, ASA, or third-party studio named elsewhere. Demo data only.',
  footerWordmark: 'assembl',
} as const;

export const ENSEMBLE_STUDIO_LINKS = [
  {
    href: '/generative-studio',
    label: 'Generative Studio',
    note: 'shaders · materials · motion',
  },
  {
    href: '/pattern-studio',
    label: 'Pattern Studio',
    note: 'brand patterns · exports',
  },
  {
    href: '/ad-studio',
    label: 'Ad Studio',
    note: 'genome-driven ads',
  },
  {
    href: '/agents/auaha',
    label: 'Auaha',
    note: 'creative lead',
  },
  {
    href: '/agents/prism',
    label: 'Prism',
    note: 'art direction',
  },
  {
    href: '/agents/muse',
    label: 'Muse',
    note: 'copy & campaigns',
  },
] as const;
