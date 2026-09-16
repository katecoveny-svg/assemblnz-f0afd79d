/**
 * Pursuit journey builder + Sponsored Agent module — extends Task DO Maker.
 *
 * Provider-neutral Assembl Sponsored Journeys shape (see
 * docs/do-action-cloud/SPONSORED_AGENT_JOURNEYS.md). Labelling grammar matches
 * Assembling ASA "Sponsored" disclosure — do not fork Assembling/Dash.
 *
 * BP seed extends PARTNER_SKINS.bp (Road-Ready) — no second BP skin.
 */

import type { PartnerSlug } from './task-do-maker';

export const PURSUIT_JOURNEY_DRAFT_KEY = 'assembl:studio:pursuit-journey:v1';
export const OUTREACH_LEAD_KEY = 'assembl:pursuit:outreach-leads:v1';

export type JourneyStepKind = 'opportunity' | 'ideas' | 'experience' | 'pitch' | 'custom';

export type JourneyStep = {
  id: string;
  kind: JourneyStepKind;
  label: string;
  brief: string;
  enabled: boolean;
};

/** Sponsored Agent stages — Kate order + #1310 schema. */
export type SponsoredStageId =
  | 'ad_loyalty'
  | 'branded_agent'
  | 'useful_step'
  | 'genuine_offer'
  | 'permit'
  | 'action'
  | 'receipt';

export type SponsoredStage = {
  id: SponsoredStageId;
  label: string;
  copy: string;
  /** ASA / Assembling labelling — always true on ad-facing stages. */
  showSponsoredLabel: boolean;
  /** Consequential steps stay DEMO-honest. */
  demoOnly: boolean;
};

export type SponsoredAgentModule = {
  enabled: boolean;
  /** Fixed Assembling grammar — never invent alternate disclosure copy. */
  asaLabel: 'Sponsored';
  sponsorName: string;
  unpaidPathNote: string;
  honesty: string;
  stages: SponsoredStage[];
};

export type OutreachGate = {
  enabled: boolean;
  headline: string;
  body: string;
  ctaLabel: string;
  unlockNote: string;
  honesty: string;
};

export type BrandAssets = {
  /** Optional uploaded imagery as data URL (browser draft only). */
  imageryDataUrl: string;
  /** Optional secondary mark / lockup. */
  markDataUrl: string;
};

export type PursuitJourney = {
  /** Freeform opportunity / journey brief — not locked to preset verticals. */
  brief: string;
  /** Client-facing journey title (e.g. BP Loyalty Moment Concierge). */
  title: string;
  steps: JourneyStep[];
  sponsored: SponsoredAgentModule;
  outreach: OutreachGate;
  assets: BrandAssets;
};

export type OutreachLead = {
  name: string;
  email: string;
  company: string;
  interest: string;
  capturedAt: string;
  surface: 'creator-share' | 'playground';
};

const ASA_LABEL = 'Sponsored' as const;

function step(
  kind: JourneyStepKind,
  label: string,
  brief: string,
  enabled = true,
): JourneyStep {
  return {
    id: `step_${kind}_${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 24)}`,
    kind,
    label,
    brief,
    enabled,
  };
}

function sponsoredStage(
  id: SponsoredStageId,
  label: string,
  copy: string,
  opts: { showSponsoredLabel?: boolean; demoOnly?: boolean } = {},
): SponsoredStage {
  return {
    id,
    label,
    copy,
    showSponsoredLabel: opts.showSponsoredLabel ?? true,
    demoOnly: opts.demoOnly ?? false,
  };
}

export function emptyBrandAssets(): BrandAssets {
  return { imageryDataUrl: '', markDataUrl: '' };
}

export function defaultOutreachGate(): OutreachGate {
  return {
    enabled: true,
    headline: 'See the deeper demo',
    body: 'Leave a note if you want API access or a walkthrough. We unlock the full interaction after that — still DEMO, still drafts-only.',
    ctaLabel: 'Request access',
    unlockNote: 'Thanks — the deeper demo is unlocked in this browser.',
    honesty: 'DEMO lead capture stays in this browser until you export or hand off. Nothing is emailed from this page.',
  };
}

export function defaultPursuitSteps(): JourneyStep[] {
  return [
    step('opportunity', 'Opportunity', 'Name the customer moment and the evidence that makes it worth a conversation.'),
    step('ideas', 'Ideas', 'Sketch two or three credible directions. Keep claims modest.'),
    step('experience', 'Experience', 'Shape the interaction people would actually feel — wait, helper, offer, receipt.'),
    step('pitch', 'Pitch', 'Prepare the short conversation: problem, proof, next ask.'),
  ];
}

export function defaultSponsoredModule(sponsorName = 'Partner'): SponsoredAgentModule {
  return {
    enabled: false,
    asaLabel: ASA_LABEL,
    sponsorName,
    unpaidPathNote: 'An unpaid path stays available — sponsored steps are labelled and skippable.',
    honesty: 'DEMO only. No live ad network, OpenAI Ads API, or partner rewards API.',
    stages: [
      sponsoredStage('ad_loyalty', 'Ad / loyalty moment', 'A labelled loyalty or wait moment appears while the person is already waiting.'),
      sponsoredStage('branded_agent', 'Branded agent', 'A branded helper steps forward with one clear job.'),
      sponsoredStage('useful_step', 'Useful step', 'The agent assembles a useful next step from what the person provides.', {
        showSponsoredLabel: false,
      }),
      sponsoredStage('genuine_offer', 'Genuine offer', 'If a real offer applies, show it plainly — never invent balances.'),
      sponsoredStage('permit', 'Permit', 'Human sign-off before anything consequential. DEMO permit only.', {
        showSponsoredLabel: false,
        demoOnly: true,
      }),
      sponsoredStage('action', 'Action', 'Approved action runs under the permit — still DEMO / drafts-only here.', {
        showSponsoredLabel: false,
        demoOnly: true,
      }),
      sponsoredStage('receipt', 'Receipt', 'Leave a receipt the person can review. Sponsor reporting uses receipts, not chat logs.', {
        showSponsoredLabel: false,
        demoOnly: true,
      }),
    ],
  };
}

export function defaultPursuitJourney(): PursuitJourney {
  return {
    title: '',
    brief: '',
    steps: defaultPursuitSteps(),
    sponsored: defaultSponsoredModule(),
    outreach: defaultOutreachGate(),
    assets: emptyBrandAssets(),
  };
}

/**
 * BP Loyalty Moment Concierge — seed from Kate’s ChatGPT Pursuit Studio work.
 * Extends PARTNER_SKINS.bp Road-Ready (**fuel / convenience retail loyalty**).
 * Vertical LOCK: NOT electricity / energy switch / ICP. No second BP skin.
 * ASA label = Assembling “Sponsored” — do not fork Assembling/Dash product.
 */
export function bpLoyaltyMomentConciergeJourney(): PursuitJourney {
  return {
    title: 'BP Loyalty Moment Concierge',
    brief:
      'Fuel / convenience retail loyalty: wait-at-pump or in-app loyalty moment → branded bp agent → useful next step (points, nearby site, offer if genuine) → DO Permit → DEMO action → receipt. Offline demo skin — no live bp API. Not an electricity switch.',
    steps: [
      step(
        'opportunity',
        'Opportunity',
        'Driver is already in a loyalty / wait moment at the pump or in the bp app. Make that moment useful without inventing points balances.',
      ),
      step(
        'ideas',
        'Ideas',
        'Concierge that checks nearby sites, shows points on this fill, and keeps unpaid help available beside the sponsored path.',
      ),
      step(
        'experience',
        'Experience',
        'Wait-at-pump / app loyalty → branded Road-Ready agent → points / nearby / genuine offer → Permit (DEMO) → action → receipt.',
      ),
      step(
        'pitch',
        'Pitch',
        'Show Assembl Sponsored Journeys on a fuel-retail partner surface: ASA “Sponsored” labelled, permit-gated, receipt-backed — provider-neutral. PREVIEW only.',
      ),
    ],
    sponsored: {
      enabled: true,
      asaLabel: ASA_LABEL,
      sponsorName: 'bp Road-Ready',
      unpaidPathNote:
        'Drivers can skip the sponsored path and still get a plain wait / points status note — unpaid help stays available.',
      honesty:
        'Demo / PREVIEW only. Fuel & convenience loyalty — not electricity. No bp account link, scrape or live rewards API. Permit and action are DEMO — nothing redeems or charges.',
      stages: [
        sponsoredStage(
          'ad_loyalty',
          'Ad / loyalty moment',
          'While the driver waits at the pump or in-app, a labelled loyalty moment appears: “Rewards while you wait.”',
        ),
        sponsoredStage(
          'branded_agent',
          'Branded agent',
          'bp Road-Ready introduces itself with one job: help with this fuel / convenience loyalty moment.',
        ),
        sponsoredStage(
          'useful_step',
          'Useful step',
          'Assemble a useful next step: points on this fill, a nearby bp site compare, or a short convenience checklist.',
          { showSponsoredLabel: false },
        ),
        sponsoredStage(
          'genuine_offer',
          'Genuine offer',
          'Show a sample redemption (e.g. +50 points on coffee) only if it fits. Symbolic DEMO offer — not a live balance.',
        ),
        sponsoredStage(
          'permit',
          'Permit',
          'Human sign-off before commit. DEMO permit with a short TTL and single use — no payment, no fuel purchase.',
          { showSponsoredLabel: false, demoOnly: true },
        ),
        sponsoredStage(
          'action',
          'Action',
          'On yes, prepare the loyalty earn draft. Still DEMO — no live redeem.',
          { showSponsoredLabel: false, demoOnly: true },
        ),
        sponsoredStage(
          'receipt',
          'Receipt',
          'Show a local receipt: what was chosen, who approved, that no live API was called.',
          { showSponsoredLabel: false, demoOnly: true },
        ),
      ],
    },
    outreach: {
      enabled: true,
      headline: 'Want the full Loyalty Concierge walkthrough?',
      body: 'Share your work email if you want API access notes or a guided DEMO. We unlock the deeper interaction in this browser.',
      ctaLabel: 'Request DEMO access',
      unlockNote: 'Access unlocked for this browser. Still DEMO — no live bp connection. Fuel / convenience loyalty only.',
      honesty: 'Lead stays in this browser only. Nothing is sent until you export or contact Assembl directly.',
    },
    assets: emptyBrandAssets(),
  };
}

export function seedJourneyForPartner(slug: PartnerSlug | null | undefined): PursuitJourney {
  if (slug === 'bp') return bpLoyaltyMomentConciergeJourney();
  if (slug === 'warehouse') {
    const base = defaultPursuitJourney();
    return {
      ...base,
      title: 'Warehouse wait-time utility',
      brief: 'One useful checklist while the customer waits. Drafts-only. No live Warehouse API.',
      sponsored: {
        ...defaultSponsoredModule('The Warehouse'),
        enabled: true,
        honesty: 'Demo skin only. No Warehouse account link, scrape or live rewards API.',
      },
    };
  }
  return defaultPursuitJourney();
}

export function normaliseJourney(input: Partial<PursuitJourney> | null | undefined): PursuitJourney {
  const base = defaultPursuitJourney();
  if (!input) return base;

  const steps =
    Array.isArray(input.steps) && input.steps.length > 0
      ? input.steps.slice(0, 12).map((s, index) => ({
          id: clamp(String(s?.id || `step_${index}`), 64),
          kind: (['opportunity', 'ideas', 'experience', 'pitch', 'custom'] as const).includes(
            s?.kind as JourneyStepKind,
          )
            ? (s.kind as JourneyStepKind)
            : 'custom',
          label: clamp(String(s?.label || `Step ${index + 1}`), 80),
          brief: clamp(String(s?.brief || ''), 600),
          enabled: s?.enabled !== false,
        }))
      : base.steps;

  const sponsoredIn = input.sponsored;
  const defaultSponsored = defaultSponsoredModule(sponsoredIn?.sponsorName);
  const stageIds: SponsoredStageId[] = [
    'ad_loyalty',
    'branded_agent',
    'useful_step',
    'genuine_offer',
    'permit',
    'action',
    'receipt',
  ];
  const sourceStages =
    Array.isArray(sponsoredIn?.stages) && sponsoredIn!.stages.length > 0
      ? sponsoredIn!.stages
      : defaultSponsored.stages;
  const normalisedStages = sourceStages.slice(0, 10).map((st, index) => {
    const id = stageIds.includes(st?.id as SponsoredStageId)
      ? (st.id as SponsoredStageId)
      : stageIds[Math.min(index, stageIds.length - 1)];
    const fallback = defaultSponsored.stages.find((s) => s.id === id) ?? defaultSponsored.stages[0];
    return {
      id,
      label: clamp(String(st?.label || fallback.label), 80),
      copy: clamp(String(st?.copy || fallback.copy), 500),
      showSponsoredLabel: st?.showSponsoredLabel ?? fallback.showSponsoredLabel,
      demoOnly: st?.demoOnly ?? fallback.demoOnly,
    };
  });

  const outreachIn = input.outreach;
  const outreach: OutreachGate = {
    enabled: outreachIn?.enabled !== false,
    headline: clamp(String(outreachIn?.headline || base.outreach.headline), 120),
    body: clamp(String(outreachIn?.body || base.outreach.body), 400),
    ctaLabel: clamp(String(outreachIn?.ctaLabel || base.outreach.ctaLabel), 60),
    unlockNote: clamp(String(outreachIn?.unlockNote || base.outreach.unlockNote), 200),
    honesty: clamp(String(outreachIn?.honesty || base.outreach.honesty), 240),
  };

  const assetsIn = input.assets;
  const assets: BrandAssets = {
    imageryDataUrl: clampDataUrl(assetsIn?.imageryDataUrl || '', 220_000),
    markDataUrl: clampDataUrl(assetsIn?.markDataUrl || '', 120_000),
  };

  return {
    title: clamp(String(input.title || ''), 100),
    brief: clamp(String(input.brief || ''), 800),
    steps,
    sponsored: {
      enabled: Boolean(sponsoredIn?.enabled),
      asaLabel: ASA_LABEL,
      sponsorName: clamp(String(sponsoredIn?.sponsorName || 'Partner'), 80),
      unpaidPathNote: clamp(String(sponsoredIn?.unpaidPathNote || defaultSponsored.unpaidPathNote), 280),
      honesty: clamp(String(sponsoredIn?.honesty || defaultSponsored.honesty), 280),
      stages: normalisedStages.length ? normalisedStages : defaultSponsored.stages,
    },
    outreach,
    assets,
  };
}

function clamp(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function clampDataUrl(value: string, maxChars: number): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('data:image/')) return '';
  return trimmed.slice(0, maxChars);
}

export function readFileAsDataUrl(file: File, maxBytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Choose an image file.'));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error(`Image is too large (max ${Math.round(maxBytes / 1024)}KB for this DEMO draft).`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      resolve(clampDataUrl(result, maxBytes * 2));
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

export function saveOutreachLead(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  lead: Omit<OutreachLead, 'capturedAt'>,
): OutreachLead {
  const next: OutreachLead = { ...lead, capturedAt: new Date().toISOString() };
  let existing: OutreachLead[] = [];
  try {
    const raw = storage.getItem(OUTREACH_LEAD_KEY);
    if (raw) existing = JSON.parse(raw) as OutreachLead[];
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }
  existing = [...existing.slice(-40), next];
  storage.setItem(OUTREACH_LEAD_KEY, JSON.stringify(existing));
  return next;
}

export function hasUnlockedOutreach(
  storage: Pick<Storage, 'getItem'>,
  unlockKey: string,
): boolean {
  try {
    return storage.getItem(unlockKey) === '1';
  } catch {
    return false;
  }
}

export function unlockOutreach(storage: Pick<Storage, 'setItem'>, unlockKey: string): void {
  storage.setItem(unlockKey, '1');
}

export function outreachUnlockKey(draftId: string): string {
  return `assembl:pursuit:outreach-unlock:${draftId}`;
}

export function moveJourneyStep(steps: JourneyStep[], from: number, to: number): JourneyStep[] {
  if (from < 0 || to < 0 || from >= steps.length || to >= steps.length || from === to) {
    return steps;
  }
  const next = [...steps];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function addCustomJourneyStep(steps: JourneyStep[]): JourneyStep[] {
  if (steps.length >= 12) return steps;
  return [
    ...steps,
    step('custom', `Custom ${steps.length + 1}`, 'Describe this stage in plain English.', true),
  ];
}
