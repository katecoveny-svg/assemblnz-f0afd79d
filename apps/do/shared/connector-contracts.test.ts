import { describe, expect, it } from 'vitest';

import { validateConnectorInput } from './connector-contracts';

const gmail = { to: ['person@example.com'], subject: 'A reviewed draft', body: 'Hello' };

function rejects(action: string, app: string, input: unknown) {
  const result = validateConnectorInput(action, app, input);
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toEqual(expect.any(String));
}

describe('Gmail draft data (not a write-scope grant)', () => {
  it('returns exact plaintext props for review', () => {
    expect(validateConnectorInput('create_email_draft', 'gmail', gmail)).toEqual({
      ok: true, data: { ...gmail, bodyType: 'plaintext' },
    });
  });

  it.each([
    { to: [] }, { to: ['not-email'] }, { to: Array(11).fill('person@example.com') },
    { subject: '' }, { subject: 'x'.repeat(201) }, { body: '' }, { body: 'x'.repeat(12001) },
    { bodyType: 'html' }, { cc: ['other@example.com'] }, { gmail: { authProvisionId: 'other' } },
  ])('rejects unreviewed or out-of-bounds Gmail props: %j', (change) => {
    rejects('create_email_draft', 'gmail', { ...gmail, ...change });
  });
});

it.each([
  ['', 'gmail'], ['send_email', 'gmail'], ['create_email_draft', 'stripe'],
  ['constructor', 'toString'], ['__proto__', 'gmail'], ['create_email_draft', '__proto__'],
])('fails closed for unsupported action/app %s %s', (action, app) => {
  rejects(action, app, gmail);
});

it.each([undefined, null, [], 'input', 1, true])('rejects non-object input %j', (input) => {
  rejects('create_email_draft', 'gmail', input);
});

type Fixture = { action: string; app: string; input: Record<string, unknown>; data: Record<string, unknown> };
const fixtures: Fixture[] = [];

function contract(fixture: Fixture, invalid: [string, Record<string, unknown>][]) {
  fixtures.push(fixture);
  const { action, app, input, data } = fixture;
  describe(`${action}/${app}`, () => {
    it('returns the exact normalized review payload', () => {
      expect(validateConnectorInput(action, app, input)).toEqual({ ok: true, data });
    });
    it.each(invalid)('rejects %s', (_name, change) => {
      rejects(action, app, { ...input, ...change });
    });
    it.each([
      'ownerId', 'accountId', 'externalUserId', 'componentId', 'configured_props', 'url',
      'auth', 'authProvisionId', 'gmail', 'microsoftOutlook', 'googleCalendar',
      'googleSheets', 'googleDrive', 'slack', 'hubspot', 'salesforce', 'notion',
      'todoist', 'linearApp', 'app', 'stripe', 'dropbox', '__proto__', 'constructor',
    ])('rejects injected %s', (key) => rejects(action, app, { ...input, [key]: { id: 'unreviewed' } }));
  });
}

const outlook = { recipients: ['person@example.com'], subject: 'Review', content: 'A draft' };
contract({ action: 'create_email_draft', app: 'microsoft_outlook', input: outlook,
  data: { ...outlook, contentType: 'text' } }, [
  ['empty recipients', { recipients: [] }], ['invalid recipient', { recipients: ['bad'] }],
  ['too many recipients', { recipients: Array(11).fill('person@example.com') }],
  ['empty subject', { subject: '' }], ['long subject', { subject: 'x'.repeat(201) }],
  ['empty content', { content: '' }], ['long content', { content: 'x'.repeat(12001) }],
  ['HTML', { contentType: 'html' }], ['shared mailbox', { userId: 'someone' }],
  ['body override', { expand: { body: 'other' } }], ['attachments', { attachments: [] }],
  ['Gmail props', { to: ['person@example.com'] }],
]);

const calendarRead = { calendarId: 'primary', timeMin: '2026-09-17T09:00:00+12:00', timeMax: '2026-09-18T09:00:00+12:00' };
contract({ action: 'list_calendar_events', app: 'google_calendar', input: calendarRead,
  data: { ...calendarRead, maxResults: 10, fields: 'compact', singleEvents: true, orderBy: 'startTime', maxAttendees: 1 } }, [
  ['missing reviewed calendar', { calendarId: undefined }], ['empty calendar', { calendarId: '' }],
  ['long calendar', { calendarId: 'x'.repeat(513) }], ['missing start', { timeMin: undefined }],
  ['missing end', { timeMax: undefined }], ['date only', { timeMin: '2026-09-17' }],
  ['no zone', { timeMin: '2026-09-17T09:00:00' }], ['bad offset', { timeMin: '2026-09-17T09:00:00+25:00' }],
  ['invalid day', { timeMin: '2026-02-30T09:00:00Z' }], ['equal end', { timeMax: calendarRead.timeMin }],
  ['inverted window', { timeMax: '2026-09-16T09:00:00+12:00' }],
  ['window over 31 days', { timeMax: '2026-10-18T09:00:01+12:00' }],
  ['zero cap', { maxResults: 0 }], ['oversized cap', { maxResults: 51 }], ['fractional cap', { maxResults: 1.5 }],
  ['string cap', { maxResults: '10' }], ['raw fields', { fields: '*' }], ['unexpanded recurrence', { singleEvents: false }],
  ['wrong order', { orderBy: 'updated' }], ['extra attendees', { maxAttendees: 2 }],
  ['raw options', { options: {} }], ['query', { q: 'unreviewed' }],
]);
it('allows the exact 31-day Calendar read bound with UTC and an explicit cap', () => {
  expect(validateConnectorInput('list_calendar_events', 'google_calendar', {
    ...calendarRead, timeMin: '2026-09-17T00:00:00Z', timeMax: '2026-10-18T00:00:00Z', maxResults: 50,
  })).toEqual({ ok: true, data: {
    calendarId: 'primary', timeMin: '2026-09-17T00:00:00Z', timeMax: '2026-10-18T00:00:00Z',
    maxResults: 50, fields: 'compact', singleEvents: true, orderBy: 'startTime', maxAttendees: 1,
  } });
});

const calendarCreate = {
  calendarId: 'primary', summary: 'Reviewed meeting', eventStartDate: '2026-09-17T09:00:00+12:00',
  eventEndDate: '2026-09-17T10:00:00+12:00', attendees: [],
};
contract({ action: 'create_calendar_event', app: 'google_calendar', input: calendarCreate,
  data: { ...calendarCreate, sendUpdates: 'none', addSelfAsAttendee: false } }, [
  ['missing calendar', { calendarId: undefined }], ['empty summary', { summary: '' }],
  ['long summary', { summary: 'x'.repeat(201) }], ['missing start', { eventStartDate: undefined }],
  ['missing end', { eventEndDate: undefined }], ['date only', { eventStartDate: '2026-09-17' }],
  ['no timezone', { eventStartDate: '2026-09-17T09:00:00' }],
  ['equal end', { eventEndDate: calendarCreate.eventStartDate }],
  ['reversed window', { eventEndDate: '2026-09-16T09:00:00+12:00' }],
  ['window over 31 days', { eventEndDate: '2026-10-18T09:00:01+12:00' }],
  ['unreviewed attendees', { attendees: undefined }], ['invalid attendee', { attendees: ['not-email'] }],
  ['too many attendees', { attendees: Array(11).fill('person@example.com') }],
  ['notifications', { sendUpdates: 'all' }], ['external notifications', { sendUpdates: 'externalOnly' }],
  ['self invitation', { addSelfAsAttendee: true }], ['recurrence', { recurrence: ['RRULE:FREQ=DAILY'] }],
  ['raw dates', { start: { dateTime: calendarCreate.eventStartDate } }],
]);
it('preserves explicitly reviewed attendees with notifications disabled', () => {
  const input = { ...calendarCreate, attendees: ['person@example.com'], sendUpdates: 'none', addSelfAsAttendee: false };
  expect(validateConnectorInput('create_calendar_event', 'google_calendar', input)).toEqual({ ok: true, data: input });
});

const sheet = { sheetId: 'reviewed-sheet', worksheetId: 0, myColumnData: ['Ada', 42, true, '', '-12.5', -4] };
contract({ action: 'add_sheet_row', app: 'google_sheets', input: sheet, data: sheet }, [
  ['empty sheet', { sheetId: '' }], ['long sheet', { sheetId: 'x'.repeat(513) }],
  ['tab title', { worksheetId: 'Sheet1' }], ['negative tab', { worksheetId: -1 }], ['fractional tab', { worksheetId: 0.5 }],
  ['empty row', { myColumnData: [] }], ['long row', { myColumnData: Array(51).fill('x') }],
  ['object cell', { myColumnData: [{ value: 'x' }] }], ['null cell', { myColumnData: [null] }],
  ['NaN cell', { myColumnData: [NaN] }], ['infinite cell', { myColumnData: [Infinity] }],
  ['long cell', { myColumnData: ['x'.repeat(2001)] }], ['row insertion', { rowIndex: 1 }],
  ['raw values', { values: [['x']] }], ['obsolete headers', { hasHeaders: true }],
  ...['=1+1', '+SUM(A1:A2)', '@SUM(A1:A2)', '-SUM(A1:A2)', ' =1', '\t=1', '\n=1', 'a\tb', 'a\nb'].map(
    (value): [string, Record<string, unknown>] => ['formula or control character', { myColumnData: [value] }],
  ),
]);

const drive = { fileId: 'reviewed-file' };
contract({ action: 'get_drive_file', app: 'google_drive', input: drive,
  data: { ...drive, fields: ['id', 'name', 'mimeType'] } }, [
  ['missing file', { fileId: undefined }], ['empty file', { fileId: '' }], ['long file', { fileId: 'x'.repeat(513) }],
  ['empty fields', { fields: [] }], ['wildcard fields', { fields: ['*'] }], ['PII metadata', { fields: ['owners'] }],
  ['raw fields string', { fields: 'id,name' }], ['duplicate fields', { fields: ['id', 'id'] }],
  ['media download', { alt: 'media' }], ['download flag', { download: true }],
]);
it('preserves the reviewed Drive metadata allowlist', () => {
  const input = { ...drive, fields: ['id', 'name', 'mimeType', 'modifiedTime', 'webViewLink'] };
  expect(validateConnectorInput('get_drive_file', 'google_drive', input)).toEqual({ ok: true, data: input });
});

const slack = { conversation: 'C0123456789', text: 'A reviewed message' };
contract({ action: 'post_slack_message', app: 'slack', input: slack,
  data: { ...slack, addToChannel: false, include_sent_via_pipedream_flag: false } }, [
  ['channel name', { conversation: '#general' }], ['user ID', { conversation: 'U0123456789' }],
  ['short channel', { conversation: 'C1' }], ['long channel', { conversation: 'C' + 'A'.repeat(128) }],
  ['empty message', { text: '' }], ['long message', { text: 'x'.repeat(4001) }],
  ['join', { addToChannel: true }], ['footer', { include_sent_via_pipedream_flag: true }],
  ['schedule', { post_at: 1790000000 }], ['identity', { username: 'other' }], ['icon', { icon_url: 'https://example.com/i.png' }],
  ['broadcast', { reply_broadcast: true }], ['metadata', { metadata: {} }], ['raw channel', { channel: 'C0123456789' }],
]);
it('accepts slack_v2 explicitly using the same reviewed v2 data schema', () => {
  expect(validateConnectorInput('post_slack_message', 'slack_v2', slack)).toEqual({
    ok: true, data: { ...slack, addToChannel: false, include_sent_via_pipedream_flag: false },
  });
});

const hubspot = { objectProperties: { email: 'person@example.com', firstname: 'Ada', lastname: 'Lovelace', company: 'Example', phone: '+64 21 555 0100' } };
contract({ action: 'create_lead', app: 'hubspot', input: hubspot, data: { ...hubspot, updateIfExists: false } }, [
  ['missing properties', { objectProperties: undefined }], ['empty properties', { objectProperties: {} }],
  ['no contact identity', { objectProperties: { company: 'Example' } }],
  ['invalid email', { objectProperties: { email: 'bad' } }], ['blank name', { objectProperties: { firstname: ' ' } }],
  ['long first name', { objectProperties: { firstname: 'x'.repeat(101) } }],
  ['long last name', { objectProperties: { lastname: 'x'.repeat(101) } }],
  ['long company', { objectProperties: { email: 'person@example.com', company: 'x'.repeat(201) } }],
  ['long phone', { objectProperties: { email: 'person@example.com', phone: 'x'.repeat(51) } }],
  ['nested owner injection', { objectProperties: { ...hubspot.objectProperties, ownerId: 'other' } }],
  ['camelCase fields', { objectProperties: { firstName: 'Ada' } }], ['overwrite', { updateIfExists: true }],
]);
it.each([{ email: 'person@example.com' }, { firstname: 'Ada' }, { lastname: 'Lovelace' }])('accepts a minimal HubSpot identity %#', (objectProperties) => {
  expect(validateConnectorInput('create_lead', 'hubspot', { objectProperties })).toEqual({
    ok: true, data: { objectProperties, updateIfExists: false },
  });
});

const salesforce = { Company: 'Example', LastName: 'Lovelace' };
contract({ action: 'create_lead', app: 'salesforce_rest_api', input: salesforce, data: salesforce }, [
  ['missing Company', { Company: undefined }], ['blank Company', { Company: '' }], ['long Company', { Company: 'x'.repeat(201) }],
  ['missing LastName', { LastName: undefined }], ['blank LastName', { LastName: '' }], ['long LastName', { LastName: 'x'.repeat(81) }],
  ['long FirstName', { FirstName: 'x'.repeat(41) }], ['invalid Email', { Email: 'bad' }],
  ['long Description', { Description: 'x'.repeat(4001) }], ['long Phone', { Phone: 'x'.repeat(41) }],
  ['additionalFields override', { additionalFields: { Company: 'other' } }], ['lowercase fields', { company: 'other' }],
]);
it('preserves exact optional Salesforce capitalized props', () => {
  const input = { ...salesforce, FirstName: 'Ada', Email: 'person@example.com', Description: 'Reviewed contact', Phone: '+64 21 555 0100' };
  expect(validateConnectorInput('create_lead', 'salesforce_rest_api', input)).toEqual({ ok: true, data: input });
});

const uuid = '12345678-1234-4234-8234-123456789abc';
const notion = { parent: uuid };
contract({ action: 'create_notion_page', app: 'notion', input: notion, data: notion }, [
  ['missing parent', { parent: undefined }], ['empty parent', { parent: '' }], ['raw parent', { parent: { page_id: uuid } }],
  ['workspace root', { parent: 'https://www.notion.so/' }], ['HTTP parent', { parent: `http://www.notion.so/${uuid}` }],
  ['lookalike host', { parent: `https://notion.so.evil.example/${uuid}` }],
  ['other host', { parent: `https://example.com/${uuid}` }], ['credentials', { parent: `https://user@notion.so/${uuid}` }],
  ['custom port', { parent: `https://notion.so:8443/${uuid}` }], ['missing page ID', { parent: 'https://www.notion.so/a-page' }],
  ['long parent', { parent: 'x'.repeat(2049) }], ['long title', { title: 'x'.repeat(201) }],
  ['long content', { content: 'x'.repeat(12001) }], ['properties JSON', { properties: '{"Status":"Done"}' }],
  ['raw children', { children: [] }],
]);
it.each([
  `https://www.notion.so/${uuid}`, `https://notion.so/Reviewed-${uuid.replaceAll('-', '')}`,
  `https://team.notion.site/Reviewed-${uuid.replaceAll('-', '')}?pvs=4`, `https://notion.site/${uuid}`,
])('accepts reviewed Notion page URL %s', (parent) => {
  const input = { parent, title: 'Reviewed title', content: '# Reviewed markdown' };
  expect(validateConnectorInput('create_notion_page', 'notion', input)).toEqual({ ok: true, data: input });
});

const todoist = { content: 'Review the brief' };
contract({ action: 'create_task', app: 'todoist', input: todoist, data: todoist }, [
  ['missing content', { content: undefined }], ['blank content', { content: ' ' }], ['long content', { content: 'x'.repeat(501) }],
  ['empty project', { project: '' }], ['long project', { project: 'x'.repeat(129) }], ['numeric section', { section: 12 }],
  ['long section', { section: 'x'.repeat(129) }], ['long description', { description: 'x'.repeat(4001) }],
  ['natural-language due', { dueString: 'tomorrow' }], ['ambiguous datetime', { dueDatetime: '2026-09-18T09:00:00' }],
  ['invalid date', { dueDate: '2026-02-30' }], ['datetime in date', { dueDate: '2026-09-18T00:00:00Z' }],
  ['conflicting due modes', { dueDate: '2026-09-18', dueDatetime: '2026-09-18T00:00:00Z' }],
  ['low priority', { priority: 0 }], ['high priority', { priority: 5 }], ['fractional priority', { priority: 1.5 }],
  ['timezone override', { dueTimezone: 'Pacific/Auckland' }], ['API project prop', { project_id: 'project' }],
  ['unreviewed parent', { parent: 'other-task' }],
]);
it.each([{ dueDate: '2026-09-18' }, { dueDatetime: '2026-09-18T09:00:00+12:00' }])('preserves one reviewed Todoist due mode %#', (due) => {
  const input = { ...todoist, project: 'project-123', section: 'section-1', description: 'Prepared locally', priority: 4, ...due };
  expect(validateConnectorInput('create_task', 'todoist', input)).toEqual({ ok: true, data: input });
});

const linear = { teamId: uuid, title: 'Reviewed issue' };
contract({ action: 'create_task', app: 'linear_app', input: linear, data: linear }, [
  ['team short key', { teamId: 'ENG' }], ['missing team', { teamId: undefined }],
  ['missing title', { title: undefined }], ['empty title', { title: '' }], ['long title', { title: 'x'.repeat(201) }],
  ['long description', { description: 'x'.repeat(4001) }], ['project name', { projectId: 'Example' }],
  ['assignee name', { assigneeId: 'Ada' }], ['state name', { stateId: 'Done' }], ['label name', { labelIds: ['Bug'] }],
  ['too many labels', { labelIds: Array(21).fill(uuid) }], ['duplicate labels', { labelIds: [uuid, uuid] }],
  ['negative priority', { priority: -1 }], ['high priority', { priority: 5 }], ['fractional priority', { priority: 1.5 }],
]);
it('preserves reviewed Linear UUID targets and zero priority', () => {
  const input = { ...linear, projectId: uuid, assigneeId: uuid, stateId: uuid, labelIds: [uuid], priority: 0, description: 'Exact description' };
  expect(validateConnectorInput('create_task', 'linear_app', input)).toEqual({ ok: true, data: input });
});
it('accepts an explicit empty Linear label list', () => {
  const input = { ...linear, labelIds: [] };
  expect(validateConnectorInput('create_task', 'linear_app', input)).toEqual({ ok: true, data: input });
});

const stripe = { id: 'in_123abc' };
contract({ action: 'retrieve_invoice', app: 'stripe', input: stripe, data: stripe }, [
  ['missing ID', { id: undefined }], ['empty ID', { id: '' }], ['wrong resource', { id: 'cus_123abc' }],
  ['empty prefix', { id: 'in_' }], ['long ID', { id: 'in_' + 'x'.repeat(126) }],
  ['path ID', { id: 'in_123/other' }], ['URL ID', { id: 'https://example.com/in_123' }],
  ['wrong prop', { invoiceId: 'in_other' }], ['expansion', { expand: ['customer'] }],
]);

const dropbox = { path: '' };
const dropboxDefaults = { recursive: false, includeDeleted: false, includeMountedFolders: false, includeHasExplicitSharedMembers: false, limit: 10 };
contract({ action: 'list_folder', app: 'dropbox', input: dropbox, data: { ...dropbox, ...dropboxDefaults } }, [
  ['unreviewed root', { path: undefined }], ['long path', { path: '/' + 'x'.repeat(1024) }],
  ['relative path', { path: 'Documents' }], ['control in path', { path: '/Documents\n' }],
  ['recursion', { recursive: true }], ['deleted entries', { includeDeleted: true }],
  ['mounted folders', { includeMountedFolders: true }], ['shared membership', { includeHasExplicitSharedMembers: true }],
  ['download override', { includeNonDownloadableFiles: false }],
  ['zero limit', { limit: 0 }], ['over limit', { limit: 51 }], ['fractional limit', { limit: 1.5 }], ['string limit', { limit: '10' }],
  ['cursor', { cursor: 'continue' }],
]);
it('preserves a reviewed Dropbox subfolder and the maximum small limit', () => {
  const input = { path: '/Reviewed folder', ...dropboxDefaults, limit: 50 };
  expect(validateConnectorInput('list_folder', 'dropbox', input)).toEqual({ ok: true, data: input });
});

it('rejects a nested prototype key rather than silently stripping it', () => {
  rejects('create_lead', 'hubspot', { objectProperties: { email: 'person@example.com', ['__proto__']: { ownerId: 'other' } } });
});
it('rejects inherited reviewed values', () => {
  rejects('retrieve_invoice', 'stripe', Object.create(stripe));
});
it('rejects hidden keys', () => {
  rejects('retrieve_invoice', 'stripe', Object.defineProperty({ ...stripe }, 'ownerId', { value: 'other' }));
});
it('rejects symbol keys', () => {
  rejects('retrieve_invoice', 'stripe', { ...stripe, [Symbol('auth')]: 'other' });
});
it('rejects getters without executing them', () => {
  let reads = 0;
  const input = { get id() { reads += 1; return stripe.id; } };
  rejects('retrieve_invoice', 'stripe', input);
  expect(reads).toBe(0);
});
it('rejects nested getters without executing them', () => {
  let reads = 0;
  const input = { objectProperties: { get email() { reads += 1; return 'person@example.com'; } } };
  rejects('create_lead', 'hubspot', input);
  expect(reads).toBe(0);
});
it('rejects extra properties on a recipient array', () => {
  const to = Object.assign(['person@example.com'], { ownerId: 'other' });
  rejects('create_email_draft', 'gmail', { ...gmail, to });
});
it('rejects undefined optional properties instead of returning non-JSON data', () => {
  rejects('create_task', 'todoist', { ...todoist, project: undefined });
});
it('fails closed on an unreadable input object', () => {
  const { proxy, revoke } = Proxy.revocable({}, {});
  revoke();
  rejects('retrieve_invoice', 'stripe', proxy);
});

/* next contract */
