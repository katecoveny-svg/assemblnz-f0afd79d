/**
 * bp Road-Ready · Sponsored Agent journey (DEMO)
 *
 * Vertical LOCK (Kate / CoS · Builder inventory):
 *   BP NZ = **fuel / convenience retail loyalty** — NOT electricity / energy switch.
 *
 * Folds into Task DO Maker Mode B (`PARTNER_SKINS.bp`) — not a parallel demo route,
 * and **does not fork** Assembling / Dash. Reuses Assembling ASA disclosure grammar:
 * the word **Sponsored** (title case) as the compliance pill; DEMO honesty is separate.
 *
 * Spine (SPONSORED_AGENT_JOURNEYS.md):
 * wait-at-pump / app loyalty → branded agent → useful next step (points, nearby site,
 * offer if genuine) → DO Permit → DEMO action → receipt.
 *
 * Provider-neutral; no OpenAI Ads API dependency. PREVIEW only — no live bp partnership.
 */

/** Assembling ASA disclosure label — do not invent variants (“Ad”, “Promoted”, etc.). */
export const BP_ASA_SPONSORED_LABEL = 'Sponsored' as const;

/** Builder inventory vertical — hard lock against energy-switch drift. */
export const BP_VERTICAL = {
  id: 'fuel-convenience-retail-loyalty',
  label: 'Fuel / convenience retail loyalty',
  not: 'Not electricity switch, ICP, home energy plans, or Contact Energy demos.',
} as const;

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
  /**
   * Show Assembling ASA “Sponsored” pill (ad / loyalty / offer-facing steps).
   * Permit / action / receipt keep DEMO honesty without re-labelling as ads.
   */
  showSponsoredLabel?: boolean;
};

export const BP_SPONSORED_SCENARIO = {
  id: 'bp-pump-wait-fuel-loyalty',
  vertical: BP_VERTICAL.id,
  label: 'Pump / app wait · fuel & convenience loyalty',
  persona: 'Alex · bp Rewards (DEMO)',
  location: 'bp Thorndon · pump 4',
  waitReason: 'I’m waiting for a fill',
  intent:
    'Use this pump or in-app wait: check nearby bp, see points I can earn, and only take an offer if it is genuine.',
  differentiator:
    'Unlike a chat-only sponsored agent, Assembl completes a bounded loyalty job under DO Permit and leaves a receipt. Provider-neutral — not built on OpenAI Ads. Not an electricity switch demo.',
} as const;

export const BP_SPONSORED_STEPS: readonly SponsoredJourneyStep[] = [
  {
    id: 'moment',
    phase: '01 · Loyalty moment',
    title: 'Waiting at the pump',
    body: 'Alex is mid-fill at bp Thorndon — or the same wait in the bp app. The wait is real. A labelled loyalty helper can step in: skippable, drafts-only until approved.',
    evidence: 'DEMO · fuel / convenience loyalty · no live pump or app telemetry',
    cta: 'Meet the bp agent',
    showSponsoredLabel: true,
  },
  {
    id: 'agent',
    phase: '02 · Branded agent',
    title: 'bp Road-Ready',
    body: 'A branded bp helper opens with partner chrome (green / yellow). One job: make this fuel or convenience wait useful. Assembl stays a small credit. No live bp account link.',
    evidence: 'DEMO skin · PARTNER_SKINS.bp · offline config · not Assembling/Dash fork',
    cta: 'Share what you need',
    showSponsoredLabel: true,
  },
  {
    id: 'intent',
    phase: '03 · Understand intent',
    title: '“I’m waiting for a fill”',
    body: 'Intent: use the wait. Useful next steps only — nearby bp site, loyalty points on this fill, or a convenience offer if it genuinely fits. No energy-plan talk.',
    evidence: 'No side effects · intent parse only · vertical = fuel / convenience loyalty',
    cta: 'Assemble next step',
    showSponsoredLabel: false,
  },
  {
    id: 'assemble',
    phase: '04 · Assemble',
    title: 'Points · nearby site · fit check',
    body: 'Draft next step: this site 91 @ $2.49 · bp Pipitea 91 @ $2.47 (2 min). Points: this fill already earns bp Rewards. Convenience: +50 points on in-store coffee if you stay for this fill — only if that offer is still relevant.',
    evidence: 'DEMO prices & points · not live board scrape or rewards API',
    cta: 'Review genuine offer',
    showSponsoredLabel: false,
  },
  {
    id: 'offer',
    phase: '05 · Offer if genuine',
    title: 'Stay · coffee points',
    body: 'Nearby saving is only 2c/L (~$1 on 50L) and Alex is already pumping, so the agent recommends staying. Offer: +50 bp Rewards on coffee — ASA “Sponsored”, removable, not a condition of help.',
    evidence: 'Offer gated · unpaid path still available · ASA Sponsored on this step',
    cta: 'Prepare DO Permit',
    note: 'Unpaid path: skip offer and just get a wait / points status draft.',
    showSponsoredLabel: true,
  },
  {
    id: 'permit',
    phase: '06 · DO Permit',
    title: 'Approve before anything runs',
    body: 'Prepare locks the args: apply coffee-points offer to this DEMO fill; no payment; no fuel purchase; no external send. Permit TTL 15m · max uses 1 · medium risk.',
    evidence: 'prepare → permit · argument hash DEMO-lock',
    cta: 'Issue DEMO Permit',
    requiresPermit: true,
    note: 'Nothing executes until you say yes.',
    showSponsoredLabel: false,
  },
  {
    id: 'action',
    phase: '07 · Action (DEMO)',
    title: 'Execute under permit',
    body: 'Under the permit, the DEMO adapter records the loyalty earn draft and stamps a verify check. No real points minted. No CRM write yet.',
    evidence: 'execute · DEMO adapter · idempotent key demo-fill-4',
    cta: 'Stub CRM handoff',
    showSponsoredLabel: false,
  },
  {
    id: 'handoff',
    phase: '08 · CRM / commerce stub',
    title: 'Handoff prepared',
    body: 'A commerce/CRM webhook stub is staged (hook-later). Payload: persona, site, offer id, permit id. Not delivered until a real connector is configured.',
    evidence: 'connector · hook-later · no live HubSpot/Shopify',
    cta: 'Open receipt',
    showSponsoredLabel: false,
  },
  {
    id: 'receipt',
    phase: '09 · Receipt',
    title: 'What happened',
    body: 'Receipt lists loyalty moment → intent → points / nearby / offer → permit → DEMO execute → staged handoff. Sponsor reporting uses receipts — not chat impressions alone.',
    evidence: 'rcp_demo_bp_road_ready · append-only DEMO · PREVIEW',
    cta: 'Replay from start',
    showSponsoredLabel: false,
  },
] as const;

export type BpSponsoredReceipt = {
  receiptId: string;
  scenarioId: string;
  vertical: typeof BP_VERTICAL.id;
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
    vertical: BP_VERTICAL.id,
    persona: BP_SPONSORED_SCENARIO.persona,
    location: BP_SPONSORED_SCENARIO.location,
    intent: BP_SPONSORED_SCENARIO.intent,
    offer: '+50 bp Rewards on coffee · stay for this fill',
    permitId: `prm_demo_bp_${stamp}`,
    actionStatus: 'demo_succeeded',
    handoff: 'staged_hook_later',
    honesty:
      'DEMO / PREVIEW only. Fuel & convenience loyalty — not electricity. No live bp Rewards, fuel board, payment or CRM write.',
  };
}

export function sponsoredJourneyStepIndex(id: SponsoredJourneyStepId): number {
  return BP_SPONSORED_STEPS.findIndex((step) => step.id === id);
}

/** Guard for agents / tests — reject energy-switch wording in BP demo copy. */
export const BP_VERTICAL_FORBIDDEN = [
  /\belectric(?:ity)?\b/i,
  /\benergy plan\b/i,
  /\bhome energy\b/i,
  /\bICP\b/,
  /\bplan switch\b/i,
  /\bContact Energy\b/i,
] as const;

export function bpCopyViolatesVerticalLock(text: string): boolean {
  return BP_VERTICAL_FORBIDDEN.some((pattern) => pattern.test(text));
}
