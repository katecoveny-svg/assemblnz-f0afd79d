/**
 * Forge agent-app PREVIEW copy — pitch surface only.
 * Automotive / dealership / workshop. Concrete NZ English.
 * No partnership claims. No mana/kete product labels.
 */

export const FORGE_PREVIEW = {
  metaTitle: 'Forge · automotive agent-app preview · concept · demo data',
  metaDescription:
    'Preview of Forge — assembl’s automotive dealership and workshop agent-app. Observe the floor plate, flag WoF and CCCFA issues, draft actions that wait for human approval.',
  previewBadge: 'PREVIEW · concept · demo data · details fictional',
  demoBadge: 'DEMO',

  brand: 'forge',
  productLine: 'assembl agent-app',
  heroLine: 'Workshop work that cites its flags.',
  heroSupport:
    'Forge reads the dealership floor plate, flags NZTA WoF/CoF and CCCFA issues, and drafts service actions that wait for your yes.',

  assembleEyebrow: '01 · assemble',
  assembleTitle: 'Parts on the plate. Then a bay.',
  assembleSupport:
    'Flat-lay chassis, wheels and bay fittings settle into a fictional NZ dealership floor plate — DEMO only, not a workshop schedule.',
  ctaAssemble: 'Watch parts assemble',
  ctaPins: 'See DEMO flags',

  modelEyebrow: 'Click a pin',
  modelTitle: 'Your floor. Flags you can name.',
  modelSupport:
    'DEMO pins use NZTA WoF/CoF and CCCFA references on a fictional dealership plan. Nothing here is a real compliance check.',

  narrativeEyebrow: 'How Forge works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Forge watches the floor plate as vehicles move — WoF bay status, CoF holds, CCCFA disclosure gaps.',
    },
    {
      id: 'advise' as const,
      label: '02',
      title: 'Advise',
      body: 'Each flag arrives with a cited clause and plain-language summary, ready for the service desk to review.',
    },
    {
      id: 'act' as const,
      label: '03',
      title: 'Act on approval',
      body: 'Drafts stay staged. A person approves before anything books a bay, sends a customer note, or leaves the desk.',
    },
  ],

  chatEyebrow: 'Chat as proof',
  chatTitle: 'Ask once. Get a cited draft.',
  chatSupport:
    'Scripted preview — no model call, nothing sends. Every reply ends as a draft awaiting approval.',
  chatGreeting:
    'Forge here. Ask about a DEMO WoF bay or a CCCFA flag. I cite the rule, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Check the WoF bay against NZTA inspection rules',
      a: 'Draft ready — NZTA WoF. Bay 2 has a vehicle past its due stamp with no staged inspection booking. Proposed note names the plate, cites the WoF requirement, and lists bay options. Status: awaiting human approval. Sources: DEMO pin wof-due · NZTA WoF (preview).',
    },
    {
      q: 'Draft a CCCFA disclosure note for this finance lead',
      a: 'Draft ready — CCCFA. Responsible lending disclosure is incomplete on this DEMO lead. The note marks missing fields and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does the CoF hold block the workshop day?',
      a: 'Draft ready — NZTA CoF. Heavy vehicle in bay 4 lacks a current CoF for the scheduled road test. Memo cites the pin and waits. Status: awaiting human approval. Nothing sends.',
    },
  ],
  chatFooter: 'draft-only · cites flags · DEMO · nothing sends without you',
  approvalLabel: 'Awaiting human approval',
  evidenceLabel: 'Evidence receipt',

  pricingEyebrow: 'Hours back · credits',
  pricingTitle: 'Sketch pricing — not live checkout',
  pricingSupport:
    'UI sketch only. No payments, no SSO. Numbers are directional for the preview conversation — hours back, not seats sold.',
  hoursBack: 'hours back each week',
  hoursBackNote: 'Less chasing WoF stamps. More time on the workshop floor.',
  tiers: [
    {
      name: 'Look',
      price: 'Free',
      detail: 'Browse DEMO flags and sample drafts on the floor plate.',
      credits: '0 credits',
      hoursBack: 0,
    },
    {
      name: 'Practice',
      price: '~NZ$99',
      detail: 'Personal seat for cited drafts on your own workshop day.',
      credits: 'starter credits',
      hoursBack: 3,
    },
    {
      name: 'Studio',
      price: '~NZ$295',
      detail: 'Shared rooftop seat, more credits, shared evidence receipts.',
      credits: 'studio credits',
      hoursBack: 8,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      detail: 'Multi-site standards, SSO later, procurement path — talk to assembl.',
      credits: 'by agreement',
      hoursBack: 20,
    },
  ],

  footerNote:
    'Forge is an assembl agent-app preview. Independent concept — not a partnership with any dealership, OEM, NZTA, or finance product named elsewhere.',
  footerWordmark: 'assembl',
} as const;
