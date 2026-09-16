/**
 * Task DO Maker — white-label, task-specific DO minting for Assembl Studio.
 *
 * Produces a portable AgentSpec compatible with DO Office / companion surfaces.
 * White-label branding is maker + preview state; the AgentSpec stays policy-clean.
 */

import type { AgentPrimitive, AgentSpec } from '@/apps/do/shared/types';
import { enforceApprovalPolicy } from '@/apps/do/shared/policy';

export const TASK_DO_MAKER_PATH = '/studio/do-maker';
export const TASK_DO_DRAFT_KEY = 'assembl:studio:task-do-draft:v1';
export const TASK_DO_HANDOFF_KEY = 'assembl:do:task-do-handoff:v1';

export type TaskDoTemplateId =
  | 'research-brief'
  | 'outreach-draft'
  | 'meeting-follow-up'
  | 'school-admin'
  | 'wait-reward';

export type WhiteLabelBrand = {
  displayName: string;
  accent: string;
  accentSecondary: string;
  logoUrl: string;
  promise: string;
};

export type TaskDoConfig = {
  templateId: TaskDoTemplateId | null;
  title: string;
  job: string;
  instructions: string;
  opportunity: string;
  partner: string;
  task: string;
};

export type TaskDoDraft = {
  version: 1;
  brand: WhiteLabelBrand;
  config: TaskDoConfig;
  updatedAt: string;
};

export type TaskDoTemplate = {
  id: TaskDoTemplateId;
  label: string;
  title: string;
  job: string;
  instructions: string;
  primitive: AgentPrimitive;
  looks_for: string[];
  can_do_without_asking: string[];
  must_ask_before: string[];
  never: string[];
};

export const DEFAULT_BRAND: WhiteLabelBrand = {
  displayName: 'your brand',
  accent: '#240B21',
  accentSecondary: '#916A70',
  logoUrl: '',
  promise: 'One clear job. Drafts first. You stay in charge.',
};

export const DEFAULT_CONFIG: TaskDoConfig = {
  templateId: null,
  title: '',
  job: '',
  instructions:
    'Draft only. Never send, post, submit, pay, book, buy or sign without an explicit human yes. Stay within the stated job.',
  opportunity: '',
  partner: '',
  task: '',
};

export const TASK_DO_TEMPLATES: TaskDoTemplate[] = [
  {
    id: 'research-brief',
    label: 'Research brief',
    title: 'Research brief',
    job: 'Turn sources into a short, evidence-backed brief for the next conversation.',
    instructions:
      'Extract facts, open questions and next steps from the material provided. Cite sources. Draft only — never send the brief without a human yes.',
    primitive: 'prepare',
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
    looks_for: ['status', 'what is needed', 'next step', 'estimated wait'],
    can_do_without_asking: [
      'draft a clear status note',
      'list what the person can prepare while waiting',
    ],
    must_ask_before: ['send a notification off this device'],
    never: ['claim a live system status without evidence'],
  },
];

export function getTaskDoTemplate(id: string | null | undefined): TaskDoTemplate | undefined {
  if (!id) return undefined;
  return TASK_DO_TEMPLATES.find((item) => item.id === id);
}

function clamp(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function isHexColour(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
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
  const templateId = getTaskDoTemplate(input?.templateId)?.id ?? null;
  return {
    templateId,
    title: clamp(input?.title || '', 80),
    job: clamp(input?.job || '', 240),
    instructions: clamp(input?.instructions || DEFAULT_CONFIG.instructions, 1200),
    opportunity: clamp(input?.opportunity || '', 160),
    partner: clamp(input?.partner || '', 80),
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
  const title = configNorm.title.trim() || template?.title || 'Task DO';
  const job = configNorm.job.trim() || template?.job || 'Complete one bounded task and stop.';
  const instructions =
    configNorm.instructions.trim() || template?.instructions || DEFAULT_CONFIG.instructions;
  const primitive = inferPrimitive(job, template);
  const now = opts.now ?? new Date().toISOString();
  const id = opts.id ?? crypto.randomUUID();

  const contextBits = [
    configNorm.opportunity ? `Opportunity: ${configNorm.opportunity}` : '',
    configNorm.partner ? `Partner context: ${configNorm.partner}` : '',
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
      'act outside the stated job',
    ],
  });

  const brief = [job, contextBits].filter(Boolean).join('\n\n');

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
    lastNote: `Task DO draft · ${brandNorm.displayName} · drafts-only send posture. Not activated.`,
    templateId: template?.id,
    connector: 'hook-later',
  };
}

export function draftFromParts(brand: WhiteLabelBrand, config: TaskDoConfig, updatedAt?: string): TaskDoDraft {
  return {
    version: 1,
    brand: normaliseBrand(brand),
    config: normaliseConfig(config),
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

export function readLocalDraft(storage: Pick<Storage, 'getItem'>): TaskDoDraft | null {
  try {
    const raw = storage.getItem(TASK_DO_DRAFT_KEY);
    if (!raw || raw.length > 200_000) return null;
    const parsed = JSON.parse(raw) as Partial<TaskDoDraft>;
    if (parsed.version !== 1) return null;
    return draftFromParts(
      normaliseBrand(parsed.brand),
      normaliseConfig(parsed.config),
      typeof parsed.updatedAt === 'string' ? parsed.updatedAt : undefined,
    );
  } catch {
    return null;
  }
}

export function writeLocalDraft(storage: Pick<Storage, 'setItem'>, draft: TaskDoDraft): TaskDoDraft {
  const next = draftFromParts(draft.brand, draft.config, new Date().toISOString());
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

/** Encode maker state into shareable / Pursuit-handoff query params. */
export function draftToSearchParams(draft: TaskDoDraft): URLSearchParams {
  const params = new URLSearchParams();
  const { brand, config } = draft;
  if (config.opportunity) params.set('opportunity', config.opportunity);
  if (config.partner) params.set('partner', config.partner);
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
  if (brand.logoUrl) params.set('logo', brand.logoUrl);
  if (brand.promise && brand.promise !== DEFAULT_BRAND.promise) params.set('promise', brand.promise);
  return params;
}

export function draftFromSearchParams(search: URLSearchParams | { get(name: string): string | null }): TaskDoDraft {
  const partner = search.get('partner') || '';
  const templateParam = search.get('template');
  const template = getTaskDoTemplate(templateParam);
  let config = normaliseConfig({
    templateId: template?.id ?? null,
    title: search.get('title') || '',
    job: search.get('job') || '',
    instructions: search.get('instructions') || DEFAULT_CONFIG.instructions,
    opportunity: search.get('opportunity') || '',
    partner,
    task: search.get('task') || '',
  });

  if (template && !config.title && !config.job) {
    config = applyTemplate(template.id, config);
  }

  const brand = normaliseBrand({
    displayName: search.get('brand') || partner || DEFAULT_BRAND.displayName,
    accent: search.get('accent') || DEFAULT_BRAND.accent,
    accentSecondary: search.get('accent2') || DEFAULT_BRAND.accentSecondary,
    logoUrl: search.get('logo') || '',
    promise: search.get('promise') || DEFAULT_BRAND.promise,
  });

  return draftFromParts(brand, config);
}

export function makerHref(params?: Partial<{
  opportunity: string;
  partner: string;
  task: string;
  template: TaskDoTemplateId;
  brand: string;
}>): string {
  const search = new URLSearchParams();
  if (params?.opportunity) search.set('opportunity', params.opportunity);
  if (params?.partner) search.set('partner', params.partner);
  if (params?.task) search.set('task', params.task);
  if (params?.template) search.set('template', params.template);
  if (params?.brand) search.set('brand', params.brand);
  const qs = search.toString();
  return qs ? `${TASK_DO_MAKER_PATH}?${qs}` : TASK_DO_MAKER_PATH;
}

export function previewHref(draft: TaskDoDraft): string {
  const params = draftToSearchParams(draft);
  params.set('preview', '1');
  return `${TASK_DO_MAKER_PATH}?${params.toString()}`;
}

export function isPreviewMode(search: URLSearchParams | { get(name: string): string | null }): boolean {
  return search.get('preview') === '1' || search.get('preview') === 'true';
}
