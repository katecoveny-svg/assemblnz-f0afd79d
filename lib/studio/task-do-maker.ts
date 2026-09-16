/**
 * Task DO Maker — shared core for Mode A (Pursuit/Studio) and Mode B (partner-facing).
 *
 * One white-label schema → portable AgentSpec. Branding is maker/preview state;
 * AgentSpec stays policy-clean (drafts-only, hook-later connectors).
 *
 * Journey / Sponsored Agent / outreach gate live in `pursuit-journey.ts` and
 * ride along on the same draft — no Assembling/Dash fork, no second BP skin.
 */

import type { AgentPrimitive, AgentSpec } from '@/apps/do/shared/types';
import { enforceApprovalPolicy } from '@/apps/do/shared/policy';
import {
  bpLoyaltyMomentConciergeJourney,
  defaultPursuitJourney,
  normaliseJourney,
  seedJourneyForPartner,
  type PursuitJourney,
} from './pursuit-journey';

export const TASK_DO_MAKER_PATH = '/studio/do-maker';
export const TASK_DO_PARTNER_PATH = '/do/maker/partner';
export const TASK_DO_DRAFT_KEY = 'assembl:studio:task-do-draft:v1';
export const TASK_DO_HANDOFF_KEY = 'assembl:do:task-do-handoff:v1';
export const PURSUIT_PLAYGROUND_PATH = '/pursuit/playground';

export type { PursuitJourney } from './pursuit-journey';
export {
  bpLoyaltyMomentConciergeJourney,
  defaultPursuitJourney,
  seedJourneyForPartner,
  normaliseJourney,
  readFileAsDataUrl,
  saveOutreachLead,
  hasUnlockedOutreach,
  unlockOutreach,
  outreachUnlockKey,
  moveJourneyStep,
  addCustomJourneyStep,
  defaultSponsoredModule,
} from './pursuit-journey';

export type TaskDoMode = 'pursuit' | 'partner';

export type TaskDoTemplateId =
  | 'research-brief'
  | 'outreach-draft'
  | 'meeting-follow-up'
  | 'school-admin'
  | 'wait-reward'
  | 'rewarded-wait'
  | 'task-utility'
  | 'sponsored-agent';

export type PartnerSlug = 'bp' | 'warehouse';

export type WhiteLabelBrand = {
  /** Partner / product display name shown to end customers. */
  displayName: string;
  accent: string;
  accentSecondary: string;
  logoUrl: string;
  promise: string;
};

export type TaskDoConfig = {
  mode: TaskDoMode;
  partnerSlug: PartnerSlug | null;
  templateId: TaskDoTemplateId | null;
  title: string;
  job: string;
  instructions: string;
  opportunity: string;
  /** Free-text partner/client label (Mode A) or skin product name (Mode B). */
  partner: string;
  task: string;
};

export type TaskDoDraft = {
  /** v1 drafts still load; journey is filled on read when missing. */
  version: 1 | 2;
  brand: WhiteLabelBrand;
  config: TaskDoConfig;
  /** Flexible Pursuit journey + Sponsored Agent + outreach gate. */
  journey: PursuitJourney;
  updatedAt: string;
};

export type TaskDoTemplate = {
  id: TaskDoTemplateId;
  label: string;
  title: string;
  job: string;
  instructions: string;
  primitive: AgentPrimitive;
  /** Which maker modes surface this chip by default. */
  modes: TaskDoMode[];
  looks_for: string[];
  can_do_without_asking: string[];
  must_ask_before: string[];
  never: string[];
};

export type PartnerSkin = {
  slug: PartnerSlug;
  /** Customer-facing product name (primary chrome). */
  productName: string;
  /** Short rail label shown in Mode B (rewarded-wait posture). */
  railLabel: string;
  brand: WhiteLabelBrand;
  defaultTemplate: TaskDoTemplateId;
  /** Honest demo note — skins are offline config, not live OAuth. */
  honesty: string;
  /** Vertical hint for journey seeding (not a dropdown lock). */
  verticalHint: string;
  /** Optional journey title when this skin seeds Mode B. */
  conciergeTitle?: string;
};

export const DEFAULT_BRAND: WhiteLabelBrand = {
  displayName: 'your brand',
  accent: '#240B21',
  accentSecondary: '#916A70',
  logoUrl: '',
  promise: 'One clear job. Drafts first. You stay in charge.',
};

export const DEFAULT_CONFIG: TaskDoConfig = {
  mode: 'pursuit',
  partnerSlug: null,
  templateId: null,
  title: '',
  job: '',
  instructions:
    'Draft only. Never send, post, submit, pay, book, buy or sign without an explicit human yes. Stay within the stated job.',
  opportunity: '',
  partner: '',
  task: '',
};

/** Offline demo skins — colours/names for pitching; no live partner APIs. */
export const PARTNER_SKINS: Record<PartnerSlug, PartnerSkin> = {
  bp: {
    slug: 'bp',
    productName: 'bp Road-Ready',
    railLabel: 'Sponsored agent · fuel loyalty',
    brand: {
      displayName: 'bp Road-Ready',
      accent: '#00965E',
      accentSecondary: '#FFCD00',
      logoUrl: '',
      promise: 'Use the wait. Useful next step, then DO Permit — DEMO only.',
    },
    defaultTemplate: 'sponsored-agent',
    honesty:
      'Demo skin only. Sponsored-agent journey is simulated — no bp account link, fuel-board scrape, live rewards API or CRM write.',
    verticalHint: 'fuel / convenience loyalty',
    conciergeTitle: 'BP Loyalty Moment Concierge',
  },
  warehouse: {
    slug: 'warehouse',
    productName: 'The Warehouse',
    railLabel: 'Useful wait · Warehouse rewards',
    brand: {
      displayName: 'The Warehouse',
      accent: '#E31837',
      accentSecondary: '#1A1A1A',
      logoUrl: '',
      promise: 'One useful task while you wait. You approve before anything leaves.',
    },
    defaultTemplate: 'task-utility',
    honesty: 'Demo skin only. No Warehouse account link, scrape or live rewards API.',
    verticalHint: 'retail wait-time utility',
  },
};

export const PARTNER_SLUGS = Object.keys(PARTNER_SKINS) as PartnerSlug[];

export const TASK_DO_TEMPLATES: TaskDoTemplate[] = [
  {
    id: 'research-brief',
    label: 'Research brief',
    title: 'Research brief',
    job: 'Turn sources into a short, evidence-backed brief for the next conversation.',
    instructions:
      'Extract facts, open questions and next steps from the material provided. Cite sources. Draft only — never send the brief without a human yes.',
    primitive: 'prepare',
    modes: ['pursuit'],
    looks_for: ['key facts', 'open questions', 'deadlines', 'evidence gaps'],
    can_do_without_asking: [
      'summarise provided sources',
      'draft a short brief with evidence notes',
      'list open questions',
    ],
    must_ask_before: ['send the brief to anyone', 'file the brief externally'],
    never: ['invent sources', 'claim live research without material'],
  },
  {
    id: 'outreach-draft',
    label: 'Outreach draft',
    title: 'Outreach draft',
    job: 'Draft a clear, polite outreach note grounded in the opportunity context.',
    instructions:
      'Write a short outreach draft in plain NZ English. Keep claims modest. Never send without approval.',
    primitive: 'prepare',
    modes: ['pursuit'],
    looks_for: ['recipient context', 'reason to write', 'ask', 'tone'],
    can_do_without_asking: ['draft outreach copy', 'offer two tone variants'],
    must_ask_before: ['send the message', 'add the person to a list'],
    never: ['cold spam', 'impersonate the owner'],
  },
  {
    id: 'meeting-follow-up',
    label: 'Meeting follow-up',
    title: 'Meeting follow-up',
    job: 'Turn meeting notes into actions, owners and a draft follow-up.',
    instructions:
      'Pull actions, decisions and open questions from notes. Draft a follow-up for review. Do not send.',
    primitive: 'extract',
    modes: ['pursuit'],
    looks_for: ['decisions', 'actions', 'owners', 'open questions'],
    can_do_without_asking: [
      'extract actions from notes',
      'draft a follow-up summary',
    ],
    must_ask_before: ['send the follow-up', 'book a follow-up meeting'],
    never: ['assign work to people without a human yes'],
  },
  {
    id: 'school-admin',
    label: 'School admin',
    title: 'School notice helper',
    job: 'Turn a school notice into dates, what to bring and a short parent reminder draft.',
    instructions:
      'Extract dates, times, what to bring and any forms. Draft a reminder for the caregiver to review. Never send on its own.',
    primitive: 'extract',
    modes: ['pursuit'],
    looks_for: ['dates', 'times', 'what to bring', 'forms', 'permissions'],
    can_do_without_asking: [
      'extract calendar details from a notice',
      'draft a caregiver reminder',
    ],
    must_ask_before: ['send a reminder', 'submit a school form'],
    never: ['pay school fees', 'sign permission forms'],
  },
  {
    id: 'wait-reward',
    label: 'Wait / reward',
    title: 'Wait-state helper',
    job: 'Make a waiting moment useful — status, next step and a small reward of clarity.',
    instructions:
      'Explain what is happening, what is still needed and what happens next. Keep the tone calm. Draft only.',
    primitive: 'prepare',
    modes: ['pursuit', 'partner'],
    looks_for: ['status', 'what is needed', 'next step', 'estimated wait'],
    can_do_without_asking: [
      'draft a clear status note',
      'list what the person can prepare while waiting',
    ],
    must_ask_before: ['send a notification off this device'],
    never: ['claim a live system status without evidence', 'scrape a live site'],
  },
  {
    id: 'rewarded-wait',
    label: 'Rewarded wait',
    title: 'Rewarded wait',
    job: 'Turn waiting time into a short useful task, then show a draft receipt for review.',
    instructions:
      'Guide one small task during a wait. Keep rewards symbolic and local to this demo. Draft only — never claim points, spend, or send without a human yes. Never scrape partner sites.',
    primitive: 'prepare',
    modes: ['partner'],
    looks_for: ['wait reason', 'useful micro-task', 'draft receipt', 'next step'],
    can_do_without_asking: [
      'outline a short wait-time task',
      'draft a local receipt the customer can review',
      'list what still needs a human yes',
    ],
    must_ask_before: [
      'send a notification off this device',
      'claim or redeem any reward',
      'post or submit anything externally',
    ],
    never: [
      'scrape a partner website or app',
      'claim a live rewards balance',
      'connect a partner account without a real connector',
    ],
  },
  {
    id: 'task-utility',
    label: 'Task utility',
    title: 'Wait-time utility',
    job: 'Help the customer complete one bounded checklist item while they wait.',
    instructions:
      'Offer a single useful checklist or form draft grounded in what the customer provides. Stay drafts-only. Do not invent partner stock, pricing or account data.',
    primitive: 'prepare',
    modes: ['partner'],
    looks_for: ['checklist items', 'missing details', 'draft answers', 'handoff note'],
    can_do_without_asking: [
      'draft a short checklist',
      'fill obvious fields from provided text',
      'prepare a handoff note for staff review',
    ],
    must_ask_before: ['send the checklist to anyone', 'submit a form'],
    never: [
      'scrape inventory or pricing',
      'claim a live partner API',
      'complete a purchase',
    ],
  },
  {
    id: 'sponsored-agent',
    label: 'Sponsored agent',
    title: 'Sponsored agent · fuel loyalty',
    job: 'From a labelled loyalty wait, understand intent, assemble a useful next step, offer only if genuine, then run prepare → permit → DEMO action → CRM stub → receipt.',
    instructions:
      'You are a branded partner helper on a sponsored journey. Always label sponsorship. Prefer a useful unpaid next step; attach a loyalty offer only when it is genuinely relevant. Never scrape partner sites or claim live balances. Consequential steps require DO Permit. Emit a DEMO receipt. Never send, pay, book or write to CRM without an explicit human yes. Not built on OpenAI Ads — Assembl completes work under Permit with a receipt.',
    primitive: 'prepare',
    modes: ['partner'],
    looks_for: [
      'wait / loyalty moment',
      'customer intent',
      'useful next step',
      'offer eligibility',
      'permit bounds',
      'receipt fields',
    ],
    can_do_without_asking: [
      'label the sponsored moment',
      'draft intent understanding',
      'assemble a useful next-step comparison from DEMO data',
      'draft a receipt skeleton',
    ],
    must_ask_before: [
      'apply or redeem any loyalty offer',
      'execute under DO Permit',
      'stage a CRM / commerce handoff',
      'send a notification off this device',
    ],
    never: [
      'hide sponsorship',
      'lengthen a wait to show an offer',
      'scrape a partner website or app',
      'claim a live rewards balance',
      'depend on an OpenAI Ads API',
      'complete a payment or fuel purchase',
    ],
  },
];

export function getTaskDoTemplate(id: string | null | undefined): TaskDoTemplate | undefined {
  if (!id) return undefined;
  return TASK_DO_TEMPLATES.find((item) => item.id === id);
}

export function templatesForMode(mode: TaskDoMode): TaskDoTemplate[] {
  return TASK_DO_TEMPLATES.filter((item) => item.modes.includes(mode));
}

export function getPartnerSkin(slug: string | null | undefined): PartnerSkin | undefined {
  if (!slug) return undefined;
  const key = slug.trim().toLowerCase();
  if (key === 'warehouse-stationery' || key === 'the-warehouse') return PARTNER_SKINS.warehouse;
  return PARTNER_SKINS[key as PartnerSlug];
}

function clamp(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function isHexColour(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

export function normaliseMode(value: string | null | undefined): TaskDoMode {
  return value === 'partner' ? 'partner' : 'pursuit';
}

export function normaliseBrand(input: Partial<WhiteLabelBrand> | null | undefined): WhiteLabelBrand {
  const accent = input?.accent && isHexColour(input.accent) ? input.accent.trim() : DEFAULT_BRAND.accent;
  const accentSecondary =
    input?.accentSecondary && isHexColour(input.accentSecondary)
      ? input.accentSecondary.trim()
      : DEFAULT_BRAND.accentSecondary;
  return {
    displayName: clamp(input?.displayName || DEFAULT_BRAND.displayName, 80) || DEFAULT_BRAND.displayName,
    accent,
    accentSecondary,
    logoUrl: clamp(input?.logoUrl || '', 500),
    promise: clamp(input?.promise || DEFAULT_BRAND.promise, 180) || DEFAULT_BRAND.promise,
  };
}

export function normaliseConfig(input: Partial<TaskDoConfig> | null | undefined): TaskDoConfig {
  const mode = normaliseMode(input?.mode);
  const skin = getPartnerSkin(input?.partnerSlug);
  const templateId = getTaskDoTemplate(input?.templateId)?.id ?? null;
  return {
    mode,
    partnerSlug: skin?.slug ?? null,
    templateId,
    title: clamp(input?.title || '', 80),
    job: clamp(input?.job || '', 240),
    instructions: clamp(input?.instructions || DEFAULT_CONFIG.instructions, 1200),
    opportunity: clamp(input?.opportunity || '', 160),
    partner: clamp(input?.partner || skin?.productName || '', 80),
    task: clamp(input?.task || '', 120),
  };
}

export function applyTemplate(templateId: TaskDoTemplateId, current: TaskDoConfig): TaskDoConfig {
  const template = getTaskDoTemplate(templateId);
  if (!template) return current;
  return normaliseConfig({
    ...current,
    templateId,
    title: current.title.trim() ? current.title : template.title,
    job: current.job.trim() ? current.job : template.job,
    instructions: current.instructions.trim() && current.instructions !== DEFAULT_CONFIG.instructions
      ? current.instructions
      : template.instructions,
    task: current.task.trim() ? current.task : template.id,
  });
}

/** Apply an offline partner skin — Mode B primary chrome. */
export function applyPartnerSkin(
  slug: PartnerSlug,
  current?: Partial<TaskDoConfig>,
  brandOverride?: Partial<WhiteLabelBrand>,
  journeyOverride?: Partial<PursuitJourney> & {
    sponsored?: Partial<PursuitJourney['sponsored']>;
    outreach?: Partial<PursuitJourney['outreach']>;
  },
): { brand: WhiteLabelBrand; config: TaskDoConfig; journey: PursuitJourney } {
  const skin = PARTNER_SKINS[slug];
  const config = applyTemplate(skin.defaultTemplate, normaliseConfig({
    ...DEFAULT_CONFIG,
    ...current,
    mode: 'partner',
    partnerSlug: slug,
    partner: skin.productName,
    task: current?.task || skin.defaultTemplate,
  }));
  const overrides = Object.fromEntries(
    Object.entries(brandOverride ?? {}).filter(([, value]) => value !== undefined && value !== ''),
  ) as Partial<WhiteLabelBrand>;
  const seededJourney = seedJourneyForPartner(slug);
  return {
    brand: normaliseBrand({ ...skin.brand, ...overrides }),
    config,
    journey: normaliseJourney({
      ...seededJourney,
      ...journeyOverride,
      title: journeyOverride?.title || seededJourney.title || skin.conciergeTitle || skin.productName,
      sponsored: {
        ...seededJourney.sponsored,
        ...(journeyOverride?.sponsored ?? {}),
        sponsorName:
          journeyOverride?.sponsored?.sponsorName ||
          seededJourney.sponsored.sponsorName ||
          skin.productName,
        asaLabel: 'Sponsored',
        stages: journeyOverride?.sponsored?.stages ?? seededJourney.sponsored.stages,
      },
      outreach: {
        ...seededJourney.outreach,
        ...(journeyOverride?.outreach ?? {}),
      },
    }),
  };
}

/** Custom client in partner/pursuit mode — no preset skin dropdown required. */
export function applyCustomClient(
  displayName: string,
  current?: Partial<TaskDoConfig>,
  brandOverride?: Partial<WhiteLabelBrand>,
): { brand: WhiteLabelBrand; config: TaskDoConfig; journey: PursuitJourney } {
  const name = displayName.trim() || 'Custom client';
  const config = normaliseConfig({
    ...DEFAULT_CONFIG,
    ...current,
    mode: current?.mode === 'partner' ? 'partner' : 'pursuit',
    partnerSlug: null,
    partner: name,
    templateId: current?.templateId ?? (current?.mode === 'partner' ? 'rewarded-wait' : 'research-brief'),
  });
  const journey = normaliseJourney({
    ...defaultPursuitJourney(),
    title: `${name} journey`,
    brief: current?.opportunity || '',
    sponsored: {
      ...defaultPursuitJourney().sponsored,
      sponsorName: name,
    },
  });
  return {
    brand: normaliseBrand({
      displayName: name,
      accent: brandOverride?.accent,
      accentSecondary: brandOverride?.accentSecondary,
      logoUrl: brandOverride?.logoUrl,
      promise: brandOverride?.promise || `One clear job for ${name}. Drafts first.`,
    }),
    config,
    journey,
  };
}

function inferPrimitive(job: string, template?: TaskDoTemplate): AgentPrimitive {
  if (template) return template.primitive;
  const text = job.toLowerCase();
  if (/\bextract\b|\bnotice\b|\bcalendar\b|\bdates?\b/.test(text)) return 'extract';
  if (/\bcompar/.test(text)) return 'compare';
  if (/\bfind\b|\bresearch\b|\bopportunit/.test(text)) return 'find';
  if (/\bwatch\b|\balert\b|\bmonitor\b/.test(text)) return 'watch';
  return 'prepare';
}

function nameForSpec(brand: WhiteLabelBrand, config: TaskDoConfig): string {
  const title = config.title.trim() || config.task.trim() || 'Task DO';
  const brandName = brand.displayName.trim();
  if (!brandName || brandName.toLowerCase() === 'your brand') return title.slice(0, 48);
  const combined = `${brandName} · ${title}`;
  return combined.length <= 48 ? combined : `${title}`.slice(0, 48);
}

/** Compile maker state into a portable AgentSpec (drafts-only send posture by default). */
export function compileTaskDoSpec(
  brand: WhiteLabelBrand,
  config: TaskDoConfig,
  opts: { id?: string; now?: string } = {},
): AgentSpec {
  const brandNorm = normaliseBrand(brand);
  const configNorm = normaliseConfig(config);
  const template = getTaskDoTemplate(configNorm.templateId);
  const skin = configNorm.partnerSlug ? PARTNER_SKINS[configNorm.partnerSlug] : undefined;
  const title = configNorm.title.trim() || template?.title || 'Task DO';
  const job = configNorm.job.trim() || template?.job || 'Complete one bounded task and stop.';
  const instructions =
    configNorm.instructions.trim() || template?.instructions || DEFAULT_CONFIG.instructions;
  const primitive = inferPrimitive(job, template);
  const now = opts.now ?? new Date().toISOString();
  const id = opts.id ?? crypto.randomUUID();

  const contextBits = [
    `Mode: ${configNorm.mode}`,
    configNorm.opportunity ? `Opportunity: ${configNorm.opportunity}` : '',
    configNorm.partner ? `Partner context: ${configNorm.partner}` : '',
    configNorm.partnerSlug ? `Partner skin: ${configNorm.partnerSlug}` : '',
    skin ? `Partner rail: ${skin.railLabel}` : '',
    skin ? `Vertical: ${skin.verticalHint}` : '',
    configNorm.task ? `Task key: ${configNorm.task}` : '',
    `Brand promise: ${brandNorm.promise}`,
    `Instructions: ${instructions}`,
  ]
    .filter(Boolean)
    .join('\n');

  const base = enforceApprovalPolicy({
    watches: [
      configNorm.opportunity ? `opportunity:${configNorm.opportunity}` : 'maker brief',
      'current page / provided material',
    ],
    looks_for: template?.looks_for ?? ['stated job', 'required inputs', 'draft-ready output'],
    can_do_without_asking: template?.can_do_without_asking ?? [
      'draft the requested output',
      'list missing inputs',
      'keep a short receipt of what was used',
    ],
    must_ask_before: [
      ...(template?.must_ask_before ?? ['send anything externally', 'submit a form']),
      'send, post, submit, pay, book, buy or sign',
    ],
    never: [
      ...(template?.never ?? []),
      'send without an explicit human yes',
      'claim a live partner API or connection that is not configured',
      'scrape a partner website or app',
      'act outside the stated job',
    ],
  });

  const brief = [job, contextBits].filter(Boolean).join('\n\n');
  const modeNote = configNorm.mode === 'partner' ? 'partner-facing skin' : 'Pursuit pitch';

  return {
    id,
    name: nameForSpec(brandNorm, { ...configNorm, title }),
    ...base,
    primitive,
    brief: brief.slice(0, 4000),
    status: 'needs_you',
    demo: true,
    createdAt: now,
    updatedAt: now,
    pendingApprovals: [],
    lastNote: `Task DO draft · ${brandNorm.displayName} · ${modeNote} · drafts-only. Not activated.`,
    templateId: template?.id,
    connector: 'hook-later',
  };
}

export function draftFromParts(
  brand: WhiteLabelBrand,
  config: TaskDoConfig,
  journey?: PursuitJourney | null,
  updatedAt?: string,
): TaskDoDraft {
  const configNorm = normaliseConfig(config);
  const baseJourney = normaliseJourney(
    journey ??
      (configNorm.partnerSlug
        ? seedJourneyForPartner(configNorm.partnerSlug)
        : defaultPursuitJourney()),
  );
  const journeyNorm = {
    ...baseJourney,
    brief: baseJourney.brief || configNorm.opportunity || '',
  };
  return {
    version: 2,
    brand: normaliseBrand(brand),
    config: configNorm,
    journey: journeyNorm,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

export function readLocalDraft(storage: Pick<Storage, 'getItem'>): TaskDoDraft | null {
  try {
    const raw = storage.getItem(TASK_DO_DRAFT_KEY);
    if (!raw || raw.length > 400_000) return null;
    const parsed = JSON.parse(raw) as Partial<TaskDoDraft> & { version?: number };
    if (parsed.version !== 1 && parsed.version !== 2) return null;
    return draftFromParts(
      normaliseBrand(parsed.brand),
      normaliseConfig(parsed.config),
      parsed.journey ? normaliseJourney(parsed.journey) : null,
      typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    );
  } catch {
    return null;
  }
}

export function writeLocalDraft(storage: Pick<Storage, 'setItem'>, draft: TaskDoDraft): TaskDoDraft {
  const next = draftFromParts(draft.brand, draft.config, draft.journey, new Date().toISOString());
  storage.setItem(TASK_DO_DRAFT_KEY, JSON.stringify(next));
  return next;
}

export function writeHandoffSpec(storage: Pick<Storage, 'setItem'>, spec: AgentSpec, brand: WhiteLabelBrand): void {
  storage.setItem(
    TASK_DO_HANDOFF_KEY,
    JSON.stringify({
      version: 1,
      savedAt: new Date().toISOString(),
      brand: normaliseBrand(brand),
      spec,
    }),
  );
}

/** Encode maker state into shareable / Pursuit / partner query params. */
export function draftToSearchParams(draft: TaskDoDraft): URLSearchParams {
  const params = new URLSearchParams();
  const { brand, config, journey } = draft;
  if (config.mode === 'partner') params.set('mode', 'partner');
  if (config.partnerSlug) params.set('partner', config.partnerSlug);
  else if (config.partner) params.set('partner', config.partner);
  if (config.opportunity) params.set('opportunity', config.opportunity);
  if (config.task) params.set('task', config.task);
  if (config.templateId) params.set('template', config.templateId);
  if (config.title) params.set('title', config.title);
  if (config.job) params.set('job', config.job);
  if (config.instructions && config.instructions !== DEFAULT_CONFIG.instructions) {
    params.set('instructions', config.instructions);
  }
  if (brand.displayName && brand.displayName !== DEFAULT_BRAND.displayName) {
    params.set('brand', brand.displayName);
  }
  if (brand.accent && brand.accent !== DEFAULT_BRAND.accent) params.set('accent', brand.accent);
  if (brand.accentSecondary && brand.accentSecondary !== DEFAULT_BRAND.accentSecondary) {
    params.set('accent2', brand.accentSecondary);
  }
  // Skip data-URL logos in share links — too large; browser draft keeps imagery.
  if (brand.logoUrl && !brand.logoUrl.startsWith('data:')) params.set('logo', brand.logoUrl);
  if (brand.promise && brand.promise !== DEFAULT_BRAND.promise) params.set('promise', brand.promise);
  if (journey.title) params.set('journey', journey.title);
  if (journey.brief) params.set('jbrief', journey.brief.slice(0, 240));
  if (journey.sponsored.enabled) params.set('sponsored', '1');
  if (journey.outreach.enabled) params.set('gate', '1');
  return params;
}

export function draftFromSearchParams(search: URLSearchParams | { get(name: string): string | null }): TaskDoDraft {
  const modeParam = search.get('mode');
  const partnerParam = search.get('partner') || '';
  const skin = getPartnerSkin(partnerParam);
  const mode = normaliseMode(modeParam || (skin ? 'partner' : 'pursuit'));
  const journeyTitle = search.get('journey') || '';
  const journeyBrief = search.get('jbrief') || search.get('opportunity') || '';
  const sponsoredFlag = search.get('sponsored') === '1';
  const gateFlag = search.get('gate') !== '0';

  if (mode === 'partner' && skin) {
    const seeded = applyPartnerSkin(skin.slug, {
      opportunity: search.get('opportunity') || journeyBrief,
      task: search.get('task') || '',
      templateId: getTaskDoTemplate(search.get('template'))?.id ?? skin.defaultTemplate,
      title: search.get('title') || '',
      job: search.get('job') || '',
      instructions: search.get('instructions') || '',
    }, {
      displayName: search.get('brand') || undefined,
      accent: search.get('accent') || undefined,
      accentSecondary: search.get('accent2') || undefined,
      logoUrl: search.get('logo') || undefined,
      promise: search.get('promise') || undefined,
    }, {
      title: journeyTitle || undefined,
      brief: journeyBrief || undefined,
    });
    if (sponsoredFlag) seeded.journey.sponsored.enabled = true;
    seeded.journey.outreach.enabled = gateFlag;
    const template = getTaskDoTemplate(search.get('template'));
    const config = template
      ? applyTemplate(template.id, { ...seeded.config, title: search.get('title') || '', job: search.get('job') || '', instructions: search.get('instructions') || DEFAULT_CONFIG.instructions })
      : seeded.config;
    const brand = normaliseBrand({
      ...seeded.brand,
      ...(search.get('brand') ? { displayName: search.get('brand')! } : {}),
      ...(search.get('accent') ? { accent: search.get('accent')! } : {}),
      ...(search.get('accent2') ? { accentSecondary: search.get('accent2')! } : {}),
      ...(search.get('logo') ? { logoUrl: search.get('logo')! } : {}),
      ...(search.get('promise') ? { promise: search.get('promise')! } : {}),
    });
    return draftFromParts(brand, config, seeded.journey);
  }

  const templateParam = search.get('template');
  const template = getTaskDoTemplate(templateParam);
  let config = normaliseConfig({
    mode: 'pursuit',
    partnerSlug: null,
    templateId: template?.id ?? null,
    title: search.get('title') || '',
    job: search.get('job') || '',
    instructions: search.get('instructions') || DEFAULT_CONFIG.instructions,
    opportunity: search.get('opportunity') || journeyBrief,
    partner: partnerParam,
    task: search.get('task') || '',
  });

  if (template && !config.title && !config.job) {
    config = applyTemplate(template.id, config);
  }

  const brand = normaliseBrand({
    displayName: search.get('brand') || partnerParam || DEFAULT_BRAND.displayName,
    accent: search.get('accent') || DEFAULT_BRAND.accent,
    accentSecondary: search.get('accent2') || DEFAULT_BRAND.accentSecondary,
    logoUrl: search.get('logo') || '',
    promise: search.get('promise') || DEFAULT_BRAND.promise,
  });

  const journey = normaliseJourney({
    ...defaultPursuitJourney(),
    title: journeyTitle,
    brief: journeyBrief,
    sponsored: {
      ...defaultPursuitJourney().sponsored,
      enabled: sponsoredFlag,
      sponsorName: brand.displayName,
    },
    outreach: { ...defaultPursuitJourney().outreach, enabled: gateFlag },
  });

  return draftFromParts(brand, config, journey);
}

export function makerHref(params?: Partial<{
  mode: TaskDoMode;
  opportunity: string;
  partner: string;
  partnerSlug: PartnerSlug;
  task: string;
  template: TaskDoTemplateId;
  brand: string;
}>): string {
  const search = new URLSearchParams();
  if (params?.mode === 'partner') search.set('mode', 'partner');
  const partner = params?.partnerSlug || params?.partner;
  if (partner) search.set('partner', partner);
  if (params?.opportunity) search.set('opportunity', params.opportunity);
  if (params?.task) search.set('task', params.task);
  if (params?.template) search.set('template', params.template);
  if (params?.brand) search.set('brand', params.brand);
  const qs = search.toString();
  return qs ? `${TASK_DO_MAKER_PATH}?${qs}` : TASK_DO_MAKER_PATH;
}

export function partnerMakerHref(slug: PartnerSlug, extras?: Partial<{ task: string; template: TaskDoTemplateId; preview: boolean }>): string {
  const search = new URLSearchParams({ mode: 'partner', partner: slug });
  if (extras?.task) search.set('task', extras.task);
  if (extras?.template) search.set('template', extras.template);
  if (extras?.preview) search.set('preview', '1');
  return `${TASK_DO_MAKER_PATH}?${search.toString()}`;
}

export function partnerAliasHref(slug: PartnerSlug): string {
  return `${TASK_DO_PARTNER_PATH}/${slug}`;
}

export function previewHref(draft: TaskDoDraft): string {
  const params = draftToSearchParams(draft);
  params.set('preview', '1');
  return `${TASK_DO_MAKER_PATH}?${params.toString()}`;
}

export function isPreviewMode(search: URLSearchParams | { get(name: string): string | null }): boolean {
  return search.get('preview') === '1' || search.get('preview') === 'true';
}

export const POWERED_BY_ASSEMBL = 'powered by assembl DO';
