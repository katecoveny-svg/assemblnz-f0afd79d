/**
 * bp Road-Ready · Sponsored Agent journey (DEMO)
 *
 * Folds into Task DO Maker Mode B (`PARTNER_SKINS.bp`) — not a parallel demo route.
 * Assembl Sponsored Journeys differentiator vs ChatGPT Sponsored Agents:
 * branded agent → intent → useful next step → genuine offer → DO Permit → action → CRM stub → receipt.
 * Provider-neutral; no OpenAI Ads API dependency.
 */

export type SponsoredJourneyStepId =
  | 'moment'
  | 'agent'
  | 'intent'
  | 'assemble'
  | 'offer'
  | 'permit'
  | 'action'
  | 'handoff'
  | 'receipt';

export type SponsoredJourneyStep = {
  id: SponsoredJourneyStepId;
  phase: string;
  title: string;
  body: string;
  /** Mono evidence / DEMO label line */
  evidence: string;
  /** Primary control label for advancing */
  cta: string;
  /** Optional secondary note under CTA */
  note?: string;
  /** Whether this step requires an explicit human yes before advance */
  requiresPermit?: boolean;
};

export const BP_SPONSORED_SCENARIO = {
  id: 'bp-pump-wait-fuel-loyalty',
  label: 'Pump wait · fuel loyalty',
  persona: 'Alex · bp Rewards (DEMO)',
  location: 'bp Thorndon · pump 4',
  waitReason: 'I’m waiting for a fill',
  intent: 'Find a useful next step while I wait — cheaper nearby fuel if it helps, or a genuine loyalty earn.',
  differentiator:
    'Unlike a chat-only sponsored agent, Assembl completes a bounded job under DO Permit and leaves a receipt. Provider-neutral — not built on OpenAI Ads.',
} as const;

export const BP_SPONSORED_STEPS: readonly SponsoredJourneyStep[] = [
  {
    id: 'moment',
    phase: '01 · Loyalty moment',
    title: 'Waiting at the pump',
    body: 'Alex is mid-fill at bp Thorndon. The wait is real. A sponsored helper can step in — labelled, skippable, and drafts-only until approved.',
    evidence: 'DEMO · sponsored moment · no live pump telemetry',
    cta: 'Meet the bp agent',
  },
  {
    id: 'agent',
    phase: '02 · Branded agent',
    title: 'bp Road-Ready',
    body: 'A branded bp helper opens with partner chrome (green / yellow). Assembl stays a small credit. No claim of a live bp account link.',
    evidence: 'DEMO skin · PARTNER_SKINS.bp · offline config',
    cta: 'Share what you need',
  },
  {
    id: 'intent',
    phase: '03 · Understand intent',
    title: '“I’m waiting for a fill”',
    body: 'Intent is clear: use the wait. Prefer a useful next step over a banner. Cheaper nearby fuel only if it is genuinely better; otherwise stay put and earn on this fill.',
    evidence: 'No side effects · intent parse only',
    cta: 'Assemble next step',
  },
  {
    id: 'assemble',
    phase: '04 · Assemble',
    title: 'Nearby fuel + loyalty check',
    body: 'Draft comparison: this site 91 @ $2.49 · bp Pipitea 91 @ $2.47 (2 min). Loyalty: fill here qualifies for +50 bp Rewards points on an in-store coffee while you wait — only if you stay for this fill.',
    evidence: 'DEMO prices · not live board scrape',
    cta: 'Review genuine offer',
  },
  {
    id: 'offer',
    phase: '05 · Offer if relevant',
    title: 'Stay · earn coffee points',
    body: 'Because the nearby saving is only 2c/L (~$1 on 50L) and Alex is already pumping, the agent recommends staying. Offer: +50 bp Rewards on coffee — labelled sponsored, removable, not a condition of help.',
    evidence: 'Offer gated · unpaid path still available',
    cta: 'Prepare DO Permit',
    note: 'Unpaid path: skip offer and just get a wait status draft.',
  },
  {
    id: 'permit',
    phase: '06 · DO Permit',
    title: 'Approve before anything runs',
    body: 'Prepare locks the args: apply coffee-points offer to this DEMO fill; no payment; no plan switch; no external send. Permit TTL 15m · max uses 1 · medium risk.',
    evidence: 'prepare → permit · argument hash DEMO-lock',
    cta: 'Issue DEMO Permit',
    requiresPermit: true,
    note: 'Nothing executes until you say yes.',
  },
  {
    id: 'action',
    phase: '07 · Action (DEMO)',
    title: 'Execute under permit',
    body: 'Under the permit, the DEMO adapter records the loyalty earn draft and stamps a verify check. No real points minted. No CRM write yet.',
    evidence: 'execute · DEMO adapter · idempotent key demo-fill-4',
    cta: 'Stub CRM handoff',
  },
  {
    id: 'handoff',
    phase: '08 · CRM / commerce stub',
    title: 'Handoff prepared',
    body: 'A commerce/CRM webhook stub is staged (hook-later). Payload: persona, site, offer id, permit id. Not delivered until a real connector is configured.',
    evidence: 'connector · hook-later · no live HubSpot/Shopify',
    cta: 'Open receipt',
  },
  {
    id: 'receipt',
    phase: '09 · Receipt',
    title: 'What happened',
    body: 'Receipt lists moment → intent → offer → permit → DEMO execute → staged handoff. Sponsor reporting can use receipts — not chat impressions alone.',
    evidence: 'rcp_demo_bp_road_ready · append-only DEMO',
    cta: 'Replay from start',
  },
] as const;

export type BpSponsoredReceipt = {
  receiptId: string;
  scenarioId: string;
  persona: string;
  location: string;
  intent: string;
  offer: string;
  permitId: string;
  actionStatus: 'demo_succeeded';
  handoff: 'staged_hook_later';
  honesty: string;
};

export function buildBpSponsoredReceipt(now = new Date()): BpSponsoredReceipt {
  const stamp = now.toISOString().replace(/[:.]/g, '').slice(0, 15);
  return {
    receiptId: `rcp_demo_bp_${stamp}`,
    scenarioId: BP_SPONSORED_SCENARIO.id,
    persona: BP_SPONSORED_SCENARIO.persona,
    location: BP_SPONSORED_SCENARIO.location,
    intent: BP_SPONSORED_SCENARIO.intent,
    offer: '+50 bp Rewards on coffee · stay for this fill',
    permitId: `prm_demo_bp_${stamp}`,
    actionStatus: 'demo_succeeded',
    handoff: 'staged_hook_later',
    honesty: 'DEMO only. No live bp Rewards, fuel board, payment or CRM write.',
  };
}

export function sponsoredJourneyStepIndex(id: SponsoredJourneyStepId): number {
  return BP_SPONSORED_STEPS.findIndex((step) => step.id === id);
}
