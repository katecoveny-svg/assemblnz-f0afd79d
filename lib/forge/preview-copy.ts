/**
 * Forge agent-app PREVIEW copy — automotive workshop / dealership desk.
 * Concrete NZ English. No architecture floor-plate grammar.
 * Honest path to live Arataki chat. No partnership claims.
 */

export const FORGE_PREVIEW = {
  metaTitle: 'Forge · automotive agent-app preview · concept · demo data',
  metaDescription:
    'Preview of Forge — assembl’s automotive dealership and workshop agent-app. Flag WoF and CCCFA issues on the service bay, draft actions that wait for human approval.',
  previewBadge: 'DEMO · draft-only · sample business · details fictional',
  demoBadge: 'DEMO',

  brand: 'forge',
  productLine: 'assembl agent-app',
  heroLine: 'Workshop work that cites its flags.',
  heroSupport:
    'Forge watches the service bay — WoF due stamps, CoF holds, CCCFA disclosure gaps — and stages notes that wait for your yes.',

  bayEyebrow: '01 · service bay',
  bayTitle: 'Flags on the bay board.',
  baySupport:
    'DEMO flags use NZTA WoF/CoF and CCCFA references on a fictional workshop day. Nothing here is a real compliance check.',
  ctaBay: 'See DEMO bay flags',
  ctaChat: 'Chat with Arataki',
  aratakiHref: '/agents/arataki',
  aratakiNote:
    'Live automotive chat lives on Arataki — the dealership agent. This page is a DEMO craft preview only.',

  narrativeEyebrow: 'How Forge works',
  narrativeTitle: 'Observe. Advise. Act on approval.',
  chapters: [
    {
      id: 'observe' as const,
      label: '01',
      title: 'Observe',
      body: 'Forge watches the service bay as vehicles move — WoF bay status, CoF holds, CCCFA disclosure gaps.',
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
    'Scripted preview on this door — or open Arataki for the live automotive agent. Every reply here ends as a draft awaiting approval.',
  chatGreeting:
    'Forge here. Ask about a DEMO WoF bay or a CCCFA flag. I cite the rule, draft the note, and hold it for your approval.',
  chatOpeners: [
    {
      q: 'Check the WoF bay against NZTA inspection rules',
      a: 'Draft ready — NZTA WoF. Bay 2 has a vehicle past its due stamp with no staged inspection booking. Proposed note names the plate, cites the WoF requirement, and lists bay options. Status: awaiting human approval. Sources: DEMO flag wof-due · NZTA WoF (preview).',
    },
    {
      q: 'Draft a CCCFA disclosure note for this finance lead',
      a: 'Draft ready — CCCFA. Responsible lending disclosure is incomplete on this DEMO lead. The note marks missing fields and holds for sign-off. Status: awaiting human approval. Evidence receipt: DEMO · not lodged.',
    },
    {
      q: 'Where does the CoF hold block the workshop day?',
      a: 'Draft ready — NZTA CoF. Heavy vehicle in bay 4 lacks a current CoF for the scheduled road test. Memo cites the flag and waits. Status: awaiting human approval. Nothing sends.',
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
      detail: 'Browse DEMO bay flags and sample drafts on this door.',
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
    'Forge is an assembl agent-app preview. Independent concept — not a partnership with any dealership, OEM, NZTA, or finance product named elsewhere. Demo data only.',
  footerWordmark: 'assembl',
} as const;
