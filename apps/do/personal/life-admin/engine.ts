import { z } from 'zod';
import { cleanSourceUrl, extractDetails } from '@/apps/do/shared/preparation';
import { LIFE_ADMIN_CATEGORIES, lifeAdminTemplate, type LifeAdminCategory } from './templates';
export const LIFE_ADMIN_SOURCE_LIMIT = 12_000;
export const LIFE_ADMIN_STORAGE_KEY = 'assembl:personal:life-admin:v1';
export const lifeAdminOwnerScopeSchema = z.string().uuid();
export function lifeAdminStorageKey(scope: string): string | null {
  const parsed = lifeAdminOwnerScopeSchema.safeParse(scope);
  return parsed.success ? `${LIFE_ADMIN_STORAGE_KEY}:${parsed.data}` : null;
}
export const LIFE_ADMIN_BOUNDARY = 'A plan from the information you supplied. No inbox, account, calendar or live record was checked. Nothing was sent, paid, booked or submitted. Done records your own completion evidence, not an independently verified external result.';
export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const year = Number(value.slice(0, 4));
  const parsed = new Date(`${value}T12:00:00Z`);
  return year >= 1900 && year <= 2200 && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, 'Use a real date.');
const timestamp = z.string().datetime();
const shortText = z.string().max(2_000);
const taskStatus = z.enum(['needs_review', 'todo', 'waiting', 'done', 'cancelled']);
const evidenceSchema = z.object({ at: timestamp, kind: z.enum(['review', 'user-recorded']), note: z.string().trim().min(1).max(2_000), url: z.string().max(1_000).refine((v) => !v || cleanSourceUrl(v) === v) }).strict();
export const lifeAdminTaskSchema = z.object({
  id: z.string().max(100), key: z.string().max(60), title: z.string().max(160), detail: z.string().max(600),
  kind: z.enum(['preparation', 'personal-action']), status: taskStatus,
  followUpOn: localDateSchema.nullable(), waitingFor: shortText, evidence: evidenceSchema.nullable(),
}).strict().refine((task) => task.status !== 'done' || task.evidence !== null, 'A completed item needs evidence.');
export const lifeAdminPlanSchema = z.object({
  version: z.literal(1), id: z.string().uuid(), category: z.enum(LIFE_ADMIN_CATEGORIES), title: z.string().trim().min(1).max(160),
  source: z.object({ title: z.string().max(160), text: z.string().trim().min(1).max(LIFE_ADMIN_SOURCE_LIMIT), url: z.string().max(1_000).refine((v) => !v || cleanSourceUrl(v) === v), method: z.enum(['pasted-text', 'reviewed-observation', 'reviewed-call']), capturedAt: timestamp }).strict(),
  fields: z.record(z.string().max(60), shortText), tasks: z.array(lifeAdminTaskSchema).min(1).max(12),
  createdAt: timestamp, updatedAt: timestamp, reviewedAt: timestamp.nullable(),
  followUpOn: localDateSchema.nullable(),
  generated: z.object({ text: z.string().max(16_000), model: z.string().max(160).nullable(), sourceHash: z.string().max(64), outputHash: z.string().max(64), createdAt: timestamp }).strict().nullable(),
}).strict().superRefine((plan, ctx) => {
  const template = lifeAdminTemplate(plan.category);
  const expected = template.steps.map((step) => step.key);
  if (new Set(plan.tasks.map((task) => task.id)).size !== plan.tasks.length || new Set(plan.tasks.map((task) => task.key)).size !== expected.length || !expected.every((key) => plan.tasks.some((task) => task.key === key))) ctx.addIssue({ code: 'custom', message: 'This checklist does not match its workflow.' });
  if (Object.keys(plan.fields).some((key) => !template.fields.some((field) => field.key === key))) ctx.addIssue({ code: 'custom', message: 'Unknown workflow field.' });
});
export type LifeAdminTask = z.infer<typeof lifeAdminTaskSchema>;
export type LifeAdminPlan = z.infer<typeof lifeAdminPlanSchema>;
export type LifeAdminLane = 'today' | 'needs-you' | 'done';
export const lifeAdminIntakeSchema = z.object({ category: z.enum(LIFE_ADMIN_CATEGORIES), source: z.string().trim().min(5, 'Add a little more detail to start.').max(LIFE_ADMIN_SOURCE_LIMIT), title: z.string().trim().max(160).default(''), sourceUrl: z.string().max(2_000).default('').transform(cleanSourceUrl), method: z.enum(['pasted-text', 'reviewed-observation', 'reviewed-call']).default('pasted-text') }).strict();
/** Conservative convenience only: copy whole matching source excerpts, never infer a fact. */
export function extractLifeAdminFields(category: LifeAdminCategory, source: string): Record<string, string> {
  const timing = /\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}[/.]\d{1,2}|\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)|deadline|due|expires?|expiry|returns?|arriv|depart|[0-9](?:am|pm))\b/i;
  const patterns: Partial<Record<LifeAdminCategory, Record<string, RegExp>>> = {
    school: { event: /\b(trip|camp|event|sports day|swimming|gala|disco|assembly)\b/i, timing, gear: /\b(bring|pack|gear|lunch|kai|cost|wear|uniform|\$[0-9])/i, permission: /\b(permission|consent|reply|RSVP|approve|form)\b/i },
    bills: { provider: /^(provider|supplier|service|company)\s*:/i, amount: /(?:\$\s*\d|\b(?:NZD|amount|due|monthly|annual|per month)\b)/i, terms: /\b(renew|renewal|cancel|notice period|exit fee|term)\b/i, outcome: /^(goal|outcome|help needed)\s*:/i },
    vehicle: { vehicle: /^(vehicle|car|job)\s*:/i, limits: /\b(wof|rego|ruc|odometer|expiry|expires|km|kilometres)\b/i, next: /^(next|task|goal)\s*:/i },
    home: { area: /^(council|provider|suburb|area)\s*:/i, job: /^(job|issue|problem|request)\s*:/i, timing },
    tradie: { scope: /^(scope|job|problem|work|include|exclude)\s*:/i, place: /^(area|access|location|suburb)\s*:/i, budget: /\b(budget|timing|urgent|deadline)\b/i, comparison: /\b(GST|materials|labour|call.out|payment terms|exclusions)\b/i },
    meals: { needs: /^(meals?|need|shopping|buy)\s*:/i, have: /^(have|pantry|freezer|already)\s*:/i, constraints: /^(people|servings|budget|allergies|dietary|time)\s*:/i },
    transport: { route: /^(from|to|route|journey)\s*:/i, timing, needs: /^(access|needs|backup|walking|transfers)\s*:/i },
    returns: { purchase: /^(item|seller|bought|purchase)\s*:/i, problem: /^(problem|fault|happened|timeline)\s*:/i, remedy: /^(request|remedy|outcome|seller response)\s*:/i },
    government: { service: /^(agency|service|application)\s*:/i, requirements: /^(required|requirements|documents|deadline)\s*:/i, questions: /^(questions|missing|unsure)\s*:/i },
    care: { provider: /^(provider|clinic|appointment|task)\s*:/i, timing, questions: /^(questions|access|support|cost|paperwork)\s*:/i },
    moving: { date: timing, services: /^(services|update|providers|notify)\s*:/i, logistics: /^(packing|transport|cleaning|handover|logistics|keys)\s*:/i },
    travel: { trip: /^(trip|destination|flight|dates|itinerary)\s*:/i, documents: /^(documents|requirements|passport validity|visa|insurance)\s*:/i, logistics: /^(transfers|baggage|check.in|accommodation|logistics)\s*:/i },
  };
  const excerpts = source.split(/\n+|(?<=[.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  return Object.fromEntries(lifeAdminTemplate(category).fields.map((field) => {
    const pattern = patterns[category]?.[field.key];
    const matches = pattern ? excerpts.filter((part) => pattern.test(part)).join('\n') : '';
    // Keep long source material in the source, rather than truncating a material condition.
    return [field.key, matches.length <= 2_000 ? matches : ''];
  }));
}
export function createLifeAdminPlan(input: z.input<typeof lifeAdminIntakeSchema>, options: { id?: string; now?: string } = {}): LifeAdminPlan {
  const value = lifeAdminIntakeSchema.parse(input);
  const template = lifeAdminTemplate(value.category);
  const id = options.id ?? crypto.randomUUID();
  const now = options.now ?? new Date().toISOString();
  return lifeAdminPlanSchema.parse({
    version: 1, id, category: value.category, title: value.title || template.packTitle,
    source: { title: value.title || 'Your notes', text: value.source, url: value.sourceUrl, method: value.method, capturedAt: now },
    fields: extractLifeAdminFields(value.category, value.source),
    tasks: template.steps.map((step) => ({ ...step, id: `${id}:${step.key}`, status: 'needs_review', followUpOn: null, waitingFor: '', evidence: null })),
    createdAt: now, updatedAt: now, reviewedAt: null, followUpOn: null, generated: null,
  });
}
export function missingLifeAdminFields(plan: LifeAdminPlan) {
  return lifeAdminTemplate(plan.category).fields.filter((field) => field.required && !plan.fields[field.key]?.trim());
}
export function updateLifeAdminField(plan: LifeAdminPlan, key: string, value: string, now = new Date().toISOString()): LifeAdminPlan {
  if (!lifeAdminTemplate(plan.category).fields.some((field) => field.key === key)) throw new Error('Unknown field.');
  return lifeAdminPlanSchema.parse({ ...plan, fields: { ...plan.fields, [key]: value }, updatedAt: now, reviewedAt: null, generated: null,
    // Changing the basis invalidates pending review and preparation, but never erases historical external completion evidence.
    tasks: plan.tasks.map((task) => task.kind === 'preparation' || !['done', 'cancelled'].includes(task.status) ? { ...task, status: 'needs_review', evidence: null } : task),
  });
}
export function reviewLifeAdminPlan(plan: LifeAdminPlan, now = new Date().toISOString()): LifeAdminPlan {
  if (missingLifeAdminFields(plan).length) throw new Error('Fill in the missing details before reviewing the plan.');
  return lifeAdminPlanSchema.parse({ ...plan, reviewedAt: now, updatedAt: now,
    tasks: plan.tasks.map((task) => task.status !== 'needs_review' ? task : task.kind === 'preparation' ? { ...task, status: 'done', evidence: { at: now, kind: 'review', note: 'Checklist prepared locally from supplied notes and reviewed by you. This does not complete the external steps.', url: '' } } : { ...task, status: 'todo' }),
  });
}
export type LifeAdminTransition = { status: 'done'; note: string; url?: string } | { status: 'waiting'; note: string; followUpOn: string } | { status: 'todo' | 'cancelled' | 'restore' };
export function transitionLifeAdminTask(plan: LifeAdminPlan, taskId: string, action: LifeAdminTransition, now = new Date().toISOString()): LifeAdminPlan {
  const task = plan.tasks.find((item) => item.id === taskId);
  if (!task) throw new Error('This step is no longer available.');
  if (action.status === 'restore') {
    if (task.status !== 'cancelled') throw new Error('Only a skipped step can be restored.');
    return lifeAdminPlanSchema.parse({ ...plan, reviewedAt: null, updatedAt: now, tasks: plan.tasks.map((item) => item.id === taskId ? { ...item, status: 'needs_review', evidence: null, waitingFor: '', followUpOn: null } : item) });
  }
  if (action.status !== 'cancelled' && (!plan.reviewedAt || task.status === 'needs_review')) throw new Error('Review the plan before changing this step.');
  let changed: LifeAdminTask = { ...task, status: action.status, evidence: null, waitingFor: '', followUpOn: null };
  if (action.status === 'done') {
    const note = z.string().trim().min(8, 'Add a useful completion note or confirmation reference.').max(2_000).parse(action.note);
    changed = { ...changed, evidence: { kind: 'user-recorded', at: now, note, url: cleanSourceUrl(action.url ?? '') } };
  } else if (action.status === 'waiting') {
    const note = z.string().trim().min(3, 'Say what or who you are waiting for.').max(2_000).parse(action.note);
    changed = { ...changed, waitingFor: note, followUpOn: localDateSchema.parse(action.followUpOn) };
  }
  return lifeAdminPlanSchema.parse({ ...plan, updatedAt: now, tasks: plan.tasks.map((item) => item.id === taskId ? changed : item) });
}
export function lifeAdminLane(plan: LifeAdminPlan): LifeAdminLane {
  if (plan.tasks.every((task) => ['done', 'cancelled'].includes(task.status))) return 'done';
  if (!plan.reviewedAt || missingLifeAdminFields(plan).length || plan.tasks.some((task) => task.status === 'needs_review' || task.status === 'waiting')) return 'needs-you';
  return 'today';
}
export function nextLifeAdminStep(plan: LifeAdminPlan): string {
  const missing = missingLifeAdminFields(plan)[0];
  if (missing) return `Add: ${missing.label.toLowerCase()}.`;
  if (!plan.reviewedAt) return 'Check the source and review these steps together.';
  const task = plan.tasks.find((item) => item.status === 'todo') ?? plan.tasks.find((item) => item.status === 'waiting');
  return task ? task.status === 'waiting' ? `Waiting for ${task.waitingFor}. Check on ${task.followUpOn}.` : task.title : 'All steps are recorded as handled or cancelled.';
}
export function lifeAdminLocalDate(now = new Date(), zone = 'Pacific/Auckland'): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function isLifeAdminFollowUpDue(plan: LifeAdminPlan, day = lifeAdminLocalDate()): boolean {
  if (lifeAdminLane(plan) === 'done') return false;
  return Boolean((plan.followUpOn && plan.followUpOn <= day) || plan.tasks.some((task) => task.status === 'waiting' && task.followUpOn && task.followUpOn <= day));
}
export function lifeAdminPack(plan: LifeAdminPlan): string {
  const template = lifeAdminTemplate(plan.category);
  return [
    plan.title, `${template.name} · ${plan.reviewedAt ? 'Reviewed checklist' : 'Draft checklist'}`,
    '', 'Your details', ...template.fields.map((field) => `${field.label}: ${plan.fields[field.key] || '[Still needed]'}`),
    '', 'Next steps', ...plan.tasks.map((task, index) => `${index + 1}. [${task.status.replaceAll('_', ' ')}] ${task.title}\n   ${task.detail}${task.waitingFor ? `\n   Waiting for: ${task.waitingFor}; check on ${task.followUpOn}` : ''}${task.evidence ? `\n   ${task.evidence.kind === 'review' ? 'Review' : 'Recorded by you'} (${task.evidence.at}): ${task.evidence.note}${task.evidence.url ? `\n   Evidence link: ${task.evidence.url}` : ''}` : ''}`),
    '', 'Source you supplied', `${plan.source.title}${plan.source.url ? ` · ${plan.source.url}` : ''}`, `Captured: ${plan.source.capturedAt}; method: ${plan.source.method}`, plan.source.text,
    '', 'Exact text matches to check', extractDetails(plan.source.text),
    ...(plan.generated ? ['', 'Optional generated draft — check before using', plan.generated.text, `Provider: ${plan.generated.model ?? 'not recorded'}; prepared: ${plan.generated.createdAt}`, `Source SHA-256: ${plan.generated.sourceHash}`, `Output SHA-256: ${plan.generated.outputHash}`] : []),
    '', 'Official references', ...template.resources.map((resource) => `${resource.title}: ${resource.url}\n${resource.note}`),
    '', template.guardrail, LIFE_ADMIN_BOUNDARY,
    ...(plan.followUpOn ? [`Your follow-up date: ${plan.followUpOn}. On-screen only; no reminder scheduled.`] : []),
  ].join('\n');
}
export const lifeAdminStoreSchema = z.object({ version: z.literal(1), ownerScope: lifeAdminOwnerScopeSchema, plans: z.array(lifeAdminPlanSchema).max(30), savedAt: timestamp }).strict().refine((store) => new Set(store.plans.map((plan) => plan.id)).size === store.plans.length, 'Duplicate saved checklist.');
export function parseLifeAdminStore(raw: string, expectedScope: string): LifeAdminPlan[] {
  if (raw.length > 1_500_000) throw new Error('This saved workspace is too large.');
  const store = lifeAdminStoreSchema.parse(JSON.parse(raw));
  if (store.ownerScope !== lifeAdminOwnerScopeSchema.parse(expectedScope)) throw new Error('This saved workspace belongs to a different account context.');
  if (new Set(store.plans.map((plan) => plan.id)).size !== store.plans.length) throw new Error('Duplicate saved checklist.');
  return store.plans;
}
export function serialiseLifeAdminStore(plans: LifeAdminPlan[], ownerScope: string, now = new Date().toISOString()) {
  const serialised = JSON.stringify(lifeAdminStoreSchema.parse({ version: 1, ownerScope, plans, savedAt: now }));
  if (serialised.length > 1_500_000) throw new Error('This workspace is too large to save safely. Download individual checklists instead.');
  return serialised;
}
const icsEscape = (value: string) => value.replaceAll('\\', '\\\\').replace(/\r\n?|\n/g, '\\n').replaceAll(';', '\\;').replaceAll(',', '\\,');
export function lifeAdminCalendarFile(plan: LifeAdminPlan): string {
  const day = localDateSchema.parse(plan.followUpOn);
  const next = new Date(`${day}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  // An all-day item avoids implicit timezone conversion or a guessed meeting time. No alarm is imposed.
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//assembl//Personal DO//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${plan.id}-follow-up@personal.do.assembl.co.nz`, `DTSTAMP:${plan.updatedAt.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART;VALUE=DATE:${day.replaceAll('-', '')}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replaceAll('-', '')}`, `SUMMARY:${icsEscape(`Check: ${plan.title}`)}`, 'DESCRIPTION:Personal follow-up. Open your checklist in DO. No booking or external action has been made.', 'END:VEVENT', 'END:VCALENDAR'];
  // Fold to 75 UTF-8 bytes without splitting a code point.
  return lines.map((line) => { let result = ''; let bytes = 0; for (const char of line) { const length = new TextEncoder().encode(char).length; if (bytes + length > 75) { result += '\r\n '; bytes = 1; } result += char; bytes += length; } return result; }).join('\r\n') + '\r\n';
}
/** This only catches common accidental secret labels; it is not a PII detector. */
export function hasLifeAdminSecretLabel(text: string) {
  return /\b(password|api[ _-]?key|secret key|card number|credit card|passport number|IRD number|NHI number|bank account)\s*[:=]\s*\S/i.test(text);
}
export const lifeAdminPreparationSchema = z.object({
  category: z.enum(LIFE_ADMIN_CATEGORIES), source: z.string().trim().min(5).max(LIFE_ADMIN_SOURCE_LIMIT),
  title: z.string().trim().max(160), fields: z.record(z.string().max(60), shortText), consent: z.literal(true),
}).strict().superRefine((input, ctx) => {
  const template = lifeAdminTemplate(input.category);
  if (Object.keys(input.fields).some((key) => !template.fields.some((field) => field.key === key))) ctx.addIssue({ code: 'custom', message: 'Unknown workflow field.' });
  if (hasLifeAdminSecretLabel([input.source, input.title, ...Object.values(input.fields)].join('\n'))) ctx.addIssue({ code: 'custom', message: 'Remove credentials, identity numbers and payment details before sending.' });
});
export function lifeAdminPreparationBrief(category: LifeAdminCategory) {
  const template = lifeAdminTemplate(category);
  return `Prepare a useful ${template.packTitle} in plain New Zealand English. Organise the supplied notes and user-confirmed fields into: Established details; Draft checklist or message to review; Missing information; Smallest next step. Make this specific to ${template.description} Preserve exact dates, amounts and qualifiers. A date mentioned in a notice is not automatically a deadline. Use placeholders for missing details. If this is school admin, separate event dates, return times, permission, gear, kai and costs. For vehicle admin separate WoF, rego and distance-based RUC. For tradie work provide a ready-to-edit scope and quote request. For meals provide a practical list using only supplied requirements, with quantities to confirm. For complaints produce a factual timeline and a draft request without inventing allegations. ${template.guardrail} ${LIFE_ADMIN_BOUNDARY}`;
}
