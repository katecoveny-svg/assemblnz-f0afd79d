import { z } from 'zod';

/** Pure data contracts pinned by connector-contract-audit.md (17 September 2026).
 * Local limits are deliberately narrower than the upstream component schemas.
 * These contracts do not grant scope, approve an action or select an account.
 */
export type ConnectorInputResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string };

const nonemptyText = (max: number) => z.string().max(max).refine((value) => value.trim().length > 0);
const email = z.email().max(254);
const recipients = z.array(email).min(1).max(10);

const gmailDraft = z.strictObject({
  to: recipients,
  subject: nonemptyText(200),
  body: nonemptyText(12_000),
  bodyType: z.literal('plaintext').default('plaintext'),
});

const outlookDraft = z.strictObject({
  recipients,
  subject: nonemptyText(200),
  content: nonemptyText(12_000),
  contentType: z.literal('text').default('text'),
});

// Require an actual zoned instant, not an all-day date or machine-local time.
const instant = z.iso.datetime({ offset: true }).max(40)
  .regex(/T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/)
  .refine((value) => Number.isFinite(Date.parse(value)) && !value.endsWith('-00:00'));
const calendarId = nonemptyText(512);
const smallLimit = z.number().int().min(1).max(50).default(10);
const maxWindowMs = 31 * 24 * 60 * 60 * 1000;
function orderedWindow(start: string, end: string): boolean {
  const difference = Date.parse(end) - Date.parse(start);
  return difference > 0 && difference <= maxWindowMs;
}

const calendarList = z.strictObject({
  calendarId,
  timeMin: instant,
  timeMax: instant,
  maxResults: smallLimit,
  fields: z.literal('compact').default('compact'),
  singleEvents: z.literal(true).default(true),
  orderBy: z.literal('startTime').default('startTime'),
  maxAttendees: z.literal(1).default(1),
}).refine((data) => orderedWindow(data.timeMin, data.timeMax), { path: ['timeMax'] });

const calendarCreate = z.strictObject({
  calendarId,
  summary: nonemptyText(200),
  eventStartDate: instant,
  eventEndDate: instant,
  // Even [] must be explicitly reviewed; do not silently inherit participants.
  attendees: z.array(email).max(10),
  sendUpdates: z.literal('none').default('none'),
  addSelfAsAttendee: z.literal(false).default(false),
}).refine((data) => orderedWindow(data.eventStartDate, data.eventEndDate), { path: ['eventEndDate'] });

const sheetString = z.string().max(2_000).refine((value) => {
  // USER_ENTERED is not RAW: block formula prefixes, including hidden prefixes.
  if (Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return false;
  const trimmed = value.trimStart();
  if (/^[=+@]/.test(trimmed)) return false;
  return !trimmed.startsWith('-') || /^-(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed);
});
const sheetAppend = z.strictObject({
  sheetId: nonemptyText(512),
  worksheetId: z.number().int().min(0),
  myColumnData: z.array(z.union([sheetString, z.number(), z.boolean()])).min(1).max(50),
});

const driveFile = z.strictObject({
  fileId: nonemptyText(512),
  fields: z.array(z.enum(['id', 'name', 'mimeType', 'modifiedTime', 'webViewLink'])).min(1).max(5)
    .refine((fields) => new Set(fields).size === fields.length).default(['id', 'name', 'mimeType']),
});

const slackMessage = z.strictObject({
  conversation: z.string().regex(/^[CGD][A-Z0-9]{8,127}$/),
  text: nonemptyText(4_000),
  addToChannel: z.literal(false).default(false),
  include_sent_via_pipedream_flag: z.literal(false).default(false),
});

const contactProperties = z.strictObject({
  email: email.optional(),
  firstname: nonemptyText(100).optional(),
  lastname: nonemptyText(100).optional(),
  company: nonemptyText(200).optional(),
  phone: nonemptyText(50).optional(),
}).refine((data) => Boolean(data.email || data.firstname || data.lastname));
const hubspotLead = z.strictObject({
  objectProperties: contactProperties,
  updateIfExists: z.literal(false).default(false),
});

const salesforceLead = z.strictObject({
  Company: nonemptyText(200),
  LastName: nonemptyText(80),
  FirstName: nonemptyText(40).optional(),
  Email: email.optional(),
  Description: z.string().max(4_000).optional(),
  Phone: nonemptyText(40).optional(),
});

const uuid = z.uuid();
const notionParent = z.string().min(1).max(2_048).refine((value) => {
  if (uuid.safeParse(value).success) return true;
  try {
    const url = new URL(value);
    const hostAllowed = url.hostname === 'notion.so' || url.hostname.endsWith('.notion.so')
      || url.hostname === 'notion.site' || url.hostname.endsWith('.notion.site');
    return url.protocol === 'https:' && hostAllowed && !url.username && !url.password && !url.port
      && /(?:^|[-/])(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.test(url.pathname);
  } catch {
    return false;
  }
});
const notionPage = z.strictObject({
  parent: notionParent,
  title: z.string().max(200).optional(),
  content: z.string().max(12_000).optional(),
  // Database properties require a separately reviewed parent schema.
});

const todoistTask = z.strictObject({
  content: nonemptyText(500),
  // Absence means the provider's Inbox default, which must be shown at review.
  project: nonemptyText(128).optional(),
  section: nonemptyText(128).optional(),
  description: z.string().max(4_000).optional(),
  dueDate: z.iso.date().optional(),
  dueDatetime: instant.optional(),
  priority: z.number().int().min(1).max(4).optional(),
}).refine((data) => !(data.dueDate && data.dueDatetime), { path: ['dueDatetime'] });

const linearTask = z.strictObject({
  teamId: uuid,
  title: nonemptyText(200),
  description: z.string().max(4_000).optional(),
  projectId: uuid.optional(),
  assigneeId: uuid.optional(),
  stateId: uuid.optional(),
  labelIds: z.array(uuid).max(20).refine((ids) => new Set(ids).size === ids.length).optional(),
  priority: z.number().int().min(0).max(4).optional(),
});

const stripeInvoice = z.strictObject({
  id: z.string().max(128).regex(/^in_[A-Za-z0-9]+$/),
});

const dropboxFolder = z.strictObject({
  path: z.string().max(1_024).refine((value) => (value === '' || value.startsWith('/'))
    && !Array.from(value).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)),
  recursive: z.literal(false).default(false),
  includeDeleted: z.literal(false).default(false),
  includeMountedFolders: z.literal(false).default(false),
  includeHasExplicitSharedMembers: z.literal(false).default(false),
  limit: smallLimit,
});


type Contract = { action: string; app: string; schema: z.ZodType<Record<string, unknown>> };
const contracts: readonly Contract[] = [
  { action: 'create_email_draft', app: 'gmail', schema: gmailDraft },
  { action: 'create_email_draft', app: 'microsoft_outlook', schema: outlookDraft },
  { action: 'list_calendar_events', app: 'google_calendar', schema: calendarList },
  { action: 'create_calendar_event', app: 'google_calendar', schema: calendarCreate },
  { action: 'add_sheet_row', app: 'google_sheets', schema: sheetAppend },
  { action: 'get_drive_file', app: 'google_drive', schema: driveFile },
  { action: 'post_slack_message', app: 'slack', schema: slackMessage },
  { action: 'create_lead', app: 'hubspot', schema: hubspotLead },
  { action: 'create_lead', app: 'salesforce_rest_api', schema: salesforceLead },
  { action: 'create_notion_page', app: 'notion', schema: notionPage },
  { action: 'create_task', app: 'todoist', schema: todoistTask },
  { action: 'create_task', app: 'linear_app', schema: linearTask },
  { action: 'retrieve_invoice', app: 'stripe', schema: stripeInvoice },
  { action: 'list_folder', app: 'dropbox', schema: dropboxFolder },
];

// Accept JSON-shaped data only. Strict Zod objects intentionally ignore some JS
// properties; reject those before parsing so nothing hidden escapes the review.
function isPlainData(value: unknown, depth = 0): boolean {
  if (depth > 4) return false;
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object') return false;
  const keys = Reflect.ownKeys(value);
  if (keys.length > 64) return false;
  const prototype = Object.getPrototypeOf(value);
  if (Array.isArray(value)) {
    if (prototype !== Array.prototype || value.length > 50 || keys.length !== value.length + 1) return false;
  } else if (prototype !== Object.prototype && prototype !== null) {
    return false;
  }
  return keys.every((key) => {
    if (Array.isArray(value) && key === 'length') return true;
    if (typeof key !== 'string' || key === '__proto__' || key === 'constructor' || key === 'prototype') return false;
    if (Array.isArray(value) && !/^(0|[1-9][0-9]*)$/.test(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return Boolean(descriptor && descriptor.enumerable && 'value' in descriptor && isPlainData(descriptor.value, depth + 1));
  });
}

/** The returned data, including defaults, is the payload to display and hash for review.
 * Only data validation happens here. Callers must separately enforce owner, app,
 * scope (including Gmail draft-write), target authority and approval before transport.
 */
export function validateConnectorInput(action: string, app: string, input: unknown): ConnectorInputResult {
  const contract = contracts.find((candidate) => candidate.action === action && candidate.app === (app === 'slack_v2' ? 'slack' : app));
  if (!contract) return { ok: false, error: 'Unsupported connector action/app.' };
  try {
    if (isPlainData(input)) {
      const result = contract.schema.safeParse(input);
      if (result.success) return { ok: true, data: result.data };
    }
  } catch {
    // A hostile JS object (e.g. a revoked Proxy) is not a transportable payload.
  }
  // Do not reflect arbitrary keys, PII or caller-provided secrets in errors.
  return { ok: false, error: 'Invalid connector input.' };
}
